package com.youthrise.project;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum SubmissionStatus {
    @JsonProperty("submitted") SUBMITTED,
    @JsonProperty("under_review") UNDER_REVIEW,
    @JsonProperty("revision") REVISION,
    @JsonProperty("approved") APPROVED
}
