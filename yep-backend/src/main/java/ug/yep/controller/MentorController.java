package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.security.CurrentUser;
import ug.yep.service.AdminService;

/** Mentor resource library. */
@RestController
@RequestMapping("/api/mentor")
public class MentorController {

    private final AdminService admin;

    public MentorController(AdminService admin) {
        this.admin = admin;
    }

    @GetMapping("/resources")
    public List<Map<String, Object>> resources() {
        return admin.resources();
    }

    @PostMapping("/resources")
    public Map<String, Object> addResource(@AuthenticationPrincipal CurrentUser actor,
                                           @Valid @RequestBody Requests.ResourceRequest request) {
        return admin.addResource(actor, request);
    }
}
