package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import ug.yep.entity.EmailVerificationToken;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.EmailVerificationTokenRepository;
import ug.yep.repository.UserRepository;

class VerificationServiceTest {

    private EmailVerificationTokenRepository tokens;
    private UserRepository users;
    private VerificationService service;
    private User user;

    @BeforeEach
    void setUp() {
        tokens = mock(EmailVerificationTokenRepository.class);
        users = mock(UserRepository.class);
        service = new VerificationService(tokens, users, mock(NotificationService.class),
                mock(AuditService.class));
        user = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                "700000000", "hash", Enums.UserStatus.APPROVED);
        when(tokens.findFirstByUserAndUsedAtIsNullOrderByCreatedAtDesc(user))
                .thenReturn(Optional.empty());
    }

    @Test
    void issuingStoresOnlyAHash() {
        String raw = service.issue(user);

        ArgumentCaptor<EmailVerificationToken> saved = ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(tokens).save(saved.capture());
        assertEquals(64, saved.getValue().getTokenHash().length());
        assertTrue(raw.length() >= 20);
        assertTrue(!saved.getValue().getTokenHash().contains(raw));
    }

    @Test
    void aValidTokenVerifiesTheAddress() {
        EmailVerificationToken token = new EmailVerificationToken(user, "hash",
                Instant.now().plusSeconds(600));
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        var view = service.verify("raw-token");

        assertNotNull(view.emailVerifiedAt());
        assertNotNull(token.getUsedAt());
        verify(users).save(user);
    }

    @Test
    void anExpiredTokenIsRejected() {
        EmailVerificationToken token = new EmailVerificationToken(user, "hash",
                Instant.now().minusSeconds(60));
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThrows(BusinessRuleException.class, () -> service.verify("raw-token"));
    }

    @Test
    void aUsedTokenIsRejected() {
        EmailVerificationToken token = new EmailVerificationToken(user, "hash",
                Instant.now().plusSeconds(600));
        token.use();
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThrows(BusinessRuleException.class, () -> service.verify("raw-token"));
    }

    @Test
    void anUnknownTokenIsRejected() {
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.empty());
        assertThrows(BusinessRuleException.class, () -> service.verify("nope"));
        assertThrows(BusinessRuleException.class, () -> service.verify(" "));
    }
}
