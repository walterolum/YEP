package com.youthrise.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum Visibility {
    @JsonProperty("public") PUBLIC,
    @JsonProperty("limited") LIMITED,
    @JsonProperty("hidden") HIDDEN
}
