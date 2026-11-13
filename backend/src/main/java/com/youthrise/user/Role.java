package com.youthrise.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum Role {
    @JsonProperty("participant") PARTICIPANT,
    @JsonProperty("facilitator") FACILITATOR,
    @JsonProperty("mentor") MENTOR,
    @JsonProperty("university") UNIVERSITY,
    @JsonProperty("employer") EMPLOYER,
    @JsonProperty("partner") PARTNER,
    @JsonProperty("admin") ADMIN;

    public String authority() {
        return "ROLE_" + name();
    }
}
