package ug.yep.report.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.UserRepository;
import ug.yep.service.LearningService;

/** Learning progress per participant, including Level Two eligibility inputs. */
@Component
public class ProgressReport implements ReportGenerator {

    private final UserRepository users;
    private final LearningService learning;

    public ProgressReport(UserRepository users, LearningService learning) {
        this.users = users;
        this.learning = learning;
    }

    @Override
    public String key() {
        return "progress";
    }

    @Override
    public String title() {
        return "Learning Progress";
    }

    @Override
    public List<String> columns() {
        return List.of("Participant", "Lessons completed", "Total lessons", "Level One %",
                "Level Two %", "Assessment average %", "Attendance %", "Level Two eligible");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (User user : users.findByRoleOrderByFullNameAsc(Enums.Role.PARTICIPANT)) {
            var progress = learning.progress(user.getId());
            rows.add(List.of(user.getFullName(), progress.completedLessons(), progress.totalLessons(),
                    progress.levelOnePercent(), progress.levelTwoPercent(),
                    progress.assessmentAverage(), progress.attendancePercent(),
                    progress.levelTwoEligible() ? "Yes" : "No"));
        }
        return rows;
    }
}
