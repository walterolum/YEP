package com.youthrise.report;

import com.youthrise.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportingController {

    private final ReportingService reports;

    public ReportingController(ReportingService reports) {
        this.reports = reports;
    }

    @GetMapping("/cohort-members")
    public List<ReportingDtos.CohortMemberResponse> cohortMembers(
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        return reports.cohortMembers(principal, request.getRemoteAddr());
    }

    @GetMapping("/programme-participation")
    public List<ReportingDtos.ProgrammeParticipationResponse> programmeParticipation(
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        return reports.programmeParticipation(principal, request.getRemoteAddr());
    }

    @GetMapping("/attendance")
    public List<ReportingDtos.AttendanceResponse> attendance(
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        return reports.attendance(principal, request.getRemoteAddr());
    }

    @GetMapping("/completion-buckets")
    public List<ReportingDtos.CompletionBucketResponse> completionBuckets(
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        return reports.completionBuckets(principal, request.getRemoteAddr());
    }

    @GetMapping("/facilitator-summary")
    public ReportingDtos.FacilitatorSummaryResponse facilitatorSummary(
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        return reports.facilitatorSummary(principal, request.getRemoteAddr());
    }
}
