package ug.yep.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.entity.EventSession;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.EventSessionRepository;
import ug.yep.repository.ProgrammeRepository;
import ug.yep.repository.ProjectRepository;
import ug.yep.repository.SubmissionRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;

/** Aggregate numbers for the dashboards. Every figure is a database count. */
@Service
public class DashboardService {

    private final UserRepository users;
    private final ProgrammeRepository programmes;
    private final ProjectRepository projects;
    private final TeamRepository teams;
    private final CertificateRepository certificates;
    private final EventSessionRepository sessions;
    private final SubmissionRepository submissions;
    private final AttendanceRepository attendance;

    public DashboardService(UserRepository users, ProgrammeRepository programmes,
                            ProjectRepository projects, TeamRepository teams,
                            CertificateRepository certificates, EventSessionRepository sessions,
                            SubmissionRepository submissions, AttendanceRepository attendance) {
        this.users = users;
        this.programmes = programmes;
        this.projects = projects;
        this.teams = teams;
        this.certificates = certificates;
        this.sessions = sessions;
        this.submissions = submissions;
        this.attendance = attendance;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> admin() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("participants", users.countByRole(Enums.Role.PARTICIPANT));
        stats.put("pendingApprovals", users.findByStatusOrderByFullNameAsc(Enums.UserStatus.PENDING).size());
        stats.put("programmes", programmes.findByPublishedTrueOrderByTitleAsc().size());
        stats.put("activeProjects", projects.countByStatusNot(Enums.ProjectStatus.COMPLETED));
        stats.put("teams", teams.count());
        stats.put("certificates", certificates.count());
        stats.put("sessions", sessions.count());
        stats.put("submissions", submissions.count());
        stats.put("attendanceRecords", attendance.count());
        stats.put("mentors", users.countByRole(Enums.Role.MENTOR));
        stats.put("sponsors", users.countByRole(Enums.Role.SPONSOR));
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> participant(Long userId, Views.ProgressView progress) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("levelOnePercent", progress.levelOnePercent());
        stats.put("levelTwoPercent", progress.levelTwoPercent());
        stats.put("levelTwoUnlocked", progress.levelTwoUnlocked());
        stats.put("certificateEligible", progress.certificateEligible());
        stats.put("assessmentAverage", progress.assessmentAverage());
        stats.put("attendancePercent", progress.attendancePercent());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<Views.SessionView> upcomingSessions(Long userId) {
        return sessions.findByStartsAtAfterOrderByStartsAtAsc(java.time.Instant.now()).stream()
                .limit(5)
                .map(session -> Views.SessionView.of(session,
                        userId != null && session.isRegistered(userId)))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> publicStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("participants", users.countByRole(Enums.Role.PARTICIPANT));
        stats.put("programmes", programmes.findByPublishedTrueOrderByTitleAsc().size());
        stats.put("certificates", certificates.count());
        stats.put("projects", projects.count());
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> sponsor(Long sponsorId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("pledges", 0);
        stats.put("projects", projects.count());
        stats.put("participants", users.countByRole(Enums.Role.PARTICIPANT));
        stats.put("certificates", certificates.count());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<EventSession> sessionEntities() {
        return sessions.findAllByOrderByStartsAtAsc();
    }
}
