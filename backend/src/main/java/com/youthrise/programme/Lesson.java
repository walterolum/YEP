package com.youthrise.programme;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lessons")
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private LearningModule module;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false, length = 16)
    private LessonType type;

    @Column(name = "duration_mins", nullable = false)
    private int durationMins;

    @Column(name = "summary", nullable = false, length = 500)
    private String summary;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "resource_label", length = 160)
    private String resourceLabel;

    @Column(name = "resource_size", length = 32)
    private String resourceSize;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "lesson_body", joinColumns = @JoinColumn(name = "lesson_id"))
    @OrderColumn(name = "position")
    @Column(name = "paragraph", nullable = false, length = 4000)
    private List<String> body = new ArrayList<>();

    protected Lesson() {
    }

    public static Lesson create(LearningModule module, String title, LessonType type, int durationMins,
                                String summary, int position, List<String> body,
                                String resourceLabel, String resourceSize) {
        Lesson lesson = new Lesson();
        lesson.module = module;
        lesson.title = title.trim();
        lesson.type = type;
        lesson.durationMins = durationMins;
        lesson.summary = summary.trim();
        lesson.position = position;
        lesson.body = new ArrayList<>(body);
        lesson.resourceLabel = resourceLabel;
        lesson.resourceSize = resourceSize;
        return lesson;
    }

    public LearningModule getModule() {
        return module;
    }

    public String getTitle() {
        return title;
    }

    public LessonType getType() {
        return type;
    }

    public int getDurationMins() {
        return durationMins;
    }

    public String getSummary() {
        return summary;
    }

    public int getPosition() {
        return position;
    }

    public String getResourceLabel() {
        return resourceLabel;
    }

    public String getResourceSize() {
        return resourceSize;
    }

    public List<String> getBody() {
        return body;
    }
}
