package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** A confirmed youth participant. Marker subclass: the role itself carries the meaning. */
@Entity
@DiscriminatorValue("PARTICIPANT")
public class Participant extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.PARTICIPANT;
    }

    protected Participant() {
    }

    public Participant(String fullName, String email, String phone, String passwordHash,
                       Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }
}
