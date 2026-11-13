package com.youthrise.project;

import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Membership of a participant in a Level Two team, carrying the role that the
 * member plays. The join table predates this class; the composite key is kept.
 */
@Entity
@Table(name = "team_members")
public class TeamMember {

    @EmbeddedId
    private TeamMemberId id;

    @MapsId("teamId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private TeamMemberRole role;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    protected TeamMember() {
    }

    static TeamMember create(Team team, User user, TeamMemberRole role) {
        TeamMember member = new TeamMember();
        member.id = new TeamMemberId(team.getId(), user.getId());
        member.team = team;
        member.user = user;
        member.role = role;
        member.joinedAt = Instant.now();
        return member;
    }

    void changeRole(TeamMemberRole role) {
        this.role = role;
    }

    public TeamMemberId getId() {
        return id;
    }

    public Team getTeam() {
        return team;
    }

    public User getUser() {
        return user;
    }

    public TeamMemberRole getRole() {
        return role;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }
}
