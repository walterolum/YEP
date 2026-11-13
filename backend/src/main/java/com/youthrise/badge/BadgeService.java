package com.youthrise.badge;

import com.youthrise.common.ApiException;
import com.youthrise.user.User;
import com.youthrise.user.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Awards and lists recognition badges. Awarding is idempotent: the unique key on
 * (user, badge) makes a repeated rule fire harmless.
 */
@Service
public class BadgeService {

    public static final String FIRST_EXCHANGE = "FIRST_EXCHANGE";
    public static final String TEAM_PLAYER = "TEAM_PLAYER";
    public static final String PROGRAMME_COMPLETION = "PROGRAMME_COMPLETION";

    private static final Logger log = LoggerFactory.getLogger(BadgeService.class);

    private final BadgeRepository badges;
    private final UserBadgeRepository awards;
    private final UserRepository users;

    public BadgeService(BadgeRepository badges, UserBadgeRepository awards, UserRepository users) {
        this.badges = badges;
        this.awards = awards;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<BadgeDtos.BadgeResponse> listForUser(String userId) {
        return awards.findByUserIdOrderByAwardedAtDesc(userId).stream()
                .map(award -> BadgeDtos.BadgeResponse.of(award.getBadge(), award))
                .toList();
    }

    /** Every badge in the catalogue, marked with whether the caller has earned it. */
    @Transactional(readOnly = true)
    public List<BadgeDtos.BadgeResponse> catalogueFor(String userId) {
        Map<String, UserBadge> earned = new HashMap<>();
        for (UserBadge award : awards.findByUserIdOrderByAwardedAtDesc(userId)) {
            earned.put(award.getBadge().getCode(), award);
        }
        return badges.findAllByOrderByNameAsc().stream()
                .map(badge -> BadgeDtos.BadgeResponse.of(badge, earned.get(badge.getCode())))
                .toList();
    }

    @Transactional
    public void award(String userId, String code, User awardedBy, String reason) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        awardIfMissing(user, code, awardedBy, reason);
    }

    /**
     * Best-effort award used by other services. A missing badge definition or a
     * concurrent duplicate never blocks the primary action.
     */
    @Transactional
    public void awardIfMissing(User user, String code, User awardedBy, String reason) {
        Badge badge = badges.findByCodeIgnoreCase(code).orElse(null);
        if (badge == null) {
            log.warn("Badge {} is not defined; skipping award for {}", code, user.getId());
            return;
        }
        if (awards.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
            return;
        }
        try {
            awards.save(UserBadge.award(user, badge, awardedBy, reason));
        } catch (DataIntegrityViolationException ex) {
            log.debug("Badge {} was already awarded to {}", code, user.getId());
        }
    }

    @Transactional
    public void awardProgrammeCompletion(User participant, User issuedBy) {
        awardIfMissing(participant, PROGRAMME_COMPLETION, issuedBy,
                "Completed every requirement of the programme.");
    }
}
