package ug.yep.service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.Enums;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.EventSessionRepository;
import ug.yep.repository.ProjectRepository;
import ug.yep.repository.UserRepository;

/**
 * Real numbers for the instructor, reviewer and employer dashboards. Each role sees the
 * counts its duties need — never the administrator's full statistics.
 */
@Service
public class RoleWorkspaceService {

    private final UserRepository users;
    private final CourseRepository courses;
    private final ProjectRepository projects;
    private final CertificateRepository certificates;
    private final EventSessionRepository sessions;

    public RoleWorkspaceService(UserRepository users, CourseRepository courses,
                                ProjectRepository projects, CertificateRepository certificates,
                                EventSessionRepository sessions) {
        this.users = users;
        this.courses = courses;
        this.projects = projects;
        this.certificates = certificates;
        this.sessions = sessions;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("courses", courses.count());
        stats.put("participants", users.countByRole(Enums.Role.PARTICIPANT));
        stats.put("approvedParticipants", users.findByRoleAndStatusOrderByFullNameAsc(
                Enums.Role.PARTICIPANT, Enums.UserStatus.APPROVED).size());
        stats.put("projects", projects.count());
        stats.put("certificates", certificates.count());
        stats.put("sessions", sessions.count());
        stats.put("instructors", users.countByRole(Enums.Role.INSTRUCTOR));
        stats.put("employers", users.countByRole(Enums.Role.EMPLOYER));
        return stats;
    }
}
