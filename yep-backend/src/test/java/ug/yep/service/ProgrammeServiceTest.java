package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Application;
import ug.yep.entity.Enums;
import ug.yep.entity.Programme;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.ApplicationRepository;
import ug.yep.repository.ProgrammeRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;

/** Capacity and deadline are enforced before an application row is written. */
class ProgrammeServiceTest {

    private ProgrammeRepository programmes;
    private ApplicationRepository applications;
    private UserRepository users;
    private ProgrammeService service;

    @BeforeEach
    void setUp() {
        programmes = mock(ProgrammeRepository.class);
        applications = mock(ApplicationRepository.class);
        users = mock(UserRepository.class);
        service = new ProgrammeService(programmes, applications, users,
                mock(NotificationService.class), mock(AuditService.class));
    }

    private Programme programme(int capacity, Instant deadline) {
        Programme programme = new Programme("Digital Foundations", "Digital Literacy", "💻",
                capacity, deadline, null, true);
        ReflectionTestUtils.setField(programme, "id", 1L);
        return programme;
    }

    private CurrentUser actor() {
        return new CurrentUser(2L, "amara@yep.example", "Amara Nakato", Enums.Role.PARTICIPANT);
    }

    @Test
    void rejectsApplicationAfterDeadline() {
        Programme programme = programme(30, Instant.now().minus(1, ChronoUnit.DAYS));
        when(programmes.findById(1L)).thenReturn(Optional.of(programme));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.apply(actor(), new Requests.ApplyRequest(1L)));
        assertEquals("The registration deadline for this programme has passed.", error.getMessage());
    }

    @Test
    void rejectsApplicationWhenProgrammeIsFull() {
        Programme programme = programme(2, Instant.now().plus(10, ChronoUnit.DAYS));
        when(programmes.findById(1L)).thenReturn(Optional.of(programme));
        when(applications.countByProgrammeIdAndStatus(1L, Enums.ApplicationStatus.APPROVED)).thenReturn(2L);

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.apply(actor(), new Requests.ApplyRequest(1L)));
        assertEquals("This programme is full. Please choose another programme.", error.getMessage());
    }

    @Test
    void rejectsDuplicateApplication() {
        Programme programme = programme(30, Instant.now().plus(10, ChronoUnit.DAYS));
        when(programmes.findById(1L)).thenReturn(Optional.of(programme));
        when(applications.countByProgrammeIdAndStatus(anyLong(), eq(Enums.ApplicationStatus.APPROVED))).thenReturn(0L);
        when(applications.findByProgrammeIdAndUserId(1L, 2L))
                .thenReturn(Optional.of(new Application(programme, User.create(Enums.Role.PARTICIPANT,
                        "Amara", "amara@yep.example", null, "x", Enums.UserStatus.APPROVED))));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.apply(actor(), new Requests.ApplyRequest(1L)));
        assertEquals("You have already applied for this programme.", error.getMessage());
    }

    @Test
    void createsApplicationWhenOpen() {
        Programme programme = programme(30, Instant.now().plus(10, ChronoUnit.DAYS));
        when(programmes.findById(1L)).thenReturn(Optional.of(programme));
        when(applications.countByProgrammeIdAndStatus(anyLong(), any())).thenReturn(4L);
        when(applications.findByProgrammeIdAndUserId(1L, 2L)).thenReturn(Optional.empty());
        User applicant = User.create(Enums.Role.PARTICIPANT, "Amara", "amara@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(applicant, "id", 2L);
        when(users.findById(2L)).thenReturn(Optional.of(applicant));
        when(applications.save(any(Application.class))).thenAnswer(invocation -> {
            Application saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 9L);
            return saved;
        });

        var view = service.apply(actor(), new Requests.ApplyRequest(1L));

        assertEquals(9L, view.id());
        assertEquals("PENDING", view.status());
        assertEquals("Digital Foundations", view.programmeTitle());
    }
}
