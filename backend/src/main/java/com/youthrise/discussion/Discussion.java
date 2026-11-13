package com.youthrise.discussion;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import com.youthrise.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

/**
 * A Level One discussion thread attached to a programme (and optionally to one
 * of its learning modules).
 *
 * <p>Membership is enforced by {@link DiscussionService}; the entity only owns
 * thread state: a thread can be pinned by staff and locked once the exchange
 * closes, which prevents further replies without deleting history.</p>
 */
@Entity
@Table(name = "discussions", indexes = {
        @Index(name = "idx_discussions_programme", columnList = "programme_id, created_at")
})
public class Discussion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "module_id", length = 36)
    private String moduleId;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "topic", nullable = false, length = 1000)
    private String topic;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "pinned", nullable = false)
    private boolean pinned;

    @Column(name = "locked", nullable = false)
    private boolean locked;

    @OneToMany(mappedBy = "discussion", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<DiscussionMessage> messages = new ArrayList<>();

    protected Discussion() {
    }

    /** Opens a thread. The opening post is the first message. */
    public static Discussion open(Programme programme, String moduleId, String title,
                                  String topic, User author) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("A discussion needs a title");
        }
        if (topic == null || topic.isBlank()) {
            throw new IllegalArgumentException("A discussion needs a topic");
        }
        Discussion discussion = new Discussion();
        discussion.programme = programme;
        discussion.moduleId = moduleId == null || moduleId.isBlank() ? null : moduleId;
        discussion.title = title.trim();
        discussion.topic = topic.trim();
        discussion.author = author;
        return discussion;
    }

    /** Adds a reply. A locked thread rejects new messages. */
    public DiscussionMessage addMessage(User author, String body) {
        if (locked) {
            throw new IllegalStateException("This discussion is closed to new replies");
        }
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Write a message before posting");
        }
        DiscussionMessage message = DiscussionMessage.create(this, author, body);
        messages.add(message);
        return message;
    }

    public void pin(boolean pinned) {
        this.pinned = pinned;
    }

    public void lock(boolean locked) {
        this.locked = locked;
    }

    public Programme getProgramme() {
        return programme;
    }

    public String getModuleId() {
        return moduleId;
    }

    public String getTitle() {
        return title;
    }

    public String getTopic() {
        return topic;
    }

    public User getAuthor() {
        return author;
    }

    public boolean isPinned() {
        return pinned;
    }

    public boolean isLocked() {
        return locked;
    }

    public List<DiscussionMessage> getMessages() {
        return messages;
    }
}
