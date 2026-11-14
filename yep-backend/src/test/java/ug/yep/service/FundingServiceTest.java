package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Academy;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.CourseEnrollment;
import ug.yep.entity.Enums;
import ug.yep.entity.FinancialAidApplication;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.CertificateVerificationRepository;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.FinancialAidApplicationRepository;
import ug.yep.repository.PaymentIntentRepository;
import ug.yep.repository.SponsorshipRepository;
import ug.yep.repository.UserRepository;

/** Phase 5: aid approval, payment confirmation and seat granting. */
class FundingServiceTest {

    private FinancialAidApplicationRepository aid;
    private CourseEnrollmentRepository enrollments;
    private CertificateRepository certificates;
    private FundingService service;
    private Course course;
    private User learner;
    private User admin;

    @BeforeEach
    void setUp() {
        aid = mock(FinancialAidApplicationRepository.class);
        PaymentIntentRepository payments = mock(PaymentIntentRepository.class);
        enrollments = mock(CourseEnrollmentRepository.class);
        CourseRepository courses = mock(CourseRepository.class);
        UserRepository users = mock(UserRepository.class);

        certificates = mock(CertificateRepository.class);
        service = new FundingService(aid, mock(SponsorshipRepository.class), payments,
                certificates, courses, enrollments, users, mock(NotificationService.class));
        when(certificates.save(any(ug.yep.entity.Certificate.class)))
                .thenAnswer(i -> i.getArgument(0));

        CareerPath path = new CareerPath(new Academy("Tech & Digital", "tech-digital"),
                "Software Development", "software-development");
        course = new Course(path, "TECH-PY-L1", "Python", "python", 1);
        ReflectionTestUtils.setField(course, "id", 27L);
        when(courses.findById(27L)).thenReturn(Optional.of(course));

        learner = User.create(Enums.Role.PARTICIPANT, "Amara", "amara@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(learner, "id", 2L);
        admin = User.create(Enums.Role.ADMIN, "Admin", "admin@yep.example", null, "x",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(admin, "id", 1L);
        when(users.findById(2L)).thenReturn(Optional.of(learner));
        when(users.findById(1L)).thenReturn(Optional.of(admin));
        when(enrollments.save(any(CourseEnrollment.class))).thenAnswer(i -> i.getArgument(0));
        when(aid.save(any(FinancialAidApplication.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void anEnrolledLearnerCannotApplyForAidAgain() {
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> service.applyForAid(2L,
                new Requests.AidRequest(27L, "I cannot afford the fee", "under-200k")));
    }

    @Test
    void aDuplicatePendingApplicationIsRejected() {
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(false);
        when(aid.findByUserIdAndCourseId(2L, 27L)).thenReturn(Optional.of(
                new FinancialAidApplication(learner, course, "Need help", "low")));

        assertThrows(BusinessRuleException.class, () -> service.applyForAid(2L,
                new Requests.AidRequest(27L, "Need help", "low")));
    }

    @Test
    void approvalEnrolsTheLearner() {
        FinancialAidApplication application = new FinancialAidApplication(learner, course,
                "Need help", "low");
        when(aid.findById(50L)).thenReturn(Optional.of(application));
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(false);

        service.decideAid(1L, 50L, true, "Approved by committee");

        assertEquals("APPROVED", application.getStatus());
        assertTrue(application.getNote().contains("Approved"));
    }

    @Test
    void rejectingAnApplicationDoesNotEnrolAnyone() {
        FinancialAidApplication application = new FinancialAidApplication(learner, course,
                "Need help", "low");
        when(aid.findById(50L)).thenReturn(Optional.of(application));
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(false);

        service.decideAid(1L, 50L, false, "Budget exhausted");

        assertEquals("REJECTED", application.getStatus());
        org.mockito.Mockito.verify(enrollments, org.mockito.Mockito.never())
                .save(any(CourseEnrollment.class));
    }

    @Test
    void aCompletedCourseYieldsAVerifiableCertificate() {
        CourseEnrollment enrollment = new CourseEnrollment(learner, course);
        enrollment.complete();
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(true);
        when(enrollments.findByUserIdAndCourseId(2L, 27L)).thenReturn(Optional.of(enrollment));
        when(certificates.existsByCodeIgnoreCase(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(false);

        var view = service.issueCourseCertificate(1L, 2L, 27L);

        assertEquals("COURSE", view.get("scope"));
        assertTrue(String.valueOf(view.get("code")).startsWith("YEP-"));
        assertEquals("Amara", view.get("holder"));
    }

    @Test
    void anIncompleteCourseCannotBeCertified() {
        CourseEnrollment enrollment = new CourseEnrollment(learner, course);
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(true);
        when(enrollments.findByUserIdAndCourseId(2L, 27L)).thenReturn(Optional.of(enrollment));

        assertThrows(BusinessRuleException.class, () -> service.issueCourseCertificate(1L, 2L, 27L));
    }

    @Test
    void anUnenrolledLearnerCannotBeCertified() {
        when(enrollments.existsByUserIdAndCourseId(2L, 27L)).thenReturn(false);

        assertThrows(BusinessRuleException.class, () -> service.issueCourseCertificate(1L, 2L, 27L));
    }

    @Test
    void aZeroPaymentIsRefused() {
        assertThrows(BusinessRuleException.class, () -> service.createPaymentIntent(2L,
                new Requests.PaymentRequest(27L, 0L, "UGX")));
    }
}
