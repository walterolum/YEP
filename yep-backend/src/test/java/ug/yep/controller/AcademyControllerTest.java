package ug.yep.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.CatalogService;

/** Public catalogue endpoints and participant enrolment over HTTP. */
class AcademyControllerTest {

    private CatalogService catalog;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        catalog = mock(CatalogService.class);
        mvc = MockMvcBuilders.standaloneSetup(new AcademyController(catalog))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CurrentUser(2L, "amara@yep.example",
                        "Amara Nakato", Enums.Role.PARTICIPANT), null, List.of()));
    }

    @Test
    void academyListIsAvailableWithoutSigningIn() throws Exception {
        when(catalog.publishedAcademies()).thenReturn(List.of(academy()));

        mvc.perform(get("/api/academies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("tech-digital"))
                .andExpect(jsonPath("$[0].courseCount").value(4));
    }

    @Test
    void courseSearchPassesFiltersAndTheSignedInLearner() throws Exception {
        when(catalog.searchCourses("tech-digital", 1, "web", null, null, null, null, 2L))
                .thenReturn(List.of());

        mvc.perform(get("/api/courses").param("academy", "tech-digital").param("level", "1")
                        .param("q", "web"))
                .andExpect(status().isOk());

        verify(catalog).searchCourses(eq("tech-digital"), eq(1), eq("web"), isNull(), isNull(),
                isNull(), isNull(), eq(2L));
    }

    @Test
    void anonymousCourseSearchDoesNotClaimEnrolment() throws Exception {
        SecurityContextHolder.clearContext();
        when(catalog.searchCourses(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull())).thenReturn(List.of());

        mvc.perform(get("/api/courses")).andExpect(status().isOk());

        verify(catalog).searchCourses(null, null, null, null, null, null, null, null);
    }

    @Test
    void participantEnrolsThroughTheCourseRoute() throws Exception {
        when(catalog.enroll(2L, 9L)).thenReturn(new Views.EnrollmentView(12L, 9L, "Web Foundations",
                "web-foundations", "ENROLLED", Instant.now(), null));

        mvc.perform(post("/api/courses/9/enrol"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.status").value("ENROLLED"));
    }

    private Views.AcademyView academy() {
        return new Views.AcademyView(1L, "Tech & Digital", "tech-digital", "Build things", null,
                "💻", "#1d4ed8", 0, true, 2, 4);
    }
}
