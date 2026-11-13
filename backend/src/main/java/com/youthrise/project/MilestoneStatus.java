package com.youthrise.project;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum MilestoneStatus {
    @JsonProperty("not_started") NOT_STARTED,
    @JsonProperty("in_progress") IN_PROGRESS,
    @JsonProperty("submitted") SUBMITTED,
    @JsonProperty("under_review") UNDER_REVIEW,
    @JsonProperty("revision") REVISION,
    @JsonProperty("approved") APPROVED
}
