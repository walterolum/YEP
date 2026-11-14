package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.SessionFlowService;

/** Phase 4 HTTP surface: series, calendar, attendance, recordings, feedback and slots. */
class SessionFlowControllerTest {

    private SessionFlowService sessions;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        sessions = mock(SessionFlowService.class);
        mvc = MockMvcBuilders.standaloneSetup(new SessionFlowController(sessions))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CurrentUser(1L, "admin@yep.example",
                        "Yep Admin", Enums.Role.ADMIN), null, List.of()));
    }

    @Test
    void aSeriesRequestReturnsTheGeneratedSessionIds() throws Exception {
        when(sessions.createSeries(eq(1L), any())).thenReturn(Map.of("seriesId", 1,
                "provider", "jitsi", "sessions", List.of(5, 6, 7, 8), "repeatWeeks", 4));

        mvc.perform(post("/api/sessions/series")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Career clinic\",\"type\":\"WORKSHOP\","
                                + "\"startsAt\":\"2027-01-04T15:00:00Z\",\"repeatWeeks\":4,"
                                + "\"durationMinutes\":60}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions.length()").value(4))
                .andExpect(jsonPath("$.provider").value("jitsi"));
    }

    @Test
    void anInvalidSeriesIsRejected() throws Exception {
        mvc.perform(post("/api/sessions/series")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"type\":\"WORKSHOP\","
                                + "\"startsAt\":\"2027-01-04T15:00:00Z\",\"repeatWeeks\":4,"
                                + "\"durationMinutes\":60}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void theCalendarIsServedAsTextCalendar() throws Exception {
        when(sessions.ics(1L, 41L)).thenReturn("BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n");

        mvc.perform(get("/api/sessions/41/calendar.ics"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=yep-session-41.ics"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("BEGIN:VCALENDAR")));
    }

    @Test
    void checkInRecordsAttendance() throws Exception {
        when(sessions.attend(1L, 41L)).thenReturn(Map.of("sessionId", 41, "present", true));

        mvc.perform(post("/api/sessions/41/attend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.present").value(true));
    }

    @Test
    void feedbackIsStored() throws Exception {
        when(sessions.feedback(eq(1L), eq(41L), any()))
                .thenReturn(Map.of("sessionId", 41, "rating", 4, "comment", "Useful"));

        mvc.perform(post("/api/sessions/41/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":4,\"comment\":\"Useful\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4));
    }

    @Test
    void slotsCanBeListedAndBooked() throws Exception {
        when(sessions.sessionSlots(41L)).thenReturn(List.of(Map.of("id", 9, "capacity", 1,
                "booked", 0, "startsAt", Instant.now())));
        when(sessions.book(1L, 9L)).thenReturn(Map.of("id", 9, "capacity", 1, "booked", 1,
                "startsAt", Instant.now()));

        mvc.perform(get("/api/sessions/41/slots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(9));

        mvc.perform(post("/api/sessions/slots/9/book"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.booked").value(1));
    }

    @Test
    void anInvalidRatingIsRejected() throws Exception {
        mvc.perform(post("/api/sessions/41/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":9}"))
                .andExpect(status().isBadRequest());
    }
}
