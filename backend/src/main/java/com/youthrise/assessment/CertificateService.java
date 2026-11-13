package com.youthrise.assessment;

import com.youthrise.common.ApiException;
import com.youthrise.common.AuditService;
import com.youthrise.common.RateLimiter;
import com.youthrise.common.exception.CertificateNotEligibleException;
import com.youthrise.badge.BadgeService;
import com.youthrise.programme.Enrolment;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.EnrolmentStatus;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CertificateService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int PASS_PERCENTAGE = 50;

    private final CertificateRepository certificates;
    private final EnrolmentRepository enrolments;
    private final AssessmentRepository assessments;
    private final AssessmentAttemptRepository attempts;
    private final ProgrammeRepository programmes;
    private final UserRepository users;
    private final BadgeService badges;
    private final RateLimiter rateLimiter;
    private final AuditService audit;
    private final SecureRandom random = new SecureRandom();

    public CertificateService(CertificateRepository certificates, EnrolmentRepository enrolments,
                              AssessmentRepository assessments, AssessmentAttemptRepository attempts,
                              ProgrammeRepository programmes, UserRepository users, BadgeService badges,
                              RateLimiter rateLimiter, AuditService audit) {
        this.certificates = certificates;
        this.enrolments = enrolments;
        this.assessments = assessments;
        this.attempts = attempts;
        this.programmes = programmes;
        this.users = users;
        this.badges = badges;
        this.rateLimiter = rateLimiter;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<CertificateDtos.CertificateResponse> listForUser(String userId) {
        return certificates.findByParticipantIdOrderByCreatedAtDesc(userId).stream()
                .map(CertificateDtos.CertificateResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CertificateDtos.CertificateResponse verify(String code, String ipAddress) {
        rateLimiter.check("certificate-verify:" + ipAddress, 30, Duration.ofHours(1));
        if (code == null || code.isBlank()) {
            throw ApiException.validation("code", "Enter a certificate verification code.");
        }
        Certificate certificate = certificates.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> ApiException.notFound("CERTIFICATE_NOT_FOUND",
                        "No certificate matches that verification code."));
        return CertificateDtos.CertificateResponse.from(certificate);
    }

    /**
     * Issues a certificate only when the enrolment is complete and every
     * published assessment has a graded attempt at or above the pass mark.
     * The unique constraint prevents duplicate issuance under concurrency.
     */
    @Transactional
    public void issueIfEligible(String programmeId, String participantId, User issuedBy) {
        if (certificates.existsByProgrammeIdAndParticipantId(programmeId, participantId)) {
            return;
        }
        Enrolment enrolment = enrolments.findByProgrammeIdAndUserId(programmeId, participantId).orElse(null);
        if (enrolment == null || enrolment.getStatus() != EnrolmentStatus.COMPLETED) {
            return;
        }
        if (!passedEveryAssessment(programmeId, participantId)) {
            return;
        }
        Programme programme = programmes.findById(programmeId).orElse(null);
        User participant = users.findById(participantId).orElse(null);
        if (programme == null || participant == null) {
            return;
        }
        certificates.save(Certificate.issue(programme, participant, uniqueCode(), issuedBy));
        badges.awardProgrammeCompletion(participant, issuedBy);
    }

    /**
     * Administrator-triggered issuance. Unlike the automatic path this reports
     * exactly which rule blocked the award, so an administrator can fix the
     * underlying record.
     */
    @Transactional
    public CertificateDtos.CertificateResponse issue(String programmeId, String participantId,
                                                     UserPrincipal principal, String ipAddress) {
        if (certificates.existsByProgrammeIdAndParticipantId(programmeId, participantId)) {
            throw ApiException.conflict("CERTIFICATE_EXISTS",
                    "A certificate already exists for this participant.");
        }
        Programme programme = programmes.findById(programmeId)
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        User participant = users.findById(participantId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND",
                        "That account could not be found."));
        Enrolment enrolment = enrolments.findByProgrammeIdAndUserId(programmeId, participantId)
                .orElseThrow(() -> new CertificateNotEligibleException(
                        "That participant is not enrolled in this programme."));
        if (enrolment.getStatus() != EnrolmentStatus.COMPLETED) {
            throw new CertificateNotEligibleException(
                    "Complete the programme before issuing a certificate.");
        }
        if (!passedEveryAssessment(programmeId, participantId)) {
            throw new CertificateNotEligibleException(
                    "Every published assessment must be passed before a certificate is issued.");
        }

        User issuer = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        Certificate certificate = certificates.save(
                Certificate.issue(programme, participant, uniqueCode(), issuer));
        badges.awardProgrammeCompletion(participant, issuer);
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "CERTIFICATE_ISSUED", "certificate:" + certificate.getId(), ipAddress);
        return CertificateDtos.CertificateResponse.from(certificate);
    }

    private boolean passedEveryAssessment(String programmeId, String participantId) {
        List<Assessment> required = assessments.findByProgrammeIdAndPublishedTrueOrderByDueAtAsc(programmeId);
        for (Assessment assessment : required) {
            AssessmentAttempt latest = attempts
                    .findFirstByAssessmentIdAndUserIdOrderByAttemptNoDesc(assessment.getId(), participantId)
                    .orElse(null);
            if (latest == null || latest.getStatus() != AttemptStatus.GRADED || latest.getScore() == null
                    || latest.getScore() * 100 < assessment.getMaxScore() * PASS_PERCENTAGE) {
                return false;
            }
        }
        return true;
    }

    @Transactional
    public void revoke(String certificateId, String note, UserPrincipal principal, String ipAddress) {
        Certificate certificate = certificates.findById(certificateId)
                .orElseThrow(() -> ApiException.notFound("CERTIFICATE_NOT_FOUND",
                        "That certificate could not be found."));
        try {
            certificate.revoke(note);
        } catch (IllegalStateException ex) {
            throw ApiException.conflict("CERTIFICATE_REVOKED", "That certificate is already revoked.");
        }
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "CERTIFICATE_REVOKED", "certificate:" + certificateId, ipAddress);
    }

    private String uniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = "YEP-" + group(4) + "-" + group(4) + "-" + group(4);
            if (certificates.findByCodeIgnoreCase(code).isEmpty()) {
                return code;
            }
        }
        throw new IllegalStateException("Could not allocate a unique certificate code");
    }

    private String group(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            builder.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
        }
        return builder.toString();
    }
}
