package ug.yep.service;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Application;
import ug.yep.entity.Enums;
import ug.yep.entity.Programme;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.ApplicationRepository;
import ug.yep.repository.ProgrammeRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;

/** Programme catalogue and enrolment applications, including capacity and deadline rules. */
@Service
public class ProgrammeService {

    private final ProgrammeRepository programmes;
    private final ApplicationRepository applications;
    private final UserRepository users;
    private final NotificationService notifications;
    private final AuditService audit;

    public ProgrammeService(ProgrammeRepository programmes, ApplicationRepository applications,
                            UserRepository users, NotificationService notifications, AuditService audit) {
        this.programmes = programmes;
        this.applications = applications;
        this.users = users;
        this.notifications = notifications;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<Views.ProgrammeView> published() {
        return programmes.findByPublishedTrueOrderByTitleAsc().stream()
                .map(programme -> Views.ProgrammeView.of(programme, approvedCount(programme.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Views.ProgrammeView> all() {
        return programmes.findAllByOrderByTitleAsc().stream()
                .map(programme -> Views.ProgrammeView.of(programme, approvedCount(programme.getId())))
                .toList();
    }

    @Transactional
    public Views.ProgrammeView create(Requests.ProgrammeRequest request) {
        Programme programme = new Programme(request.title(), request.category(), request.icon(),
                request.capacity(), request.registrationDeadline(), request.eligibilityText(),
                request.published());
        programmes.save(programme);
        return Views.ProgrammeView.of(programme, 0);
    }

    @Transactional
    public Views.ProgrammeView update(Long id, Requests.ProgrammeRequest request) {
        Programme programme = programmes.findById(id)
                .orElseThrow(() -> new NotFoundException("Programme"));
        programme.update(request.title(), request.category(), request.icon(), request.capacity(),
                request.registrationDeadline(), request.eligibilityText());
        programme.setPublished(request.published());
        return Views.ProgrammeView.of(programme, approvedCount(id));
    }

    @Transactional
    public Views.ApplicationView apply(CurrentUser actor, Requests.ApplyRequest request) {
        Programme programme = programmes.findById(request.programmeId())
                .orElseThrow(() -> new NotFoundException("Programme"));
        if (!programme.isPublished()) {
            throw new BusinessRuleException("That programme is not open for applications.");
        }
        if (Instant.now().isAfter(programme.getRegistrationDeadline())) {
            throw new BusinessRuleException("The registration deadline for this programme has passed.");
        }
        if (approvedCount(programme.getId()) >= programme.getCapacity()) {
            throw new BusinessRuleException("This programme is full. Please choose another programme.");
        }
        if (applications.findByProgrammeIdAndUserId(programme.getId(), actor.id()).isPresent()) {
            throw new BusinessRuleException("You have already applied for this programme.");
        }
        User applicant = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        Application application = applications.save(new Application(programme, applicant));
        audit.record(applicant, "PROGRAMME_APPLY", "programme", programme.getId(),
                "Applied for " + programme.getTitle());
        users.findByRoleAndStatusOrderByFullNameAsc(Enums.Role.ADMIN, Enums.UserStatus.APPROVED)
                .forEach(admin -> notifications.send(admin, "APPLICATION",
                        applicant.getFullName() + " applied for " + programme.getTitle() + "."));
        return Views.ApplicationView.of(application);
    }

    @Transactional(readOnly = true)
    public List<Views.ApplicationView> mine(Long userId) {
        return applications.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(Views.ApplicationView::of).toList();
    }

    @Transactional(readOnly = true)
    public List<Views.ApplicationView> allApplications() {
        return applications.findAll().stream().map(Views.ApplicationView::of).toList();
    }

    @Transactional
    public Views.ApplicationView decide(CurrentUser actor, Long applicationId, boolean approve) {
        Application application = applications.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application"));
        if (approve) {
            long approved = approvedCount(application.getProgramme().getId());
            if (approved >= application.getProgramme().getCapacity()) {
                throw new BusinessRuleException("The programme is already at capacity.");
            }
        }
        application.decide(approve ? Enums.ApplicationStatus.APPROVED : Enums.ApplicationStatus.REJECTED);
        notifications.send(application.getUser(), "APPLICATION",
                "Your application for " + application.getProgramme().getTitle() + " was "
                        + (approve ? "approved." : "not approved."));
        audit.record(actorUser(actor), approve ? "APPLICATION_APPROVE" : "APPLICATION_REJECT",
                "application", applicationId, application.getProgramme().getTitle());
        return Views.ApplicationView.of(application);
    }

    @Transactional(readOnly = true)
    public List<Long> approvedParticipantIds() {
        return applications.findAll().stream()
                .filter(application -> application.getStatus() == Enums.ApplicationStatus.APPROVED)
                .map(application -> application.getUser().getId())
                .distinct()
                .toList();
    }

    private long approvedCount(Long programmeId) {
        return applications.countByProgrammeIdAndStatus(programmeId, Enums.ApplicationStatus.APPROVED);
    }

    private User actorUser(CurrentUser actor) {
        return users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
    }
}
