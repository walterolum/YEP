package com.youthrise;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.youthrise.assessment.Assessment;
import com.youthrise.assessment.AssessmentAttempt;
import com.youthrise.assessment.AssessmentAttemptRepository;
import com.youthrise.assessment.AssessmentRepository;
import com.youthrise.assessment.AssessmentType;
import com.youthrise.assessment.CertificateRepository;
import com.youthrise.assessment.CertificateService;
import com.youthrise.badge.BadgeService;
import com.youthrise.badge.UserBadgeRepository;
import com.youthrise.common.exception.ScoringException;
import com.youthrise.common.exception.TeamCapacityExceededException;
import com.youthrise.programme.Enrolment;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.EnrolmentStatus;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.project.ProjectDtos;
import com.youthrise.project.TeamMemberRole;
import com.youthrise.project.TeamService;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service-level coverage for the three rules the brief calls out explicitly:
 * team formation, assessment scoring and certificate generation.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class KeyServicesTest {

    @Autowired
    private UserRepository users;
    @Autowired
    private ProgrammeRepository programmes;
    @Autowired
    private EnrolmentRepository enrolments;
    @Autowired
    private AssessmentRepository assessments;
    @Autowired
    private AssessmentAttemptRepository attempts;
    @Autowired
    private CertificateRepository certificates;
    @Autowired
    private UserBadgeRepository userBadges;
    @Autowired
    private TeamService teamService;
    @Autowired
    private CertificateService certificateService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void teamFormationCreatesALeadAndAddsMembers() {
        User facilitator = saveFacilitator();
        Programme programme = saveLevelTwoProgramme(facilitator);
        User lead = saveParticipant();
        User second = saveParticipant();
        enrol(programme, lead);
        enrol(programme, second);

        ProjectDtos.TeamResponse created = teamService.createTeam(
                new ProjectDtos.CreateTeamRequest(programme.getId(), "Green Team", "Climate"),
                UserPrincipal.from(lead));

        assertThat(created.members()).hasSize(1);
        assertThat(created.members().get(0).role()).isEqualTo(TeamMemberRole.LEAD);
        assertThat(created.capacity()).isEqualTo(TeamService.DEFAULT_TEAM_CAPACITY);

        ProjectDtos.TeamResponse updated = teamService.addMember(created.id(),
                new ProjectDtos.AddTeamMemberRequest(second.getId(), null, TeamMemberRole.MEMBER),
                UserPrincipal.from(lead));

        assertThat(updated.members()).hasSize(2);
        assertThat(updated.memberIds()).contains(second.getId());
    }

    @Test
    void teamFormationStopsAtCapacity() {
        User facilitator = saveFacilitator();
        Programme programme = saveLevelTwoProgramme(facilitator);
        User lead = saveParticipant();
        enrol(programme, lead);
        ProjectDtos.TeamResponse team = teamService.createTeam(
                new ProjectDtos.CreateTeamRequest(programme.getId(), "Full House", "Health"),
                UserPrincipal.from(lead));

        for (int index = 1; index < TeamService.DEFAULT_TEAM_CAPACITY; index++) {
            User member = saveParticipant();
            enrol(programme, member);
            teamService.addMember(team.id(),
                    new ProjectDtos.AddTeamMemberRequest(member.getId(), null, TeamMemberRole.MEMBER),
                    UserPrincipal.from(lead));
        }

        User overflow = saveParticipant();
        enrol(programme, overflow);
        assertThatThrownBy(() -> teamService.addMember(team.id(),
                new ProjectDtos.AddTeamMemberRequest(overflow.getId(), null, TeamMemberRole.MEMBER),
                UserPrincipal.from(lead)))
                .isInstanceOf(TeamCapacityExceededException.class);
    }

    @Test
    void assessmentScoringEnforcesTheRangeAndPassMark() {
        User facilitator = saveFacilitator();
        Programme programme = saveLevelTwoProgramme(facilitator);
        User participant = saveParticipant();
        Assessment assessment = savePublishedAssessment(programme);

        AssessmentAttempt pass = AssessmentAttempt.submit(assessment, participant, 1, "My answer");
        pass.grade(facilitator, 10, "Meets the criteria");

        assertThat(pass.isGraded()).isTrue();
        assertThat(pass.percentage()).isEqualTo(50.0);
        assertThat(pass.isPassed()).isTrue();

        AssessmentAttempt fail = AssessmentAttempt.submit(assessment, participant, 2, "Second answer");
        fail.grade(facilitator, 9, "Below the pass mark");
        assertThat(fail.isPassed()).isFalse();

        AssessmentAttempt invalid = AssessmentAttempt.submit(assessment, participant, 3, "Third answer");
        assertThatThrownBy(() -> invalid.grade(facilitator, 21, "Too high"))
                .isInstanceOf(ScoringException.class);
    }

    @Test
    void certificateIsIssuedOnlyAfterCompletionAndAPassingMark() {
        User facilitator = saveFacilitator();
        Programme programme = saveLevelTwoProgramme(facilitator);
        User participant = saveParticipant();
        Assessment assessment = savePublishedAssessment(programme);

        Enrolment inProgress = Enrolment.create(programme, participant, EnrolmentStatus.ACTIVE);
        enrolments.saveAndFlush(inProgress);
        AssessmentAttempt attempt = AssessmentAttempt.submit(assessment, participant, 1, "Answer");
        attempt.grade(facilitator, 16, "Strong work");
        attempts.saveAndFlush(attempt);

        certificateService.issueIfEligible(programme.getId(), participant.getId(), facilitator);
        assertThat(certificates.findByParticipantIdOrderByCreatedAtDesc(participant.getId())).isEmpty();

        inProgress.updateProgress(100, null);
        enrolments.saveAndFlush(inProgress);
        certificateService.issueIfEligible(programme.getId(), participant.getId(), facilitator);

        assertThat(certificates.findByParticipantIdOrderByCreatedAtDesc(participant.getId()))
                .singleElement()
                .satisfies(certificate -> {
                    assertThat(certificate.getCode()).startsWith("YEP-");
                    assertThat(certificate.getStatus().name()).isEqualTo("VALID");
                });
        assertThat(userBadges.findByUserIdOrderByAwardedAtDesc(participant.getId()))
                .extracting(award -> award.getBadge().getCode())
                .contains(BadgeService.PROGRAMME_COMPLETION);
    }

    private User saveParticipant() {
        User user = User.register("Test Participant", uniqueEmail(), null, "Uganda",
                passwordEncoder.encode("Password1"), "Africa/Kampala", LocalDate.of(2000, 1, 1));
        user.markEmailVerified(Instant.now());
        return users.saveAndFlush(user);
    }

    private User saveFacilitator() {
        User facilitator = User.invited("Test Facilitator", uniqueEmail(), Role.FACILITATOR,
                "Uganda", "Africa/Kampala");
        facilitator.changePassword(passwordEncoder.encode("Password1"));
        return users.saveAndFlush(facilitator);
    }

    private Programme saveLevelTwoProgramme(User facilitator) {
        Instant now = Instant.now();
        return programmes.saveAndFlush(Programme.create(
                "Level Two Exchange", "Summary", "Description", 2, "Climate",
                6, "4 hours a week", "Online", 30, ProgrammeStatus.OPEN,
                now.minus(1, ChronoUnit.DAYS), now.plus(60, ChronoUnit.DAYS),
                "2026-A", facilitator));
    }

    private Assessment savePublishedAssessment(Programme programme) {
        Instant now = Instant.now();
        return assessments.saveAndFlush(Assessment.create(programme, "Module quiz",
                AssessmentType.QUIZ, "Check your understanding", now.minus(1, ChronoUnit.DAYS),
                now.plus(7, ChronoUnit.DAYS), 20, 2, true, List.of(), List.of()));
    }

    private void enrol(Programme programme, User participant) {
        enrolments.saveAndFlush(Enrolment.create(programme, participant, EnrolmentStatus.ACTIVE));
    }

    private static String uniqueEmail() {
        return "test-" + UUID.randomUUID() + "@example.org";
    }
}
