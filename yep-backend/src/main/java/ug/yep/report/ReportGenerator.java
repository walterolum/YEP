package ug.yep.report;

import java.util.List;
import java.util.Map;

/**
 * Strategy for one report type. Each implementation owns its rows and is discovered by
 * Spring, so adding a report means adding a class, not editing a switch.
 */
public interface ReportGenerator {

    /** Stable key used by the API, e.g. {@code participants}. */
    String key();

    /** Human readable title shown in the UI and in the export header. */
    String title();

    /** Column headers in display order. */
    List<String> columns();

    /** Data rows, one value per column. */
    List<List<Object>> rows(Map<String, Object> filters);
}
