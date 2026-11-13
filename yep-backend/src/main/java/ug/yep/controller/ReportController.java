package ug.yep.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.security.CurrentUser;
import ug.yep.service.ReportService;

/** The seven reports, rendered as JSON, CSV or PDF. */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reports;

    public ReportController(ReportService reports) {
        this.reports = reports;
    }

    @GetMapping
    public List<Map<String, Object>> catalogue(@AuthenticationPrincipal CurrentUser actor) {
        return reports.catalogue();
    }

    @GetMapping("/{key}")
    public Map<String, Object> run(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable String key) {
        return reports.run(key, Map.of(), actor);
    }

    @GetMapping("/{key}/export")
    public ResponseEntity<byte[]> export(@AuthenticationPrincipal CurrentUser actor,
                                         @PathVariable String key,
                                         @RequestParam(defaultValue = "csv") String format) {
        ReportService.Export export = reports.export(key, format, Map.of(), actor);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(export.fileName()).build().toString())
                .contentType(MediaType.parseMediaType(export.contentType()))
                .body(export.content());
    }
}
