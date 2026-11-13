package com.youthrise.announcement;

import com.youthrise.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class AnnouncementDtos {

    private AnnouncementDtos() {
    }

    public record AnnouncementResponse(
            String id,
            String title,
            String body,
            Role audienceRole,
            String programmeId,
            String authorName,
            Instant publishedAt) {

        public static AnnouncementResponse from(Announcement announcement) {
            return new AnnouncementResponse(
                    announcement.getId(),
                    announcement.getTitle(),
                    announcement.getBody(),
                    announcement.getAudienceRole(),
                    announcement.getProgramme() == null ? null : announcement.getProgramme().getId(),
                    announcement.getAuthor().getFullName(),
                    announcement.getPublishedAt());
        }
    }

    public record CreateAnnouncementRequest(
            @NotBlank(message = "Give the announcement a title.")
            @Size(max = 160, message = "Use 160 characters or fewer.") String title,
            @NotBlank(message = "Write the announcement.")
            @Size(max = 4000, message = "Use 4000 characters or fewer.") String body,
            Role audienceRole,
            String programmeId) {
    }
}
