package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.ImpactRecord;

public interface ImpactRecordRepository extends JpaRepository<ImpactRecord, Long> {

    List<ImpactRecord> findAllByOrderByCountryAsc();
}
