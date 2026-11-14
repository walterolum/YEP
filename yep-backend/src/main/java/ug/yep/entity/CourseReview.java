package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** One learner rating (1–5) and optional comment per course. */
@Entity
@Table(name = "course_reviews")
public class CourseReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "rating", nullable = false)
    private int rating;

    @Column(name = "body", length = 2000)
    private String body;

    protected CourseReview() {
    }

    public CourseReview(Course course, User user, int rating, String body) {
        this.course = course;
        this.user = user;
        update(rating, body);
    }

    public void update(int rating, String body) {
        this.rating = Math.max(1, Math.min(5, rating));
        this.body = body == null || body.isBlank() ? null : body.trim();
    }

    public Course getCourse() {
        return course;
    }

    public User getUser() {
        return user;
    }

    public int getRating() {
        return rating;
    }

    public String getBody() {
        return body;
    }
}
