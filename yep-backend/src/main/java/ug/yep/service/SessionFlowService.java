package ug.yep.service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.entity.Attendance;
import ug.yep.entity.BookingSlot;
import ug.yep.entity.EventSession;
import ug.yep.entity.Lesson;
import ug.yep.entity.Module;
import ug.yep.entity.Programme;
import ug.yep.entity.SessionFeedback;
import ug.yep.entity.SessionRecording;
import ug.yep.entity.SessionSeries;
import ug.yep.entity.SlotBooking;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.NotFoundException;
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

/** Phase 4: recurring sessions, join links, attendance, recordings, feedback and slots. */
@Service
public class SessionFlowService {

    private static final DateTimeFormatter ICS_TIME =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);

    private final SessionSeriesRepository series;
    private final EventSessionRepository sessions;
    private final AttendanceRepository attendance;
    private final SessionRecordingRepository recordings;
    private final SessionFeedbackRepository feedback;
    private final BookingSlotRepository slots;
    private final SlotBookingRepository bookings;
    private final ProgrammeRepository programmes;
    private final ModuleRepository modules;
    private final LessonRepository lessons;
    private final UserRepository users;
    private final SessionProvider provider;

    public SessionFlowService(SessionSeriesRepository series, EventSessionRepository sessions,
                              AttendanceRepository attendance,
                              SessionRecordingRepository recordings,
                              SessionFeedbackRepository feedback, BookingSlotRepository slots,
                              SlotBookingRepository bookings, ProgrammeRepository programmes,
                              ModuleRepository modules, LessonRepository lessons,
                              UserRepository users, SessionProvider provider) {
        this.series = series;
        this.sessions = sessions;
        this.attendance = attendance;
        this.recordings = recordings;
        this.feedback = feedback;
        this.slots = slots;
        this.bookings = bookings;
        this.programmes = programmes;
        this.modules = modules;
        this.lessons = lessons;
        this.users = users;
        this.provider = provider;
    }

    // ------------------------------------------------------------- series

    @Transactional
    public Map<String, Object> createSeries(Long userId, Requests.SeriesRequest request) {
        User creator = user(userId);
        Programme programme = request.programmeId() == null ? null
                : programmes.findById(request.programmeId())
                        .orElseThrow(() -> new NotFoundException("Programme"));
        int weeks = Math.max(1, Math.min(request.repeatWeeks(), 26));
        SessionSeries saved = series.save(new SessionSeries(request.title(),
                ug.yep.entity.Enums.SessionType.valueOf(request.type().toUpperCase(java.util.Locale.ROOT)),
                request.startsAt(), weeks, request.durationMinutes(), request.cohort(), programme,
                creator, provider.name()));

        List<Long> ids = new ArrayList<>();
        for (int week = 0; week < weeks; week++) {
            EventSession session = new EventSession(request.title(),
                    saved.getType(), request.startsAt().plus(Duration.ofDays(7L * week)),
                    request.cohort(), programme, creator, null);
            String room = provider.roomName(request.title());
            session.applyRoom(saved.getProvider(), provider.joinUrl(room), request.durationMinutes(),
                    saved.getId());
            session.setRoomName(room);
            ids.add(sessions.save(session).getId());
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("seriesId", saved.getId());
        result.put("provider", saved.getProvider());
        result.put("sessions", ids);
        result.put("repeatWeeks", weeks);
        return result;
    }

    // --------------------------------------------------------------- ICS

    public String ics(Long userId, Long sessionId) {
        List<EventSession> events = sessionId == null
                ? sessions.findByStartsAtAfterOrderByStartsAtAsc(Instant.now().minusSeconds(3600)).stream()
                        .filter(session -> session.isRegistered(userId)).toList()
                : List.of(session(sessionId));
        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//YEP//Sessions//EN\r\nCALSCALE:GREGORIAN\r\n");
        for (EventSession session : events) {
            ics.append("BEGIN:VEVENT\r\n")
                    .append("UID:yep-session-").append(session.getId()).append("@yep.ug\r\n")
                    .append("DTSTAMP:").append(ICS_TIME.format(Instant.now())).append("\r\n")
                    .append("DTSTART:").append(ICS_TIME.format(session.getStartsAt())).append("\r\n")
                    .append("DTEND:").append(ICS_TIME.format(session.getStartsAt()
                            .plus(Duration.ofMinutes(session.getDurationMinutes())))).append("\r\n")
                    .append("SUMMARY:").append(escape(session.getTitle())).append("\r\n")
                    .append("LOCATION:").append(escape(session.getRoomUrl() == null ? ""
                            : session.getRoomUrl())).append("\r\n")
                    .append("DESCRIPTION:").append(escape("Join with your YEP account. Provider: "
                            + session.getProvider())).append("\r\n")
                    .append("END:VEVENT\r\n");
        }
        return ics.append("END:VCALENDAR\r\n").toString();
    }

    // ---------------------------------------------------------- attendance

    @Transactional
    public Map<String, Object> attend(Long userId, Long sessionId) {
        EventSession session = session(sessionId);
        User learner = user(userId);
        if (!session.isRegistered(userId)) {
            session.register(learner);
            sessions.save(session);
        }
        Attendance record = attendance.findBySessionIdAndUserId(sessionId, userId)
                .orElseGet(() -> new Attendance(session, learner, true));
        record.mark(true);
        attendance.save(record);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sessionId", sessionId);
        result.put("present", true);
        result.put("checkedInAt", Instant.now());
        return result;
    }

    // ---------------------------------------------------------- recordings

    @Transactional
    public Map<String, Object> addRecording(Long userId, Long sessionId, Requests.RecordingRequest request) {
        EventSession session = session(sessionId);
        SessionRecording recording = recordings.save(new SessionRecording(session,
                request.title(), request.url(), request.transcript()));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", recording.getId());
        result.put("sessionId", sessionId);
        result.put("title", recording.getTitle());
        result.put("url", recording.getUrl());
        return result;
    }

    /** Publishes a recording as a VIDEO lesson inside a course module. */
    @Transactional
    public Map<String, Object> publishRecording(Long userId, Long recordingId,
                                                Requests.PublishRecordingRequest request) {
        SessionRecording recording = recordings.findById(recordingId)
                .orElseThrow(() -> new NotFoundException("Recording"));
        Module module = modules.findById(request.moduleId())
                .orElseThrow(() -> new NotFoundException("Module"));
        int sortOrder = lessons.findByModuleIdOrderBySortOrderAsc(module.getId()).size() * 10 + 10;
        Lesson lesson = new Lesson(module, recording.getTitle(), ug.yep.entity.Enums.LessonType.VIDEO,
                sortOrder, "Recorded session: " + recording.getTitle(), 45);
        lesson.setVideo(recording.getUrl(), recording.getTranscript(), null);
        Lesson saved = lessons.save(lesson);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("lessonId", saved.getId());
        result.put("moduleId", module.getId());
        result.put("title", saved.getTitle());
        return result;
    }

    public List<Map<String, Object>> sessionRecordings(Long sessionId) {
        return recordings.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(recording -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", recording.getId());
                    row.put("title", recording.getTitle());
                    row.put("url", recording.getUrl());
                    return row;
                }).toList();
    }

    // ------------------------------------------------------------ feedback

    @Transactional
    public Map<String, Object> feedback(Long userId, Long sessionId,
                                        Requests.SessionFeedbackRequest request) {
        EventSession session = session(sessionId);
        if (!session.isRegistered(userId) && !attendance.findBySessionIdAndUserId(sessionId, userId)
                .map(Attendance::isPresent).orElse(false)) {
            throw new BusinessRuleException("Register and attend before leaving feedback.");
        }
        int rating = Math.max(1, Math.min(5, request.rating()));
        SessionFeedback entry = feedback.findBySessionIdAndUserId(sessionId, userId)
                .orElseGet(() -> new SessionFeedback(session, user(userId), rating, request.comment()));
        entry.update(rating, request.comment());
        feedback.save(entry);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sessionId", sessionId);
        result.put("rating", entry.getRating());
        result.put("comment", entry.getComment());
        return result;
    }

    // --------------------------------------------------------------- slots

    @Transactional
    public Map<String, Object> createSlot(Long sessionId, Requests.SlotRequest request) {
        EventSession session = session(sessionId);
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw new BusinessRuleException("A slot must end after it starts.");
        }
        BookingSlot slot = slots.save(new BookingSlot(session, request.startsAt(), request.endsAt(),
                Math.max(1, request.capacity())));
        return slotView(slot);
    }

    public List<Map<String, Object>> sessionSlots(Long sessionId) {
        return slots.findBySessionIdOrderByStartsAtAsc(sessionId).stream().map(this::slotView).toList();
    }

    @Transactional
    public Map<String, Object> book(Long userId, Long slotId) {
        BookingSlot slot = slots.findById(slotId).orElseThrow(() -> new NotFoundException("Slot"));
        if (bookings.existsBySlotIdAndUserId(slotId, userId)) {
            throw new BusinessRuleException("You already booked this slot.");
        }
        if (!slot.book()) {
            throw new BusinessRuleException("This slot is full.");
        }
        slots.save(slot);
        bookings.save(new SlotBooking(slot, user(userId)));
        return slotView(slot);
    }

    private Map<String, Object> slotView(BookingSlot slot) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", slot.getId());
        row.put("sessionId", slot.getSession().getId());
        row.put("startsAt", slot.getStartsAt());
        row.put("endsAt", slot.getEndsAt());
        row.put("capacity", slot.getCapacity());
        row.put("booked", slot.getBookedCount());
        return row;
    }

    private EventSession session(Long sessionId) {
        return sessions.findById(sessionId).orElseThrow(() -> new NotFoundException("Session"));
    }

    private User user(Long userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,")
                .replace("\r\n", "\\n").replace("\n", "\\n");
    }
}
