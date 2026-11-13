package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

/** A workshop, webinar, discussion or project session. */
@Entity
@Table(name = "sessions")
public class EventSession extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private Enums.SessionType type;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "cohort", length = 80)
    private String cohort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id")
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "meeting_link", length = 400)
    private String meetingLink;

    @Column(name = "room_name", length = 100)
    private String roomName;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "session_registrations",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> registrations = new LinkedHashSet<>();

    protected EventSession() {
    }

    public EventSession(String title, Enums.SessionType type, Instant startsAt, String cohort,
                        Programme programme, User createdBy, String meetingLink) {
        this.title = title;
        this.type = type;
        this.startsAt = startsAt;
        this.cohort = cohort;
        this.programme = programme;
        this.createdBy = createdBy;
        this.meetingLink = meetingLink;
    }

    /** Generates a stable, URL-safe room so the class can meet without an extra account. */
    public void assignVirtualRoom() {
        if (roomName == null || roomName.isBlank()) {
            String slug = title == null ? "session" : title.toLowerCase(java.util.Locale.ROOT)
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("(^-|-$)", "");
            if (slug.length() > 40) {
                slug = slug.substring(0, 40);
            }
            roomName = "yep-" + getId() + "-" + slug;
        }
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public void register(User user) {
        registrations.add(user);
    }

    public void cancel(User user) {
        registrations.remove(user);
    }

    public boolean isRegistered(Long userId) {
        return registrations.stream().anyMatch(user -> user.getId().equals(userId));
    }

    public String getTitle() {
        return title;
    }

    public Enums.SessionType getType() {
        return type;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public String getCohort() {
        return cohort;
    }

    public Programme getProgramme() {
        return programme;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public Set<User> getRegistrations() {
        return registrations;
    }
}
