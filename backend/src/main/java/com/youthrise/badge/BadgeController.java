package com.youthrise.badge;

import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import com.youthrise.common.ApiException;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BadgeController {

    private final BadgeService badges;
    private final UserRepository users;

    public BadgeController(BadgeService badges, UserRepository users) {
        this.badges = badges;
        this.users = users;
    }

    @GetMapping("/me/badges")
    public List<BadgeDtos.BadgeResponse> myBadges(@AuthenticationPrincipal UserPrincipal principal) {
        return badges.listForUser(principal.id());
    }

    @GetMapping("/badges")
    public List<BadgeDtos.BadgeResponse> catalogue(@AuthenticationPrincipal UserPrincipal principal) {
        return badges.catalogueFor(principal.id());
    }

    @PostMapping("/admin/badges")
    public ResponseEntity<Void> award(@Valid @RequestBody BadgeDtos.AwardBadgeRequest request,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        User awardedBy = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        badges.award(request.userId(), request.code(), awardedBy, request.reason());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
