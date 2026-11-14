package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.security.CurrentUser;
import ug.yep.service.SessionFlowService;

/** Phase 4: calendar exports, attendance, recordings, feedback and booking slots. */
@RestController
@RequestMapping("/api/sessions")
public class SessionFlowController {

    private final SessionFlowService sessions;

    public SessionFlowController(SessionFlowService sessions) {
        this.sessions = sessions;
    }

    @PostMapping("/series")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR','INSTRUCTOR')")
    public Map<String, Object> createSeries(@AuthenticationPrincipal CurrentUser actor,
                                            @Valid @RequestBody Requests.SeriesRequest request) {
        return sessions.createSeries(actor.id(), request);
    }

    @GetMapping(value = "/calendar.ics", produces = "text/calendar")
    public ResponseEntity<String> myCalendar(@AuthenticationPrincipal CurrentUser actor) {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=yep-sessions.ics")
                .contentType(MediaType.parseMediaType("text/calendar; charset=utf-8"))
                .body(sessions.ics(actor.id(), null));
    }

    @GetMapping(value = "/{sessionId}/calendar.ics", produces = "text/calendar")
    public ResponseEntity<String> sessionCalendar(@AuthenticationPrincipal CurrentUser actor,
                                                  @PathVariable Long sessionId) {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=yep-session-" + sessionId + ".ics")
                .contentType(MediaType.parseMediaType("text/calendar; charset=utf-8"))
                .body(sessions.ics(actor.id(), sessionId));
    }

    @PostMapping("/{sessionId}/attend")
    public Map<String, Object> attend(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long sessionId) {
        return sessions.attend(actor.id(), sessionId);
    }

    @GetMapping("/{sessionId}/recordings")
    public List<Map<String, Object>> recordings(@PathVariable Long sessionId) {
        return sessions.sessionRecordings(sessionId);
    }

    @PostMapping("/{sessionId}/recordings")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR','INSTRUCTOR')")
    public Map<String, Object> addRecording(@AuthenticationPrincipal CurrentUser actor,
                                            @PathVariable Long sessionId,
                                            @Valid @RequestBody Requests.RecordingRequest request) {
        return sessions.addRecording(actor.id(), sessionId, request);
    }

    @PostMapping("/recordings/{recordingId}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR','INSTRUCTOR')")
    public Map<String, Object> publish(@AuthenticationPrincipal CurrentUser actor,
                                       @PathVariable Long recordingId,
                                       @Valid @RequestBody Requests.PublishRecordingRequest request) {
        return sessions.publishRecording(actor.id(), recordingId, request);
    }

    @PostMapping("/{sessionId}/feedback")
    public Map<String, Object> feedback(@AuthenticationPrincipal CurrentUser actor,
                                        @PathVariable Long sessionId,
                                        @Valid @RequestBody Requests.SessionFeedbackRequest request) {
        return sessions.feedback(actor.id(), sessionId, request);
    }

    @GetMapping("/{sessionId}/slots")
    public List<Map<String, Object>> slots(@PathVariable Long sessionId) {
        return sessions.sessionSlots(sessionId);
    }

    @PostMapping("/{sessionId}/slots")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR','INSTRUCTOR','MENTOR')")
    public Map<String, Object> createSlot(@PathVariable Long sessionId,
                                          @Valid @RequestBody Requests.SlotRequest request) {
        return sessions.createSlot(sessionId, request);
    }

    @PostMapping("/slots/{slotId}/book")
    public Map<String, Object> book(@AuthenticationPrincipal CurrentUser actor,
                                    @PathVariable Long slotId) {
        return sessions.book(actor.id(), slotId);
    }
}
