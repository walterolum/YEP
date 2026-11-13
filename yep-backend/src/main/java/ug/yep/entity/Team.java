package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;

/** A Level Two team. The lead is a member with explicit accountability. */
@Entity
@Table(name = "teams")
public class Team extends BaseEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_user_id", nullable = false)
    private User lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facilitator_id")
    private User facilitator;

    @Column(name = "cohort", length = 80)
    private String cohort;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "team_members",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> members = new LinkedHashSet<>();

    protected Team() {
    }

    public Team(String name, Project project, User lead, String cohort) {
        this.name = name.trim();
        this.project = project;
        this.lead = lead;
        this.cohort = cohort;
        addMember(lead);
    }

    public void addMember(User user) {
        members.add(user);
    }

    public boolean hasMember(Long userId) {
        return members.stream().anyMatch(member -> member.getId().equals(userId));
    }

    public boolean isLead(Long userId) {
        return lead != null && lead.getId().equals(userId);
    }

    public void setMentor(User mentor) {
        this.mentor = mentor;
    }

    public void setFacilitator(User facilitator) {
        this.facilitator = facilitator;
    }

    public String getName() {
        return name;
    }

    public Project getProject() {
        return project;
    }

    public User getLead() {
        return lead;
    }

    public User getMentor() {
        return mentor;
    }

    public User getFacilitator() {
        return facilitator;
    }

    public String getCohort() {
        return cohort;
    }

    public Set<User> getMembers() {
        return members;
    }
}
