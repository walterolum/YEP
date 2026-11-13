package ug.yep.util;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Very small PDF writer (no third-party library): one or more text pages in Helvetica.
 * Enough for report exports and the certificate download.
 */
public final class PdfExporter {

    private PdfExporter() {
    }

    /** Builds a PDF from lines of text; every 42 lines start a new page. */
    public static byte[] text(String title, List<String> lines) {
        List<List<String>> pages = new ArrayList<>();
        List<String> current = new ArrayList<>();
        current.add(title);
        current.add("");
        for (String line : lines) {
            if (current.size() >= 44) {
                pages.add(current);
                current = new ArrayList<>();
                current.add(title + " (continued)");
                current.add("");
            }
            current.add(line);
        }
        pages.add(current);
        return render(pages);
    }

    private static byte[] render(List<List<String>> pages) {
        List<String> objects = new ArrayList<>();
        objects.add("<< /Type /Catalog /Pages 2 0 R >>");

        StringBuilder kids = new StringBuilder();
        int firstPage = 4;
        for (int i = 0; i < pages.size(); i++) {
            kids.append(firstPage + i * 2).append(" 0 R ");
        }
        objects.add("<< /Type /Pages /Count " + pages.size() + " /Kids [" + kids.toString().trim() + "] >>");
        objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        for (int i = 0; i < pages.size(); i++) {
            int contentObject = firstPage + i * 2 + 1;
            objects.add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
                    + "/Resources << /Font << /F1 3 0 R >> >> /Contents " + contentObject + " 0 R >>");
            objects.add(stream(pages.get(i)));
        }

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objects.size(); i++) {
            offsets.add(pdf.length());
            pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
        }
        int xref = pdf.length();
        pdf.append("xref\n0 ").append(objects.size() + 1).append("\n");
        pdf.append("0000000000 65535 f \n");
        for (int offset : offsets) {
            pdf.append(String.format("%010d 00000 n \n", offset));
        }
        pdf.append("trailer\n<< /Size ").append(objects.size() + 1)
                .append(" /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF\n");
        return pdf.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private static String stream(List<String> lines) {
        StringBuilder content = new StringBuilder("BT\n/F1 11 Tf\n50 800 Td\n14 TL\n");
        boolean first = true;
        for (String line : lines) {
            String safe = sanitize(line);
            if (!first) {
                content.append("T*\n");
            }
            content.append("(").append(safe).append(") Tj\n");
            first = false;
        }
        content.append("ET");
        String body = content.toString();
        return "<< /Length " + body.length() + " >>\nstream\n" + body + "\nendstream";
    }

    /** Keeps text inside WinAnsi range and escapes PDF string delimiters. */
    public static String sanitize(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        for (char ch : value.toCharArray()) {
            if (ch == '(' || ch == ')' || ch == '\\') {
                builder.append('\\').append(ch);
            } else if (ch == '\n' || ch == '\r') {
                builder.append(' ');
            } else if (ch >= 32 && ch <= 255) {
                builder.append(ch);
            } else if (ch == '\u2013' || ch == '\u2014') {
                builder.append('-');
            } else {
                builder.append('?');
            }
        }
        return builder.toString();
    }
}
