package com.youthrise.user;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * An employer that discovers participant talent and saves profiles.
 */
@Entity
@DiscriminatorValue("EMPLOYER")
public class Employer extends User {

    @Override
    public Role getRole() {
        return Role.EMPLOYER;
    }

    @Override
    public String workspaceName() {
        return "Employer workspace";
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
