package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ug.yep.entity.Enums;
import ug.yep.entity.MessageThread;

public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {

    @Query("select distinct t from MessageThread t join t.members m where m.id = :userId order by t.createdAt desc")
    List<MessageThread> findForMember(@Param("userId") Long userId);

    List<MessageThread> findByKindOrderByCreatedAtDesc(Enums.ThreadKind kind);
}
