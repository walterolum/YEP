package com.youthrise.user;

import com.youthrise.common.BaseEntity;
import com.youthrise.common.Notifiable;
import com.youthrise.common.NotificationChannel;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Abstract account shared by every person who signs in to YEP.
 *
 * <p>The concrete subclasses ({@link Participant}, {@link Facilitator},
 * {@link Mentor}, {@link Administrator}, {@link University}, {@link Employer},
 * {@link Partner}) decide which workspace the account opens and which actions it
 * may perform. Persistence uses single-table inheritance: the {@code role}
 * column is the discriminator, so one account row always maps to one role.</p>
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_role", columnList = "role"),
        @Index(name = "idx_users_status", columnList = "status")
})
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING, length = 24)
public abstract class User extends BaseEntity implements Notifiable {

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(name = "email", nullable = false, length = 320, unique = true)
    private String email;

    @Column(name = "phone", length = 32)
    private String phone;

    @Column(name = "country", nullable = false, length = 80)
    private String country;

    @Column(name = "organization", length = 160)
    private String organization;

    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Column(name = "bio", length = 2000)
    private String bio;

    @Column(name = "initials", nullable = false, length = 4)
    private String initials;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private AccountStatus status;

    @Column(name = "profile_complete", nullable = false)
    private int profileComplete;

