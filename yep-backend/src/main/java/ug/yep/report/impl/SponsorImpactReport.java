package ug.yep.report.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Pledge;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.PledgeRepository;

/** Sponsorship pledges and their totals. */
@Component
public class SponsorImpactReport implements ReportGenerator {

    private final PledgeRepository pledges;

    public SponsorImpactReport(PledgeRepository pledges) {
        this.pledges = pledges;
    }

    @Override
    public String key() {
        return "sponsors";
    }

    @Override
    public String title() {
        return "Sponsor Impact";
    }

    @Override
    public List<String> columns() {
        return List.of("Sponsor", "Project", "Amount (UGX)", "Status", "Pledged on");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (Pledge pledge : pledges.findAllByOrderByPledgedAtDesc()) {
            rows.add(List.of(pledge.getSponsor().getFullName(),
                    pledge.getProjectTitle() == null ? "" : pledge.getProjectTitle(),
                    pledge.getAmountUgx(), pledge.getStatus().name(),
                    pledge.getPledgedAt().toString().substring(0, 10)));
        }
        return rows;
    }
}
