package com.youthrise.partner;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum NominationStatus {
    @JsonProperty("nominated") NOMINATED,
    @JsonProperty("invited") INVITED,
    @JsonProperty("registered") REGISTERED,
    @JsonProperty("accepted") ACCEPTED,
    @JsonProperty("declined") DECLINED
}
