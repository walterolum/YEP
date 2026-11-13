package com.youthrise.programme;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_modules")
public class LearningModule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "summary", nullable = false, length = 500)
    private String summary;

    @Column(name = "position", nullable = false)
    private int position;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private ContentStatus status;

    @Column(name = "duration_mins", nullable = false)
    private int durationMins;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<Lesson> lessons = new ArrayList<>();

    protected LearningModule() {
    }

    public static LearningModule create(Programme programme, String title, String summary, int position,
                                        ContentStatus status, int durationMins) {
        LearningModule module = new LearningModule();
        module.programme = programme;
        module.title = title.trim();
        module.summary = summary.trim();
        module.position = position;
        module.status = status;
        module.durationMins = durationMins;
        return module;
    }

    public void addLesson(Lesson lesson) {
        lessons.add(lesson);
    }

    public void changeStatus(ContentStatus status) {
        this.status = status;
    }

    public Programme getProgramme() {
        return programme;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public int getPosition() {
        return position;
    }

    public ContentStatus getStatus() {
        return status;
    }

    public int getDurationMins() {
        return durationMins;
    }

    public List<Lesson> getLessons() {
        return lessons;
    }
}
