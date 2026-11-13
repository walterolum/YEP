package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Runs the platform: manages accounts, content, reports and governance records.
 */
@Entity
@DiscriminatorValue("ADMIN")
public class Administrator extends User {

    @Override
    public Role getRole() {
        return Role.ADMIN;
    }

    @Override
    public String workspaceName() {
        return "Administration";
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
        return true;
    }

    @Override
    public boolean isEligibleForLevelTwo() {
        return false;
    }
}
