package ug.yep.service.impl;

import java.time.Year;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Views;
import ug.yep.entity.Certificate;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;
import ug.yep.service.AuditService;
import ug.yep.service.CertificateService;
import ug.yep.service.LearningService;
import ug.yep.service.NotificationService;
import ug.yep.util.PdfExporter;

/** Issues certificates only when both levels are at 100%, with unique sequential codes. */
@Service
public class CertificateServiceImpl implements CertificateService {

    private static final DateTimeFormatter DATE =
            DateTimeFormatter.ofPattern("dd MMMM yyyy").withZone(ZoneOffset.UTC);

    private final CertificateRepository certificates;
    private final UserRepository users;
    private final LearningService learning;
    private final NotificationService notifications;
    private final AuditService audit;

    public CertificateServiceImpl(CertificateRepository certificates, UserRepository users,
                                  LearningService learning, NotificationService notifications,
                                  AuditService audit) {
        this.certificates = certificates;
        this.users = users;
        this.learning = learning;
        this.notifications = notifications;
        this.audit = audit;
    }

    @Override
    @Transactional
    public Views.CertificateView issue(CurrentUser actor, Long userId, String programmeLabel) {
        User holder = users.findById(userId).orElseThrow(() -> new NotFoundException("Participant"));
        if (certificates.existsByUserId(userId)) {
            throw new BusinessRuleException("A certificate has already been issued to this participant.");
        }
        Views.ProgressView progress = learning.progress(userId);
        if (progress.levelOnePercent() != 100 || progress.levelTwoPercent() != 100) {
            throw new BusinessRuleException(
                    "Certificates are only issued when both levels are 100% complete. Current progress: Level One "
                            + progress.levelOnePercent() + "%, Level Two " + progress.levelTwoPercent() + "%.");
        }
        User issuer = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        String code = nextCode();
        String label = programmeLabel == null || programmeLabel.isBlank()
                ? "YEP Youth Empowerment Programme" : programmeLabel.trim();
        Certificate certificate = certificates.save(new Certificate(code, holder, label, issuer));
        notifications.send(holder, "CERTIFICATE",
                "Your certificate is ready. Verification code: " + code);
        audit.record(issuer, "CERTIFICATE_ISSUE", "certificate", certificate.getId(),
                "Issued " + code + " to " + holder.getFullName());
        return Views.CertificateView.of(certificate);
    }

    /** YEP-{year}-{4 digit sequence}, skipping anything already taken. */
    private String nextCode() {
        int year = Year.now().getValue();
        long sequence = certificates.count() + 1;
        for (int attempt = 0; attempt < 10000; attempt++) {
            String code = String.format("YEP-%d-%04d", year, sequence + attempt);
            if (!certificates.existsByCodeIgnoreCase(code)) {
                return code;
            }
        }
        throw new BusinessRuleException("Unable to allocate a certificate number. Please contact support.");
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Views.CertificateView> forUser(Long userId) {
        return certificates.findByUserId(userId).map(Views.CertificateView::of);
    }

    @Override
    @Transactional(readOnly = true)
    public Views.CertificateView verify(String code) {
        Certificate certificate = certificates.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new NotFoundException("Certificate code " + code));
        return Views.CertificateView.of(certificate);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] pdf(Long userId, CurrentUser requester) {
        if (!requester.isAdmin() && !requester.id().equals(userId)) {
            throw new ForbiddenException("You can only download your own certificate.");
        }
        Certificate certificate = certificates.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Certificate"));
        List<String> lines = List.of(
                "This certifies that",
                "",
                certificate.getUser().getFullName(),
                "",
                "has successfully completed both levels of the",
                certificate.getProgrammeLabel(),
                "",
                "Level One: 100% module completion",
                "Level Two: 100% impact project milestones",
                "",
                "Issued: " + DATE.format(certificate.getIssuedAt()),
                "Verification code: " + certificate.getCode(),
                "",
                "Verify this certificate at /api/certificates/verify/" + certificate.getCode(),
                "",
                "Youth Empowerment Programme (YEP)");
        return PdfExporter.text("Certificate of Completion", lines);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Views.CertificateView> issued() {
        return certificates.findAllByOrderByIssuedAtDesc().stream()
                .map(Views.CertificateView::of).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long issuedThisYear() {
        java.time.Instant start = Year.now().atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        return certificates.countByIssuedAtAfter(start);
    }
}
