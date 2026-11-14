package ug.yep.repository;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Enums;
import ug.yep.entity.User;

/**
 * {@code role} is the JPA discriminator column, so it is not an entity attribute and cannot
 * appear in JPQL. Role filters therefore run in memory through the default methods below.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByStatusOrderByFullNameAsc(Enums.UserStatus status);

    List<User> findAllByOrderByFullNameAsc();

    default List<User> findByRoleOrderByFullNameAsc(Enums.Role role) {
        return findAllByOrderByFullNameAsc().stream()
                .filter(user -> user.getRole() == role)
                .toList();
    }

    default List<User> findByRoleAndStatusOrderByFullNameAsc(Enums.Role role, Enums.UserStatus status) {
        return findAllByOrderByFullNameAsc().stream()
                .filter(user -> user.getRole() == role && user.getStatus() == status)
                .toList();
    }

    default long countByRole(Enums.Role role) {
        return findAll().stream().filter(user -> user.getRole() == role).count();
    }

    default List<User> search(String role, String status, String q) {
        return search(role, status, q, null, null);
    }

    /** Directory search with the country and education-level filters used by the admin console. */
    default List<User> search(String role, String status, String q, String country, String educationLevel) {
        String roleFilter = role == null || role.isBlank() ? null : role.trim().toUpperCase(Locale.ROOT);
        String statusFilter = status == null || status.isBlank() ? null
                : status.trim().toUpperCase(Locale.ROOT);
        String text = q == null || q.isBlank() ? null : q.trim().toLowerCase(Locale.ROOT);
        String countryFilter = country == null || country.isBlank() ? null
                : country.trim().toLowerCase(Locale.ROOT);
        String educationFilter = educationLevel == null || educationLevel.isBlank() ? null
                : educationLevel.trim().toLowerCase(Locale.ROOT);
        return findAllByOrderByFullNameAsc().stream()
                .filter(user -> roleFilter == null || user.getRole().name().equals(roleFilter))
                .filter(user -> statusFilter == null || user.getStatus().name().equals(statusFilter))
                .filter(user -> countryFilter == null || (user.getCountry() != null
                        && user.getCountry().toLowerCase(Locale.ROOT).equals(countryFilter)))
                .filter(user -> educationFilter == null || (user.getEducationLevel() != null
                        && user.getEducationLevel().toLowerCase(Locale.ROOT).equals(educationFilter)))
                .filter(user -> text == null
                        || user.getFullName().toLowerCase(Locale.ROOT).contains(text)
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(text))
                .toList();
    }
}
