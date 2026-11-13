package com.youthrise.project;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TeamController {

    private final TeamService teams;

    public TeamController(TeamService teams) {
        this.teams = teams;
    }

    @GetMapping("/me/teams")
    public List<ProjectDtos.TeamResponse> myTeams(@AuthenticationPrincipal UserPrincipal principal) {
        return teams.listForUser(principal.id());
    }

    @GetMapping("/mentor/teams")
    public List<ProjectDtos.TeamResponse> mentorTeams(@AuthenticationPrincipal UserPrincipal principal) {
        return teams.listForMentor(principal.id());
    }

    @GetMapping("/teams/{id}")
    public ProjectDtos.TeamResponse get(@PathVariable String id,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        return teams.get(id, principal);
    }

    @PostMapping("/teams")
    public ResponseEntity<ProjectDtos.TeamResponse> create(
            @Valid @RequestBody ProjectDtos.CreateTeamRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectDtos.TeamResponse created = teams.createTeam(body, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/teams/{id}/members")
    public ProjectDtos.TeamResponse addMember(
            @PathVariable String id,
            @Valid @RequestBody ProjectDtos.AddTeamMemberRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teams.addMember(id, body, principal);
    }

    /** Participants enrolled in a programme who are not yet on a team. */
    @GetMapping("/facilitator/programmes/{programmeId}/unassigned-participants")
    public List<ProjectDtos.ParticipantCandidateResponse> unassigned(
            @PathVariable String programmeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teams.unassignedParticipants(programmeId, principal);
    }

    /** Facilitator-side selection: add several participants in one action. */
    @PostMapping("/teams/{id}/members/bulk")
    public ProjectDtos.TeamResponse addMembers(
            @PathVariable String id,
            @Valid @RequestBody ProjectDtos.BulkAddMembersRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teams.addMembers(id, body, principal);
    }

    @PatchMapping("/teams/{id}/members/{userId}")
    public ProjectDtos.TeamResponse changeMemberRole(
            @PathVariable String id,
            @PathVariable String userId,
            @Valid @RequestBody ProjectDtos.ChangeTeamMemberRoleRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teams.changeMemberRole(id, userId, body, principal);
    }

    @DeleteMapping("/teams/{id}/members/{userId}")
    public ProjectDtos.TeamResponse removeMember(
            @PathVariable String id,
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teams.removeMember(id, userId, principal);
    }

    @PostMapping("/teams/{id}/messages")
    public ResponseEntity<Void> postMessage(@PathVariable String id,
                                            @Valid @RequestBody ProjectDtos.PostMessageRequest body,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        teams.postMessage(id, body.body(), principal);
        return ResponseEntity.noContent().build();
    }
}
