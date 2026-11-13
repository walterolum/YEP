package com.youthrise.report;

import com.youthrise.common.ApiException;
import com.youthrise.common.AuditService;
import com.youthrise.exchange.ExchangeSession;
import com.youthrise.exchange.ExchangeSessionRepository;
import com.youthrise.exchange.SessionRegistrationRepository;
import com.youthrise.partner.NominationRepository;
import com.youthrise.programme.Enrolment;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.EnrolmentStatus;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.project.SubmissionRepository;
import com.youthrise.project.SubmissionStatus;
import com.youthrise.project.TeamRepository;
import com.youthrise.user.Role;
import com.youthrise.user.UserPrincipal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reporting is scoped to the caller: facilitators see their own programmes,
 * university and partner accounts see programmes they nominated learners for,
 * and administrators see everything. Aggregate cells smaller than five learners
 * are suppressed to reduce re-identification risk.
 */
@Service
@Transactional(readOnly = true)
public class ReportingService {

    private static final int SMALL_CELL_THRESHOLD = 5;
    private static final Set<SubmissionStatus> PENDING_REVIEW = Set.of(
            SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW);

    private final EnrolmentRepository enrolments;
    private final ProgrammeRepository programmes;
    private final ExchangeSessionRepository sessions;
    private final SessionRegistrationRepository registrations;
    private final SubmissionRepository submissions;
    private final TeamRepository teams;
    private final NominationRepository nominations;
    private final AuditService audit;

    public ReportingService(EnrolmentRepository enrolments, ProgrammeRepository programmes,
                            ExchangeSessionRepository sessions, SessionRegistrationRepository registrations,
                            SubmissionRepository submissions, TeamRepository teams,
                            NominationRepository nominations, AuditService audit) {
        this.enrolments = enrolments;
        this.programmes = programmes;
        this.sessions = sessions;
        this.registrations = registrations;
        this.submissions = submissions;
        this.teams = teams;
        this.nominations = nominations;
        this.audit = audit;
    }

    public List<ReportingDtos.CohortMemberResponse> cohortMembers(UserPrincipal principal, String ipAddress) {
        if (principal.role() != Role.ADMIN && principal.role() != Role.FACILITATOR
                && principal.role() != Role.UNIVERSITY) {
            throw forbidden();
        }
        List<Enrolment> visible = scopedEnrolments(principal);
        List<String> programmeIds = visible.stream()
                .map(enrolment -> enrolment.getProgramme().getId())
                .distinct()
                .toList();
        Map<String, Integer> sessionCounts = sessionCountsByProgramme(programmeIds);
        Map<String, Integer> attendance = attendanceByLearner(programmeIds);

        audit.success(principal.id(), principal.email(), principal.role().name(),
                "REPORT_VIEWED", "report:cohort-members", ipAddress);

        return visible.stream()
                .map(enrolment -> new ReportingDtos.CohortMemberResponse(
                        enrolment.getUser().getId(),
                        enrolment.getId(),
                        enrolment.getProgramme().getId(),
                        enrolment.getProgress(),
                        attendance.getOrDefault(key(enrolment.getUser().getId(),
                                enrolment.getProgramme().getId()), 0),
                        completionOf(enrolment),
                        enrolment.getEnrolledAt()))
                .toList();
    }

