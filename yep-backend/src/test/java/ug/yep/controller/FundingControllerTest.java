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
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.FundingService;

/** Phase 5 HTTP surface: aid, sponsorship, payments and certificate issuing. */
class FundingControllerTest {

    private FundingService funding;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        funding = mock(FundingService.class);
        mvc = MockMvcBuilders.standaloneSetup(new FundingController(funding))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CurrentUser(2L, "amara@yep.example",
                        "Amara Nakato", Enums.Role.PARTICIPANT), null, List.of()));
    }

    @Test
    void applyingForAidReturnsThePendingApplication() throws Exception {
        when(funding.applyForAid(eq(2L), any())).thenReturn(Map.of("id", 1, "status", "PENDING",
                "course", "Python Programming Fundamentals"));

        mvc.perform(post("/api/funding/aid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":27,\"reason\":\"I cannot afford the fee\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.course").value("Python Programming Fundamentals"));
    }

    @Test
    void anAidApplicationNeedsAReason() throws Exception {
        mvc.perform(post("/api/funding/aid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":27,\"reason\":\" \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void theAdminQueueIsAvailable() throws Exception {
        when(funding.aidQueue()).thenReturn(List.of(Map.of("id", 1, "status", "PENDING")));

        mvc.perform(get("/api/admin/funding/aid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void aDecisionReturnsTheUpdatedApplication() throws Exception {
        when(funding.decideAid(eq(2L), eq(1L), eq(true), eq("Approved")))
                .thenReturn(Map.of("id", 1, "status", "APPROVED"));

        mvc.perform(post("/api/admin/funding/aid/1/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"approved\":true,\"note\":\"Approved\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void aSponsorCanFundALearnerSeat() throws Exception {
        when(funding.sponsor(eq(2L), any())).thenReturn(Map.of("id", 1, "status", "ACTIVE",
                "learner", "Daniel Okello"));

        mvc.perform(post("/api/funding/sponsorships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"learnerEmail\":\"daniel@yep.example\",\"courseId\":27}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.learner").value("Daniel Okello"));
    }

    @Test
    void aPaymentIntentReturnsItsReference() throws Exception {
        when(funding.createPaymentIntent(eq(2L), any())).thenReturn(Map.of("reference",
                "PAY-2026-000001", "status", "PENDING", "amountCents", 5000));

        mvc.perform(post("/api/funding/payment-intents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":27,\"amountCents\":5000,\"currency\":\"UGX\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reference").value("PAY-2026-000001"));
    }

    @Test
    void aZeroPaymentIsRejected() throws Exception {
        mvc.perform(post("/api/funding/payment-intents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":27,\"amountCents\":0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aCourseCertificateIsIssuedWithACode() throws Exception {
        when(funding.issueCourseCertificate(2L, 2L, 1L)).thenReturn(Map.of("code",
                "YEP-2026-682380", "holder", "Amara Nakato", "scope", "COURSE"));

        mvc.perform(post("/api/admin/certificates/course/1/learners/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("YEP-2026-682380"))
                .andExpect(jsonPath("$.scope").value("COURSE"));
    }
}
