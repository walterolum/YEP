package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ug.yep.entity.LessonProgress;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    List<LessonProgress> findByUserId(Long userId);

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    long countByUserId(Long userId);

    @Query("select count(p) from LessonProgress p where p.user.id = :userId "
            + "and p.lesson.module.course.id = :courseId")
    long countCompletedInCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("select count(p) from LessonProgress p where p.user.id = :userId "
            + "and p.lesson.module.course.careerPath.id = :careerPathId")
    long countCompletedInCareerPath(@Param("userId") Long userId,
                                    @Param("careerPathId") Long careerPathId);

    @Query("select count(p) from LessonProgress p where p.user.id = :userId "
            + "and p.lesson.module.course.published = true")
    long countCompletedInPublishedCourses(@Param("userId") Long userId);

    void deleteByUserIdAndLessonId(Long userId, Long lessonId);

    boolean existsByLessonId(Long lessonId);
}
