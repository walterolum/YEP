package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Funder account: pledges, impact reports and sponsor enquiries. */
@Entity
@DiscriminatorValue("SPONSOR")
public class Sponsor extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.SPONSOR;
    }

    protected Sponsor() {
    }

    public Sponsor(String fullName, String email, String phone, String passwordHash,
                   Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canSponsor() {
        return true;
    }
}
