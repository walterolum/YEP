package com.youthrise.discussion;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscussionRepository extends JpaRepository<Discussion, String> {

    @EntityGraph(attributePaths = {"author", "programme", "messages", "messages.author"})
    List<Discussion> findByProgrammeIdOrderByPinnedDescCreatedAtDesc(String programmeId);

    @EntityGraph(attributePaths = {"author", "programme", "messages", "messages.author"})
    List<Discussion> findByIdIn(List<String> ids);
}
