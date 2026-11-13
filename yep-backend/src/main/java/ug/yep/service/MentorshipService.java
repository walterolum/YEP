package ug.yep.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.entity.Enums;
import ug.yep.entity.MentorSession;
import ug.yep.entity.Mentorship;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.MentorSessionRepository;
import ug.yep.repository.MentorshipRepository;
import ug.yep.repository.UserRepository;

/** Mentorship requests, acceptance, progress and meetings. */
@Service
public class MentorshipService {

    private final MentorshipRepository mentorships;
    private final MentorSessionRepository sessions;
    private final UserRepository users;
    private final NotificationService notifications;

    public MentorshipService(MentorshipRepository mentorships, MentorSessionRepository sessions,
                             UserRepository users, NotificationService notifications) {
        this.mentorships = mentorships;
        this.sessions = sessions;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional
    public Map<String, Object> request(Long menteeId, Long mentorId, String goal, String note) {
        User mentor = users.findById(mentorId).orElseThrow(() -> new NotFoundException("Mentor"));
        if (mentor.getRole() != Enums.Role.MENTOR && mentor.getRole() != Enums.Role.ADMIN) {
            throw new BusinessRuleException("That account is not a mentor.");
        }
        if (mentorships.findByMentorIdAndMenteeId(mentorId, menteeId).isPresent()) {
            throw new BusinessRuleException("You already have a mentorship with this mentor.");
        }
        User mentee = users.findById(menteeId).orElseThrow(() -> new NotFoundException("Account"));
        Mentorship mentorship = mentorships.save(new Mentorship(mentor, mentee, goal, note));
        notifications.send(mentor, "MENTORSHIP",
                mentee.getFullName() + " requested mentorship: " + goal);
        return view(mentorship);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> forMentor(Long mentorId) {
        return mentorships.findByMentorIdOrderByCreatedAtDesc(mentorId).stream()
                .map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> forMentee(Long menteeId) {
        return mentorships.findByMenteeIdOrderByCreatedAtDesc(menteeId).stream()
                .map(this::view).toList();
    }

    @Transactional
    public Map<String, Object> decide(Long actorId, Long mentorshipId, boolean accept) {
        Mentorship mentorship = mentorships.findById(mentorshipId)
                .orElseThrow(() -> new NotFoundException("Mentorship"));
        if (!mentorship.getMentor().getId().equals(actorId)) {
            throw new ForbiddenException("Only the mentor can respond to this request.");
        }
        if (mentorship.getStatus() != Enums.MentorshipStatus.REQUESTED) {
            throw new BusinessRuleException("This request has already been answered.");
        }
        mentorship.decide(accept ? Enums.MentorshipStatus.ACCEPTED : Enums.MentorshipStatus.DECLINED);
        notifications.send(mentorship.getMentee(), "MENTORSHIP",
                "Your mentorship request was " + (accept ? "accepted." : "declined."));
        return view(mentorship);
    }

    @Transactional
    public Map<String, Object> updateProgress(Long actorId, Long mentorshipId, int percent) {
        Mentorship mentorship = mentorships.findById(mentorshipId)
                .orElseThrow(() -> new NotFoundException("Mentorship"));
        if (!mentorship.getMentor().getId().equals(actorId)) {
            throw new ForbiddenException("Only the mentor can update progress.");
        }
        mentorship.updateProgress(percent);
        return view(mentorship);
    }

    @Transactional
    public Map<String, Object> schedule(Long actorId, Long mentorshipId, Requests.MentorSessionRequest request) {
        Mentorship mentorship = mentorships.findById(mentorshipId)
                .orElseThrow(() -> new NotFoundException("Mentorship"));
        if (!mentorship.getMentor().getId().equals(actorId)) {
            throw new ForbiddenException("Only the mentor can schedule meetings.");
        }
        MentorSession session = sessions.save(new MentorSession(mentorship, request.title(),
                request.startsAt()));
        notifications.send(mentorship.getMentee(), "MENTORSHIP",
                "A mentoring meeting was scheduled: " + session.getTitle());
        Map<String, Object> view = view(mentorship);
        view.put("nextSession", session.getTitle());
        view.put("nextSessionAt", session.getStartsAt().toString());
        return view;
    }

    private Map<String, Object> view(Mentorship mentorship) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", mentorship.getId());
        view.put("mentor", mentorship.getMentor().getFullName());
        view.put("mentee", mentorship.getMentee().getFullName());
        view.put("goal", mentorship.getGoal());
        view.put("status", mentorship.getStatus().name());
        view.put("progressPercent", mentorship.getProgressPercent());
        view.put("createdAt", mentorship.getCreatedAt().toString());
        List<Map<String, Object>> meetings = sessions.findByMentorshipMentorIdOrderByStartsAtAsc(
                        mentorship.getMentor().getId()).stream()
                .filter(session -> session.getMentorship().getId().equals(mentorship.getId()))
                .map(session -> {
                    Map<String, Object> meeting = new LinkedHashMap<>();
                    meeting.put("title", session.getTitle());
                    meeting.put("startsAt", session.getStartsAt().toString());
                    meeting.put("status", session.getStatus());
                    return meeting;
                }).toList();
        view.put("meetings", meetings);
        view.put("upcoming", meetings.stream()
                .anyMatch(meeting -> Instant.parse((String) meeting.get("startsAt")).isAfter(Instant.now())));
        return view;
    }
}
