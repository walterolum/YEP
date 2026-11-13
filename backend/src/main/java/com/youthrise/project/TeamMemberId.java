package com.youthrise.project;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Composite key of the {@code team_members} join table.
 */
@Embeddable
public class TeamMemberId implements Serializable {

    @Column(name = "team_id", length = 36, nullable = false)
    private String teamId;

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    protected TeamMemberId() {
    }

    public TeamMemberId(String teamId, String userId) {
        this.teamId = teamId;
        this.userId = userId;
    }

    public String getTeamId() {
        return teamId;
    }

    public String getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof TeamMemberId that)) {
            return false;
        }
        return Objects.equals(teamId, that.teamId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(teamId, userId);
    }
}
