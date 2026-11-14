package ug.yep.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.SlotBooking;

public interface SlotBookingRepository extends JpaRepository<SlotBooking, Long> {

    boolean existsBySlotIdAndUserId(Long slotId, Long userId);
}
