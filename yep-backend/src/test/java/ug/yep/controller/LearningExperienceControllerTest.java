package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
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
import ug.yep.exception.NotFoundException;
import ug.yep.security.CurrentUser;
import ug.yep.service.DiscussionService;
import ug.yep.service.LearningExperienceService;
import ug.yep.service.LearningService;

/** Phase 3 HTTP surface: lesson extras, notes, practice, Q&A, coding and attempts. */
class LearningExperienceControllerTest {

    private LearningExperienceService experience;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        experience = mock(LearningExperienceService.class);
        mvc = MockMvcBuilders.standaloneSetup(new LearningController(mock(LearningService.class),
                        mock(DiscussionService.class), experience))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CurrentUser(2L, "amara@yep.example",
                        "Amara Nakato", Enums.Role.PARTICIPANT), null, List.of()));
    }

    @Test
    void extrasBundleNotePostsPracticeAndProfile() throws Exception {
        when(experience.note(2L, 200L)).thenReturn(new Views.NoteView(200L, "my note", Instant.now()));
        when(experience.lessonPosts(200L)).thenReturn(List.of());
        when(experience.practice(200L)).thenReturn(List.of(
                new Views.PracticeQuestionView(200L, "What does input() return?", List.of("int", "text"))));
        when(experience.exercise(2L, 200L)).thenThrow(new NotFoundException("Coding exercise"));
        when(experience.profile(2L)).thenReturn(new Views.LearningProfileView(120, 3, 4, 4, List.of()));

        mvc.perform(get("/api/learning/lessons/200/extras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note.body").value("my note"))
                .andExpect(jsonPath("$.practice[0].id").value(200))
                .andExpect(jsonPath("$.exercise").doesNotExist())
                .andExpect(jsonPath("$.profile.xp").value(120));
    }

    @Test
    void savingANoteReturnsTheStoredBody() throws Exception {
        when(experience.saveNote(2L, 200L, "remember this"))
                .thenReturn(new Views.NoteView(200L, "remember this", Instant.now()));

        mvc.perform(put("/api/learning/lessons/200/note")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"remember this\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.body").value("remember this"));

        verify(experience).saveNote(2L, 200L, "remember this");
    }

    @Test
    void aPracticeAnswerReturnsMastery() throws Exception {
        when(experience.answer(2L, 200L, "B"))
                .thenReturn(new Views.PracticeResultView(true, "B", 80));

        mvc.perform(post("/api/learning/lessons/200/practice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"questionId\":200,\"choice\":\"B\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.masteryPercent").value(80));
    }

    @Test
    void anEmptyQuestionIsRejectedBeforeReachingTheService() throws Exception {
        mvc.perform(post("/api/learning/lessons/200/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aCodeSubmissionReturnsTheRunnerVerdict() throws Exception {
        when(experience.submitCode(eq(2L), eq(200L), any()))
                .thenReturn(new Views.CodeRunView("REVIEW", 0, "Saved for review."));

        mvc.perform(post("/api/learning/coding/200/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"print(1)\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVIEW"));
    }

    @Test
    void startingAnAttemptReturnsADeadline() throws Exception {
        when(experience.startAttempt(2L, 200L)).thenReturn(new Views.AttemptView(1L, 200L,
                Instant.now(), Instant.now().plusSeconds(1800), "OPEN", 30));

        mvc.perform(post("/api/learning/assessments/200/attempts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minutes").value(30))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }
}
