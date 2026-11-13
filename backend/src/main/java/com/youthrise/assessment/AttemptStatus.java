package com.youthrise.assessment;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AttemptStatus {
    @JsonProperty("submitted") SUBMITTED,
    @JsonProperty("graded") GRADED
}
