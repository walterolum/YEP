package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.PaymentIntent;

public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {

    Optional<PaymentIntent> findByReference(String reference);

    List<PaymentIntent> findByUserIdOrderByCreatedAtDesc(Long userId);
}
