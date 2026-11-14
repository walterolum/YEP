package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * A payment request. The provider is abstracted so a mobile-money or card gateway can be
 * plugged in without changing the enrolment rules: only a PAID intent grants a seat.
 */
@Entity
@Table(name = "payment_intents")
public class PaymentIntent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "provider", nullable = false, length = 30)
    private String provider;

    @Column(name = "reference", nullable = false, length = 60, unique = true)
    private String reference;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    protected PaymentIntent() {
    }

    public PaymentIntent(User user, Course course, long amountCents, String currency,
                         String provider, String reference) {
        this.user = user;
        this.course = course;
        this.amountCents = amountCents;
        this.currency = currency;
        this.provider = provider;
        this.reference = reference;
        this.status = "PENDING";
    }

    public void markPaid() {
        this.status = "PAID";
    }

    public User getUser() {
        return user;
    }

    public Course getCourse() {
        return course;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public String getReference() {
        return reference;
    }

    public String getStatus() {
        return status;
    }
}
