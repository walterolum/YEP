package com.youthrise.announcement;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A staff-authored message broadcast to participants.
 *
 * <p>Encapsulation: the entity validates its own text and publication time, so
 * a half-written announcement can never be stored. An announcement either
 * targets a role (or everyone) or a single programme, never both, which keeps
 * the audience rule unambiguous.</p>
 */
@Entity
@Table(name = "announcements", indexes = {
        @Index(name = "idx_announcements_published", columnList = "published_at"),
        @Index(name = "idx_announcements_role", columnList = "audience_role")
})
public class Announcement extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience_role", length = 24)
    private Role audienceRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id")
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    protected Announcement() {
    }

    /**
     * Creates a published announcement.
     *
     * @param title        short headline, 160 characters at most
     * @param body         message text, 4000 characters at most
     * @param audienceRole role the message addresses, or {@code null} for everyone
     * @param programme    programme the message belongs to, or {@code null} for the whole platform
     * @param author       staff account publishing the message
     */
    public static Announcement publish(String title, String body, Role audienceRole,
                                       Programme programme, User author) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("An announcement needs a title");
        }
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("An announcement needs a message");
        }
        if (audienceRole != null && programme != null) {
            throw new IllegalArgumentException("Target a role or a programme, not both");
        }
        Announcement announcement = new Announcement();
        announcement.title = title.trim();
        announcement.body = body.trim();
        announcement.audienceRole = audienceRole;
        announcement.programme = programme;
        announcement.author = author;
        announcement.publishedAt = Instant.now();
        return announcement;
    }

    /** True when this message is addressed to the given account and programmes. */
    public boolean isVisibleTo(Role role, java.util.Collection<String> programmeIds) {
        if (programme != null) {
            return programmeIds.contains(programme.getId());
        }
        return audienceRole == null || audienceRole == role;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public Role getAudienceRole() {
        return audienceRole;
    }

    public Programme getProgramme() {
        return programme;
    }

    public User getAuthor() {
        return author;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