    public List<ReportingDtos.ProgrammeParticipationResponse> programmeParticipation(UserPrincipal principal,
                                                                                     String ipAddress) {
        if (principal.role() != Role.ADMIN && principal.role() != Role.FACILITATOR
                && principal.role() != Role.PARTNER && principal.role() != Role.UNIVERSITY) {
            throw forbidden();
        }
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "REPORT_VIEWED", "report:programme-participation", ipAddress);
        return scopedProgrammes(principal).stream()
                .map(programme -> new ReportingDtos.ProgrammeParticipationResponse(
                        programme.getId(),
                        programme.getTitle(),
                        shortName(programme.getTitle()),
                        programme.getEnrolledCount(),
                        programme.getCapacity(),
                        programme.getLevel()))
                .toList();
    }

    public List<ReportingDtos.AttendanceResponse> attendance(UserPrincipal principal, String ipAddress) {
        if (principal.role() != Role.ADMIN && principal.role() != Role.FACILITATOR) {
            throw forbidden();
        }
        List<String> programmeIds = scopedProgrammes(principal).stream().map(Programme::getId).toList();
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "REPORT_VIEWED", "report:attendance", ipAddress);
        if (programmeIds.isEmpty()) {
            return List.of();
        }
        return sessions.findByProgrammeIdInOrderByStartsAtAsc(programmeIds).stream()
                .map(session -> new ReportingDtos.AttendanceResponse(
                        session.getId(),
                        session.getTitle(),
                        session.getRegisteredCount(),
                        session.getCapacity(),
                        session.getStatus()))
                .toList();
    }

    public List<ReportingDtos.CompletionBucketResponse> completionBuckets(UserPrincipal principal,
                                                                          String ipAddress) {
        if (principal.role() != Role.ADMIN && principal.role() != Role.FACILITATOR) {
            throw forbidden();
        }
        long[] counts = new long[4];
        for (Enrolment enrolment : scopedEnrolments(principal)) {
            counts[bucket(enrolment.getProgress())]++;
        }
        List<ReportingDtos.CompletionBucketResponse> buckets = new ArrayList<>(4);
        buckets.add(bucketResponse("0–25%", 0, 25, counts[0]));
        buckets.add(bucketResponse("26–50%", 26, 50, counts[1]));
        buckets.add(bucketResponse("51–75%", 51, 75, counts[2]));
        buckets.add(bucketResponse("76–100%", 76, 100, counts[3]));
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "REPORT_VIEWED", "report:completion-buckets", ipAddress);
        return buckets;
    }

    public ReportingDtos.FacilitatorSummaryResponse facilitatorSummary(UserPrincipal principal,
                                                                       String ipAddress) {
        if (principal.role() != Role.FACILITATOR && principal.role() != Role.ADMIN) {
            throw forbidden();
        }
        long activeProgrammes;
        long pendingReviews;
        long activeTeams;
        Double average;
        if (principal.role() == Role.ADMIN) {
            activeProgrammes = programmes.countByStatusNot(ProgrammeStatus.CLOSED);
            pendingReviews = submissions.countByStatusIn(PENDING_REVIEW);
            activeTeams = teams.count();
            average = enrolments.averageProgress();
        } else {
            activeProgrammes = programmes.findByFacilitatorIdOrderByStartsAtAsc(principal.id()).stream()
                    .filter(programme -> programme.getStatus() != ProgrammeStatus.CLOSED)
                    .count();
            pendingReviews = submissions.countForFacilitatorByStatus(principal.id(), PENDING_REVIEW);
            activeTeams = teams.countByProgrammeFacilitatorId(principal.id());
            average = enrolments.averageProgressForFacilitator(principal.id());
        }
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "REPORT_VIEWED", "report:facilitator-summary", ipAddress);
        return new ReportingDtos.FacilitatorSummaryResponse(
                activeProgrammes,
                pendingReviews,
                activeTeams,
                (int) Math.round(average == null ? 0 : average));
    }

    private List<Enrolment> scopedEnrolments(UserPrincipal principal) {
        return switch (principal.role()) {
            case ADMIN -> enrolments.findAllByOrderByEnrolledAtDesc();
            case FACILITATOR -> enrolments.findByProgrammeFacilitatorIdOrderByEnrolledAtDesc(principal.id());
            case UNIVERSITY -> {
                List<String> ids = nominations.findProgrammeIdsByNominatedById(principal.id());
                yield ids.isEmpty() ? List.of() : enrolments.findByProgrammeIdInOrderByEnrolledAtDesc(ids);
            }
            default -> throw forbidden();
        };
    }

    private List<Programme> scopedProgrammes(UserPrincipal principal) {
        return switch (principal.role()) {
            case ADMIN -> programmes.findAll();
            case FACILITATOR -> programmes.findByFacilitatorIdOrderByStartsAtAsc(principal.id());
            case PARTNER, UNIVERSITY -> {
                List<String> ids = nominations.findProgrammeIdsByNominatedById(principal.id());
                yield ids.isEmpty() ? List.of() : programmes.findAllById(ids);
            }
            default -> throw forbidden();
        };
    }

    private Map<String, Integer> sessionCountsByProgramme(Collection<String> programmeIds) {
        Map<String, Integer> counts = new HashMap<>();
        if (programmeIds.isEmpty()) {
            return counts;
        }
        for (ExchangeSession session : sessions.findByProgrammeIdInOrderByStartsAtAsc(programmeIds)) {
            counts.merge(session.getProgramme().getId(), 1, Integer::sum);
        }
        return counts;
    }

    /**
     * Attendance is measured as the share of a programme's scheduled exchange
     * sessions for which the learner registered. The expression is derived from
     * real registrations, not sampled or estimated.
     */
    private Map<String, Integer> attendanceByLearner(Collection<String> programmeIds) {
        Map<String, Integer> result = new HashMap<>();
        if (programmeIds.isEmpty()) {
            return result;
        }
        Map<String, Integer> totals = sessionCountsByProgramme(programmeIds);
        Map<String, Integer> attended = new HashMap<>();
        for (Object[] row : registrations.findRegistrationFacts(programmeIds)) {
            attended.merge(key((String) row[0], (String) row[1]), 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> entry : attended.entrySet()) {
            String[] parts = entry.getKey().split("\\|", 2);
            int total = totals.getOrDefault(parts[1], 0);
            result.put(entry.getKey(), total == 0
                    ? 0
                    : Math.min(100, (int) Math.round(entry.getValue() * 100.0 / total)));
        }
        return result;
    }

    private static String completionOf(Enrolment enrolment) {
        if (enrolment.getStatus() == EnrolmentStatus.COMPLETED || enrolment.getProgress() >= 100) {
            return "completed";
        }
        if (enrolment.getProgress() == 0) {
            return "not_started";
        }
        return enrolment.getProgress() < 35 ? "at_risk" : "on_track";
    }

    private static int bucket(int progress) {
        if (progress <= 25) {
            return 0;
        }
        if (progress <= 50) {
            return 1;
        }
        if (progress <= 75) {
            return 2;
        }
        return 3;
    }

    private static ReportingDtos.CompletionBucketResponse bucketResponse(String label, int min, int max, long learners) {
        boolean smallCell = learners > 0 && learners < SMALL_CELL_THRESHOLD;
        return new ReportingDtos.CompletionBucketResponse(label, min, max, smallCell ? 0 : learners);
    }

    private static String shortName(String title) {
        String[] parts = title.trim().split("\\s+");
        return parts.length <= 2 ? title.trim() : parts[0] + " " + parts[1];
    }

    private static String key(String userId, String programmeId) {
        return userId + "|" + programmeId;
    }

    private static ApiException forbidden() {
        return ApiException.forbidden("FORBIDDEN", "You do not have access to these reports.");
    }
}
