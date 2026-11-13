package com.youthrise.partner;

import com.youthrise.common.ApiException;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartnerService {

    private final NominationRepository nominations;
    private final BriefingRequestRepository briefings;
    private final ProgrammeRepository programmes;
    private final UserRepository users;

    public PartnerService(NominationRepository nominations, BriefingRequestRepository briefings,
                          ProgrammeRepository programmes, UserRepository users) {
        this.nominations = nominations;
        this.briefings = briefings;
        this.programmes = programmes;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<PartnerDtos.NominationResponse> listNominations(UserPrincipal principal) {
        requirePartner(principal);
        List<Nomination> result = principal.role() == Role.ADMIN
                ? nominations.findAllByOrderByNominatedAtDesc()
                : nominations.findByNominatedByIdOrderByNominatedAtDesc(principal.id());
        return result.stream().map(PartnerDtos.NominationResponse::from).toList();
    }

    @Transactional
    public PartnerDtos.NominationResponse nominate(PartnerDtos.CreateNominationRequest request,
                                                   UserPrincipal principal) {
        requirePartner(principal);
        Programme programme = programmes.findById(request.programmeId())
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        if (programme.getStatus() == ProgrammeStatus.DRAFT) {
            throw ApiException.notFound("PROGRAMME_NOT_FOUND", "That programme could not be found.");
        }
        String email = User.normalizeEmail(request.learnerEmail());
        if (nominations.existsByProgrammeIdAndLearnerEmailIgnoreCaseAndStatusNot(
                programme.getId(), email, NominationStatus.DECLINED)) {
            throw ApiException.conflict("NOMINATION_EXISTS",
                    "That learner has already been nominated for this programme.");
        }
        User partner = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        Nomination nomination = nominations.save(Nomination.create(request.institution(), request.learnerName(),
                email, programme, partner, request.note()));
        return PartnerDtos.NominationResponse.from(nomination);
    }

    @Transactional
    public void requestBriefing(String programmeId, PartnerDtos.BriefingRequestPayload payload,
                                UserPrincipal principal) {
        requirePartner(principal);
        Programme programme = programmes.findById(programmeId)
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        User partner = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        briefings.save(BriefingRequest.create(partner, programme, payload.note()));
    }

    private static void requirePartner(UserPrincipal principal) {
        if (principal.role() != Role.UNIVERSITY && principal.role() != Role.PARTNER
                && principal.role() != Role.ADMIN) {
            throw ApiException.forbidden("FORBIDDEN", "Only partner organisations can use this workspace.");
        }
    }
}
