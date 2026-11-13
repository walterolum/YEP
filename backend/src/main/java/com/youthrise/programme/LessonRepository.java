package com.youthrise.programme;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LessonRepository extends JpaRepository<Lesson, String> {

    @Query("""
            select l from Lesson l
            where l.id = :lessonId and l.module.programme.id = :programmeId
            """)
    Optional<Lesson> findInProgramme(@Param("lessonId") String lessonId,
                                     @Param("programmeId") String programmeId);

    @Query("""
            select count(l) from Lesson l
            where l.module.programme.id = :programmeId and l.module.status = :status
            """)
    long countForProgramme(@Param("programmeId") String programmeId,
                           @Param("status") ContentStatus status);
}
