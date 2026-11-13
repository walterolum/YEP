package ug.yep.service;

import java.util.Optional;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;

/** Certificate issuing, public verification and PDF download. */
public interface CertificateService {

    Views.CertificateView issue(CurrentUser actor, Long userId, String programmeLabel);

    Optional<Views.CertificateView> forUser(Long userId);

    Views.CertificateView verify(String code);

    /** Returns the PDF bytes for the holder, or for an administrator. */
    byte[] pdf(Long userId, CurrentUser requester);

    long issuedThisYear();

    java.util.List<Views.CertificateView> issued();
}
