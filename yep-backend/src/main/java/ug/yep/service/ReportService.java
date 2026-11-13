package ug.yep.service;

import java.util.List;
import java.util.Map;
import ug.yep.security.CurrentUser;

/** Runs the report strategies and renders CSV or PDF exports. */
public interface ReportService {

    List<Map<String, Object>> catalogue();

    Map<String, Object> run(String key, Map<String, Object> filters, CurrentUser actor);

    Export export(String key, String format, Map<String, Object> filters, CurrentUser actor);

    record Export(String fileName, String contentType, byte[] content) {
    }
}
