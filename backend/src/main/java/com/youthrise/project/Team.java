package com.youthrise.project;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import com.youthrise.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "teams", uniqueConstraints =
        @UniqueConstraint(name = "uk_teams_programme_name", columnNames = {"programme_id", "name"}))
public class Team extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "theme", nullable = false, length = 80)
    private String theme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    private Set<TeamMember> memberships = new LinkedHashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sentAt ASC")
    private List<TeamMessage> messages = new ArrayList<>();

    @OneToOne(mappedBy = "team", fetch = FetchType.LAZY)
    private Project project;

    protected Team() {
    }

    public static Team create(Programme programme, String name, String theme, int capacity, User mentor) {
        Team team = new Team();
        team.programme = programme;
        team.name = name.trim();
        team.theme = theme.trim();
        team.capacity = capacity;
        team.mentor = mentor;
        return team;
    }

    public TeamMember addMember(User user, TeamMemberRole role) {
        if (hasMember(user.getId())) {
            throw new IllegalStateException("That person is already a member of this team.");
        }
        if (memberships.size() >= capacity) {
            throw new IllegalStateException("The team is already at capacity");
        }
        TeamMember member = TeamMember.create(this, user, role);
        memberships.add(member);
        return member;
    }

    public void changeMemberRole(String userId, TeamMemberRole role) {
        TeamMember member = requireMembership(userId);
        member.changeRole(role);
    }

    public void removeMember(String userId) {
        TeamMember member = requireMembership(userId);
        memberships.remove(member);
    }

    public TeamMemberRole roleOf(String userId) {
        return memberships.stream()
                .filter(member -> member.getUser().getId().equals(userId))
                .map(TeamMember::getRole)
                .findFirst()
                .orElse(null);
    }

    public boolean hasMember(String userId) {
        return memberships.stream().anyMatch(member -> member.getUser().getId().equals(userId));
    }

    public boolean isLead(String userId) {
        return roleOf(userId) == TeamMemberRole.LEAD;
    }

    public boolean isMentor(String userId) {
        return mentor != null && mentor.getId().equals(userId);
    }

    private TeamMember requireMembership(String userId) {
        return memberships.stream()
                .filter(member -> member.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("That person is not a member of this team."));
    }

    public TeamMessage postMessage(User author, String body) {
        TeamMessage message = TeamMessage.create(this, author, body);
        messages.add(message);
        return message;
    }

    public Programme getProgramme() {
        return programme;
    }

    public String getName() {
        return name;
    }

    public String getTheme() {
        return theme;
    }

    public User getMentor() {
        return mentor;
    }

    public int getCapacity() {
        return capacity;
    }

    /** Members as accounts, derived from the role-carrying memberships. */
    public Set<User> getMembers() {
        Set<User> members = new LinkedHashSet<>();
        for (TeamMember membership : memberships) {
            members.add(membership.getUser());
        }
        return members;
    }

    public Set<TeamMember> getMemberships() {
        return memberships;
    }

    public List<TeamMessage> getMessages() {
        return messages;
    }

    public Project getProject() {
        return project;
    }
}
