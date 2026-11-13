package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A young person aged 18-35 who joins Level One exchanges and may form or join a
 * Level Two Impact Project team.
 */
@Entity
@DiscriminatorValue("PARTICIPANT")
public class Participant extends User {

    @Override
    public Role getRole() {
        return Role.PARTICIPANT;
    }

    @Override
    public String workspaceName() {
        return "Participant workspace";
    }

    @Override
    public boolean canFacilitate() {
        return false;
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
        return true;
    }
}
