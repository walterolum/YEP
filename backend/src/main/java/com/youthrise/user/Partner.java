package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A partner organisation that supports programmes and reviews impact reports.
 */
@Entity
@DiscriminatorValue("PARTNER")
public class Partner extends User {

    @Override
    public Role getRole() {
        return Role.PARTNER;
    }

    @Override
    public String workspaceName() {
        return "Partner workspace";
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
        return false;
    }
}
