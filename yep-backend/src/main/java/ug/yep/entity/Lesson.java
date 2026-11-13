package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** One lesson: intro video, core notes or a practical activity. */
@Entity
@Table(name = "lessons")
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private Enums.LessonType type;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    protected Lesson() {
    }

    public Lesson(Module module, String title, Enums.LessonType type, int sortOrder) {
        this.module = module;
        this.title = title;
        this.type = type;
        this.sortOrder = sortOrder;
    }

    public Module getModule() {
        return module;
    }

    public String getTitle() {
        return title;
    }

    public Enums.LessonType getType() {
        return type;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getContent() {
        return content;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }
}
