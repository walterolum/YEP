package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Designs programmes, publishes Level One content and runs virtual sessions.
 */
@Entity
@DiscriminatorValue("FACILITATOR")
public class Facilitator extends User {

    @Override
    public Role getRole() {
        return Role.FACILITATOR;
    }

    @Override
    public String workspaceName() {
        return "Facilitator workspace";
    }

    @Override
    public boolean canFacilitate() {
        return true;
    }

    @Override
    public boolean canMentor() {
        return false;
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
