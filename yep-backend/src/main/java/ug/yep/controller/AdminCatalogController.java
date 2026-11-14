package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.CatalogService;

/** Admin catalogue manager: academies, career paths and courses are all data. */
@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {

    private final CatalogService catalog;

    public AdminCatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/catalogue")
    public List<Views.AcademyDetailView> catalogue() {
        return catalog.adminCatalogue();
    }

    @PostMapping("/academies")
    public ResponseEntity<Views.AcademyView> createAcademy(
            @AuthenticationPrincipal CurrentUser actor,
            @Valid @RequestBody Requests.AcademyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalog.createAcademy(CatalogService.CurrentActor.of(actor), request));
    }

    @PutMapping("/academies/{academyId}")
    public Views.AcademyView updateAcademy(@AuthenticationPrincipal CurrentUser actor,
                                           @PathVariable Long academyId,
                                           @Valid @RequestBody Requests.AcademyRequest request) {
        return catalog.updateAcademy(CatalogService.CurrentActor.of(actor), academyId, request);
    }

    @PutMapping("/academies/{academyId}/publish")
    public Views.AcademyView publishAcademy(@AuthenticationPrincipal CurrentUser actor,
                                            @PathVariable Long academyId,
                                            @RequestParam(defaultValue = "true") boolean published) {
        return catalog.publishAcademy(CatalogService.CurrentActor.of(actor), academyId, published);
    }

    @PostMapping("/career-paths")
    public ResponseEntity<Views.CareerPathView> createCareerPath(
            @AuthenticationPrincipal CurrentUser actor,
            @Valid @RequestBody Requests.CareerPathRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalog.createCareerPath(CatalogService.CurrentActor.of(actor), request));
    }

    @PutMapping("/career-paths/{careerPathId}")
    public Views.CareerPathView updateCareerPath(@AuthenticationPrincipal CurrentUser actor,
                                                 @PathVariable Long careerPathId,
                                                 @Valid @RequestBody Requests.CareerPathRequest request) {
        return catalog.updateCareerPath(CatalogService.CurrentActor.of(actor), careerPathId, request);
    }

    @PutMapping("/career-paths/{careerPathId}/publish")
    public Views.CareerPathView publishCareerPath(@AuthenticationPrincipal CurrentUser actor,
                                                  @PathVariable Long careerPathId,
                                                  @RequestParam(defaultValue = "true") boolean published) {
        return catalog.publishCareerPath(CatalogService.CurrentActor.of(actor), careerPathId, published);
    }

    @GetMapping("/courses")
    public List<Views.CourseView> courses() {
        return catalog.adminCourses();
    }

    @PostMapping("/courses")
    public ResponseEntity<Views.CourseView> createCourse(
            @AuthenticationPrincipal CurrentUser actor,
            @Valid @RequestBody Requests.CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalog.createCourse(CatalogService.CurrentActor.of(actor), request));
    }

    @PutMapping("/courses/{courseId}")
    public Views.CourseView updateCourse(@AuthenticationPrincipal CurrentUser actor,
                                         @PathVariable Long courseId,
                                         @Valid @RequestBody Requests.CourseRequest request) {
        return catalog.updateCourse(CatalogService.CurrentActor.of(actor), courseId, request);
    }

    @PutMapping("/courses/{courseId}/publish")
    public Views.CourseView publishCourse(@AuthenticationPrincipal CurrentUser actor,
                                          @PathVariable Long courseId,
                                          @RequestParam(defaultValue = "true") boolean published) {
        return catalog.publishCourse(CatalogService.CurrentActor.of(actor), courseId, published);
    }
}
