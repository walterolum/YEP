package ug.yep.report.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.UserRepository;

/** Attendance rate per participant. */
@Component
public class AttendanceReport implements ReportGenerator {

    private final UserRepository users;
    private final AttendanceRepository attendance;

    public AttendanceReport(UserRepository users, AttendanceRepository attendance) {
        this.users = users;
        this.attendance = attendance;
    }

    @Override
    public String key() {
        return "attendance";
    }

    @Override
    public String title() {
        return "Session Attendance";
    }

    @Override
    public List<String> columns() {
        return List.of("Participant", "Sessions recorded", "Sessions attended", "Attendance %");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (User user : users.findByRoleOrderByFullNameAsc(Enums.Role.PARTICIPANT)) {
            long recorded = attendance.countByUserId(user.getId());
            long present = attendance.countByUserIdAndPresentTrue(user.getId());
            int percent = recorded == 0 ? 0 : (int) Math.round(present * 100.0 / recorded);
            rows.add(List.of(user.getFullName(), recorded, present, percent));
        }
        return rows;
    }
}
