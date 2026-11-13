package com.youthrise.announcement;

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
 * Announcement broadcast rules.
 *
 * <p>Only administrators publish platform-wide messages and facilitators publish
 * messages for a programme they own. Recipients see role-targeted messages plus
 * messages for the programmes they belong to, so an announcement never leaks
 * across cohorts.</p>
 */
@Service
public class AnnouncementService {

    private final AnnouncementRepository announcements;
    private final UserRepository users;
    private final ProgrammeRepository programmes;
    private final EnrolmentRepository enrolments;
    private final AuditService audit;

    public AnnouncementService(AnnouncementRepository announcements, UserRepository users,
                               ProgrammeRepository programmes, EnrolmentRepository enrolments,
                               AuditService audit) {
        this.announcements = announcements;
        this.users = users;
        this.programmes = programmes;
        this.enrolments = enrolments;
        this.audit = audit;
    }

    /** Announcements the signed-in account is allowed to read. */
    @Transactional(readOnly = true)
    public List<AnnouncementDtos.AnnouncementResponse> listFor(UserPrincipal principal) {
        List<Announcement> all = announcements.findAllByOrderByPublishedAtDesc();
        if (principal.role() == Role.ADMIN) {
            return all.stream().map(AnnouncementDtos.AnnouncementResponse::from).toList();
        }
        List<String> programmeIds = visibleProgrammeIds(principal);
        return all.stream()
                .filter(announcement -> announcement.isVisibleTo(principal.role(), programmeIds))
                .map(AnnouncementDtos.AnnouncementResponse::from)
                .toList();
    }

    /**
     * Publishes an announcement. An administrator may address the whole platform;
     * a facilitator must name a programme they facilitate.
     */
    @Transactional
    public AnnouncementDtos.AnnouncementResponse publish(AnnouncementDtos.CreateAnnouncementRequest request,
                                                        UserPrincipal principal, String ipAddress) {
        User author = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND",
                        "That account could not be found."));
        Programme programme = null;
        if (request.programmeId() != null && !request.programmeId().isBlank()) {
            programme = programmes.findById(request.programmeId())
                    .orElseThrow(() -> ApiException.validation("programmeId",
                            "That programme could not be found."));
        }
        if (principal.role() != Role.ADMIN) {
            if (principal.role() != Role.FACILITATOR) {
                throw ApiException.forbidden("FORBIDDEN",
                        "Only facilitators and administrators publish announcements.");
            }
            if (programme == null || programme.getFacilitator() == null
                    || !programme.getFacilitator().getId().equals(principal.id())) {
                throw ApiException.forbidden("PROGRAMME_SCOPE",
                        "Facilitators can only announce to their own programmes.");
            }
        }
        Announcement saved = announcements.save(
                Announcement.publish(request.title(), request.body(), request.audienceRole(),
                        programme, author));
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "ANNOUNCEMENT_PUBLISHED", "announcement:" + saved.getId(), ipAddress);
        return AnnouncementDtos.AnnouncementResponse.from(saved);
    }

    /** Programmes whose announcements this account may see. */
    private List<String> visibleProgrammeIds(UserPrincipal principal) {
        if (principal.role() == Role.FACILITATOR) {
            return programmes.findByFacilitatorIdOrderByStartsAtAsc(principal.id()).stream()
                    .map(Programme::getId)
                    .toList();
        }
        if (principal.role() == Role.PARTICIPANT) {
            return enrolments.findByUserIdOrderByEnrolledAtDesc(principal.id()).stream()
                    .map(enrolment -> enrolment.getProgramme().getId())
                    .distinct()
                    .toList();
        }
        return List.of();
    }
}
