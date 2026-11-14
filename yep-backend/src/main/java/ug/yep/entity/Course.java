package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A course inside a career path. Level 1 courses form Level One; Level 2 courses
 * are the advanced/impact stage after the overall 80% gate.
 */
@Entity
@Table(name = "courses")
public class Course extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "career_path_id", nullable = false)
    private CareerPath careerPath;

    @Column(name = "code", nullable = false, length = 40, unique = true)
    private String code;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "slug", nullable = false, length = 160, unique = true)
    private String slug;

    @Column(name = "summary", length = 500)
    private String summary;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "level", nullable = false)
    private int level = 1;

    @Column(name = "duration_hours", nullable = false)
    private int durationHours;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "language", nullable = false, length = 8)
    private String language = "en";

    @Column(name = "certificate_available", nullable = false)
    private boolean certificateAvailable = true;

    // Attribution is mandatory before a course can be published (content-licensing rule).
    @Column(name = "source_name", length = 160)
    private String sourceName;

    @Column(name = "source_url", length = 400)
    private String sourceUrl;

    @Column(name = "licence", length = 80)
    private String licence;

    @Column(name = "licence_url", length = 400)
    private String licenceUrl;

    @Column(name = "author", length = 160)
    private String author;

    @Column(name = "attribution_text", length = 1000)
    private String attributionText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", nullable = false, length = 24)
    private Enums.ReviewStatus reviewStatus = Enums.ReviewStatus.DRAFT;

    @Column(name = "review_note", length = 1000)
    private String reviewNote;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "rating_average", nullable = false)
    private double ratingAverage;

    @Column(name = "rating_count", nullable = false)
    private int ratingCount;

    protected Course() {
    }

    public Course(CareerPath careerPath, String code, String title, String slug, int level) {
        this.careerPath = careerPath;
        this.code = code.trim().toUpperCase(java.util.Locale.ROOT);
        this.title = title.trim();
        this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
        this.level = level;
    }

    public void update(CareerPath careerPath, String code, String title, String slug, String summary,
                       String description, int level, int durationHours, String icon, int sortOrder) {
        if (careerPath != null) {
            this.careerPath = careerPath;
        }
        if (code != null && !code.isBlank()) {
            this.code = code.trim().toUpperCase(java.util.Locale.ROOT);
        }
        if (title != null && !title.isBlank()) {
            this.title = title.trim();
        }
        if (slug != null && !slug.isBlank()) {
            this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
        }
        this.summary = summary;
        this.description = description;
        if (level == 1 || level == 2) {
            this.level = level;
        }
        this.durationHours = Math.max(0, durationHours);
        this.icon = icon;
        this.sortOrder = sortOrder;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    /** Language, certificate flag and the attribution block required by the licensing rule. */
    public void applyLicensing(String language, Boolean certificateAvailable, String sourceName,
                               String sourceUrl, String licence, String licenceUrl, String author,
                               String attributionText) {
        if (language != null && !language.isBlank()) {
            this.language = language.trim().toLowerCase(java.util.Locale.ROOT);
        }
        if (certificateAvailable != null) {
            this.certificateAvailable = certificateAvailable;
        }
        this.sourceName = trimmed(sourceName);
        this.sourceUrl = trimmed(sourceUrl);
        this.licence = trimmed(licence);
        this.licenceUrl = trimmed(licenceUrl);
        this.author = trimmed(author);
        this.attributionText = trimmed(attributionText);
    }

    public void assignInstructor(User instructor) {
        this.instructor = instructor;
    }

    /** Every publishable course must name its source, licence, author and attribution. */
    public boolean attributionComplete() {
        return isFilled(sourceName) && isFilled(licence) && isFilled(author)
                && isFilled(attributionText);
    }

    public void submitForReview() {
        if (reviewStatus != Enums.ReviewStatus.DRAFT
                && reviewStatus != Enums.ReviewStatus.CHANGES_REQUESTED) {
            throw new ug.yep.exception.BusinessRuleException(
                    "Only a draft or a course with requested changes can be submitted for review.");
        }
        if (!attributionComplete()) {
            throw new ug.yep.exception.BusinessRuleException(
                    "Add the source, licence, author and attribution before submitting this course.");
        }
        this.reviewStatus = Enums.ReviewStatus.SUBMITTED;
        this.reviewNote = null;
    }

    public void approve(User reviewer, String note) {
        this.reviewStatus = Enums.ReviewStatus.APPROVED;
        this.reviewNote = trimmed(note);
        this.reviewedAt = Instant.now();
        this.reviewedBy = reviewer;
        this.published = true;
    }

    public void requestChanges(User reviewer, String note) {
        this.reviewStatus = Enums.ReviewStatus.CHANGES_REQUESTED;
        this.reviewNote = trimmed(note);
        this.reviewedAt = Instant.now();
        this.reviewedBy = reviewer;
        this.published = false;
    }

    /** Keeps the denormalised rating used by the catalogue filters. */
    public void updateRating(int count, double average) {
        this.ratingCount = Math.max(0, count);
        this.ratingAverage = count <= 0 ? 0 : Math.round(average * 100.0) / 100.0;
    }

    private static String trimmed(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static boolean isFilled(String value) {
        return value != null && !value.isBlank();
    }

    public CareerPath getCareerPath() {
        return careerPath;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getSummary() {
        return summary;
    }

    public String getDescription() {
        return description;
    }

    public int getLevel() {
        return level;
    }

    public int getDurationHours() {
        return durationHours;
    }

    public String getIcon() {
        return icon;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isPublished() {
        return published;
    }

    public String getLanguage() {
        return language;
    }

    public boolean isCertificateAvailable() {
        return certificateAvailable;
    }

    public String getSourceName() {
        return sourceName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getLicence() {
        return licence;
    }

    public String getLicenceUrl() {
        return licenceUrl;
    }

    public String getAuthor() {
        return author;
    }

    public String getAttributionText() {
        return attributionText;
    }

    public User getInstructor() {
        return instructor;
    }

    public Enums.ReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public String getReviewNote() {
        return reviewNote;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public double getRatingAverage() {
        return ratingAverage;
    }

    public int getRatingCount() {
        return ratingCount;
    }
}
