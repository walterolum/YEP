package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.ProgrammeService;

/** Programme catalogue and applications. */
@RestController
@RequestMapping("/api/programmes")
public class ProgrammeController {

    private final ProgrammeService programmes;

    public ProgrammeController(ProgrammeService programmes) {
        this.programmes = programmes;
    }

    @GetMapping
    public List<Views.ProgrammeView> list() {
        return programmes.published();
    }

    @GetMapping("/mine")
    public List<Views.ApplicationView> mine(@AuthenticationPrincipal CurrentUser actor) {
        return programmes.mine(actor.id());
    }

    @PostMapping("/apply")
    public Views.ApplicationView apply(@AuthenticationPrincipal CurrentUser actor,
                                       @Valid @RequestBody Requests.ApplyRequest request) {
        return programmes.apply(actor, request);
    }
}
