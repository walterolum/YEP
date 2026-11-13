package com.youthrise.employer;

import com.youthrise.user.Visibility;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class EmployerDtos {

    private EmployerDtos() {
    }

    public record PortfolioItemResponse(String title, String theme, String summary) {

        static PortfolioItemResponse from(TalentProfile.PortfolioItem item) {
            return new PortfolioItemResponse(item.getTitle(), item.getTheme(), item.getSummary());
        }
    }

    public record TalentProfileResponse(
            String userId,
            String headline,
            String country,
            List<String> skills,
            String projectSummary,
            String certificateStatus,
            String certificateCode,
            TalentAvailability availability,
            Visibility visibility,
            boolean contactPermission,
            List<PortfolioItemResponse> portfolioItems) {
    }

    public record PortfolioItemRequest(
            @NotBlank(message = "Give the portfolio item a title.")
            @Size(max = 160) String title,
            @NotBlank(message = "Choose a theme.")
            @Size(max = 80) String theme,
            @NotBlank(message = "Describe the work.")
            @Size(max = 1000) String summary) {
    }

    public record UpdateTalentProfileRequest(
            @NotBlank(message = "Add a short headline.")
            @Size(max = 160) String headline,
            @NotBlank(message = "Describe your project work.")
            @Size(max = 1000) String projectSummary,
            @NotNull(message = "Choose your availability.") TalentAvailability availability,
            @Size(max = 6, message = "Add up to six portfolio items.")
            List<@Valid PortfolioItemRequest> portfolioItems) {
    }

    public record IntroductionRequest(
            @NotBlank(message = "Explain why you would like an introduction.")
            @Size(max = 1000) String note) {
    }
}
