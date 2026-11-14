package ug.yep.service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.Setting;
import ug.yep.repository.SettingRepository;

/** Typed access to the configurable business rules stored in {@code settings}. */
@Service
public class SettingsService {

    private final SettingRepository settings;

    public SettingsService(SettingRepository settings) {
        this.settings = settings;
    }

    public String value(String key, String fallback) {
        return settings.findById(key).map(Setting::getValue).orElse(fallback);
    }

    public int integer(String key, int fallback) {
        String raw = value(key, String.valueOf(fallback));
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    public Map<String, String> all() {
        Map<String, String> map = new LinkedHashMap<>();
        settings.findAll().forEach(setting -> map.put(setting.getKey(), setting.getValue()));
        return map;
    }

    @Transactional
    public Map<String, String> update(Map<String, String> values) {
        values.forEach((key, raw) -> {
            if (key == null || key.isBlank() || raw == null) {
                return;
            }
            Setting setting = settings.findById(key).orElseGet(() -> new Setting(key, raw));
            setting.setValue(raw);
            settings.save(setting);
        });
        return all();
    }

    /** Snapshot of the Level Two eligibility thresholds. */
    public Policy policy() {
        return new Policy(
                integer("min_age", 18),
                integer("max_age", 35),
                integer("level2_min_completion", 80),
                integer("level2_min_assessment", 65),
                integer("level2_min_attendance", 75));
    }

    public record Policy(int minAge, int maxAge, int level2MinCompletion,
                         int level2MinAssessment, int level2MinAttendance) {
    }

    /** Weights of the one overall score (Phase 2). Defaults: 40% lessons, 40% assessments, 20% attendance. */
    public Weights weights() {
        return new Weights(
                integer("overall_weight_lessons", 40),
                integer("overall_weight_assessments", 40),
                integer("overall_weight_attendance", 20));
    }

    public record Weights(int lessons, int assessments, int attendance) {
    }
}
