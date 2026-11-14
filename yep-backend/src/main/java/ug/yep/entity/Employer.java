package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Employer / partner account: posts opportunities and reviews applicants (Phase 6 owns the board). */
@Entity
@DiscriminatorValue("EMPLOYER")
public class Employer extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.EMPLOYER;
    }

    protected Employer() {
    }

    public Employer(String fullName, String email, String phone, String passwordHash,
                    Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canHire() {
        return true;
    }

    @Override
    public boolean canSponsor() {
        return true;
    }
}
