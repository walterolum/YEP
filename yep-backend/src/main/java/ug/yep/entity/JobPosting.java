package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A job, internship or attachment posted by an employer account. */
@Entity
@Table(name = "job_postings")
public class JobPosting extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "organisation", nullable = false, length = 160)
    private String organisation;

    @Column(name = "location", nullable = false, length = 120)
    private String location;

    @Column(name = "work_mode", nullable = false, length = 20)
    private String workMode;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "skills", length = 500)
    private String skills;

    @Column(name = "closes_at")
    private Instant closesAt;

    @Column(name = "published", nullable = false)
    private boolean published;

    protected JobPosting() {
    }

    public JobPosting(User employer, String title, String organisation, String location,
                      String workMode, String description, String skills, Instant closesAt) {
        this.employer = employer;
        this.title = title;
        this.organisation = organisation;
        this.location = location;
        this.workMode = workMode == null ? "ONSITE" : workMode.toUpperCase(java.util.Locale.ROOT);
        this.description = description;
        this.skills = skills;
        this.closesAt = closesAt;
        this.published = true;
    }

    public boolean isOpen() {
        return published && (closesAt == null || closesAt.isAfter(Instant.now()));
    }

    public void close() {
        this.published = false;
    }

    public User getEmployer() {
        return employer;
    }

    public String getTitle() {
        return title;
    }

    public String getOrganisation() {
        return organisation;
    }

    public String getLocation() {
        return location;
    }

    public String getWorkMode() {
        return workMode;
    }

    public String getDescription() {
        return description;
    }

    public String getSkills() {
        return skills;
    }

    public Instant getClosesAt() {
        return closesAt;
    }

    public boolean isPublished() {
        return published;
    }
}
