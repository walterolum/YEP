package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.security.CurrentUser;
import ug.yep.service.AdminService;
import ug.yep.service.AuthService;

/** Facilitator-only endpoints: register, session creation and attendance. */
class FacilitatorControllerTest {

    private AuthService auth;
    private AdminService admin;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        auth = mock(AuthService.class);
        admin = mock(AdminService.class);
        mvc = MockMvcBuilders.standaloneSetup(new FacilitatorController(auth, admin))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new CurrentUser(5L, "daniel@yep.example", "Daniel Okello", Enums.Role.FACILITATOR), null, List.of()));
    }

    private Views.SessionView session() {
        return new Views.SessionView(1L, "Level One welcome workshop", "WORKSHOP",
                Instant.parse("2026-11-16T08:07:00Z"), "2026-A", "Digital Foundations",
                null, "yep-1-welcome", false, 3);
    }

    @Test
    void listsTheParticipantRegister() throws Exception {
        User participant = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(participant, "id", 2L);
        when(auth.byRole(Enums.Role.PARTICIPANT)).thenReturn(List.of(Views.UserView.of(participant)));

        mvc.perform(get("/api/facilitator/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Amara Nakato"))
                .andExpect(jsonPath("$[0].role").value("PARTICIPANT"));
    }

    @Test
    void listsSessions() throws Exception {
        when(admin.sessions(5L)).thenReturn(List.of(session()));

        mvc.perform(get("/api/facilitator/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Level One welcome workshop"))
                .andExpect(jsonPath("$[0].roomName").value("yep-1-welcome"));
    }

    @Test
    void createsASession() throws Exception {
        when(admin.createSession(any(CurrentUser.class), any())).thenReturn(session());

        mvc.perform(post("/api/facilitator/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Level One welcome workshop\",\"type\":\"WORKSHOP\","
                                + "\"startsAt\":\"2026-11-16T08:07:00Z\",\"cohort\":\"2026-A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("WORKSHOP"));
    }

    @Test
    void returnsTheAttendanceRoster() throws Exception {
        when(admin.sessionRoster(1L)).thenReturn(List.of(
                Map.of("userId", 2, "name", "Amara Nakato", "present", true)));

        mvc.perform(get("/api/facilitator/sessions/1/roster"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Amara Nakato"))
                .andExpect(jsonPath("$[0].present").value(true));
    }

    @Test
    void marksAttendance() throws Exception {
        when(admin.markAttendance(eq(1L), any())).thenReturn(Map.of("marked", true, "present", true));

        mvc.perform(put("/api/facilitator/sessions/1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":2,\"present\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marked").value(true));
    }
}
