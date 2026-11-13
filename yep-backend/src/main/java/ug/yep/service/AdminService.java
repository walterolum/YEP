package ug.yep.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Attendance;
import ug.yep.entity.Enums;
import ug.yep.entity.EventSession;
import ug.yep.entity.LearningResource;
import ug.yep.entity.Partner;
import ug.yep.entity.Pledge;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.EventSessionRepository;
import ug.yep.repository.LearningResourceRepository;
import ug.yep.repository.PartnerRepository;
import ug.yep.repository.PledgeRepository;
import ug.yep.repository.ProgrammeRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;

/** Administrative operations: sessions, attendance, settings, resources, partners and pledges. */
@Service
public class AdminService {

    private final EventSessionRepository sessions;
    private final AttendanceRepository attendance;
    private final UserRepository users;
    private final ProgrammeRepository programmes;
    private final LearningResourceRepository resources;
    private final PartnerRepository partners;
    private final PledgeRepository pledges;
    private final ug.yep.repository.ProjectRepository projects;
    private final SettingsService settings;
    private final AuditService audit;
    private final NotificationService notifications;

    public AdminService(EventSessionRepository sessions, AttendanceRepository attendance,
                        UserRepository users, ProgrammeRepository programmes,
                        LearningResourceRepository resources, PartnerRepository partners,
                        PledgeRepository pledges, ug.yep.repository.ProjectRepository projects,
                        SettingsService settings, AuditService audit,
                        NotificationService notifications) {
        this.sessions = sessions;
        this.attendance = attendance;
        this.users = users;
        this.programmes = programmes;
        this.resources = resources;
        this.partners = partners;
        this.pledges = pledges;
        this.projects = projects;
        this.settings = settings;
        this.audit = audit;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<Views.SessionView> sessions(Long userId) {
        return sessions.findAllByOrderByStartsAtAsc().stream()
                .map(session -> Views.SessionView.of(session,
                        userId != null && session.isRegistered(userId)))
                .toList();
    }

    @Transactional
    public Views.SessionView createSession(CurrentUser actor, Requests.CreateSessionRequest request) {
        Enums.SessionType type;
        try {
            type = Enums.SessionType.valueOf(request.type().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Unknown session type: " + request.type());
        }
        User creator = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        EventSession session = new EventSession(request.title(), type, request.startsAt(),
                request.cohort(),
                request.programmeId() == null ? null
                        : programmes.findById(request.programmeId()).orElse(null),
                creator, request.meetingLink());
        EventSession saved = sessions.save(session);
        saved.assignVirtualRoom();
        sessions.save(saved);
        users.findByRoleOrderByFullNameAsc(Enums.Role.PARTICIPANT).stream()
                .filter(user -> user.getStatus() == Enums.UserStatus.APPROVED)
                .forEach(user -> notifications.send(user, "SESSION",
                        "New session: " + saved.getTitle()));
        audit.record(creator, "SESSION_CREATE", "session", saved.getId(), saved.getTitle());
        return Views.SessionView.of(saved, false);
    }

    @Transactional
    public Views.SessionView sessionDetail(Long sessionId, Long userId) {
        EventSession session = sessions.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session"));
        if (session.getRoomName() == null) {
            session.assignVirtualRoom();
            sessions.save(session);
        }
        return Views.SessionView.of(session, userId != null && session.isRegistered(userId));
    }

    @Transactional
    public Map<String, Object> registerForSession(Long sessionId, Long userId) {
        EventSession session = sessions.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session"));
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        session.register(user);
        if (attendance.findBySessionIdAndUserId(sessionId, userId).isEmpty()) {
            attendance.save(new Attendance(session, user, false));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("registered", true);
        response.put("session", session.getTitle());
        return response;
    }

    @Transactional
    public Map<String, Object> markAttendance(Long sessionId, Requests.AttendanceRequest request) {
        EventSession session = sessions.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session"));
        User user = users.findById(request.userId()).orElseThrow(() -> new NotFoundException("Participant"));
        Attendance record = attendance.findBySessionIdAndUserId(sessionId, user.getId())
                .orElseGet(() -> new Attendance(session, user, request.present()));
        record.mark(request.present());
        attendance.save(record);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("marked", true);
        response.put("present", request.present());
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> sessionRoster(Long sessionId) {
        List<Map<String, Object>> roster = new ArrayList<>();
        attendance.findBySessionId(sessionId).forEach(record -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", record.getUser().getId());
            row.put("name", record.getUser().getFullName());
            row.put("present", record.isPresent());
            roster.add(row);
        });
        return roster;
    }

    @Transactional(readOnly = true)
    public Map<String, String> settings() {
        return settings.all();
    }

    @Transactional
    public Map<String, String> updateSettings(CurrentUser actor, Requests.SettingsRequest request) {
        Map<String, String> updated = settings.update(request.values());
        User user = users.findById(actor.id()).orElse(null);
        audit.record(user, "SETTINGS_UPDATE", "settings", null, String.join(", ", request.values().keySet()));
        return updated;
    }

    @Transactional(readOnly = true)
    public List<Views.AuditView> auditTrail() {
        return audit.recent().stream().map(Views.AuditView::of).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> resources() {
        return resources.findAllByOrderByCreatedAtDesc().stream().map(resource -> {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", resource.getId());
            view.put("title", resource.getTitle());
            view.put("type", resource.getType().name());
            view.put("url", resource.getUrl());
            view.put("owner", resource.getOwner().getFullName());
            return view;
        }).toList();
    }

    @Transactional
    public Map<String, Object> addResource(CurrentUser actor, Requests.ResourceRequest request) {
        Enums.MaterialType type;
        try {
            type = Enums.MaterialType.valueOf(request.type().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Unknown resource type: " + request.type());
        }
        User owner = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        LearningResource resource = resources.save(new LearningResource(owner, request.title(), type,
                request.url()));
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", resource.getId());
        view.put("title", resource.getTitle());
        view.put("type", resource.getType().name());
        view.put("url", resource.getUrl());
        return view;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> partners() {
        return partners.findByActiveTrueOrderByNameAsc().stream().map(partner -> {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", partner.getId());
            view.put("name", partner.getName());
            view.put("type", partner.getType());
            view.put("icon", partner.getIcon());
            return view;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> pledges() {
        return pledges.findAllByOrderByPledgedAtDesc().stream().map(pledge -> {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", pledge.getId());
            view.put("sponsor", pledge.getSponsor().getFullName());
            view.put("project", pledge.getProjectTitle());
            view.put("amountUgx", pledge.getAmountUgx());
            view.put("status", pledge.getStatus().name());
            view.put("pledgedAt", pledge.getPledgedAt().toString());
            return view;
        }).toList();
    }

    @Transactional
    public Map<String, Object> addPledge(CurrentUser actor, Requests.PledgeRequest request) {
        if (!actor.hasRole(Enums.Role.SPONSOR, Enums.Role.ADMIN)) {
            throw new BusinessRuleException("Only sponsors can record pledges.");
        }
        User sponsor = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        var project = request.projectId() == null ? null
                : projects.findById(request.projectId()).orElse(null);
        String title = request.projectTitle() == null || request.projectTitle().isBlank()
                ? (project == null ? "General fund" : project.getTitle())
                : request.projectTitle();
        Pledge pledge = pledges.save(new Pledge(sponsor, project, title,
                java.math.BigDecimal.valueOf(request.amountUgx())));
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", pledge.getId());
        view.put("amountUgx", pledge.getAmountUgx());
        view.put("status", pledge.getStatus().name());
        return view;
    }
}
