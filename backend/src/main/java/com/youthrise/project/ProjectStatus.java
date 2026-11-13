package com.youthrise.project;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ProjectStatus {
    @JsonProperty("draft") DRAFT,
    @JsonProperty("active") ACTIVE,
    @JsonProperty("under_review") UNDER_REVIEW,
    @JsonProperty("completed") COMPLETED
}
