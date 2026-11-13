package ug.yep.report.impl;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Enums;
import ug.yep.entity.Programme;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.ApplicationRepository;
import ug.yep.repository.ProgrammeRepository;

/** Enrolment demand against capacity for every programme. */
@Component
public class EnrolmentReport implements ReportGenerator {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            .withZone(ZoneOffset.UTC);

    private final ProgrammeRepository programmes;
    private final ApplicationRepository applications;

    public EnrolmentReport(ProgrammeRepository programmes, ApplicationRepository applications) {
        this.programmes = programmes;
        this.applications = applications;
    }

    @Override
    public String key() {
        return "enrolment";
    }

    @Override
    public String title() {
        return "Programme Enrolment";
    }

    @Override
    public List<String> columns() {
        return List.of("Programme", "Category", "Capacity", "Approved", "Pending", "Places left", "Deadline");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (Programme programme : programmes.findAllByOrderByTitleAsc()) {
            long approved = applications.countByProgrammeIdAndStatus(programme.getId(),
                    Enums.ApplicationStatus.APPROVED);
            long pending = applications.countByProgrammeIdAndStatus(programme.getId(),
                    Enums.ApplicationStatus.PENDING);
            rows.add(List.of(programme.getTitle(), programme.getCategory(), programme.getCapacity(),
                    approved, pending, Math.max(0, programme.getCapacity() - approved),
                    DATE.format(programme.getRegistrationDeadline())));
        }
        return rows;
    }
}
