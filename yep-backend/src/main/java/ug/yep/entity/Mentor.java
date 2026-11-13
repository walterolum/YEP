package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Staff account that can design programmes and grade assessments. */
@Entity
@DiscriminatorValue("MENTOR")
public class Mentor extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.MENTOR;
    }

    protected Mentor() {
    }

    public Mentor(String fullName, String email, String phone, String passwordHash,
                  Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canMentor() {
        return true;
    }
}
