package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A file uploaded against a project. */
@Entity
@Table(name = "deliverables")
public class Deliverable extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "file_name", nullable = false, length = 200)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 400)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.DeliverableStatus status;

    protected Deliverable() {
    }

    public Deliverable(Project project, User uploadedBy, String fileName, String filePath) {
        this.project = project;
        this.uploadedBy = uploadedBy;
        this.fileName = fileName;
        this.filePath = filePath;
        this.status = Enums.DeliverableStatus.REVIEW;
    }

    public Project getProject() {
        return project;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public Enums.DeliverableStatus getStatus() {
        return status;
    }
}
