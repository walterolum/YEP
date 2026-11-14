package ug.yep.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.exception.NotFoundException;
import ug.yep.service.CertificateService;
import ug.yep.service.CountryDirectory;
import ug.yep.service.DashboardService;
import ug.yep.service.ProgrammeService;

/** The public certificate verification endpoint is anonymous and must not leak anything else. */
class PublicCertificateControllerTest {

    private final CertificateService certificates = mock(CertificateService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new PublicController(
                    mock(DashboardService.class), mock(ProgrammeService.class), certificates,
                    mock(ug.yep.repository.UserRepository.class), new CountryDirectory()))
            .setControllerAdvice(new ug.yep.exception.GlobalExceptionHandler())
            .build();

    @Test
    void aKnownCodeReturnsTheHolderAndAward() throws Exception {
        when(certificates.verify("YEP-2026-682380")).thenReturn(new Views.CertificateView(3L,
                "YEP-2026-682380", 2L, "Amara Nakato", "YEP Core — Level One", Instant.now()));

        mvc.perform(get("/api/public/certificates/YEP-2026-682380"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("YEP-2026-682380"))
                .andExpect(jsonPath("$.holderName").value("Amara Nakato"));
    }

    @Test
    void anUnknownCodeIs404() throws Exception {
        when(certificates.verify("YEP-0000-000000"))
                .thenThrow(new NotFoundException("Certificate code YEP-0000-000000"));

        mvc.perform(get("/api/public/certificates/YEP-0000-000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void theCountryListStaysPublic() {
        List<CountryDirectory.Country> all = new CountryDirectory().all();
        org.junit.jupiter.api.Assertions.assertFalse(all.isEmpty());
        org.junit.jupiter.api.Assertions.assertTrue(all.stream().anyMatch(c -> "KE".equals(c.code())));
    }
}
