package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A learner's private notes for one lesson (one row per learner and lesson). */
@Entity
@Table(name = "lesson_notes")
public class LessonNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    protected LessonNote() {
    }

    public LessonNote(User user, Lesson lesson, String body) {
        this.user = user;
        this.lesson = lesson;
        this.body = body;
    }

    public void update(String body) {
        this.body = body;
    }

    public User getUser() {
        return user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public String getBody() {
        return body;
    }
}
