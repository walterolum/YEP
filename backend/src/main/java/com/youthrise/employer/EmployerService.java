package com.youthrise.employer;

import com.youthrise.assessment.Certificate;
import com.youthrise.assessment.CertificateRepository;
import com.youthrise.assessment.CertificateStatus;
import com.youthrise.common.ApiException;
import com.youthrise.notification.NotificationKind;
import com.youthrise.notification.NotificationService;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import com.youthrise.user.Visibility;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployerService {

    private final TalentProfileRepository profiles;
    private final SavedTalentRepository saved;
    private final IntroductionRepository introductions;
    private final CertificateRepository certificates;
    private final UserRepository users;
    private final NotificationService notifications;

    public EmployerService(TalentProfileRepository profiles, SavedTalentRepository saved,
                           IntroductionRepository introductions, CertificateRepository certificates,
                           UserRepository users, NotificationService notifications) {
        this.profiles = profiles;
        this.saved = saved;
        this.introductions = introductions;
        this.certificates = certificates;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<EmployerDtos.TalentProfileResponse> search(String query, String skill, String certificateStatus,
                                                           UserPrincipal principal) {
        requireEmployer(principal);
        String needle = query == null ? null : query.trim().toLowerCase(Locale.ROOT);
        return profiles.findAll().stream()
                .filter(profile -> profile.getUser().getVisibility() != Visibility.HIDDEN)
                .filter(profile -> matches(profile, needle, skill, certificateStatus))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EmployerDtos.TalentProfileResponse updateMine(EmployerDtos.UpdateTalentProfileRequest request,
                                                         UserPrincipal principal) {
        if (principal.role() != Role.PARTICIPANT) {
            throw ApiException.forbidden("FORBIDDEN", "Only participants can publish a talent profile.");
        }
        User user = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        List<TalentProfile.PortfolioItem> items = request.portfolioItems() == null
                ? List.of()
                : request.portfolioItems().stream()
                        .map(item -> new TalentProfile.PortfolioItem(item.title(), item.theme(), item.summary()))
                        .toList();
        TalentProfile profile = profiles.findByUserId(principal.id())
                .map(existing -> {
                    existing.update(request.headline(), request.projectSummary(), request.availability(), items);
                    return existing;
                })
                .orElseGet(() -> TalentProfile.create(user, request.headline(), request.projectSummary(),
                        request.availability(), items));
        return toResponse(profiles.save(profile));
    }

    @Transactional
    public void toggleSaved(String talentUserId, boolean shouldSave, UserPrincipal principal) {
        requireEmployer(principal);
        TalentProfile profile = profiles.findByUserId(talentUserId)
                .filter(candidate -> candidate.getUser().getVisibility() != Visibility.HIDDEN)
                .orElseThrow(() -> ApiException.notFound("TALENT_NOT_FOUND",
                        "That talent profile could not be found."));
        if (!shouldSave) {
            saved.deleteByEmployerIdAndTalentId(principal.id(), talentUserId);
            return;
        }
        if (!saved.existsByEmployerIdAndTalentId(principal.id(), talentUserId)) {
            User employer = users.findById(principal.id())
                    .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
            saved.save(SavedTalent.create(employer, profile.getUser()));
        }
    }

    @Transactional
    public void requestIntroduction(String talentUserId, String note, UserPrincipal principal) {
        requireEmployer(principal);
        TalentProfile profile = profiles.findByUserId(talentUserId)
                .filter(candidate -> candidate.getUser().getVisibility() != Visibility.HIDDEN)
                .orElseThrow(() -> ApiException.notFound("TALENT_NOT_FOUND",
                        "That talent profile could not be found."));
        User talent = profile.getUser();
        boolean consent = talent.isContactPermission() || talent.getVisibility() == Visibility.PUBLIC;
        if (!consent) {
            throw ApiException.forbidden("CONTACT_NOT_PERMITTED",
                    "This participant has not consented to employer introductions.");
        }
        User employer = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        introductions.save(Introduction.request(employer, talent, note));
        notifications.notifyUser(talent, "Employer introduction request",
                employer.getFullName() + " would like an introduction.", "/app/notifications",
                NotificationKind.APPROVAL);
    }

    private boolean matches(TalentProfile profile, String needle, String skill, String certificateFilter) {
        if (skill != null && !skill.isBlank() && !"all".equalsIgnoreCase(skill)
                && profile.getUser().getSkills().stream().noneMatch(value -> value.equalsIgnoreCase(skill))) {
            return false;
        }
        String status = certificateInfo(profile.getUser().getId()).status();
        if (certificateFilter != null && !certificateFilter.isBlank()
                && !"all".equalsIgnoreCase(certificateFilter) && !certificateFilter.equals(status)) {
            return false;
        }
        if (needle == null || needle.isEmpty()) {
            return true;
        }
        String haystack = (profile.getUser().getFullName() + " " + profile.getHeadline() + " "
                + String.join(" ", profile.getUser().getSkills()) + " " + profile.getProjectSummary())
                .toLowerCase(Locale.ROOT);
        return haystack.contains(needle);
    }

    private EmployerDtos.TalentProfileResponse toResponse(TalentProfile profile) {
        User user = profile.getUser();
        CertificateInfo info = certificateInfo(user.getId());
        return new EmployerDtos.TalentProfileResponse(
                user.getId(),
                profile.getHeadline(),
                user.getCountry(),
                List.copyOf(user.getSkills()),
                profile.getProjectSummary(),
                info.status(),
                info.code(),
                profile.getAvailability(),
                user.getVisibility(),
                user.isContactPermission(),
                profile.getPortfolioItems().stream().map(EmployerDtos.PortfolioItemResponse::from).toList());
    }

    private CertificateInfo certificateInfo(String userId) {
        List<Certificate> issued = certificates.findByParticipantIdOrderByCreatedAtDesc(userId);
        return issued.stream()
                .filter(certificate -> certificate.getStatus() == CertificateStatus.VALID)
                .findFirst()
                .map(certificate -> new CertificateInfo("verified", certificate.getCode()))
                .orElseGet(() -> issued.stream()
                        .anyMatch(certificate -> certificate.getStatus() == CertificateStatus.PENDING)
                        ? new CertificateInfo("pending", null)
                        : new CertificateInfo("none", null));
    }

    private static void requireEmployer(UserPrincipal principal) {
        if (principal.role() != Role.EMPLOYER && principal.role() != Role.ADMIN) {
            throw ApiException.forbidden("FORBIDDEN", "Only employers can search the talent directory.");
        }
    }

    private record CertificateInfo(String status, String code) {
    }
}
