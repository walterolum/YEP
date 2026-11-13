package ug.yep.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.Enums;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.NotFoundException;
import ug.yep.report.ReportGenerator;
import ug.yep.security.CurrentUser;
import ug.yep.service.PermissionService;
import ug.yep.service.ReportService;
import ug.yep.util.CsvExporter;
import ug.yep.util.PdfExporter;

/** Collects every {@link ReportGenerator} bean and dispatches by key. */
@Service
public class ReportServiceImpl implements ReportService {

    private final Map<String, ReportGenerator> generators = new LinkedHashMap<>();
    private final PermissionService permissions;

    public ReportServiceImpl(List<ReportGenerator> generators, PermissionService permissions) {
        generators.forEach(generator -> this.generators.put(generator.key(), generator));
        this.permissions = permissions;
    }

    @Override
    public List<Map<String, Object>> catalogue() {
        List<Map<String, Object>> list = new ArrayList<>();
        generators.values().forEach(generator -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("key", generator.key());
            entry.put("title", generator.title());
            entry.put("columns", generator.columns());
            list.add(entry);
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> run(String key, Map<String, Object> filters, CurrentUser actor) {
        permissions.require(actor, Enums.Permission.REPORTS);
        ReportGenerator generator = generator(key);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("key", generator.key());
        payload.put("title", generator.title());
        payload.put("columns", generator.columns());
        payload.put("rows", generator.rows(safe(filters)));
        payload.put("generatedAt", java.time.Instant.now().toString());
        return payload;
    }

    @Override
    @Transactional(readOnly = true)
    public Export export(String key, String format, Map<String, Object> filters, CurrentUser actor) {
        Map<String, Object> payload = run(key, filters, actor);
        @SuppressWarnings("unchecked")
        List<String> columns = (List<String>) payload.get("columns");
        @SuppressWarnings("unchecked")
        List<List<Object>> rows = (List<List<Object>>) payload.get("rows");
        String base = key + "-" + java.time.LocalDate.now();
        String normalised = format == null ? "csv" : format.toLowerCase(java.util.Locale.ROOT);
        if (normalised.equals("pdf")) {
            List<String> lines = new ArrayList<>();
            String header = String.join(" | ", columns);
            lines.add(header);
            lines.add("-".repeat(Math.min(header.length(), 110)));
            for (List<Object> row : rows) {
                lines.add(String.join(" | ", row.stream().map(value -> value == null ? "" : String.valueOf(value)).toList()));
            }
            lines.add("");
            lines.add(rows.size() + " record(s).");
            return new Export(base + ".pdf", "application/pdf",
                    PdfExporter.text(String.valueOf(payload.get("title")), lines));
        }
        if (!normalised.equals("csv")) {
            throw new BusinessRuleException("Supported export formats are csv and pdf.");
        }
        return new Export(base + ".csv", "text/csv", CsvExporter.build(columns, rows)
                .getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private ReportGenerator generator(String key) {
        ReportGenerator generator = generators.get(key);
        if (generator == null) {
            throw new NotFoundException("Report " + key);
        }
        return generator;
    }

    private static Map<String, Object> safe(Map<String, Object> filters) {
        return filters == null ? Map.of() : filters;
    }
}
