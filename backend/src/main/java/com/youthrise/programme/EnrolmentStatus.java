package com.youthrise.programme;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum EnrolmentStatus {
    @JsonProperty("active") ACTIVE,
    @JsonProperty("completed") COMPLETED,
    @JsonProperty("withdrawn") WITHDRAWN,
    @JsonProperty("waitlisted") WAITLISTED
}
