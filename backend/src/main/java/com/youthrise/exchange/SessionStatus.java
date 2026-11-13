package com.youthrise.exchange;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum SessionStatus {
    @JsonProperty("upcoming") UPCOMING,
    @JsonProperty("completed") COMPLETED,
    @JsonProperty("cancelled") CANCELLED
}
