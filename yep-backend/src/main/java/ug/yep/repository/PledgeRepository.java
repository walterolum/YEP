package ug.yep.repository;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ug.yep.entity.Pledge;

public interface PledgeRepository extends JpaRepository<Pledge, Long> {

    List<Pledge> findBySponsorIdOrderByPledgedAtDesc(Long sponsorId);

    List<Pledge> findAllByOrderByPledgedAtDesc();

    @Query("select coalesce(sum(p.amountUgx), 0) from Pledge p where p.sponsor.id = :sponsorId")
    BigDecimal totalForSponsor(@Param("sponsorId") Long sponsorId);
}
