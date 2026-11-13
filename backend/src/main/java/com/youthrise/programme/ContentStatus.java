package com.youthrise.programme;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContentStatus {
    @JsonProperty("draft") DRAFT,
    @JsonProperty("published") PUBLISHED,
    @JsonProperty("archived") ARCHIVED
}
