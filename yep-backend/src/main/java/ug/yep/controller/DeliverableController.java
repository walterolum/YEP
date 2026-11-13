package ug.yep.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ug.yep.entity.Deliverable;
import ug.yep.entity.Project;
import ug.yep.entity.User;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.DeliverableRepository;
import ug.yep.repository.ProjectRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;
import ug.yep.service.FileStorageService;

/** Project deliverables: validated upload and authenticated download. */
@RestController
public class DeliverableController {

    private final DeliverableRepository deliverables;
    private final ProjectRepository projects;
    private final TeamRepository teams;
    private final UserRepository users;
    private final FileStorageService storage;

    public DeliverableController(DeliverableRepository deliverables, ProjectRepository projects,
                                 TeamRepository teams, UserRepository users,
                                 FileStorageService storage) {
        this.deliverables = deliverables;
        this.projects = projects;
        this.teams = teams;
        this.users = users;
        this.storage = storage;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/api/projects/{projectId}/deliverables")
    public List<Map<String, Object>> list(@AuthenticationPrincipal CurrentUser actor,
                                          @PathVariable Long projectId) {
        assertCanAccess(actor, projectId);
        return deliverables.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(deliverable -> {
                    Map<String, Object> view = new LinkedHashMap<>();
                    view.put("id", deliverable.getId());
                    view.put("fileName", deliverable.getFileName());
                    view.put("status", deliverable.getStatus().name());
                    view.put("uploadedBy", deliverable.getUploadedBy().getFullName());
                    view.put("createdAt", deliverable.getCreatedAt().toString());
                    return view;
                }).toList();
    }

    @PostMapping(value = "/api/projects/{projectId}/deliverables", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> upload(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long projectId,
                                      @RequestParam("file") MultipartFile file) {
        assertCanAccess(actor, projectId);
        Project project = projects.findById(projectId).orElseThrow(() -> new NotFoundException("Project"));
        User uploader = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        FileStorageService.StoredFile stored = storage.store(file);
        Deliverable deliverable = deliverables.save(
                new Deliverable(project, uploader, stored.originalName(), stored.storedPath()));
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", deliverable.getId());
        view.put("fileName", deliverable.getFileName());
        view.put("status", deliverable.getStatus().name());
        return view;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/api/deliverables/{deliverableId}/download")
    public ResponseEntity<Resource> download(@AuthenticationPrincipal CurrentUser actor,
                                             @PathVariable Long deliverableId) throws IOException {
        Deliverable deliverable = deliverables.findById(deliverableId)
                .orElseThrow(() -> new NotFoundException("Deliverable"));
        assertCanAccess(actor, deliverable.getProject().getId());
        Path path = storage.resolve(deliverable.getFilePath());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(deliverable.getFileName()).build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new ByteArrayResource(Files.readAllBytes(path)));
    }

    /** Staff can see every project; participants only their own team's project. */
    private void assertCanAccess(CurrentUser actor, Long projectId) {
        if (actor.hasRole(ug.yep.entity.Enums.Role.ADMIN, ug.yep.entity.Enums.Role.FACILITATOR,
                ug.yep.entity.Enums.Role.MENTOR)) {
            return;
        }
        boolean member = teams.findByMemberId(actor.id()).stream()
                .anyMatch(team -> team.getProject() != null && team.getProject().getId().equals(projectId));
        if (!member) {
            throw new ForbiddenException("You can only access your own team's project files.");
        }
    }
}
