package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

/** A published or draft learning programme that participants apply to. */
@Entity
@Table(name = "programmes")
public class Programme extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "category", nullable = false, length = 80)
    private String category;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "registration_deadline", nullable = false)
    private Instant registrationDeadline;

    @Column(name = "eligibility_text", length = 1000)
    private String eligibilityText;

    @Column(name = "published", nullable = false)
    private boolean published;

    protected Programme() {
    }

    public Programme(String title, String category, String icon, int capacity,
                     Instant registrationDeadline, String eligibilityText, boolean published) {
        this.title = title.trim();
        this.category = category;
        this.icon = icon;
        this.capacity = capacity;
        this.registrationDeadline = registrationDeadline;
        this.eligibilityText = eligibilityText;
        this.published = published;
    }

    /** True when a new application is still possible (published, open, with places). */
    public boolean isOpen(long approvedEnrolments) {
        return published && Instant.now().isBefore(registrationDeadline) && approvedEnrolments < capacity;
    }

    public long getPlacesLeft(long approvedEnrolments) {
        return Math.max(0, capacity - approvedEnrolments);
    }

    public void update(String title, String category, String icon, int capacity,
                       Instant registrationDeadline, String eligibilityText) {
        this.title = title.trim();
        this.category = category;
        this.icon = icon;
        this.capacity = capacity;
        this.registrationDeadline = registrationDeadline;
        this.eligibilityText = eligibilityText;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getIcon() {
        return icon;
    }

    public int getCapacity() {
        return capacity;
    }

    public Instant getRegistrationDeadline() {
        return registrationDeadline;
    }

    public String getEligibilityText() {
        return eligibilityText;
    }

    public boolean isPublished() {
        return published;
    }
}
