package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Staff account that runs cohorts, sessions and grading. */
@Entity
@DiscriminatorValue("FACILITATOR")
public class Facilitator extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.FACILITATOR;
    }

    protected Facilitator() {
    }

    public Facilitator(String fullName, String email, String phone, String passwordHash,
                       Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canFacilitate() {
        return true;
    }

    @Override
    public boolean canAuthorContent() {
        return true;
    }
}
