package ug.yep.entity;

/** All status and type constants used by the domain, kept in one place. */
public final class Enums {

    private Enums() {
    }

    public enum Role { ADMIN, PARTICIPANT, MENTOR, FACILITATOR, SPONSOR }

    public enum UserStatus { PENDING, APPROVED, SUSPENDED, REJECTED }

    public enum Level { LEVEL_ONE, LEVEL_TWO }

    public enum ApplicationStatus { PENDING, APPROVED, REJECTED }

    public enum ProjectStatus { PROPOSED, APPROVED, IN_PROGRESS, COMPLETED, REJECTED }

    public enum LessonType { VIDEO, NOTES, ACTIVITY }

    public enum CourseEnrollmentStatus { ENROLLED, COMPLETED, WITHDRAWN }

    public enum MaterialType { PDF, VIDEO, LINK, SLIDES }

    public enum DeliverableStatus { REVIEW, ACCEPTED, REVISE }

    public enum SessionType { WORKSHOP, WEBINAR, DISCUSSION, PROJECT }

    public enum MentorshipStatus { REQUESTED, ACCEPTED, DECLINED }

    public enum PledgeStatus { PLEDGED, DISBURSED }

    public enum ThreadKind { ANNOUNCEMENT, SPONSOR_ENQUIRY, DM, TEAM }

    public enum Permission { MANAGE_USERS("Manage users"), PROGRAMMES("Programmes"),
        ASSESSMENTS("Assessments"), CERTIFICATES("Certificates"), REPORTS("Reports");

        private final String label;

        Permission(String label) {
            this.label = label;
        }

        public String label() {
            return label;
        }

        public static Permission fromLabel(String label) {
            for (Permission permission : values()) {
                if (permission.label.equalsIgnoreCase(label) || permission.name().equalsIgnoreCase(label)) {
                    return permission;
                }
            }
            throw new IllegalArgumentException("Unknown permission: " + label);
        }
    }
}
