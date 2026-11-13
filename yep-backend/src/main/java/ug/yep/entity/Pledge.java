package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/** A sponsor pledge to a project. */
@Entity
@Table(name = "pledges")
public class Pledge extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sponsor_id", nullable = false)
    private User sponsor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "project_title", length = 160)
    private String projectTitle;

    @Column(name = "amount_ugx", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountUgx;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.PledgeStatus status;

    @Column(name = "pledged_at", nullable = false)
    private Instant pledgedAt;

    protected Pledge() {
    }

    public Pledge(User sponsor, Project project, String projectTitle, BigDecimal amountUgx) {
        this.sponsor = sponsor;
        this.project = project;
        this.projectTitle = projectTitle;
        this.amountUgx = amountUgx;
        this.status = Enums.PledgeStatus.PLEDGED;
        this.pledgedAt = Instant.now();
    }

    public User getSponsor() {
        return sponsor;
    }

    public Project getProject() {
        return project;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public BigDecimal getAmountUgx() {
        return amountUgx;
    }

    public Enums.PledgeStatus getStatus() {
        return status;
    }

    public Instant getPledgedAt() {
        return pledgedAt;
    }
}
