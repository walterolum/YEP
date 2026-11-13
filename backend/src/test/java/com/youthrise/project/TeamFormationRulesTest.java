package com.youthrise.project;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/**
 * Domain rules for Level Two teams: capacity, unique membership, the single-lead
 * invariant and role changes. These run without a database so a regression is
 * caught in milliseconds.
 */
class TeamFormationRulesTest {

    private static final int CAPACITY = TeamService.DEFAULT_TEAM_CAPACITY;

    @Test
    void aTeamStopsAcceptingMembersAtCapacity() {
        Team team = team(CAPACITY);
        team.addMember(participant("Lead", "lead@example.org"), TeamMemberRole.LEAD);
        for (int index = 1; index < CAPACITY; index++) {
            team.addMember(participant("Member " + index, "m" + index + "@example.org"),
                    TeamMemberRole.MEMBER);
        }

        assertThat(team.getMemberships()).hasSize(CAPACITY);
        assertThatThrownBy(() -> team.addMember(participant("Overflow", "over@example.org"),
                TeamMemberRole.MEMBER))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("capacity");
    }

    @Test
    void theSameParticipantCannotJoinTwice() {
        Team team = team(CAPACITY);
        User lead = participant("Lead", "lead@example.org");
        team.addMember(lead, TeamMemberRole.LEAD);

        assertThatThrownBy(() -> team.addMember(lead, TeamMemberRole.MEMBER))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already a member");
    }

    @Test
    void rolesAreExplicitAndTheLeadIsIdentifiable() {
        Team team = team(CAPACITY);
        User lead = participant("Lead", "lead@example.org");
        User member = participant("Member", "member@example.org");
        team.addMember(lead, TeamMemberRole.LEAD);
        team.addMember(member, TeamMemberRole.MEMBER);

        assertThat(team.isLead(lead.getId())).isTrue();
        assertThat(team.roleOf(member.getId())).isEqualTo(TeamMemberRole.MEMBER);

        team.changeMemberRole(member.getId(), TeamMemberRole.SUPPORT);
        assertThat(team.roleOf(member.getId())).isEqualTo(TeamMemberRole.SUPPORT);

        team.removeMember(member.getId());
        assertThat(team.hasMember(member.getId())).isFalse();
    }

    private static Team team(int capacity) {
        User facilitator = User.invited("Facilitator", "fac@example.org", Role.FACILITATOR,
                "Uganda", "Africa/Kampala");
        Instant now = Instant.now();
        Programme programme = Programme.create("Level Two Exchange", "Summary", "Description", 2,
                "Climate", 6, "4 hours a week", "Online", 30, ProgrammeStatus.OPEN,
                now.minus(1, ChronoUnit.DAYS), now.plus(60, ChronoUnit.DAYS), "2026-A", facilitator);
        return Team.create(programme, "Green Team", "Climate", capacity, null);
    }

    /**
     * Accounts receive their identifier when persisted, so a database-free test
     * assigns one directly to exercise membership rules on real objects.
     */
    private static User participant(String name, String email) {
        User user = User.register(name, email, null, "Uganda", "hash", "Africa/Kampala",
                LocalDate.of(2000, 1, 1));
        assignId(user);
        return user;
    }

    private static void assignId(Object entity) {
        try {
            Field field = BaseEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, UUID.randomUUID().toString());
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException("Could not assign a test identifier", ex);
        }
    }
}
