package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.DiscussionThread;

public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, Long> {

    List<DiscussionThread> findAllByOrderByCreatedAtDesc();
}
