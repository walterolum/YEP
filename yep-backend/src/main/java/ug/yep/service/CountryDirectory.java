package ug.yep.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;

/**
 * The registration country list: every ISO country, African countries first, with the
 * dial codes used by the phone field. Names come from the JDK so there is no bundled
 * dataset to fall out of date; dial codes are only listed where the platform ships them
 * and the form lets a learner type a prefix for anything else.
 */
@Service
public class CountryDirectory {

    public record Country(String code, String name, String dialCode, String region) {
    }

    private static final Set<String> AFRICA = Set.of(
            "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "CI",
            "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR",
            "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN",
            "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW");

    private static final Map<String, String> DIAL = Map.ofEntries(
            // Africa
            Map.entry("DZ", "+213"), Map.entry("AO", "+244"), Map.entry("BJ", "+229"),
            Map.entry("BW", "+267"), Map.entry("BF", "+226"), Map.entry("BI", "+257"),
            Map.entry("CM", "+237"), Map.entry("CV", "+238"), Map.entry("CF", "+236"),
            Map.entry("TD", "+235"), Map.entry("KM", "+269"), Map.entry("CG", "+242"),
            Map.entry("CD", "+243"), Map.entry("CI", "+225"), Map.entry("DJ", "+253"),
            Map.entry("EG", "+20"), Map.entry("GQ", "+240"), Map.entry("ER", "+291"),
            Map.entry("SZ", "+268"), Map.entry("ET", "+251"), Map.entry("GA", "+241"),
            Map.entry("GM", "+220"), Map.entry("GH", "+233"), Map.entry("GN", "+224"),
            Map.entry("GW", "+245"), Map.entry("KE", "+254"), Map.entry("LS", "+266"),
            Map.entry("LR", "+231"), Map.entry("LY", "+218"), Map.entry("MG", "+261"),
            Map.entry("MW", "+265"), Map.entry("ML", "+223"), Map.entry("MR", "+222"),
            Map.entry("MU", "+230"), Map.entry("MA", "+212"), Map.entry("MZ", "+258"),
            Map.entry("NA", "+264"), Map.entry("NE", "+227"), Map.entry("NG", "+234"),
            Map.entry("RW", "+250"), Map.entry("ST", "+239"), Map.entry("SN", "+221"),
            Map.entry("SC", "+248"), Map.entry("SL", "+232"), Map.entry("SO", "+252"),
            Map.entry("ZA", "+27"), Map.entry("SS", "+211"), Map.entry("SD", "+249"),
            Map.entry("TZ", "+255"), Map.entry("TG", "+228"), Map.entry("TN", "+216"),
            Map.entry("UG", "+256"), Map.entry("ZM", "+260"), Map.entry("ZW", "+263"),
            // Diaspora and partner countries
            Map.entry("US", "+1"), Map.entry("CA", "+1"), Map.entry("GB", "+44"),
            Map.entry("IE", "+353"), Map.entry("FR", "+33"), Map.entry("DE", "+49"),
            Map.entry("IT", "+39"), Map.entry("ES", "+34"), Map.entry("PT", "+351"),
            Map.entry("NL", "+31"), Map.entry("BE", "+32"), Map.entry("LU", "+352"),
            Map.entry("CH", "+41"), Map.entry("AT", "+43"), Map.entry("SE", "+46"),
            Map.entry("NO", "+47"), Map.entry("DK", "+45"), Map.entry("FI", "+358"),
            Map.entry("IS", "+354"), Map.entry("PL", "+48"), Map.entry("CZ", "+420"),
            Map.entry("SK", "+421"), Map.entry("HU", "+36"), Map.entry("RO", "+40"),
            Map.entry("BG", "+359"), Map.entry("GR", "+30"), Map.entry("HR", "+385"),
            Map.entry("RS", "+381"), Map.entry("SI", "+386"), Map.entry("EE", "+372"),
            Map.entry("LV", "+371"), Map.entry("LT", "+370"), Map.entry("UA", "+380"),
            Map.entry("RU", "+7"), Map.entry("TR", "+90"), Map.entry("IL", "+972"),
            Map.entry("SA", "+966"), Map.entry("AE", "+971"), Map.entry("QA", "+974"),
            Map.entry("KW", "+965"), Map.entry("BH", "+973"), Map.entry("OM", "+968"),
            Map.entry("JO", "+962"), Map.entry("LB", "+961"), Map.entry("IQ", "+964"),
            Map.entry("IR", "+98"), Map.entry("PK", "+92"), Map.entry("IN", "+91"),
            Map.entry("BD", "+880"), Map.entry("LK", "+94"), Map.entry("NP", "+977"),
            Map.entry("MM", "+95"), Map.entry("TH", "+66"), Map.entry("VN", "+84"),
            Map.entry("KH", "+855"), Map.entry("LA", "+856"), Map.entry("MY", "+60"),
            Map.entry("SG", "+65"), Map.entry("ID", "+62"), Map.entry("PH", "+63"),
            Map.entry("CN", "+86"), Map.entry("JP", "+81"), Map.entry("KR", "+82"),
            Map.entry("AU", "+61"), Map.entry("NZ", "+64"), Map.entry("BR", "+55"),
            Map.entry("AR", "+54"), Map.entry("CL", "+56"), Map.entry("CO", "+57"),
            Map.entry("PE", "+51"), Map.entry("MX", "+52"), Map.entry("GT", "+502"),
            Map.entry("CR", "+506"), Map.entry("PA", "+507"), Map.entry("JM", "+1876"),
            Map.entry("TT", "+1868"), Map.entry("GY", "+592"), Map.entry("HT", "+509"));

    private final List<Country> countries;
    private final Map<String, Country> byCode;

    public CountryDirectory() {
        List<Country> list = new ArrayList<>();
        for (String code : Locale.getISOCountries()) {
            String name = new Locale.Builder().setRegion(code).build().getDisplayCountry(Locale.ENGLISH);
            if (name == null || name.isBlank()) {
                name = code;
            }
            list.add(new Country(code, name, DIAL.getOrDefault(code, ""),
                    AFRICA.contains(code) ? "Africa" : "World"));
        }
        list.sort(Comparator.comparing((Country country) -> !"Africa".equals(country.region()))
                .thenComparing(Country::name));
        this.countries = List.copyOf(list);
        Map<String, Country> lookup = new LinkedHashMap<>();
        this.countries.forEach(country -> lookup.put(country.code(), country));
        this.byCode = Map.copyOf(lookup);
    }

    public List<Country> all() {
        return countries;
    }

    public Optional<Country> byCode(String code) {
        return code == null || code.isBlank()
                ? Optional.empty() : Optional.ofNullable(byCode.get(code.trim().toUpperCase(Locale.ROOT)));
    }

    public Optional<Country> byName(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        String needle = name.trim().toLowerCase(Locale.ROOT);
        return countries.stream().filter(country -> country.name().toLowerCase(Locale.ROOT).equals(needle))
                .findFirst();
    }

    public String dialFor(String code) {
        return byCode(code).map(Country::dialCode).orElse("");
    }
}
