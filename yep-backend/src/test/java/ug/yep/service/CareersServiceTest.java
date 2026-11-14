package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Enums;
import ug.yep.entity.JobApplication;
import ug.yep.entity.JobPosting;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.JobApplicationRepository;
import ug.yep.repository.JobPostingRepository;
import ug.yep.repository.PortfolioItemRepository;
import ug.yep.repository.SavedJobRepository;
import ug.yep.repository.UserRepository;

/** Phase 6: applications, duplicate guards and employer ownership. */
class CareersServiceTest {

    private JobApplicationRepository applications;
    private CareersService service;
    private JobPosting posting;
    private User employer;
    private User learner;

    @BeforeEach
    void setUp() {
        JobPostingRepository postings = mock(JobPostingRepository.class);
        applications = mock(JobApplicationRepository.class);
        UserRepository users = mock(UserRepository.class);
        service = new CareersService(postings, applications, mock(SavedJobRepository.class),
                mock(PortfolioItemRepository.class), users);

        employer = User.create(Enums.Role.EMPLOYER, "Acme HR", "employer@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(employer, "id", 16L);
        learner = User.create(Enums.Role.PARTICIPANT, "Amara", "amara@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(learner, "id", 2L);
        posting = new JobPosting(employer, "Junior Developer", "Acme", "Kampala", "HYBRID",
                "Build pages", "HTML, CSS", null);
        ReflectionTestUtils.setField(posting, "id", 1L);

        when(postings.findById(1L)).thenReturn(Optional.of(posting));
        when(users.findById(2L)).thenReturn(Optional.of(learner));
        when(users.findById(16L)).thenReturn(Optional.of(employer));
        when(applications.save(any(JobApplication.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void aLearnerAppliesOnce() {
        when(applications.findByPostingIdAndUserId(1L, 2L)).thenReturn(Optional.empty());

        var result = service.apply(2L, 1L, new Requests.JobApplyRequest("I can build pages."));

        assertEquals("SUBMITTED", result.get("status"));
        assertEquals("Junior Developer", result.get("title"));
    }

    @Test
    void aSecondApplicationIsRejected() {
        when(applications.findByPostingIdAndUserId(1L, 2L)).thenReturn(Optional.of(
                new JobApplication(posting, learner, "first")));

        assertThrows(BusinessRuleException.class,
                () -> service.apply(2L, 1L, new Requests.JobApplyRequest("again")));
    }

    @Test
    void aClosedPostingRejectsApplications() {
        posting.close();
        assertThrows(BusinessRuleException.class,
                () -> service.apply(2L, 1L, new Requests.JobApplyRequest("too late")));
    }

    @Test
    void anotherEmployerCannotSeeApplicants() {
        assertThrows(ForbiddenException.class, () -> service.applicants(99L, 1L));
    }

    @Test
    void aDecisionMustBeOneOfTheAllowedStatuses() {
        JobApplication application = new JobApplication(posting, learner, "hire me");
        ReflectionTestUtils.setField(application, "id", 7L);
        when(applications.findById(7L)).thenReturn(Optional.of(application));

        assertThrows(BusinessRuleException.class, () -> service.decide(16L, 7L, "MAYBE"));
        assertEquals("HIRED", service.decide(16L, 7L, "hired").get("status"));
    }
}
