package com.youthrise.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Development mailer. It never pretends that a message was delivered: the
 * verification code and reset link are written to the application log so the
 * local frontend can be exercised without an SMTP account.
 */
@Component
public class LoggingMailer implements Mailer {

    private static final Logger log = LoggerFactory.getLogger(LoggingMailer.class);

    @Override
    public void sendEmailVerification(String to, String name, String code) {
        log.info("Email verification for {} <{}> — code: {}", name, to, code);
    }

    @Override
    public void sendPasswordReset(String to, String name, String resetUrl) {
        log.info("Password reset for {} <{}> — link: {}", name, to, resetUrl);
    }
}
