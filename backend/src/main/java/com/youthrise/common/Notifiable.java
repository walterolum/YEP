package com.youthrise.common;

/**
 * Abstraction for any account that can receive platform messages. Services
 * depend on this contract instead of a concrete user type, so new account
 * kinds become notifiable without changing the notification code.
 */
public interface Notifiable {

    /** Stable address for the account, never null for an active account. */
    String notificationAddress();

    /** Preferred first channel for time-sensitive messages. */
    NotificationChannel notificationChannel();

    /** False when the account is suspended, pending or otherwise muted. */
    boolean acceptsNotifications();
}
