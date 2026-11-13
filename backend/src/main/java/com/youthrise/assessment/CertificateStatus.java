package com.youthrise.assessment;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum CertificateStatus {
    @JsonProperty("pending") PENDING,
    @JsonProperty("valid") VALID,
    @JsonProperty("revoked") REVOKED
}