    @Column(name = "timezone", nullable = false, length = 64)
    private String timezone;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 16)
    private Visibility visibility;

    @Column(name = "contact_permission", nullable = false)
    private boolean contactPermission;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "password_hash", length = 100)
    private String passwordHash;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest", nullable = false, length = 60)
    private Set<String> interests = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill", nullable = false, length = 60)
    private Set<String> skills = new LinkedHashSet<>();

    protected User() {
    }

    /**
     * Creates the correct account subtype for a self-service registration.
     * Only youth participants may register themselves.
     */
    public static User register(String fullName, String email, String phone, String country,
                                String passwordHash, String timezone, LocalDate dateOfBirth) {
        Participant participant = new Participant();
        User user = participant;
        user.applyIdentity(fullName, email, phone, country, timezone);
        user.dateOfBirth = dateOfBirth;
        user.passwordHash = passwordHash;
        user.status = AccountStatus.ACTIVE;
        user.visibility = Visibility.LIMITED;
        user.contactPermission = false;
        user.recalculateProfileCompletion();
        return user;
    }

    /**
     * Creates an account for a role that cannot self-register. The factory keeps
     * the subclass choice in one place so callers never instantiate a role type
     * directly.
     */
    public static User invited(String fullName, String email, Role role, String country, String timezone) {
        User user = switch (role) {
            case PARTICIPANT -> new Participant();
            case FACILITATOR -> new Facilitator();
            case MENTOR -> new Mentor();
            case UNIVERSITY -> new University();
            case EMPLOYER -> new Employer();
            case PARTNER -> new Partner();
            case ADMIN -> new Administrator();
        };
        user.applyIdentity(fullName, email, null, country, timezone);
        user.status = AccountStatus.INVITED;
        user.visibility = Visibility.HIDDEN;
        user.contactPermission = false;
        return user;
    }

    private void applyIdentity(String fullName, String email, String phone, String country, String timezone) {
        this.fullName = fullName.trim();
        this.email = normalizeEmail(email);
        this.phone = blankToNull(phone);
        this.country = country.trim();
        this.timezone = timezone == null || timezone.isBlank() ? "Africa/Kampala" : timezone.trim();
        this.initials = initialsOf(this.fullName);
        this.joinedAt = Instant.now();
    }

    /** Role constant owned by the concrete account class. */
    public abstract Role getRole();

    /** Human label used by navigation and dashboards. */
    public abstract String workspaceName();

    /** True when the account may design and deliver Level One content. */
    public abstract boolean canFacilitate();

    /** True when the account may review Level Two teams and projects. */
    public abstract boolean canMentor();

    /** True when the account may administer users, content and reports. */
    public abstract boolean canAdminister();

    /** True when the account may join a Level Two Impact Project team. */
    public abstract boolean isEligibleForLevelTwo();

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public void changePassword(String passwordHash) {
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("A password hash is required");
        }
        this.passwordHash = passwordHash;
    }

    public void markEmailVerified(Instant when) {
        this.emailVerifiedAt = when;
        recalculateProfileCompletion();
    }

    public void recordLogin(Instant when) {
        this.lastLoginAt = when;
    }

    public void activate() {
        this.status = AccountStatus.ACTIVE;
    }

    public void suspend() {
        this.status = AccountStatus.SUSPENDED;
    }

    public void changeStatus(AccountStatus status) {
        this.status = status;
    }

    public void updateProfile(String fullName, String phone, String country, String organization,
                              String jobTitle, String bio, String timezone, Set<String> interests,
                              Set<String> skills, Visibility visibility, Boolean contactPermission) {
        if (fullName != null && !fullName.isBlank()) {
            this.fullName = fullName.trim();
            this.initials = initialsOf(this.fullName);
        }
        if (phone != null) {
            this.phone = blankToNull(phone);
        }
        if (country != null && !country.isBlank()) {
            this.country = country.trim();
        }
        if (organization != null) {
            this.organization = blankToNull(organization);
        }
        if (jobTitle != null) {
            this.jobTitle = blankToNull(jobTitle);
        }
        if (bio != null) {
            this.bio = blankToNull(bio);
        }
        if (timezone != null && !timezone.isBlank()) {
            this.timezone = timezone.trim();
        }
        if (interests != null) {
            this.interests = clean(interests);
        }
        if (skills != null) {
            this.skills = clean(skills);
        }
        if (visibility != null) {
            this.visibility = visibility;
        }
        if (contactPermission != null) {
            this.contactPermission = contactPermission;
        }
        recalculateProfileCompletion();
    }

    private void recalculateProfileCompletion() {
        int score = 15; // a verified-format name and e-mail are mandatory at registration
        if (emailVerifiedAt != null) score += 15;
        if (phone != null) score += 10;
        if (organization != null) score += 10;
        if (jobTitle != null) score += 5;
        if (bio != null) score += 15;
        if (!interests.isEmpty()) score += 10;
        if (!skills.isEmpty()) score += 10;
        if (visibility != Visibility.LIMITED) score += 5;
        if (contactPermission) score += 5;
        this.profileComplete = Math.min(100, score);
    }

    private static Set<String> clean(Set<String> values) {
        Set<String> cleaned = new LinkedHashSet<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                cleaned.add(value.trim());
            }
        }
        return cleaned;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String initialsOf(String name) {
        StringBuilder initials = new StringBuilder();
        for (String part : name.split("\\s+")) {
            if (!part.isBlank() && initials.length() < 2) {
                initials.append(Character.toUpperCase(part.charAt(0)));
            }
        }
        return initials.length() == 0 ? "YR" : initials.toString();
    }

    @Override
    public String notificationAddress() {
        return email;
    }

    @Override
    public NotificationChannel notificationChannel() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public boolean acceptsNotifications() {
        return status == AccountStatus.ACTIVE;
    }

    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }

    /** Completed years between the stored date of birth and the given day. */
    public int ageOn(LocalDate today) {
        if (dateOfBirth == null) {
            return -1;
        }
        return Period.between(dateOfBirth, today).getYears();
    }

    public boolean isActive() {
        return status == AccountStatus.ACTIVE;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCountry() {
        return country;
    }

    public String getOrganization() {
        return organization;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getBio() {
        return bio;
    }

    public String getInitials() {
        return initials;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public int getProfileComplete() {
        return profileComplete;
    }

    public String getTimezone() {
        return timezone;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public boolean isContactPermission() {
        return contactPermission;
    }

    public Instant getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public Set<String> getInterests() {
        return interests;
    }

    public Set<String> getSkills() {
        return skills;
    }
}
