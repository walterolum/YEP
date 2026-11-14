package ug.yep.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ug.yep.service.ImpactService;

/** Phase 6 impact reporting endpoints. */
class ImpactControllerTest {

    private final ImpactService impact = mock(ImpactService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ImpactController(impact)).build();

    @Test
    void theSummaryReportsLiveFigures() throws Exception {
        when(impact.summary()).thenReturn(Map.of("participants", 8, "women", 1,
                "certificates", 1, "placements", 0, "learnersByCountry", Map.of("Uganda", 5),
                "manualRecords", List.of()));

        mvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participants").value(8))
                .andExpect(jsonPath("$.learnersByCountry.Uganda").value(5));
    }

    @Test
    void anImpactRecordIsStored() throws Exception {
        when(impact.addRecord(any())).thenReturn(Map.of("id", 1, "country", "Uganda",
                "learners", 25, "certificates", 10, "placements", 4));

        mvc.perform(post("/api/impact/records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"country\":\"Uganda\",\"learners\":25,\"certificates\":10,"
                                + "\"placements\":4,\"period\":\"2026-Q4\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placements").value(4));
    }

    @Test
    void aNegativeCountIsRejected() throws Exception {
        mvc.perform(post("/api/impact/records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"country\":\"Uganda\",\"learners\":-1,\"certificates\":0,"
                                + "\"placements\":0}"))
                .andExpect(status().isBadRequest());
    }
}
