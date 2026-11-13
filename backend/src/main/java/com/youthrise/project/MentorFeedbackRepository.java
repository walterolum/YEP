package com.youthrise.project;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, String> {

    List<MentorFeedback> findByTeamMentorIdOrderByCreatedAtDesc(String mentorId);

    List<MentorFeedback> findByTeamIdOrderByCreatedAtDesc(String teamId);

    List<MentorFeedback> findAllByOrderByCreatedAtDesc();
}
