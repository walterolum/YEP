package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A university partner that nominates students and reviews cohort outcomes.
 */
@Entity
@DiscriminatorValue("UNIVERSITY")
public class University extends User {

    @Override
    public Role getRole() {
        return Role.UNIVERSITY;
    }

    @Override
    public String workspaceName() {
        return "Institution workspace";
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
