package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Instructor / content creator: builds and submits courses for review. */
@Entity
@DiscriminatorValue("INSTRUCTOR")
public class Instructor extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.INSTRUCTOR;
    }

    protected Instructor() {
    }

    public Instructor(String fullName, String email, String phone, String passwordHash,
                      Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canAuthorContent() {
        return true;
    }
}
