package com.youthrise.employer;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum TalentAvailability {
    @JsonProperty("open") OPEN,
    @JsonProperty("not_looking") NOT_LOOKING,
    @JsonProperty("undisclosed") UNDISCLOSED
}
