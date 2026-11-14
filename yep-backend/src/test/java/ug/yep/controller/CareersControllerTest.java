package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import ug.yep.service.CareersService;

/** Phase 6 HTTP surface: jobs, applications, saved jobs and portfolio. */
class CareersControllerTest {

    private CareersService careers;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        careers = mock(CareersService.class);
        mvc = MockMvcBuilders.standaloneSetup(new CareersController(careers))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CurrentUser(16L, "employer@yep.example",
                        "Acme HR", Enums.Role.EMPLOYER), null, List.of()));
    }

    @Test
    void theBoardListsOpenJobs() throws Exception {
        when(careers.openJobs()).thenReturn(List.of(Map.of("id", 1, "title",
                "Junior Web Developer", "organisation", "Acme Ltd", "open", true)));

        mvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Junior Web Developer"))
                .andExpect(jsonPath("$[0].open").value(true));
    }

    @Test
    void anEmployerPostsAJob() throws Exception {
        when(careers.post(eq(16L), any())).thenReturn(Map.of("id", 1, "title",
                "Junior Web Developer", "open", true));

        mvc.perform(post("/api/employer/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Junior Web Developer\",\"organisation\":\"Acme Ltd\","
                                + "\"location\":\"Kampala\",\"description\":\"Build pages\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void aPostingWithoutADescriptionIsRejected() throws Exception {
        mvc.perform(post("/api/employer/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Role\",\"organisation\":\"Acme\",\"location\":\"Kampala\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aLearnerAppliesOnce() throws Exception {
        when(careers.apply(eq(16L), eq(1L), any())).thenReturn(Map.of("id", 1, "status",
                "SUBMITTED", "title", "Junior Web Developer"));

        mvc.perform(post("/api/jobs/1/apply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"coverNote\":\"I built the YEP course projects.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void anEmptyCoverNoteIsRejected() throws Exception {
        mvc.perform(post("/api/jobs/1/apply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"coverNote\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void applicantsAreScopedToTheEmployerPosting() throws Exception {
        when(careers.applicants(16L, 1L)).thenReturn(List.of(Map.of("id", 1,
                "learner", "Amara Nakato", "status", "SUBMITTED")));

        mvc.perform(get("/api/employer/jobs/1/applicants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].learner").value("Amara Nakato"));
    }

    @Test
    void aDecisionIsApplied() throws Exception {
        when(careers.decide(eq(16L), eq(1L), eq("HIRED")))
                .thenReturn(Map.of("id", 1, "status", "HIRED"));

        mvc.perform(post("/api/employer/applications/1/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"HIRED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("HIRED"));
    }

    @Test
    void savedJobsAndPortfolioRoundTrip() throws Exception {
        when(careers.savedJobs(16L)).thenReturn(List.of(Map.of("id", 1)));
        when(careers.portfolio(16L)).thenReturn(List.of(Map.of("id", 2, "title", "Capstone")));
        when(careers.addPortfolio(eq(16L), any())).thenReturn(Map.of("id", 3, "title", "Capstone"));
        when(careers.unsaveJob(16L, 1L)).thenReturn(Map.of("postingId", 1, "saved", false));

        mvc.perform(get("/api/me/saved-jobs")).andExpect(status().isOk());
        mvc.perform(get("/api/me/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Capstone"));
        mvc.perform(post("/api/me/portfolio")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Capstone\",\"type\":\"PROJECT\"}"))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/jobs/1/save"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved").value(false));
    }
}
