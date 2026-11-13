package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Partner;

public interface PartnerRepository extends JpaRepository<Partner, Long> {

    List<Partner> findByActiveTrueOrderByNameAsc();
}
