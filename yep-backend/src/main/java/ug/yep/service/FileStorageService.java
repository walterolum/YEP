package ug.yep.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ug.yep.exception.BusinessRuleException;

/**
 * Stores uploads outside the served web root with random names.
 * The allow-list and the 10 MB ceiling are enforced here, not in the browser.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("pdf", "png", "jpg", "jpeg", "docx", "pptx", "fig", "zip");
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final Path root;

    public FileStorageService(@Value("${app.uploads.directory:uploads}") String directory) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
    }

    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("Please choose a file to upload.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BusinessRuleException("The file is larger than the 10 MB limit.");
        }
        String original = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
        String clean = original.replaceAll("[^A-Za-z0-9._-]", "_");
        int dot = clean.lastIndexOf('.');
        String extension = dot < 0 ? "" : clean.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED.contains(extension)) {
            throw new BusinessRuleException("Allowed file types: pdf, png, jpg, docx, pptx, fig, zip.");
        }
        String storedName = UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(root);
            Path target = root.resolve(storedName).normalize();
            if (!target.startsWith(root)) {
                throw new BusinessRuleException("That file name is not allowed.");
            }
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredFile(clean, target.toString());
        } catch (IOException ex) {
            throw new BusinessRuleException("The file could not be saved. Please try again.");
        }
    }

    public Path resolve(String storedPath) {
        Path path = Path.of(storedPath).toAbsolutePath().normalize();
        if (!path.startsWith(root) || !Files.exists(path)) {
            throw new BusinessRuleException("That file is no longer available.");
        }
        return path;
    }

    public record StoredFile(String originalName, String storedPath) {
    }
}
