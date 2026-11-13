package com.youthrise.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum IncidentSeverity {
    @JsonProperty("low") LOW,
    @JsonProperty("medium") MEDIUM,
    @JsonProperty("high") HIGH,
    @JsonProperty("critical") CRITICAL
}
