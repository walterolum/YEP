package com.youthrise.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PrivacyRequestStatus {
    @JsonProperty("received") RECEIVED,
    @JsonProperty("identity_check") IDENTITY_CHECK,
    @JsonProperty("in_progress") IN_PROGRESS,
    @JsonProperty("completed") COMPLETED,
    @JsonProperty("rejected") REJECTED
}
