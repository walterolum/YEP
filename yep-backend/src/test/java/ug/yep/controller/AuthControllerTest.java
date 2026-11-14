package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
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
import ug.yep.service.AuthService;
import ug.yep.service.VerificationService;

/** HTTP contract for sign-up, sign-in and the signed-in account. */
class AuthControllerTest {

    private AuthService auth;
    private MockMvc mvc;
    private Views.UserView user;

    @BeforeEach
    void setUp() {
        auth = mock(AuthService.class);
        User entity = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(entity, "id", 2L);
        user = Views.UserView.of(entity);
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(auth, mock(VerificationService.class)))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new CurrentUser(2L, "amara@yep.example", "Amara Nakato", Enums.Role.PARTICIPANT), null, List.of()));
    }

    @Test
    void logsInAndReturnsAToken() throws Exception {
        when(auth.login(any())).thenReturn(new Views.AuthView("signed-token", 3600, user));

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"amara@yep.example\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("signed-token"))
                .andExpect(jsonPath("$.user.role").value("PARTICIPANT"));
    }

    @Test
    void signupReturns201WithPendingMessage() throws Exception {
        when(auth.signup(any(), any())).thenReturn(new Views.AuthView(null, 0, user));

        mvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Amara Nakato\",\"email\":\"amara@yep.example\","
                                + "\"password\":\"Password123!\",\"confirmPassword\":\"Password123!\","
                                + "\"dateOfBirth\":\"2000-01-01\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.user.email").value("amara@yep.example"));
    }

    @Test
    void meReturnsTheSignedInUser() throws Exception {
        when(auth.me(2L)).thenReturn(user);

        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Amara Nakato"));
    }
}
