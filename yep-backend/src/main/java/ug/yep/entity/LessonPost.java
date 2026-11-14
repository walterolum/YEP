package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A question or answer in a lesson's Q&amp;A thread. */
@Entity
@Table(name = "lesson_posts")
public class LessonPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "body", nullable = false, length = 2000)
    private String body;

    protected LessonPost() {
    }

    public LessonPost(Lesson lesson, User user, String body) {
        this.lesson = lesson;
        this.user = user;
        this.body = body;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public User getUser() {
        return user;
    }

    public String getBody() {
        return body;
    }
}
