package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A recording of a session, with an optional transcript, publishable as a lesson. */
@Entity
@Table(name = "session_recordings")
public class SessionRecording extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private EventSession session;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "transcript", columnDefinition = "text")
    private String transcript;

    protected SessionRecording() {
    }

    public SessionRecording(EventSession session, String title, String url, String transcript) {
        this.session = session;
        this.title = title;
        this.url = url;
        this.transcript = transcript;
    }

    public EventSession getSession() {
        return session;
    }

    public String getTitle() {
        return title;
    }

    public String getUrl() {
        return url;
    }

    public String getTranscript() {
        return transcript;
    }
}
