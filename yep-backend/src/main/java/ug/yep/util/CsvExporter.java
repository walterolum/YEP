package ug.yep.util;

import java.util.List;

/** RFC 4180-friendly CSV builder with formula-injection protection. */
public final class CsvExporter {

    private CsvExporter() {
    }

    public static String build(List<String> headers, List<List<Object>> rows) {
        StringBuilder csv = new StringBuilder();
        csv.append(line(headers.stream().map(header -> (Object) header).toList()));
        for (List<Object> row : rows) {
            csv.append(line(row));
        }
        return csv.toString();
    }

    private static String line(List<Object> values) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                builder.append(',');
            }
            builder.append(escape(values.get(i)));
        }
        return builder.append("\r\n").toString();
    }

    private static String escape(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        if (!text.isEmpty() && "=+-@".indexOf(text.charAt(0)) >= 0) {
            text = "'" + text;
        }
        if (text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }
}
