package ug.yep.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Setting;

public interface SettingRepository extends JpaRepository<Setting, String> {
}
