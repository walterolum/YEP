package com.youthrise.project;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "team_messages")
public class TeamMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "body", nullable = false, length = 2000)
    private String body;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    protected TeamMessage() {
    }

    static TeamMessage create(Team team, User author, String body) {
        TeamMessage message = new TeamMessage();
        message.team = team;
        message.author = author;
        message.body = body.trim();
        message.sentAt = Instant.now();
        return message;
    }

    public Team getTeam() {
        return team;
    }

    public User getAuthor() {
        return author;
    }

    public String getBody() {
        return body;
    }

    public Instant getSentAt() {
        return sentAt;
    }
}
