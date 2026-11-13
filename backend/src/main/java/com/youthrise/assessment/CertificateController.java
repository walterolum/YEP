package com.youthrise.assessment;

import com.youthrise.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CertificateController {

    private final CertificateService certificates;

    public CertificateController(CertificateService certificates) {
        this.certificates = certificates;
    }

    @GetMapping("/me/certificates")
    public List<CertificateDtos.CertificateResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
        return certificates.listForUser(principal.id());
    }

    @GetMapping("/certificates/verify/{code}")
    public CertificateDtos.CertificateResponse verify(@PathVariable String code, HttpServletRequest request) {
        return certificates.verify(code, request.getRemoteAddr());
    }

    @PostMapping("/admin/certificates")
    public ResponseEntity<CertificateDtos.CertificateResponse> issue(
            @Valid @RequestBody CertificateDtos.IssueRequest body,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request) {
        CertificateDtos.CertificateResponse issued = certificates.issue(
                body.programmeId(), body.participantId(), principal, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(issued);
    }

    @PostMapping("/admin/certificates/{id}/revoke")
    public ResponseEntity<Void> revoke(@PathVariable String id,
                                       @Valid @RequestBody CertificateDtos.RevokeRequest body,
                                       @AuthenticationPrincipal UserPrincipal principal,
                                       HttpServletRequest request) {
        certificates.revoke(id, body.note(), principal, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
