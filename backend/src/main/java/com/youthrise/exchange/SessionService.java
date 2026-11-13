package com.youthrise.exchange;

import com.youthrise.common.ApiException;
import com.youthrise.notification.NotificationKind;
import com.youthrise.notification.NotificationService;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.EnrolmentStatus;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.time.DateTimeException;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {

    private final ExchangeSessionRepository sessions;
    private final SessionRegistrationRepository registrations;
    private final ProgrammeRepository programmes;
    private final EnrolmentRepository enrolments;
    private final UserRepository users;
    private final NotificationService notifications;

    public SessionService(ExchangeSessionRepository sessions, SessionRegistrationRepository registrations,
                          ProgrammeRepository programmes, EnrolmentRepository enrolments,
                          UserRepository users, NotificationService notifications) {
        this.sessions = sessions;
        this.registrations = registrations;
        this.programmes = programmes;
        this.enrolments = enrolments;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ExchangeDtos.SessionResponse> list(UserPrincipal principal) {
        Set<String> mine = Set.copyOf(registrations.findSessionIdsForUser(principal.id()));
        return sessions.findAllByOrderByStartsAtAsc().stream()
                .map(session -> toResponse(session, canSeeMeetingUrl(session, principal, mine)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> myRegistrations(String userId) {
        return registrations.findSessionIdsForUser(userId);
    }

    @Transactional
    public ExchangeDtos.SessionResponse create(ExchangeDtos.CreateSessionRequest request, UserPrincipal principal) {
        if (principal.role() != Role.FACILITATOR && principal.role() != Role.ADMIN) {
            throw ApiException.forbidden("FORBIDDEN", "Only facilitators can schedule exchange sessions.");
        }
        Programme programme = programmes.findById(request.programmeId())
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND", "That programme could not be found."));
        if (principal.role() == Role.FACILITATOR
                && !programme.getFacilitator().getId().equals(principal.id())) {
            throw ApiException.forbidden("FORBIDDEN", "You can only schedule sessions for your own programmes.");
        }
        ZoneId zone;
        try {
            zone = ZoneId.of(request.timezone());
        } catch (DateTimeException ex) {
            throw ApiException.validation("timezone", "Enter a valid IANA time zone, for example Africa/Kampala.");
        }
        if (!request.startsAt().isAfter(Instant.now())) {
            throw ApiException.validation("startsAt", "Choose a start time in the future.");
        }
        String meetingUrl = blankToNull(request.meetingUrl());
        if (meetingUrl != null && !meetingUrl.startsWith("https://")) {
            throw ApiException.validation("meetingUrl", "Meeting links must use https.");
        }
        User facilitator = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));

        ExchangeSession session = ExchangeSession.create(programme, request.title(), request.startsAt(),
                request.durationMins(), zone.getId(), facilitator, request.capacity(),
                request.description(), meetingUrl);
        return toResponse(sessions.save(session), true);
    }

    @Transactional
    public void register(String sessionId, UserPrincipal principal) {
        if (principal.role() != Role.PARTICIPANT) {
            throw ApiException.forbidden("SESSION_PARTICIPANTS_ONLY",
                    "Only participants can register for exchange sessions.");
        }
        ExchangeSession session = sessions.findByIdForUpdate(sessionId)
                .orElseThrow(() -> ApiException.notFound("SESSION_NOT_FOUND",
                        "That session could not be found."));
        if (!session.isUpcoming()) {
            throw ApiException.conflict("SESSION_CLOSED",
                    "Registration is not available for this session.");
        }
        boolean enrolled = enrolments.findByProgrammeIdAndUserId(session.getProgramme().getId(), principal.id())
                .filter(enrolment -> enrolment.getStatus() == EnrolmentStatus.ACTIVE
                        || enrolment.getStatus() == EnrolmentStatus.COMPLETED)
                .isPresent();
        if (!enrolled) {
            throw ApiException.forbidden("ENROLMENT_REQUIRED",
                    "Enrol in the programme before registering for its sessions.");
        }
        if (registrations.findBySessionIdAndUserId(sessionId, principal.id()).isPresent()) {
            return;
        }
        if (registrations.countBySessionId(sessionId) >= session.getCapacity()) {
            throw ApiException.conflict("SESSION_FULL",
                    "This session is full. Try another session or contact the facilitator.");
        }
        User user = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        try {
            registrations.saveAndFlush(SessionRegistration.create(session, user));
        } catch (DataIntegrityViolationException ex) {
            // Concurrent double-submit: the unique constraint already recorded the registration.
            return;
        }
        notifications.notifyUser(user, "Session confirmed",
                "You are registered for \"" + session.getTitle() + "\" on " + session.getStartsAt() + ".",
                "/app/sessions", NotificationKind.SESSION);
    }

    @Transactional
    public void cancel(String sessionId, UserPrincipal principal) {
        ExchangeSession session = sessions.findById(sessionId)
                .orElseThrow(() -> ApiException.notFound("SESSION_NOT_FOUND",
                        "That session could not be found."));
        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw ApiException.conflict("SESSION_COMPLETED",
                    "Completed sessions can no longer be cancelled.");
        }
        registrations.findBySessionIdAndUserId(sessionId, principal.id())
                .ifPresent(registrations::delete);
    }

    private boolean canSeeMeetingUrl(ExchangeSession session, UserPrincipal principal, Set<String> mine) {
        if (principal.role() == Role.ADMIN) {
            return true;
        }
        if (session.getFacilitator().getId().equals(principal.id())) {
            return true;
        }
        return mine.contains(session.getId());
    }

    private ExchangeDtos.SessionResponse toResponse(ExchangeSession session, boolean includeMeetingUrl) {
        return new ExchangeDtos.SessionResponse(
                session.getId(),
                session.getTitle(),
                session.getProgramme().getId(),
                session.getStartsAt(),
                session.getDurationMins(),
                session.getTimezone(),
                session.getFacilitator().getId(),
                session.getCapacity(),
                session.getRegisteredCount(),
                session.getDescription(),
                includeMeetingUrl ? session.getMeetingUrl() : null,
                session.getStatus());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
