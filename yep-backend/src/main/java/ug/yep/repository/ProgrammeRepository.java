package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Programme;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    List<Programme> findByPublishedTrueOrderByTitleAsc();

    List<Programme> findAllByOrderByTitleAsc();
}
