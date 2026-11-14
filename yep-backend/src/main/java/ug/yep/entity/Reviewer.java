package ug.yep.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/** Content reviewer / moderator: checks courses for quality and licensing before publication. */
@Entity
@DiscriminatorValue("REVIEWER")
public class Reviewer extends User {

    @Override
    public Enums.Role getRole() {
        return Enums.Role.REVIEWER;
    }

    protected Reviewer() {
    }

    public Reviewer(String fullName, String email, String phone, String passwordHash,
                    Enums.UserStatus status) {
        super(fullName, email, phone, passwordHash, status);
    }

    @Override
    public boolean canReviewContent() {
        return true;
    }
}
