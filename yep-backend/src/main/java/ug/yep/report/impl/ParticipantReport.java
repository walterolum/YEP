package ug.yep.report.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.UserRepository;
import ug.yep.service.LearningService;

/** One row per participant with status, level progress and certificate code. */
@Component
public class ParticipantReport implements ReportGenerator {

    private final UserRepository users;
    private final CertificateRepository certificates;
    private final LearningService learning;

    public ParticipantReport(UserRepository users, CertificateRepository certificates,
                             LearningService learning) {
        this.users = users;
        this.certificates = certificates;
        this.learning = learning;
    }

    @Override
    public String key() {
        return "participants";
    }

    @Override
    public String title() {
        return "Participant Register";
    }

    @Override
    public List<String> columns() {
        return List.of("Name", "Email", "District", "Status", "Level One %", "Level Two %", "Certificate");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (User user : users.findByRoleOrderByFullNameAsc(Enums.Role.PARTICIPANT)) {
            var progress = learning.progress(user.getId());
            rows.add(List.of(user.getFullName(), user.getEmail(), nullSafe(user.getDistrict()),
                    user.getStatus().name(), progress.levelOnePercent(), progress.levelTwoPercent(),
                    certificates.findByUserId(user.getId())
                            .map(certificate -> certificate.getCode()).orElse("Not issued")));
        }
        return rows;
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
