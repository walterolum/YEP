package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A learner's booking of one slot. */
@Entity
@Table(name = "slot_bookings")
public class SlotBooking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "slot_id", nullable = false)
    private BookingSlot slot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    protected SlotBooking() {
    }

    public SlotBooking(BookingSlot slot, User user) {
        this.slot = slot;
        this.user = user;
    }

    public BookingSlot getSlot() {
        return slot;
    }
}
