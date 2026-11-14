package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Year;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Views;
import ug.yep.entity.Certificate;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;
import ug.yep.service.impl.CertificateServiceImpl;

/** A certificate is only issued at 100%/100% and its code is unique and sequential. */
class CertificateServiceTest {

    private CertificateRepository certificates;
    private UserRepository users;
    private LearningService learning;
    private CertificateServiceImpl service;

    private final CurrentUser admin =
            new CurrentUser(1L, "admin@yep.example", "YEP Admin", Enums.Role.ADMIN);

    @BeforeEach
    void setUp() {
        certificates = mock(CertificateRepository.class);
        users = mock(UserRepository.class);
        learning = mock(LearningService.class);
        service = new CertificateServiceImpl(certificates, users, learning,
                mock(NotificationService.class), mock(AuditService.class));

        User participant = User.create(Enums.Role.PARTICIPANT, "Amara Nakato",
                "amara@yep.example", null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(participant, "id", 2L);
        when(users.findById(2L)).thenReturn(Optional.of(participant));
        when(users.findById(1L)).thenReturn(Optional.of(User.create(Enums.Role.ADMIN, "Admin",
                "admin@yep.example", null, "x", Enums.UserStatus.APPROVED)));
        when(certificates.save(any(Certificate.class))).thenAnswer(invocation -> {
            Certificate saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 5L);
            return saved;
        });
    }

    private Views.ProgressView progress(int levelOne, int levelTwo) {
        return new Views.ProgressView(levelOne, 15, 15, levelTwo, true, true,
                4, 4, 80, 100, levelOne == 100 && levelTwo == 100,
                new Views.PolicyView(18, 35, 80, 65, 75), Map.of(), 88, Map.of());
    }

    @Test
    void refusesWhenLevelTwoIsNotComplete() {
        when(learning.progress(2L)).thenReturn(progress(100, 25));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.issue(admin, 2L, "YEP Programme"));
        assertTrue(error.getMessage().contains("both levels are 100%"));
    }

    @Test
    void refusesDuplicateCertificate() {
        when(certificates.existsByUserId(2L)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> service.issue(admin, 2L, "YEP Programme"));
    }

    @Test
    void issuesSequentialYearPrefixedCode() {
        when(learning.progress(2L)).thenReturn(progress(100, 100));
        when(certificates.count()).thenReturn(0L);
        when(certificates.existsByCodeIgnoreCase(anyString())).thenReturn(false);

        Views.CertificateView view = service.issue(admin, 2L, "YEP Programme");

        assertEquals("YEP-" + Year.now().getValue() + "-0001", view.code());
        assertEquals(2L, view.holderId());
        assertEquals("Amara Nakato", view.holderName());
    }

    @Test
    void skipsCodesThatAlreadyExist() {
        when(learning.progress(2L)).thenReturn(progress(100, 100));
        when(certificates.count()).thenReturn(3L);
        when(certificates.existsByCodeIgnoreCase("YEP-" + Year.now().getValue() + "-0004")).thenReturn(true);
        when(certificates.existsByCodeIgnoreCase("YEP-" + Year.now().getValue() + "-0005")).thenReturn(false);

        Views.CertificateView view = service.issue(admin, 2L, "YEP Programme");

        assertEquals("YEP-" + Year.now().getValue() + "-0005", view.code());
    }

    @Test
    void verificationIsPublicAndExact() {
        User holder = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        Certificate certificate = new Certificate("YEP-2026-0007", holder, "YEP Programme",
                User.create(Enums.Role.ADMIN, "Admin", "admin@yep.example", null, "x",
                        Enums.UserStatus.APPROVED));
        when(certificates.findByCodeIgnoreCase("YEP-2026-0007")).thenReturn(Optional.of(certificate));

        assertEquals("YEP-2026-0007", service.verify("YEP-2026-0007").code());
        assertThrows(ug.yep.exception.NotFoundException.class, () -> service.verify("YEP-2026-9999"));
    }
}
