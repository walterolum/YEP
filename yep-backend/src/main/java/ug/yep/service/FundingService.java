package ug.yep.service;

import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.entity.Certificate;
import ug.yep.entity.CertificateVerification;
import ug.yep.entity.Course;
import ug.yep.entity.CourseEnrollment;
import ug.yep.entity.Enums;
import ug.yep.entity.FinancialAidApplication;
import ug.yep.entity.PaymentIntent;
import ug.yep.entity.Sponsorship;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.CertificateVerificationRepository;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.FinancialAidApplicationRepository;
import ug.yep.repository.PaymentIntentRepository;
import ug.yep.repository.SponsorshipRepository;
import ug.yep.repository.UserRepository;

/**
 * Phase 5: financial aid, sponsorship seats, payment intents and verifiable certificates.
 *
 * <p>Seat-granting paths are explicit and auditable: aid approval, a sponsor, or a PAID
 * payment intent. Nothing else enrols a learner into a paid course.</p>
 */
@Service
public class FundingService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final FinancialAidApplicationRepository aid;
    private final SponsorshipRepository sponsorships;
    private final PaymentIntentRepository payments;
    private final CertificateRepository certificates;
    private final CertificateVerificationRepository verifications;
    private final CourseRepository courses;
    private final CourseEnrollmentRepository enrollments;
    private final UserRepository users;
    private final NotificationService notifications;

    public FundingService(FinancialAidApplicationRepository aid,
                          SponsorshipRepository sponsorships, PaymentIntentRepository payments,
                          CertificateRepository certificates,
                          CertificateVerificationRepository verifications,
                          CourseRepository courses, CourseEnrollmentRepository enrollments,
                          UserRepository users, NotificationService notifications) {
        this.aid = aid;
        this.sponsorships = sponsorships;
        this.payments = payments;
        this.certificates = certificates;
        this.verifications = verifications;
        this.courses = courses;
        this.enrollments = enrollments;
        this.users = users;
        this.notifications = notifications;
    }

    // --------------------------------------------------------- financial aid

    @Transactional
    public Map<String, Object> applyForAid(Long userId, Requests.AidRequest request) {
        Course course = course(request.courseId());
        if (enrollments.existsByUserIdAndCourseId(userId, course.getId())) {
            throw new BusinessRuleException("You are already enrolled in this course.");
        }
        FinancialAidApplication application = aid.findByUserIdAndCourseId(userId, course.getId())
                .orElse(null);
        if (application != null && "PENDING".equals(application.getStatus())) {
            throw new BusinessRuleException("Your application for this course is already pending.");
        }
        if (application != null && "APPROVED".equals(application.getStatus())) {
            throw new BusinessRuleException("This course was already funded for you.");
        }
        if (application == null) {
            application = new FinancialAidApplication(user(userId), course, request.reason(),
                    request.incomeBand());
            aid.save(application);
        }
        return aidView(application);
    }

    public List<Map<String, Object>> aidFor(Long userId) {
        return aid.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::aidView).toList();
    }

    public List<Map<String, Object>> aidQueue() {
        return aid.findAllByOrderByCreatedAtDesc().stream().map(this::aidView).toList();
    }

    @Transactional
    public Map<String, Object> decideAid(Long adminId, Long applicationId, boolean approved,
                                         String note) {
        FinancialAidApplication application = aid.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Aid application"));
        if (!"PENDING".equals(application.getStatus())) {
            throw new BusinessRuleException("This application has already been decided.");
        }
        application.decide(user(adminId), approved, note);
        aid.save(application);
        if (approved) {
            enrol(application.getUser(), application.getCourse());
            notifications.send(application.getUser(), "AID",
                    "Your financial aid for " + application.getCourse().getTitle() + " was approved.");
        }
        return aidView(application);
    }

    // ---------------------------------------------------------- sponsorships

    @Transactional
    public Map<String, Object> sponsor(Long sponsorId, Requests.SponsorshipRequest request) {
        User sponsor = user(sponsorId);
        User learner = users.findByEmailIgnoreCase(request.learnerEmail().trim())
                .orElseThrow(() -> new NotFoundException("Learner"));
        if (learner.getId().equals(sponsorId)) {
            throw new BusinessRuleException("Choose a learner other than yourself.");
        }
        Course course = course(request.courseId());
        if (sponsorships.existsBySponsorIdAndLearnerIdAndCourseId(sponsorId, learner.getId(),
                course.getId())) {
            throw new BusinessRuleException("This learner is already sponsored for the course.");
        }
        Sponsorship sponsorship = sponsorships.save(new Sponsorship(sponsor, learner, course));
        enrol(learner, course);
        notifications.send(learner, "SPONSORSHIP",
                "A sponsor funded your seat on " + course.getTitle() + ".");
        return sponsorshipView(sponsorship);
    }

    public List<Map<String, Object>> sponsorshipsFor(Long sponsorId) {
        return sponsorships.findBySponsorIdOrderByCreatedAtDesc(sponsorId).stream()
                .map(this::sponsorshipView).toList();
    }

    // -------------------------------------------------------------- payments

    @Transactional
    public Map<String, Object> createPaymentIntent(Long userId, Requests.PaymentRequest request) {
        Course course = course(request.courseId());
        long amount = request.amountCents() == null ? 0 : request.amountCents();
        if (amount <= 0) {
            throw new BusinessRuleException("Enter the amount to pay in cents.");
        }
        String currency = (request.currency() == null || request.currency().isBlank()) ? "UGX"
                : request.currency().trim().toUpperCase(java.util.Locale.ROOT);
        String reference = "PAY-" + java.time.Year.now() + "-" + String.format("%06d",
                RANDOM.nextInt(1_000_000));
        PaymentIntent intent = payments.save(new PaymentIntent(user(userId), course, amount, currency,
                "manual", reference));
        Map<String, Object> result = paymentView(intent);
        result.put("checkoutHint", "Send the amount with reference " + reference
                + " to the YEP collection account; confirmation is recorded by an admin.");
        return result;
    }

    /** Recorded by an admin or a provider webhook; only then does the seat open. */
    @Transactional
    public Map<String, Object> confirmPayment(Long actorId, String reference) {
        PaymentIntent intent = payments.findByReference(reference)
                .orElseThrow(() -> new NotFoundException("Payment"));
        if ("PAID".equals(intent.getStatus())) {
            return paymentView(intent);
        }
        intent.markPaid();
        payments.save(intent);
        enrol(intent.getUser(), intent.getCourse());
        notifications.send(intent.getUser(), "PAYMENT",
                "Payment received. You are enrolled in " + intent.getCourse().getTitle() + ".");
        return paymentView(intent);
    }

    public List<Map<String, Object>> paymentsFor(Long userId) {
        return payments.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::paymentView).toList();
    }

    // ---------------------------------------------------------- certificates

    @Transactional
    public Map<String, Object> issueCourseCertificate(Long actorId, Long learnerId, Long courseId) {
        User learner = user(learnerId);
        Course course = course(courseId);
        if (!enrollments.existsByUserIdAndCourseId(learnerId, courseId)) {
            throw new BusinessRuleException("The learner is not enrolled in this course.");
        }
        CourseEnrollment enrollment = enrollments
                .findByUserIdAndCourseId(learnerId, courseId)
                .orElseThrow(() -> new NotFoundException("Enrolment"));
        if (enrollment.getStatus() != Enums.CourseEnrollmentStatus.COMPLETED) {
            throw new BusinessRuleException("Only completed courses can be certified.");
        }
        Certificate certificate = certificates
                .findByUserIdAndScopeAndScopeId(learnerId, "COURSE", courseId).orElse(null);
        if (certificate == null) {
            certificate = new Certificate(nextCode(), learner,
                    course.getTitle(), user(actorId));
            certificate.scopeTo("COURSE", courseId);
            certificates.save(certificate);
        }
        return certificateView(certificate);
    }

    /** Public verification: returns the holder, the award and whether it is valid. */
    @Transactional
    public Map<String, Object> verify(String code) {
        Certificate certificate = certificates.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new NotFoundException("Certificate"));
        verifications.save(new CertificateVerification(certificate));
        Map<String, Object> view = certificateView(certificate);
        view.put("valid", true);
        view.put("checks", verifications.countByCertificateId(certificate.getId()));
        return view;
    }

    // ---------------------------------------------------------------- helper

    private void enrol(User learner, Course course) {
        if (enrollments.existsByUserIdAndCourseId(learner.getId(), course.getId())) {
            return;
        }
        enrollments.save(new CourseEnrollment(learner, course));
    }

    private String nextCode() {
        for (int i = 0; i < 10; i++) {
            String code = "YEP-" + java.time.Year.now() + "-"
                    + String.format("%06d", RANDOM.nextInt(1_000_000));
            if (!certificates.existsByCodeIgnoreCase(code)) {
                return code;
            }
        }
        throw new BusinessRuleException("Could not allocate a certificate code; try again.");
    }

    private Map<String, Object> aidView(FinancialAidApplication application) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", application.getId());
        row.put("learner", application.getUser().getFullName());
        row.put("courseId", application.getCourse().getId());
        row.put("course", application.getCourse().getTitle());
        row.put("reason", application.getReason());
        row.put("status", application.getStatus());
        row.put("note", application.getNote());
        row.put("createdAt", application.getCreatedAt());
        return row;
    }

    private Map<String, Object> sponsorshipView(Sponsorship sponsorship) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", sponsorship.getId());
        row.put("sponsor", sponsorship.getSponsor().getFullName());
        row.put("learner", sponsorship.getLearner().getFullName());
        row.put("course", sponsorship.getCourse().getTitle());
        row.put("status", sponsorship.getStatus());
        row.put("createdAt", sponsorship.getCreatedAt());
        return row;
    }

    private Map<String, Object> paymentView(PaymentIntent intent) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", intent.getId());
        row.put("reference", intent.getReference());
        row.put("courseId", intent.getCourse().getId());
        row.put("course", intent.getCourse().getTitle());
        row.put("amountCents", intent.getAmountCents());
        row.put("currency", intent.getCurrency());
        row.put("status", intent.getStatus());
        row.put("createdAt", intent.getCreatedAt());
        return row;
    }

    private Map<String, Object> certificateView(Certificate certificate) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("code", certificate.getCode());
        row.put("holder", certificate.getUser().getFullName());
        row.put("award", certificate.getProgrammeLabel());
        row.put("scope", certificate.getScope());
        row.put("issuedAt", certificate.getIssuedAt());
        return row;
    }

    private Course course(Long courseId) {
        return courses.findById(courseId).orElseThrow(() -> new NotFoundException("Course"));
    }

    private User user(Long userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
    }
}
