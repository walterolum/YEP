package com.youthrise.employer;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "talent_profiles")
public class TalentProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "headline", nullable = false, length = 160)
    private String headline;

    @Column(name = "project_summary", nullable = false, length = 1000)
    private String projectSummary;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability", nullable = false, length = 20)
    private TalentAvailability availability;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "talent_portfolio_items", joinColumns = @JoinColumn(name = "profile_id"))
    @OrderColumn(name = "position")
    private List<PortfolioItem> portfolioItems = new ArrayList<>();

    protected TalentProfile() {
    }

    @Embeddable
    public static class PortfolioItem {

        @Column(name = "title", nullable = false, length = 160)
        private String title;

        @Column(name = "theme", nullable = false, length = 80)
        private String theme;

        @Column(name = "summary", nullable = false, length = 1000)
        private String summary;

        protected PortfolioItem() {
        }

        public PortfolioItem(String title, String theme, String summary) {
            this.title = title;
            this.theme = theme;
            this.summary = summary;
        }

        public String getTitle() {
            return title;
        }

        public String getTheme() {
            return theme;
        }

        public String getSummary() {
            return summary;
        }
    }

    public static TalentProfile create(User user, String headline, String projectSummary,
                                       TalentAvailability availability, List<PortfolioItem> items) {
        TalentProfile profile = new TalentProfile();
        profile.user = user;
        profile.update(headline, projectSummary, availability, items);
        return profile;
    }

    public void update(String headline, String projectSummary, TalentAvailability availability,
                       List<PortfolioItem> items) {
        this.headline = headline.trim();
        this.projectSummary = projectSummary.trim();
        this.availability = availability;
        this.portfolioItems = new ArrayList<>(items);
    }

    public User getUser() {
        return user;
    }

    public String getHeadline() {
        return headline;
    }

    public String getProjectSummary() {
        return projectSummary;
    }

    public TalentAvailability getAvailability() {
        return availability;
    }

    public List<PortfolioItem> getPortfolioItems() {
        return portfolioItems;
    }
}
