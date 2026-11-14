package ug.yep.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Inheritance;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Account base entity.
 *
 * <p>Inheritance is expressed with a role discriminator: every subclass
 * ({@link Participant}, {@link Mentor}, {@link Facilitator}, {@link Sponsor},
 * {@link Admin}) decides its own permissions, so the rest of the system asks the
 * object instead of switching on a string.</p>
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = jakarta.persistence.InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING, length = 20)
@DiscriminatorValue("USER")
public abstract class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email", nullable = false, length = 190, unique = true)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.UserStatus status;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "country", length = 80)
    private String country;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "institution", length = 160)
    private String institution;

    @Column(name = "field_of_study", length = 120)
    private String fieldOfStudy;

    @Column(name = "education_level", length = 40)
    private String educationLevel;

    @Column(name = "employment_status", length = 40)
    private String employmentStatus;

    @Column(name = "career_goal", length = 240)
    private String careerGoal;

    @Column(name = "preferred_language", nullable = false, length = 8)
    private String preferredLanguage = "en";

    @Column(name = "terms_accepted_at")
    private Instant termsAcceptedAt;

    @Column(name = "privacy_accepted_at")
    private Instant privacyAcceptedAt;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "guardian_name", length = 120)
    private String guardianName;

    @Column(name = "guardian_phone", length = 40)
    private String guardianPhone;

    @Column(name = "guardian_consent_at")
    private Instant guardianConsentAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "requested_level", length = 20)
    private Enums.Level requestedLevel;

    @Column(name = "avatar", length = 8)
    private String avatar;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "name", nullable = false, length = 80)
    private Set<String> skills = new LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest", nullable = false, length = 80)
    private Set<String> interests = new LinkedHashSet<>();

    protected User() {
    }

    protected User(String fullName, String email, String phone, String passwordHash,
                   Enums.UserStatus status) {
        this.fullName = fullName.trim();
        this.email = email.trim().toLowerCase(java.util.Locale.ROOT);
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.status = status;
        this.avatar = initials(fullName);
    }

    /** Creates the concrete account class for a role (polymorphic factory). */
    public static User create(Enums.Role role, String fullName, String email, String phone,
                              String passwordHash, Enums.UserStatus status) {
        return switch (role) {
            case ADMIN -> new Admin(fullName, email, phone, passwordHash, status);
            case MENTOR -> new Mentor(fullName, email, phone, passwordHash, status);
            case FACILITATOR -> new Facilitator(fullName, email, phone, passwordHash, status);
            case SPONSOR -> new Sponsor(fullName, email, phone, passwordHash, status);
            case PARTICIPANT -> new Participant(fullName, email, phone, passwordHash, status);
        };
    }

    private static String initials(String name) {
        StringBuilder builder = new StringBuilder();
        for (String part : name.trim().split("\\s+")) {
            if (!part.isBlank() && builder.length() < 2) {
                builder.append(Character.toUpperCase(part.charAt(0)));
            }
        }
        return builder.length() == 0 ? "YP" : builder.toString();
    }

    /** Polymorphic behaviour: subclasses decide what the role may do. */
    public boolean canManageUsers() {
        return false;
    }

    public boolean canFacilitate() {
        return false;
    }

    public boolean canMentor() {
        return false;
    }

    public boolean canSponsor() {
        return false;
    }

    /** Role constant owned by the concrete account class (discriminator column). */
    public abstract Enums.Role getRole();

    public boolean isAdmin() {
        return getRole() == Enums.Role.ADMIN;
    }

    public String portal() {
        return getRole().name().toLowerCase(java.util.Locale.ROOT);
    }

    public void recordLogin() {
        this.lastLoginAt = Instant.now();
    }

    public void changeStatus(Enums.UserStatus status) {
        this.status = status;
    }

    public void updateProfile(String fullName, String phone, String country, String district,
                              LocalDate dateOfBirth, String institution, String fieldOfStudy) {
        if (fullName != null && !fullName.isBlank()) {
            this.fullName = fullName.trim();
            this.avatar = initials(this.fullName);
        }
        if (phone != null) {
            this.phone = phone;
        }
        if (country != null) {
            this.country = country;
        }
        if (district != null) {
            this.district = district;
        }
        if (dateOfBirth != null) {
            this.dateOfBirth = dateOfBirth;
        }
        if (institution != null) {
            this.institution = institution;
        }
        if (fieldOfStudy != null) {
            this.fieldOfStudy = fieldOfStudy;
        }
    }

    /**
     * Applies the profile fields captured by self-registration. Consent timestamps are
     * set by the service only after the server has confirmed both boxes were ticked.
     */
    public void applyRegistration(String gender, String educationLevel, String employmentStatus,
                                  String careerGoal, String preferredLanguage, Set<String> interests,
                                  Instant termsAcceptedAt, Instant privacyAcceptedAt) {
        this.gender = trimmed(gender);
        this.educationLevel = trimmed(educationLevel);
        this.employmentStatus = trimmed(employmentStatus);
        this.careerGoal = trimmed(careerGoal);
        if (preferredLanguage != null && !preferredLanguage.isBlank()) {
            this.preferredLanguage = preferredLanguage.trim().toLowerCase(java.util.Locale.ROOT);
        }
        this.termsAcceptedAt = termsAcceptedAt;
        this.privacyAcceptedAt = privacyAcceptedAt;
        if (interests != null) {
            this.interests.clear();
            for (String interest : interests) {
                if (interest != null && !interest.isBlank()) {
                    this.interests.add(interest.trim());
                }
            }
        }
    }

    /** Updates the extended profile fields without touching consent timestamps. */
    public void updateExtendedProfile(String gender, String educationLevel, String employmentStatus,
                                      String careerGoal, String preferredLanguage,
                                      Set<String> interests) {
        if (gender != null) {
            this.gender = trimmed(gender);
        }
        if (educationLevel != null) {
            this.educationLevel = trimmed(educationLevel);
        }
        if (employmentStatus != null) {
            this.employmentStatus = trimmed(employmentStatus);
        }
        if (careerGoal != null) {
            this.careerGoal = trimmed(careerGoal);
        }
        if (preferredLanguage != null && !preferredLanguage.isBlank()) {
            this.preferredLanguage = preferredLanguage.trim().toLowerCase(java.util.Locale.ROOT);
        }
        if (interests != null) {
            this.interests.clear();
            for (String interest : interests) {
                if (interest != null && !interest.isBlank()) {
                    this.interests.add(interest.trim());
                }
            }
        }
    }

    private static String trimmed(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public void addSkill(String skill) {
        if (skill != null && !skill.isBlank()) {
            skills.add(skill.trim());
        }
    }

    public void removeSkill(String skill) {
        skills.remove(skill);
    }

    public void changePassword(String hash) {
        this.passwordHash = hash;
    }

    public Long getId() {
        return super.getId();
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public Enums.UserStatus getStatus() {
        return status;
    }

    public String getCountry() {
        return country;
    }

    public String getDistrict() {
        return district;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getInstitution() {
        return institution;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public Enums.Level getRequestedLevel() {
        return requestedLevel;
    }

    public String getAvatar() {
        return avatar;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public Set<String> getInterests() {
        return interests;
    }

    public String getGender() {
        return gender;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public Instant getTermsAcceptedAt() {
        return termsAcceptedAt;
    }

    public Instant getPrivacyAcceptedAt() {
        return privacyAcceptedAt;
    }

    public Instant getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public String getGuardianName() {
        return guardianName;
    }

    public String getGuardianPhone() {
        return guardianPhone;
    }

    public Instant getGuardianConsentAt() {
        return guardianConsentAt;
    }
}
