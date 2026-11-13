package com.youthrise.user;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserService userService;

    public MeController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserDtos.UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getProfile(principal.id());
    }

    @PatchMapping
    public UserDtos.UserResponse update(@AuthenticationPrincipal UserPrincipal principal,
                                        @Valid @RequestBody UserDtos.ProfilePatch patch) {
        return userService.updateProfile(principal.id(), patch);
    }
}
