package com.youthrise.programme;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, String> {

    boolean existsByUserIdAndLessonId(String userId, String lessonId);

    long countByUserIdAndProgrammeId(String userId, String programmeId);

    @Query("""
            select c.lesson.id from LessonCompletion c
            where c.user.id = :userId and c.programme.id = :programmeId
            order by c.completedAt asc
            """)
    List<String> findCompletedLessonIds(@Param("userId") String userId,
                                        @Param("programmeId") String programmeId);
}
