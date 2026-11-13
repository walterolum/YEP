package com.youthrise.partner;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "briefing_requests")
public class BriefingRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partner_id", nullable = false)
    private User partner;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "note", nullable = false, length = 1000)
    private String note;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    protected BriefingRequest() {
    }

    public static BriefingRequest create(User partner, Programme programme, String note) {
        BriefingRequest request = new BriefingRequest();
        request.partner = partner;
        request.programme = programme;
        request.note = note.trim();
        request.requestedAt = Instant.now();
        request.status = "requested";
        return request;
    }

    public User getPartner() {
        return partner;
    }

    public Programme getProgramme() {
        return programme;
    }

    public String getNote() {
        return note;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public String getStatus() {
        return status;
    }
}
