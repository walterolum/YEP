package ug.yep.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.entity.Enums;
import ug.yep.entity.ImpactRecord;
import ug.yep.entity.User;
import ug.yep.repository.CertificateRepository;
import ug.yep.repository.ImpactRecordRepository;
import ug.yep.repository.JobApplicationRepository;
import ug.yep.repository.UserRepository;

/** Phase 6 impact reporting: live figures plus manual records by country and cohort. */
@Service
public class ImpactService {

    private final UserRepository users;
    private final CertificateRepository certificates;
    private final JobApplicationRepository applications;
    private final ImpactRecordRepository records;

    public ImpactService(UserRepository users, CertificateRepository certificates,
                         JobApplicationRepository applications, ImpactRecordRepository records) {
        this.users = users;
        this.certificates = certificates;
        this.applications = applications;
        this.records = records;
    }

    public Map<String, Object> summary() {
        List<User> all = users.findAll();
        Map<String, Integer> byCountry = new TreeMap<>();
        int participants = 0;
        int women = 0;
        for (User user : all) {
            if (user.getRole() != Enums.Role.PARTICIPANT) {
                continue;
            }
            participants++;
            if (user.getCountry() != null && !user.getCountry().isBlank()) {
                byCountry.merge(user.getCountry(), 1, Integer::sum);
            }
            if ("Female".equalsIgnoreCase(user.getGender())) {
                women++;
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("participants", participants);
        result.put("women", women);
        result.put("certificates", certificates.count());
        result.put("placements", applications.countByStatus("HIRED"));
        result.put("learnersByCountry", byCountry);
        result.put("manualRecords", records.findAllByOrderByCountryAsc().stream()
                .map(this::view).toList());
        return result;
    }

    @Transactional
    public Map<String, Object> addRecord(Requests.ImpactRequest request) {
        ImpactRecord record = records.save(new ImpactRecord(request.country(), request.gender(),
                request.educationLevel(), Math.max(0, request.learners()),
                Math.max(0, request.certificates()), Math.max(0, request.placements()),
                request.period()));
        return view(record);
    }

    private Map<String, Object> view(ImpactRecord record) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", record.getId());
        row.put("country", record.getCountry());
        row.put("gender", record.getGender());
        row.put("educationLevel", record.getEducationLevel());
        row.put("learners", record.getLearners());
        row.put("certificates", record.getCertificates());
        row.put("placements", record.getPlacements());
        row.put("period", record.getPeriod());
        return row;
    }
}
