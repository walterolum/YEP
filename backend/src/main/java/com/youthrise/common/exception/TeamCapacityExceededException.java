package com.youthrise.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when a team has no room for another member.
 */
public class TeamCapacityExceededException extends DomainException {

    public TeamCapacityExceededException(int capacity) {
        super(HttpStatus.CONFLICT, "TEAM_FULL",
                "This team already has its maximum of " + capacity + " members.");
    }
}
