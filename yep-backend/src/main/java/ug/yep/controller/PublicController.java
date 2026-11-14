package ug.yep.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Views;
import ug.yep.service.CertificateService;
import ug.yep.service.CountryDirectory;
import ug.yep.service.DashboardService;
import ug.yep.service.ProgrammeService;

/** Anonymous endpoints: landing-page numbers, published programmes and certificate verification. */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final DashboardService dashboard;
    private final ProgrammeService programmes;
    private final CertificateService certificates;
    private final ug.yep.repository.UserRepository users;
    private final CountryDirectory countries;

    public PublicController(DashboardService dashboard, ProgrammeService programmes,
                            CertificateService certificates, ug.yep.repository.UserRepository users,
                            CountryDirectory countries) {
        this.dashboard = dashboard;
        this.programmes = programmes;
        this.certificates = certificates;
        this.users = users;
        this.countries = countries;
    }

    /** Every ISO country, African countries first, each with its dial code. */
    @GetMapping("/countries")
    public java.util.List<CountryDirectory.Country> countries() {
        return countries.all();
    }

    @GetMapping("/mentors")
    public java.util.List<java.util.Map<String, Object>> mentors() {
        return users.findByRoleOrderByFullNameAsc(ug.yep.entity.Enums.Role.MENTOR).stream()
                .map(user -> java.util.Map.<String, Object>of("id", user.getId(),
                        "fullName", user.getFullName(), "email", user.getEmail()))
                .toList();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return dashboard.publicStats();
    }

    @GetMapping("/programmes")
    public java.util.List<Views.ProgrammeView> programmes() {
        return programmes.published();
    }

    @GetMapping("/certificates/{code}")
    public Views.CertificateView verify(@PathVariable String code) {
        return certificates.verify(code);
    }
}
