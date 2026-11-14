package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** A manual impact entry for reporting by country, gender and education level. */
@Entity
@Table(name = "impact_records")
public class ImpactRecord extends BaseEntity {

    @Column(name = "country", nullable = false, length = 80)
    private String country;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "education_level", length = 40)
    private String educationLevel;

    @Column(name = "learners", nullable = false)
    private int learners;

    @Column(name = "certificates", nullable = false)
    private int certificates;

    @Column(name = "placements", nullable = false)
    private int placements;

    @Column(name = "period", length = 20)
    private String period;

    protected ImpactRecord() {
    }

    public ImpactRecord(String country, String gender, String educationLevel, int learners,
                        int certificates, int placements, String period) {
        this.country = country;
        this.gender = gender;
        this.educationLevel = educationLevel;
        this.learners = learners;
        this.certificates = certificates;
        this.placements = placements;
        this.period = period;
    }

    public String getCountry() {
        return country;
    }

    public String getGender() {
        return gender;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public int getLearners() {
        return learners;
    }

    public int getCertificates() {
        return certificates;
    }

    public int getPlacements() {
        return placements;
    }

    public String getPeriod() {
        return period;
    }
}
