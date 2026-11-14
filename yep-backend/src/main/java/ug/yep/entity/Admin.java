package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Administrator account. Capabilities are also enforced by Spring Security. */
@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.ADMIN;
    }

    protected Admin() {
    }

    public Admin(String fullName, String email, String phone, String passwordHash,
                 Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canManageUsers() {
        return true;
    }

    @Override
    public boolean canFacilitate() {
        return true;
    }

    @Override
    public boolean canMentor() {
        return true;
    }

    @Override
    public boolean canSponsor() {
        return true;
    }

    @Override
    public boolean canAuthorContent() {
        return true;
    }

    @Override
    public boolean canReviewContent() {
        return true;
    }

    @Override
    public boolean canHire() {
        return true;
    }
}
