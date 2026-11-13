package com.youthrise.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AccountStatus {
    @JsonProperty("active") ACTIVE,
    @JsonProperty("suspended") SUSPENDED,
    @JsonProperty("invited") INVITED
}
