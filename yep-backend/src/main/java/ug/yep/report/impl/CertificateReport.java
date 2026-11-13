package ug.yep.report.impl;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Certificate;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.CertificateRepository;

/** Every certificate issued, with its public verification code. */
@Component
public class CertificateReport implements ReportGenerator {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            .withZone(ZoneOffset.UTC);

    private final CertificateRepository certificates;

    public CertificateReport(CertificateRepository certificates) {
        this.certificates = certificates;
    }

    @Override
    public String key() {
        return "certificates";
    }

    @Override
    public String title() {
        return "Certificates Issued";
    }

    @Override
    public List<String> columns() {
        return List.of("Code", "Holder", "Email", "Programme", "Issued");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (Certificate certificate : certificates.findAllByOrderByIssuedAtDesc()) {
            rows.add(List.of(certificate.getCode(), certificate.getUser().getFullName(),
                    certificate.getUser().getEmail(), certificate.getProgrammeLabel(),
                    DATE.format(certificate.getIssuedAt())));
        }
        return rows;
    }
}
