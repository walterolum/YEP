package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByModuleIdOrderBySortOrderAsc(Long moduleId);

    List<Lesson> findAllByOrderByModuleSortOrderAscSortOrderAsc();

    long countByModuleId(Long moduleId);

    long countByModuleCourseId(Long courseId);

    long countByModuleCourseCareerPathId(Long careerPathId);

    /** Only published courses count towards a learner's percentage, so drafts never dilute it. */
    @org.springframework.data.jpa.repository.Query(
            "select count(l) from Lesson l where l.module.course.published = true")
    long countInPublishedCourses();

    List<Lesson> findByModuleCourseIdOrderByModuleSortOrderAscSortOrderAsc(Long courseId);
}
