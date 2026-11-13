package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
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
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.DiscussionService;
import ug.yep.service.LearningService;

/** HTTP-level tests for the learning endpoints, including the principal and JSON contract. */
class LearningControllerTest {

    private LearningService learning;
    private DiscussionService discussions;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        learning = mock(LearningService.class);
        discussions = mock(DiscussionService.class);
        mvc = MockMvcBuilders.standaloneSetup(new LearningController(learning, discussions))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new CurrentUser(2L, "amara@yep.example", "Amara Nakato", Enums.Role.PARTICIPANT), null, List.of()));
    }

    private Views.ProgressView progress(int levelOne, boolean unlocked) {
        return new Views.ProgressView(levelOne, 12, 15, 0, unlocked, unlocked, 0, 4, 88, 90, false,
                new Views.PolicyView(18, 35, 80, 65, 75), Map.of("Digital Literacy", levelOne));
    }

    @Test
    void returnsProgressForTheSignedInParticipant() throws Exception {
        when(learning.progress(2L)).thenReturn(progress(53, false));

        mvc.perform(get("/api/learning/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.levelOnePercent").value(53))
                .andExpect(jsonPath("$.levelTwoUnlocked").value(false))
                .andExpect(jsonPath("$.policy.minAge").value(18));
    }

    @Test
    void listsModulesWithLessons() throws Exception {
        when(learning.modules(2L)).thenReturn(List.of(new Views.ModuleView(1L, "Digital Literacy", "💻",
                "Use digital tools confidently", 3, 1, 33,
                List.of(new Views.LessonView(1L, "Introduction to digital tools", "READING", 25, true)))));

        mvc.perform(get("/api/learning/modules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Digital Literacy"))
                .andExpect(jsonPath("$[0].lessons[0].completed").value(true));
    }

    @Test
    void returnsLessonDetail() throws Exception {
        when(learning.lessonDetail(2L, 4L)).thenReturn(new Views.LessonDetailView(4L,
                "What generative AI can and cannot do", "READING", 30, "AI Literacy", "WHAT YOU WILL LEARN", false));

        mvc.perform(get("/api/learning/lessons/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moduleName").value("AI Literacy"))
                .andExpect(jsonPath("$.completed").value(false));
    }

    @Test
    void completesALesson() throws Exception {
        when(learning.completeLesson(2L, 4L, true))
                .thenReturn(new Views.LessonView(4L, "AI lesson", "READING", 30, true));

        mvc.perform(post("/api/learning/lessons/4/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void startsADiscussionAsTheSignedInUser() throws Exception {
        when(discussions.startThread(eq(2L), eq("Source checking"), any()))
                .thenReturn(Map.of("id", 7, "title", "Source checking"));

        mvc.perform(post("/api/learning/discussions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Source checking\",\"body\":\"How do you check a photo?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }
}
