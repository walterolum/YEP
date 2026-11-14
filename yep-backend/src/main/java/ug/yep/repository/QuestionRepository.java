package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ug.yep.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    /** Published practice questions for the same module as a lesson. */
    @Query("select q from Question q where q.assessment.module.id = :moduleId "
            + "and q.assessment.published = true order by q.assessment.id, q.sortOrder")
    List<Question> findPracticeForModule(@Param("moduleId") Long moduleId);
}
