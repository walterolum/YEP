package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.repository.CertificateRepository;
import ug.yep.security.CurrentUser;
import ug.yep.service.CertificateService;

/** Issuing, viewing, verifying and downloading certificates. */
@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificates;
    private final CertificateRepository repository;

    public CertificateController(CertificateService certificates, CertificateRepository repository) {
        this.certificates = certificates;
        this.repository = repository;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Views.CertificateView issue(@AuthenticationPrincipal CurrentUser actor,
                                       @Valid @RequestBody Requests.IssueCertificateRequest request) {
        return certificates.issue(actor, request.userId(), request.programmeLabel());
    }

    @GetMapping("/me")
    public ResponseEntity<Views.CertificateView> mine(@AuthenticationPrincipal CurrentUser actor) {
        return certificates.forUser(actor.id())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/verify/{code}")
    public Views.CertificateView verify(@PathVariable String code) {
        return certificates.verify(code);
    }

    @GetMapping("/issued")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR')")
    public List<Views.CertificateView> issued() {
        return certificates.issued();
    }

    @GetMapping("/{userId}/pdf")
    public ResponseEntity<byte[]> pdf(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long userId) {
        byte[] pdf = certificates.pdf(userId, actor);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("yep-certificate.pdf").build().toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> summary() {
        return Map.of("issuedThisYear", certificates.issuedThisYear(), "total", repository.count());
    }
}
