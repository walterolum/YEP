package com.youthrise.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum IncidentStatus {
    @JsonProperty("reported") REPORTED,
    @JsonProperty("triaged") TRIAGED,
    @JsonProperty("investigating") INVESTIGATING,
    @JsonProperty("resolved") RESOLVED,
    @JsonProperty("escalated") ESCALATED
}
