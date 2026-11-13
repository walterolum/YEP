package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByThreadIdOrderBySentAtAsc(Long threadId);
}
