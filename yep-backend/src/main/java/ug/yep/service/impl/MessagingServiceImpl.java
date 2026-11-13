package ug.yep.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.entity.EventSession;
import ug.yep.entity.MessageThread;
import ug.yep.entity.Team;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.MessageRepository;
import ug.yep.repository.MessageThreadRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;
import ug.yep.service.MessagingService;
import ug.yep.service.NotificationService;

/** Thread creation and posting, enforcing who may see and answer each conversation. */
@Service
public class MessagingServiceImpl implements MessagingService {

    private final MessageThreadRepository threads;
    private final MessageRepository messages;
    private final UserRepository users;
    private final TeamRepository teams;
    private final NotificationService notifications;

    public MessagingServiceImpl(MessageThreadRepository threads, MessageRepository messages,
                                UserRepository users, TeamRepository teams,
                                NotificationService notifications) {
        this.threads = threads;
        this.messages = messages;
        this.users = users;
        this.teams = teams;
        this.notifications = notifications;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Views.ThreadView> threads(Long userId) {
        return threads.findForMember(userId).stream()
                .map(thread -> Views.ThreadView.of(thread, canReply(thread, userId)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Views.ThreadView thread(Long threadId, Long userId) {
        MessageThread thread = require(threadId);
        if (!thread.hasMember(userId)) {
            throw new ForbiddenException("You are not part of this conversation.");
        }
        return Views.ThreadView.of(thread, canReply(thread, userId));
    }

    @Override
    @Transactional
    public Views.ThreadView create(CurrentUser actor, Requests.NewThreadRequest request) {
        User sender = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        Enums.ThreadKind kind;
        try {
            kind = Enums.ThreadKind.valueOf(request.kind().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Unknown conversation type: " + request.kind());
        }
        MessageThread thread;
        switch (kind) {
            case ANNOUNCEMENT -> {
                if (!actor.hasRole(Enums.Role.ADMIN, Enums.Role.FACILITATOR)) {
                    throw new ForbiddenException("Only administrators and facilitators post announcements.");
                }
                thread = new MessageThread(kind, request.title(), null, sender, null);
                thread.addMember(sender);
                List<User> audience = users.findAllByOrderByFullNameAsc().stream()
                        .filter(user -> user.getStatus() == Enums.UserStatus.APPROVED)
                        .filter(user -> user.getRole() != Enums.Role.ADMIN)
                        .filter(user -> matchesAudience(user, request.audience()))
                        .toList();
                audience.forEach(thread::addMember);
                audience.forEach(user -> notifications.send(user, "ANNOUNCEMENT", request.title()));
            }
            case SPONSOR_ENQUIRY -> {
                if (!actor.hasRole(Enums.Role.SPONSOR, Enums.Role.ADMIN)) {
                    throw new ForbiddenException("Sponsor enquiries are started by sponsors.");
                }
                thread = new MessageThread(kind, request.title(), null, sender, null);
                thread.addMember(sender);
                users.findByRoleAndStatusOrderByFullNameAsc(Enums.Role.ADMIN, Enums.UserStatus.APPROVED)
                        .forEach(thread::addMember);
            }
            case TEAM -> {
                Team team = teams.findByMemberId(actor.id()).stream().findFirst()
                        .orElseThrow(() -> new BusinessRuleException("You are not in a Level Two team yet."));
                thread = new MessageThread(kind, request.title(), team, sender, null);
                team.getMembers().forEach(thread::addMember);
                thread.addMember(team.getMentor());
                thread.addMember(team.getFacilitator());
            }
            default -> {
                if (request.targetUserId() == null) {
                    throw new BusinessRuleException("Choose the person you want to message.");
                }
                User target = users.findById(request.targetUserId())
                        .orElseThrow(() -> new NotFoundException("Recipient"));
                if (target.getId().equals(sender.getId())) {
                    throw new BusinessRuleException("You cannot send a direct message to yourself.");
                }
                thread = new MessageThread(kind, request.title(), null, sender, target);
                thread.addMember(sender);
                thread.addMember(target);
                notifications.send(target, "MESSAGE", sender.getFullName() + " sent you a message.");
            }
        }
        thread.post(sender, request.body());
        return Views.ThreadView.of(threads.save(thread), canReply(thread, actor.id()));
    }

    @Override
    @Transactional
    public Views.ThreadView post(Long threadId, Long userId, String body) {
        MessageThread thread = require(threadId);
        if (!thread.hasMember(userId)) {
            throw new ForbiddenException("You are not part of this conversation.");
        }
        if (!canReply(thread, userId)) {
            throw new ForbiddenException("This conversation is read-only for you.");
        }
        User sender = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        thread.post(sender, body);
        thread.getMembers().stream()
                .filter(member -> !member.getId().equals(userId))
                .forEach(member -> notifications.send(member, "MESSAGE",
                        sender.getFullName() + " replied in \"" + thread.getTitle() + "\"."));
        return Views.ThreadView.of(thread, true);
    }

    /**
     * Announcements are read-only for their audience; sponsor enquiries are answerable by
     * the sponsor and by administrators; direct and team threads by their members.
     */
    @Override
    public boolean canReply(MessageThread thread, Long userId) {
        if (!thread.hasMember(userId)) {
            return false;
        }
        return switch (thread.getKind()) {
            case ANNOUNCEMENT -> {
                User user = users.findById(userId).orElse(null);
                yield user != null && (user.canManageUsers() || user.canFacilitate());
            }
            case SPONSOR_ENQUIRY -> {
                User user = users.findById(userId).orElse(null);
                yield user != null && (user.getRole() == Enums.Role.SPONSOR || user.isAdmin());
            }
            default -> true;
        };
    }

    private boolean matchesAudience(User user, String audience) {
        if (audience == null || audience.equalsIgnoreCase("ALL")) {
            return user.getRole() != Enums.Role.ADMIN;
        }
        return user.getRole().name().equalsIgnoreCase(audience);
    }

    private MessageThread require(Long id) {
        return threads.findById(id).orElseThrow(() -> new NotFoundException("Conversation"));
    }
}
