package com.youthrise.announcement;

import com.youthrise.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
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

/**
 * Announcement endpoints. Reads are available to any signed-in account and are
 * scoped by the service; publishing is restricted to staff roles by
 * {@code SecurityConfig} and re-checked in the service.
 */
@RestController
@RequestMapping("/api")
public class AnnouncementController {

    private final AnnouncementService announcements;

    public AnnouncementController(AnnouncementService announcements) {
        this.announcements = announcements;
    }

    @GetMapping("/announcements")
    public List<AnnouncementDtos.AnnouncementResponse> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return announcements.listFor(principal);
    }

    @PostMapping("/admin/announcements")
    public ResponseEntity<AnnouncementDtos.AnnouncementResponse> publish(
            @Valid @RequestBody AnnouncementDtos.CreateAnnouncementRequest body,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(announcements.publish(body, principal, request.getRemoteAddr()));
    }
}
