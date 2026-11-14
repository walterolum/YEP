package ug.yep.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.entity.JobApplication;
import ug.yep.entity.JobPosting;
import ug.yep.entity.PortfolioItem;
import ug.yep.entity.SavedJob;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.JobApplicationRepository;
import ug.yep.repository.JobPostingRepository;
import ug.yep.repository.PortfolioItemRepository;
import ug.yep.repository.SavedJobRepository;
import ug.yep.repository.UserRepository;

/** Phase 6: jobs board, applications, saved jobs and learner portfolios. */
@Service
public class CareersService {

    private final JobPostingRepository postings;
    private final JobApplicationRepository applications;
    private final SavedJobRepository saved;
    private final PortfolioItemRepository portfolio;
    private final UserRepository users;

    public CareersService(JobPostingRepository postings, JobApplicationRepository applications,
                          SavedJobRepository saved, PortfolioItemRepository portfolio,
                          UserRepository users) {
        this.postings = postings;
        this.applications = applications;
        this.saved = saved;
        this.portfolio = portfolio;
        this.users = users;
    }

    // ------------------------------------------------------------- postings

    @Transactional
    public Map<String, Object> post(Long employerId, Requests.JobRequest request) {
        User employer = user(employerId);
        JobPosting posting = postings.save(new JobPosting(employer, request.title(),
                request.organisation(), request.location(), request.workMode(),
                request.description(), request.skills(), request.closesAt()));
        return postingView(posting);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> openJobs() {
        return postings.findByPublishedTrueOrderByCreatedAtDesc().stream()
                .filter(JobPosting::isOpen).map(this::postingView).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> employerJobs(Long employerId) {
        return postings.findByEmployerIdOrderByCreatedAtDesc(employerId).stream()
                .map(this::postingView).toList();
    }

    @Transactional
    public Map<String, Object> close(Long employerId, Long postingId) {
        JobPosting posting = posting(postingId);
        if (!posting.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("This posting belongs to another employer.");
        }
        posting.close();
        postings.save(posting);
        return postingView(posting);
    }

    // ---------------------------------------------------------- applications

    @Transactional
    public Map<String, Object> apply(Long userId, Long postingId, Requests.JobApplyRequest request) {
        JobPosting posting = posting(postingId);
        if (!posting.isOpen()) {
            throw new BusinessRuleException("This posting is closed.");
        }
        if (applications.findByPostingIdAndUserId(postingId, userId).isPresent()) {
            throw new BusinessRuleException("You have already applied to this posting.");
        }
        JobApplication application = applications.save(new JobApplication(posting, user(userId),
                request.coverNote()));
        return applicationView(application);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> myApplications(Long userId) {
        return applications.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::applicationView).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> applicants(Long employerId, Long postingId) {
        JobPosting posting = posting(postingId);
        if (!posting.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("This posting belongs to another employer.");
        }
        return applications.findByPostingIdOrderByCreatedAtDesc(postingId).stream()
                .map(this::applicantView).toList();
    }

    @Transactional
    public Map<String, Object> decide(Long employerId, Long applicationId, String status) {
        JobApplication application = applications.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application"));
        if (!application.getPosting().getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("This application belongs to another employer.");
        }
        String clean = status == null ? "" : status.trim().toUpperCase(java.util.Locale.ROOT);
        if (!List.of("SHORTLISTED", "HIRED", "REJECTED").contains(clean)) {
            throw new BusinessRuleException("Choose SHORTLISTED, HIRED or REJECTED.");
        }
        application.decide(clean);
        applications.save(application);
        return applicantView(application);
    }

    // -------------------------------------------------------------- saved

    @Transactional
    public Map<String, Object> saveJob(Long userId, Long postingId) {
        JobPosting posting = posting(postingId);
        if (!saved.existsByPostingIdAndUserId(postingId, userId)) {
            saved.save(new SavedJob(posting, user(userId)));
        }
        Map<String, Object> result = postingView(posting);
        result.put("saved", true);
        return result;
    }

    @Transactional
    public Map<String, Object> unsaveJob(Long userId, Long postingId) {
        saved.deleteByPostingIdAndUserId(postingId, userId);
        return Map.of("postingId", postingId, "saved", false);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> savedJobs(Long userId) {
        return saved.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(row -> postingView(row.getPosting())).toList();
    }

    // ---------------------------------------------------------- portfolio

    @Transactional
    public Map<String, Object> addPortfolio(Long userId, Requests.PortfolioRequest request) {
        PortfolioItem item = portfolio.save(new PortfolioItem(user(userId), request.title(),
                request.description(), request.url(), request.type()));
        return portfolioView(item);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> portfolio(Long userId) {
        return portfolio.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::portfolioView).toList();
    }

    @Transactional
    public void removePortfolio(Long userId, Long itemId) {
        PortfolioItem item = portfolio.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Portfolio item"));
        if (!item.getUser().getId().equals(userId)) {
            throw new ForbiddenException("This portfolio item belongs to another learner.");
        }
        portfolio.delete(item);
    }

    // ------------------------------------------------------------- views

    private Map<String, Object> postingView(JobPosting posting) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", posting.getId());
        row.put("title", posting.getTitle());
        row.put("organisation", posting.getOrganisation());
        row.put("location", posting.getLocation());
        row.put("workMode", posting.getWorkMode());
        row.put("description", posting.getDescription());
        row.put("skills", posting.getSkills());
        row.put("closesAt", posting.getClosesAt());
        row.put("open", posting.isOpen());
        row.put("employer", posting.getEmployer().getFullName());
        return row;
    }

    private Map<String, Object> applicationView(JobApplication application) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", application.getId());
        row.put("postingId", application.getPosting().getId());
        row.put("title", application.getPosting().getTitle());
        row.put("organisation", application.getPosting().getOrganisation());
        row.put("status", application.getStatus());
        row.put("coverNote", application.getCoverNote());
        row.put("createdAt", application.getCreatedAt());
        return row;
    }

    private Map<String, Object> applicantView(JobApplication application) {
        Map<String, Object> row = applicationView(application);
        row.put("learner", application.getUser().getFullName());
        row.put("learnerEmail", application.getUser().getEmail());
        row.put("country", application.getUser().getCountry());
        return row;
    }

    private Map<String, Object> portfolioView(PortfolioItem item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", item.getId());
        row.put("title", item.getTitle());
        row.put("description", item.getDescription());
        row.put("url", item.getUrl());
        row.put("type", item.getType());
        row.put("createdAt", item.getCreatedAt());
        return row;
    }

    private JobPosting posting(Long postingId) {
        return postings.findById(postingId).orElseThrow(() -> new NotFoundException("Job posting"));
    }

    private User user(Long userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
    }
}
