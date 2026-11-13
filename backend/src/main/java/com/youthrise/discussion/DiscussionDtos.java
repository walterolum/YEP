package com.youthrise.discussion;

import com.youthrise.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class DiscussionDtos {

    private DiscussionDtos() {
    }

    public record MessageResponse(
            String id,
            String authorId,
            String authorName,
            Role authorRole,
            String body,
            Instant createdAt) {

        static MessageResponse from(DiscussionMessage message) {
            return new MessageResponse(message.getId(), message.getAuthor().getId(),
                    message.getAuthor().getFullName(), message.getAuthor().getRole(),
                    message.getBody(), message.getCreatedAt());
        }
    }

    public record DiscussionResponse(
            String id,
            String programmeId,
            String moduleId,
            String title,
            String topic,
            String authorName,
            boolean pinned,
            boolean locked,
            Instant createdAt,
            List<MessageResponse> messages) {

        static DiscussionResponse from(Discussion discussion) {
            return new DiscussionResponse(
                    discussion.getId(),
                    discussion.getProgramme().getId(),
                    discussion.getModuleId(),
                    discussion.getTitle(),
                    discussion.getTopic(),
                    discussion.getAuthor().getFullName(),
                    discussion.isPinned(),
                    discussion.isLocked(),
                    discussion.getCreatedAt(),
                    discussion.getMessages().stream().map(MessageResponse::from).toList());
        }
    }

    public record CreateDiscussionRequest(
            @NotBlank(message = "Give the discussion a title.")
            @Size(max = 160, message = "Use 160 characters or fewer.") String title,
            @NotBlank(message = "Describe what you want to discuss.")
            @Size(max = 1000, message = "Use 1000 characters or fewer.") String topic,
            String moduleId) {
    }

    public record ReplyRequest(
            @NotBlank(message = "Write a message before posting.")
            @Size(max = 4000, message = "Use 4000 characters or fewer.") String body) {
    }
}
