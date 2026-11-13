package com.youthrise.auth;

/** Boundary for transactional e-mail. The default implementation logs in development. */
public interface Mailer {

    void sendEmailVerification(String to, String name, String code);

    void sendPasswordReset(String to, String name, String resetUrl);
}
