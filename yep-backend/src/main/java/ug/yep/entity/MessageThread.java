package ug.yep.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** An announcement, sponsor enquiry, direct message or team thread. */
@Entity
@Table(name = "message_threads")
public class MessageThread extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 24)
    private Enums.ThreadKind kind;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id")
    private User fromUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "thread_members",
            joinColumns = @JoinColumn(name = "thread_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> members = new LinkedHashSet<>();

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("sentAt ASC")
    private List<Message> messages = new ArrayList<>();

    protected MessageThread() {
    }

    public MessageThread(Enums.ThreadKind kind, String title, Team team, User fromUser, User targetUser) {
        this.kind = kind;
        this.title = title;
        this.team = team;
        this.fromUser = fromUser;
        this.targetUser = targetUser;
    }

    public void addMember(User user) {
        if (user != null) {
            members.add(user);
        }
    }

    public boolean hasMember(Long userId) {
        return members.stream().anyMatch(member -> member.getId().equals(userId));
    }

    public Message post(User sender, String body) {
        Message message = new Message(this, sender, body);
        messages.add(message);
        return message;
    }

    public Enums.ThreadKind getKind() {
        return kind;
    }

    public String getTitle() {
        return title;
    }

    public Team getTeam() {
        return team;
    }

    public User getFromUser() {
        return fromUser;
    }

    public User getTargetUser() {
        return targetUser;
    }

    public Set<User> getMembers() {
        return members;
    }

    public List<Message> getMessages() {
        return messages;
    }
}
