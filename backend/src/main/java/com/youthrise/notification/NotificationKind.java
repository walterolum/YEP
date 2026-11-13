package com.youthrise.notification;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum NotificationKind {
    @JsonProperty("announcement") ANNOUNCEMENT,
    @JsonProperty("feedback") FEEDBACK,
    @JsonProperty("session") SESSION,
    @JsonProperty("system") SYSTEM,
    @JsonProperty("approval") APPROVAL
}
