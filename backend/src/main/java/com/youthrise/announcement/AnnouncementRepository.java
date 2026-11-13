package com.youthrise.announcement;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, String> {

    @EntityGraph(attributePaths = {"author", "programme"})
    List<Announcement> findAllByOrderByPublishedAtDesc();
}
