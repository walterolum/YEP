package com.youthrise.assessment;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AssessmentType {
    @JsonProperty("quiz") QUIZ,
    @JsonProperty("reflection") REFLECTION,
    @JsonProperty("project") PROJECT,
    @JsonProperty("final") FINAL
}
