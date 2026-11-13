package com.youthrise.discussion;

import com.youthrise.common.ApiException;
import com.youthrise.common.AuditService;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Level One discussion threads.
 *
 * <p>Only members of a programme can read or write its discussions: enrolled
 * participants, the programme's facilitator and administrators. This check is
 * repeated here rather than trusted from the route, so a hand-edited URL cannot
 * reach another cohort's conversation.</p>
 */
@Service
public class DiscussionService {

    private final DiscussionRepository discussions;
    private final ProgrammeRepository programmes;
    private final EnrolmentRepository enrolments;
    private final UserRepository users;
    private final AuditService audit;

    public DiscussionService(DiscussionRepository discussions, ProgrammeRepository programmes,
                             EnrolmentRepository enrolments, UserRepository users, AuditService audit) {
        this.discussions = discussions;
        this.programmes = programmes;
        this.enrolments = enrolments;
        this.users = users;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<DiscussionDtos.DiscussionResponse> listForProgramme(String programmeId,
                                                                   UserPrincipal principal) {
        Programme programme = requireProgramme(programmeId);
        requireMember(programme, principal);
        return discussions.findByProgrammeIdOrderByPinnedDescCreatedAtDesc(programmeId).stream()
                .map(DiscussionDtos.DiscussionResponse::from)
                .toList();
    }

    /** Opens a thread and stores the opening post as its first message. */
    @Transactional
    public DiscussionDtos.DiscussionResponse open(String programmeId,
                                                  DiscussionDtos.CreateDiscussionRequest request,
                                                  UserPrincipal principal) {
        Programme programme = requireProgramme(programmeId);
        requireMember(programme, principal);
        User author = requireUser(principal.id());
        Discussion discussion = Discussion.open(programme, request.moduleId(), request.title(),
                request.topic(), author);
        discussion.addMessage(author, request.topic());
        Discussion saved = discussions.save(discussion);
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "DISCUSSION_OPENED", "discussion:" + saved.getId(), null);
        return DiscussionDtos.DiscussionResponse.from(saved);
    }

    /** Adds a reply to an unlocked thread the caller can read. */
    @Transactional
    public DiscussionDtos.MessageResponse reply(String discussionId,
                                                DiscussionDtos.ReplyRequest request,
                                                UserPrincipal principal) {
        Discussion discussion = discussions.findById(discussionId)
                .orElseThrow(() -> ApiException.notFound("DISCUSSION_NOT_FOUND",
                        "That discussion could not be found."));
        requireMember(discussion.getProgramme(), principal);
        User author = requireUser(principal.id());
        try {
            DiscussionMessage message = discussion.addMessage(author, request.body());
            discussions.flush();
            return DiscussionDtos.MessageResponse.from(message);
        } catch (IllegalStateException ex) {
            throw ApiException.conflict("DISCUSSION_LOCKED", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            throw ApiException.validation("body", ex.getMessage());
        }
    }

    /** Staff may pin a thread (useful for the current week's topic) or close it. */
    @Transactional
    public void moderate(String discussionId, boolean pinned, boolean locked, UserPrincipal principal) {
        Discussion discussion = discussions.findById(discussionId)
                .orElseThrow(() -> ApiException.notFound("DISCUSSION_NOT_FOUND",
                        "That discussion could not be found."));
        boolean owner = discussion.getProgramme().getFacilitator() != null
                && discussion.getProgramme().getFacilitator().getId().equals(principal.id());
        if (principal.role() != Role.ADMIN && !(principal.role() == Role.FACILITATOR && owner)) {
            throw ApiException.forbidden("FORBIDDEN",
                    "Only the programme facilitator or an administrator can moderate discussions.");
        }
        discussion.pin(pinned);
        discussion.lock(locked);
    }

    private void requireMember(Programme programme, UserPrincipal principal) {
        if (principal.role() == Role.ADMIN) {
            return;
        }
        boolean facilitator = programme.getFacilitator() != null
                && programme.getFacilitator().getId().equals(principal.id());
        if (facilitator) {
            return;
        }
        if (principal.role() == Role.PARTICIPANT
                && enrolments.findByProgrammeIdAndUserId(programme.getId(), principal.id()).isPresent()) {
            return;
        }
        throw ApiException.forbidden("PROGRAMME_MEMBERSHIP_REQUIRED",
                "Join the programme to take part in its discussions.");
    }

    private Programme requireProgramme(String programmeId) {
        return programmes.findById(programmeId)
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
    }

    private User requireUser(String userId) {
        return users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND",
                        "That account could not be found."));
    }
}
