package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.entity.Enums;
import ug.yep.entity.MessageThread;
import ug.yep.entity.Team;
import ug.yep.entity.User;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.MessageRepository;
import ug.yep.repository.MessageThreadRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;
import ug.yep.service.impl.MessagingServiceImpl;

/** Visibility and reply rules per thread kind. */
class MessagingServiceTest {

    private UserRepository users;
    private MessageThreadRepository threads;
    private MessagingServiceImpl service;

    private User participant;
    private User facilitator;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        threads = mock(MessageThreadRepository.class);
        service = new MessagingServiceImpl(threads, mock(MessageRepository.class), users,
                mock(TeamRepository.class), mock(NotificationService.class));

        participant = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(participant, "id", 2L);
        facilitator = User.create(Enums.Role.FACILITATOR, "Daniel Okello", "daniel@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(facilitator, "id", 5L);

        when(users.findById(2L)).thenReturn(Optional.of(participant));
        when(users.findById(5L)).thenReturn(Optional.of(facilitator));
    }

    private MessageThread announcement() {
        MessageThread thread = new MessageThread(Enums.ThreadKind.ANNOUNCEMENT, "Cohort update",
                null, facilitator, null);
        thread.addMember(facilitator);
        thread.addMember(participant);
        return thread;
    }

    @Test
    void announcementsAreReadOnlyForParticipants() {
        assertFalse(service.canReply(announcement(), 2L));
    }

    @Test
    void announcementsAreAnswerableByFacilitators() {
        assertTrue(service.canReply(announcement(), 5L));
    }

    @Test
    void nonMembersCannotReadOrReply() {
        MessageThread thread = new MessageThread(Enums.ThreadKind.DM, "Private", null,
                facilitator, participant);
        thread.addMember(facilitator);
        ReflectionTestUtils.setField(thread, "id", 8L);
        when(threads.findById(8L)).thenReturn(Optional.of(thread));

        assertFalse(service.canReply(thread, 2L), "participant is not a member of this thread");
        assertThrows(ForbiddenException.class, () -> service.thread(8L, 2L));
    }

    @Test
    void directMessagesAreAnswerableByBothMembers() {
        MessageThread thread = new MessageThread(Enums.ThreadKind.DM, "Hello", null,
                facilitator, participant);
        thread.addMember(facilitator);
        thread.addMember(participant);

        assertTrue(service.canReply(thread, 2L));
        assertTrue(service.canReply(thread, 5L));
    }

    @Test
    void teamThreadsRequireTeamMembership() {
        Team team = new Team("Team Alpha", null, facilitator, "Cohort A");
        MessageThread thread = new MessageThread(Enums.ThreadKind.TEAM, "Team chat", team,
                facilitator, null);
        thread.addMember(facilitator);

        assertTrue(service.canReply(thread, 5L));
        assertFalse(service.canReply(thread, 2L));
    }
}
