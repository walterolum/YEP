package ug.yep.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import ug.yep.service.CourseContentService;

/** Course player HTTP contract: outline, per-course progress, completion and reopening. */
class CourseContentControllerTest {

    private CourseContentService content;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        content = mock(CourseContentService.class);
        mvc = MockMvcBuilders.standaloneSetup(new CourseContentController(content))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CurrentUser(2L, "amara@yep.example",
                        "Amara Nakato", Enums.Role.PARTICIPANT), null, List.of()));
    }

    @Test
    void outlineIsReadableAnonymouslyAndCarriesNoPersonalProgress() throws Exception {
        SecurityContextHolder.clearContext();
        when(content.outline(isNull(), eq("yep-core-level-one"))).thenReturn(outline(false, 0, null));

        mvc.perform(get("/api/courses/yep-core-level-one/outline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolled").value(false))
                .andExpect(jsonPath("$.percent").value(0))
                .andExpect(jsonPath("$.course.slug").value("yep-core-level-one"))
                .andExpect(jsonPath("$.modules[0].lessons[0].title").value("Introduction to digital tools"));
    }

    @Test
    void signedInOutlineIncludesEnrolmentAndResumePoint() throws Exception {
        when(content.outline(2L, "yep-core-level-one")).thenReturn(outline(true, 40, 4L));

        mvc.perform(get("/api/courses/yep-core-level-one/outline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolled").value(true))
                .andExpect(jsonPath("$.percent").value(40))
                .andExpect(jsonPath("$.resumeLessonId").value(4));

        verify(content).outline(2L, "yep-core-level-one");
    }

    @Test
    void myCourseProgressReturnsOneRowPerEnrolment() throws Exception {
        when(content.myCourseProgress(2L)).thenReturn(List.of(new Views.CourseProgressView(1L,
                "YEP Core — Level One", "yep-core-level-one", 1, "ENROLLED", 40, 6, 15, 55)));

        mvc.perform(get("/api/me/course-progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value(1))
                .andExpect(jsonPath("$[0].percent").value(40))
                .andExpect(jsonPath("$[0].overallScore").value(55));
    }

    @Test
    void completingALessonUsesTheSignedInLearner() throws Exception {
        when(content.markLesson(2L, 1L, 3L, true)).thenReturn(module(66));

        mvc.perform(post("/api/courses/1/lessons/3/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.percent").value(66));

        verify(content).markLesson(2L, 1L, 3L, true);
    }

    @Test
    void reopeningALessonAlsoStaysScopedToTheCourse() throws Exception {
        when(content.markLesson(2L, 1L, 3L, false)).thenReturn(module(33));

        mvc.perform(delete("/api/courses/1/lessons/3/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.percent").value(33));

        verify(content).markLesson(2L, 1L, 3L, false);
    }

    private Views.CourseOutlineView outline(boolean enrolled, int percent, Long resumeLessonId) {
        Views.CourseView course = new Views.CourseView(1L, 1L, "Digital Foundations", 1L,
                "Tech & Digital", "YEP-CORE-L1", "YEP Core — Level One", "yep-core-level-one",
                "The existing curriculum.", null, 1, 15, "🎓", 1, 3, true, enrolled);
        Views.LessonView lesson = new Views.LessonView(1L, "Introduction to digital tools", "VIDEO",
                20, false);
        Views.ModuleView module = new Views.ModuleView(1L, "Digital Literacy", "💻", "Start safely.",
                3, 1, 33, List.of(lesson));
        return new Views.CourseOutlineView(course, enrolled, percent, 3, 15, 40, resumeLessonId,
                null, null, List.of(module));
    }

    private Views.ModuleView module(int percent) {
        return new Views.ModuleView(1L, "Digital Literacy", "💻", "Start safely.", 3, 2, percent,
                List.of());
    }
}
