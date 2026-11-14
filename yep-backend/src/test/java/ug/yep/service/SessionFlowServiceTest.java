package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.BookingSlot;
import ug.yep.entity.Enums;
import ug.yep.entity.EventSession;
import ug.yep.entity.SessionSeries;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.BookingSlotRepository;
import ug.yep.repository.EventSessionRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.ProgrammeRepository;
import ug.yep.repository.SessionFeedbackRepository;
import ug.yep.repository.SessionRecordingRepository;
import ug.yep.repository.SessionSeriesRepository;
import ug.yep.repository.SlotBookingRepository;
import ug.yep.repository.UserRepository;

/** Phase 4: series generation, calendar export, attendance and slot capacity. */
class SessionFlowServiceTest {

    private SessionSeriesRepository series;
    private EventSessionRepository sessions;
    private BookingSlotRepository slots;
    private SessionFlowService service;
    private User creator;

    @BeforeEach
    void setUp() {
        series = mock(SessionSeriesRepository.class);
        sessions = mock(EventSessionRepository.class);
        slots = mock(BookingSlotRepository.class);
        UserRepository users = mock(UserRepository.class);
        service = new SessionFlowService(series, sessions, mock(AttendanceRepository.class),
                mock(SessionRecordingRepository.class), mock(SessionFeedbackRepository.class), slots,
                mock(SlotBookingRepository.class), mock(ProgrammeRepository.class),
                mock(ModuleRepository.class), mock(LessonRepository.class), users,
                new SessionProvider(""));

        creator = User.create(Enums.Role.FACILITATOR, "Grace", "grace@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(creator, "id", 7L);
        when(users.findById(7L)).thenReturn(Optional.of(creator));
        when(series.save(any(SessionSeries.class))).thenAnswer(i -> {
            SessionSeries saved = i.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 3L);
            return saved;
        });
        when(sessions.save(any(EventSession.class))).thenAnswer(i -> {
            EventSession saved = i.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 40L);
            return saved;
        });
    }

    @Test
    void aFourWeekSeriesCreatesFourSessions() {
        var result = service.createSeries(7L, new Requests.SeriesRequest("Career clinic",
                "WORKSHOP", Instant.parse("2027-01-04T15:00:00Z"), 4, 60, "2027-A", null));

        assertEquals(4, ((List<?>) result.get("sessions")).size());
        assertEquals("jitsi", result.get("provider"));
        verify(sessions, times(4)).save(any(EventSession.class));
    }

    @Test
    void aSingleInPersonSeriesIsClampedToAValidWeekCount() {
        var result = service.createSeries(7L, new Requests.SeriesRequest("One-off",
                "WEBINAR", Instant.parse("2027-02-01T10:00:00Z"), 0, 45, null, null));

        assertEquals(1, result.get("repeatWeeks"));
    }

    @Test
    void theCalendarContainsAWellFormedEvent() {
        EventSession session = new EventSession("Career clinic", Enums.SessionType.WORKSHOP,
                Instant.parse("2027-01-04T15:00:00Z"), "2027-A", null, creator, null);
        ReflectionTestUtils.setField(session, "id", 41L);
        session.applyRoom("jitsi", "https://meet.jit.si/yep-test", 60, 3L);
        when(sessions.findById(41L)).thenReturn(Optional.of(session));

        String ics = service.ics(7L, 41L);

        assertTrue(ics.startsWith("BEGIN:VCALENDAR"));
        assertTrue(ics.contains("UID:yep-session-41@yep.ug"));
        assertTrue(ics.contains("DTSTART:20270104T150000Z"));
        assertTrue(ics.contains("END:VCALENDAR"));
    }

    @Test
    void aSlotCannotBeOverBooked() {
        EventSession session = mock(EventSession.class);
        BookingSlot slot = new BookingSlot(session, Instant.now(), Instant.now().plusSeconds(1800), 1);
        when(slots.findById(9L)).thenReturn(Optional.of(slot));
        when(slots.save(any(BookingSlot.class))).thenAnswer(i -> i.getArgument(0));
        User second = User.create(Enums.Role.PARTICIPANT, "Daniel", "daniel@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(second, "id", 3L);
        when(session.getId()).thenReturn(41L);
        UserRepository users = mock(UserRepository.class);
        when(users.findById(2L)).thenReturn(Optional.of(creator));
        when(users.findById(3L)).thenReturn(Optional.of(second));

        SessionFlowService fresh = new SessionFlowService(series, sessions,
                mock(AttendanceRepository.class), mock(SessionRecordingRepository.class),
                mock(SessionFeedbackRepository.class), slots, mock(SlotBookingRepository.class),
                mock(ProgrammeRepository.class), mock(ModuleRepository.class),
                mock(LessonRepository.class), users, new SessionProvider(""));

        fresh.book(2L, 9L);
        assertThrows(BusinessRuleException.class, () -> fresh.book(3L, 9L));
    }
}
