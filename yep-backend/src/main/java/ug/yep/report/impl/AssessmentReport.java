package ug.yep.report.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Assessment;
import ug.yep.entity.Submission;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.AssessmentRepository;
import ug.yep.repository.SubmissionRepository;

/** Scores per assessment, with the publication state so the report is never misleading. */
@Component
public class AssessmentReport implements ReportGenerator {

    private final AssessmentRepository assessments;
    private final SubmissionRepository submissions;

    public AssessmentReport(AssessmentRepository assessments, SubmissionRepository submissions) {
        this.assessments = assessments;
        this.submissions = submissions;
    }

    @Override
    public String key() {
        return "assessments";
    }

    @Override
    public String title() {
        return "Assessment Results";
    }

    @Override
    public List<String> columns() {
        return List.of("Assessment", "Module", "Participant", "Score", "Total", "Percentage", "Published");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (Assessment assessment : assessments.findAllByOrderByDueDateAsc()) {
            for (Submission submission : submissions.findByAssessmentIdOrderBySubmittedAtAsc(assessment.getId())) {
                rows.add(List.of(assessment.getTitle(), assessment.getModule().getName(),
                        submission.getUser().getFullName(),
                        submission.getScore() == null ? "Not graded" : submission.getScore(),
                        assessment.getTotalMarks(),
                        submission.getScore() == null ? "-" : assessment.percentage(submission.getScore()),
                        assessment.isResultsPublished() ? "Yes" : "Pending"));
            }
        }
        return rows;
    }
}
