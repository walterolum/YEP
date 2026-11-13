package com.youthrise.project;

import com.youthrise.common.ApiException;
import com.youthrise.config.AppProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores milestone evidence outside the database. The database keeps only the
 * generated name, so a user-supplied path can never escape the upload directory.
 */
@Component
public class EvidenceStorage {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg", "txt", "zip");

    private final Path root;

    public EvidenceStorage(AppProperties properties) {
        Path configured = properties.uploads() == null ? null : properties.uploads().directory();
        this.root = (configured == null ? Path.of("uploads") : configured).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create the evidence upload directory", ex);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.unprocessable("FILE_REQUIRED", "Select a file to submit as evidence.");
        }
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            throw ApiException.unprocessable("FILE_REQUIRED", "The uploaded file has no name.");
        }
        String extension = extensionOf(original);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw ApiException.unprocessable("FILE_TYPE_NOT_ALLOWED",
                    "Upload a PDF, Office document, image, text file or ZIP archive.");
        }
        String storedName = UUID.randomUUID() + "." + extension;
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, root.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store the uploaded evidence", ex);
        }
        return storedName;
    }

    public static String safeFileName(String original) {
        if (original == null || original.isBlank()) {
            return "evidence";
        }
        String normalized = original.replace('\\', '/');
        String name = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        return name.isEmpty() ? "evidence" : name.substring(0, Math.min(name.length(), 255));
    }

    private static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return "";
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
