package com.youthrise.programme;

import com.youthrise.common.ApiException;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgrammeService {

    private final ProgrammeRepository programmes;
    private final EnrolmentRepository enrolments;
    private final LearningModuleRepository modules;
    private final LessonRepository lessons;
    private final LessonCompletionRepository completions;
    private final UserRepository users;

    public ProgrammeService(ProgrammeRepository programmes, EnrolmentRepository enrolments,
                            LearningModuleRepository modules, LessonRepository lessons,
                            LessonCompletionRepository completions, UserRepository users) {
        this.programmes = programmes;
        this.enrolments = enrolments;
        this.modules = modules;
        this.lessons = lessons;
        this.completions = completions;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<ProgrammeDtos.ProgrammeResponse> listPublic() {
        return programmes.findByStatusNotOrderByStartsAtAsc(ProgrammeStatus.DRAFT).stream()
                .map(ProgrammeDtos.ProgrammeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProgrammeDtos.ProgrammeResponse getPublic(String id) {
        Programme programme = required(id);
        return ProgrammeDtos.ProgrammeResponse.from(programme);
    }

    @Transactional(readOnly = true)
    public List<ProgrammeDtos.ProgrammeResponse> listForFacilitator(UserPrincipal principal) {
        List<Programme> result = principal.role() == Role.ADMIN
                ? programmes.findAll()
                : programmes.findByFacilitatorIdOrderByStartsAtAsc(principal.id());
        return result.stream().map(ProgrammeDtos.ProgrammeResponse::from).toList();
    }

    @Transactional
    public ProgrammeDtos.ProgrammeResponse createProgramme(ProgrammeDtos.CreateProgrammeRequest request,
                                                           UserPrincipal principal) {
        if (principal.role() != Role.FACILITATOR && principal.role() != Role.ADMIN) {
            throw ApiException.forbidden("FORBIDDEN", "Only facilitators can create programmes.");
        }
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw ApiException.validation("endsAt", "The end date must be after the start date.");
        }
        User facilitator = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        Programme programme = Programme.create(request.title(), request.summary(), request.description(),
                request.level(), request.theme(), request.durationWeeks(), request.commitment(), request.mode(),
                request.capacity(), request.status(), request.startsAt(), request.endsAt(), request.cohort(),
                facilitator);
        programme.replaceCurriculumCopy(listOrEmpty(request.eligibility()), listOrEmpty(request.outcomes()),
                listOrEmpty(request.skills()));
        return ProgrammeDtos.ProgrammeResponse.from(programmes.save(programme));
    }

    @Transactional
    public ProgrammeDtos.EnrolmentResponse enrol(String programmeId, UserPrincipal principal) {
        if (principal.role() != Role.PARTICIPANT) {
            throw ApiException.forbidden("FORBIDDEN", "Only participants can enrol in a programme.");
        }
        User user = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        if (!user.isEmailVerified()) {
            throw ApiException.forbidden("EMAIL_NOT_VERIFIED",
                    "Verify your email address before enrolling in a programme.");
        }

        Programme programme = programmes.findByIdForUpdate(programmeId)
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        if (programme.getStatus() == ProgrammeStatus.DRAFT) {
            throw ApiException.notFound("PROGRAMME_NOT_FOUND", "That programme could not be found.");
        }

        Enrolment existing = enrolments.findByProgrammeIdAndUserId(programmeId, principal.id()).orElse(null);
        if (existing != null) {
            return ProgrammeDtos.EnrolmentResponse.from(existing);
        }
        if (programme.getStatus() == ProgrammeStatus.CLOSED) {
            throw ApiException.conflict("ENROLMENT_CLOSED", "Enrolment for this programme is closed.");
        }

        long seated = enrolments.countSeated(programmeId);
        EnrolmentStatus status;
        if (programme.getStatus() == ProgrammeStatus.WAITLIST || seated >= programme.getCapacity()) {
            if (programme.getStatus() != ProgrammeStatus.WAITLIST) {
                throw ApiException.conflict("PROGRAMME_FULL",
                        "This cohort is full. Enrolment is not open for additional places.");
            }
            status = EnrolmentStatus.WAITLISTED;
        } else {
            status = EnrolmentStatus.ACTIVE;
        }

        try {
            Enrolment enrolment = enrolments.saveAndFlush(Enrolment.create(programme, user, status));
            return ProgrammeDtos.EnrolmentResponse.from(enrolment);
        } catch (DataIntegrityViolationException ex) {
            // Concurrent double-submit: the unique constraint wins and the existing row is returned.
            return enrolments.findByProgrammeIdAndUserId(programmeId, principal.id())
                    .map(ProgrammeDtos.EnrolmentResponse::from)
                    .orElseThrow(() -> ApiException.conflict("ENROLMENT_FAILED",
                            "Enrolment could not be completed. Please try again."));
        }
    }

    @Transactional(readOnly = true)
    public List<ProgrammeDtos.EnrolmentResponse> listEnrolments(String userId) {
        return enrolments.findByUserIdOrderByEnrolledAtDesc(userId).stream()
                .map(ProgrammeDtos.EnrolmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProgrammeDtos.LearningModuleResponse> getModules(String programmeId, UserPrincipal principal) {
        Programme programme = required(programmeId);
        boolean staff = isStaff(programme, principal);
        if (!staff) {
            requireActiveEnrolment(programmeId, principal.id());
        }
        return modules.findByProgrammeIdOrderByPositionAsc(programmeId).stream()
                .map(module -> toModuleResponse(module, staff))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProgrammeDtos.LearningModuleResponse> listModulesForFacilitator(UserPrincipal principal) {
        List<LearningModule> visible = principal.role() == Role.ADMIN
                ? modules.findAll()
                : modules.findByProgrammeFacilitatorIdOrderByProgrammeIdAscPositionAsc(principal.id());
        return visible.stream().map(module -> toModuleResponse(module, true)).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getProgress(String programmeId, String userId) {
        requireEnrolment(programmeId, userId);
        return completions.findCompletedLessonIds(userId, programmeId);
    }

    @Transactional
    public ProgrammeDtos.CompletedLessonsResponse completeLesson(String programmeId, String lessonId,
                                                                 UserPrincipal principal) {
        if (principal.role() != Role.PARTICIPANT) {
            throw ApiException.forbidden("FORBIDDEN", "Only enrolled participants can complete lessons.");
        }
        Enrolment enrolment = requireActiveEnrolment(programmeId, principal.id());
        Lesson lesson = lessons.findInProgramme(lessonId, programmeId)
                .orElseThrow(() -> ApiException.notFound("LESSON_NOT_FOUND",
                        "That lesson does not belong to this programme."));
        if (lesson.getModule().getStatus() != ContentStatus.PUBLISHED) {
            throw ApiException.notFound("LESSON_NOT_FOUND", "That lesson is not available yet.");
        }

        if (!completions.existsByUserIdAndLessonId(principal.id(), lessonId)) {
            completions.saveAndFlush(LessonCompletion.record(enrolment.getUser(), lesson,
                    lesson.getModule().getProgramme()));
        }
        long total = lessons.countForProgramme(programmeId, ContentStatus.PUBLISHED);
        long done = completions.countByUserIdAndProgrammeId(principal.id(), programmeId);
        int progress = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
        enrolment.updateProgress(progress, lessonId);

        return new ProgrammeDtos.CompletedLessonsResponse(
                completions.findCompletedLessonIds(principal.id(), programmeId));
    }

    @Transactional
    public void updateModuleStatus(String moduleId, ContentStatus status, UserPrincipal principal) {
        LearningModule module = modules.findById(moduleId)
                .orElseThrow(() -> ApiException.notFound("MODULE_NOT_FOUND", "That module could not be found."));
        boolean owner = module.getProgramme().getFacilitator().getId().equals(principal.id());
        if (principal.role() != Role.ADMIN && !(principal.role() == Role.FACILITATOR && owner)) {
            throw ApiException.forbidden("FORBIDDEN", "You can only change modules you own.");
        }
        module.changeStatus(status);
    }

    private ProgrammeDtos.LearningModuleResponse toModuleResponse(LearningModule module, boolean includeDrafts) {
        List<ProgrammeDtos.LessonResponse> visibleLessons = module.getLessons().stream()
                .filter(lesson -> includeDrafts || module.getStatus() == ContentStatus.PUBLISHED)
                .map(ProgrammeDtos.LessonResponse::from)
                .toList();
        return new ProgrammeDtos.LearningModuleResponse(module.getId(), module.getProgramme().getId(),
                module.getTitle(), module.getSummary(), module.getPosition(), module.getStatus(),
                module.getDurationMins(), visibleLessons);
    }

    private Enrolment requireEnrolment(String programmeId, String userId) {
        return enrolments.findByProgrammeIdAndUserId(programmeId, userId)
                .orElseThrow(() -> ApiException.forbidden("ENROLMENT_REQUIRED",
                        "Enrol in this programme to view its learning content."));
    }

    private Enrolment requireActiveEnrolment(String programmeId, String userId) {
        Enrolment enrolment = requireEnrolment(programmeId, userId);
        if (enrolment.getStatus() != EnrolmentStatus.ACTIVE
                && enrolment.getStatus() != EnrolmentStatus.COMPLETED) {
            throw ApiException.forbidden("ENROLMENT_REQUIRED",
                    "Your enrolment is not active. Contact the programme facilitator.");
        }
        return enrolment;
    }

    private boolean isStaff(Programme programme, UserPrincipal principal) {
        if (principal.role() == Role.ADMIN) {
            return true;
        }
        return principal.role() == Role.FACILITATOR
                && programme.getFacilitator().getId().equals(principal.id());
    }

    private Programme required(String id) {
        return programmes.findById(id)
                .filter(programme -> programme.getStatus() != ProgrammeStatus.DRAFT)
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
    }

    private static List<String> listOrEmpty(List<String> value) {
        return value == null ? List.of() : value.stream().filter(item -> item != null && !item.isBlank()).toList();
    }
}
