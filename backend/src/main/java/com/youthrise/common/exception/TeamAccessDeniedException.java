package com.youthrise.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when the caller has no relationship with the team they addressed.
 */
public class TeamAccessDeniedException extends DomainException {

    public TeamAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "TEAM_ACCESS_DENIED", "You do not have access to this team.");
    }
}
