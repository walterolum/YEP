package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Guides Level Two teams, reviews project evidence and records feedback.
 */
@Entity
@DiscriminatorValue("MENTOR")
public class Mentor extends User {

    @Override
    public Role getRole() {
        return Role.MENTOR;
    }

    @Override
    public String workspaceName() {
        return "Mentor workspace";
    }

    @Override
    public boolean canFacilitate() {
        return false;
    }

    @Override
    public boolean canMentor() {
        return true;
    }

    @Override
    public boolean canAdminister() {
        return false;
    }

    @Override
    public boolean isEligibleForLevelTwo() {
        return false;
    }
}
