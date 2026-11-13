package com.youthrise.project;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The part a participant plays inside a Level Two team. Roles are deliberately
 * few: a team needs one lead, contributors, and optional support members.
 */
public enum TeamMemberRole {
    @JsonProperty("lead") LEAD,
    @JsonProperty("member") MEMBER,
    @JsonProperty("support") SUPPORT
}
