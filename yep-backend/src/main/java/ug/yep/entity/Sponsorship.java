package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A sponsor funding a named learner's seat on a course. */
@Entity
@Table(name = "sponsorships")
public class Sponsorship extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sponsor_id", nullable = false)
    private User sponsor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    protected Sponsorship() {
    }

    public Sponsorship(User sponsor, User learner, Course course) {
        this.sponsor = sponsor;
        this.learner = learner;
        this.course = course;
        this.status = "ACTIVE";
    }

    public User getSponsor() {
        return sponsor;
    }

    public User getLearner() {
        return learner;
    }

    public Course getCourse() {
        return course;
    }

    public String getStatus() {
        return status;
    }
}
