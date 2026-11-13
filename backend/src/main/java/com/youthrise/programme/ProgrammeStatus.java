package com.youthrise.programme;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ProgrammeStatus {
    @JsonProperty("open") OPEN,
    @JsonProperty("waitlist") WAITLIST,
    @JsonProperty("closed") CLOSED,
    @JsonProperty("draft") DRAFT
}
