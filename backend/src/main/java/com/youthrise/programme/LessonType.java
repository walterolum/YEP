package com.youthrise.programme;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum LessonType {
    @JsonProperty("reading") READING,
    @JsonProperty("video") VIDEO,
    @JsonProperty("activity") ACTIVITY,
    @JsonProperty("quiz") QUIZ
}
