package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.DiscussionPost;

public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {

    List<DiscussionPost> findByThreadIdOrderByCreatedAtAsc(Long threadId);
}
