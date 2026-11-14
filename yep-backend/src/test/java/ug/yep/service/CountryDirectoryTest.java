package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Locale;
import org.junit.jupiter.api.Test;

class CountryDirectoryTest {

    private final CountryDirectory directory = new CountryDirectory();

    @Test
    void listsEveryIsoCountry() {
        assertEquals(Locale.getISOCountries().length, directory.all().size());
    }

    @Test
    void africanCountriesComeFirst() {
        List<CountryDirectory.Country> all = directory.all();
        int lastAfrica = -1;
        int firstWorld = all.size();
        for (int index = 0; index < all.size(); index++) {
            if ("Africa".equals(all.get(index).region())) {
                lastAfrica = index;
            } else if (index < firstWorld) {
                firstWorld = index;
            }
        }
        assertTrue(lastAfrica >= 0);
        assertTrue(lastAfrica < firstWorld, "no non-African country may appear before an African one");
    }

    @Test
    void resolvesUgandaByCodeAndName() {
        CountryDirectory.Country uganda = directory.byCode("ug").orElseThrow();
        assertEquals("Uganda", uganda.name());
        assertEquals("+256", uganda.dialCode());
        assertEquals("UG", directory.byName("uganda").orElseThrow().code());
    }

    @Test
    void unknownCodesAreRejected() {
        assertFalse(directory.byCode("ZZ").isPresent());
        assertEquals("", directory.dialFor("ZZ"));
    }
}
