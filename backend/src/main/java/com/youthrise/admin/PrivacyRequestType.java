package com.youthrise.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PrivacyRequestType {
    @JsonProperty("access") ACCESS,
    @JsonProperty("correction") CORRECTION,
    @JsonProperty("deletion") DELETION,
    @JsonProperty("restriction") RESTRICTION
}
