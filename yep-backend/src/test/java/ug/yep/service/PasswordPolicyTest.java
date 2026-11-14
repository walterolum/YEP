package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import ug.yep.exception.BusinessRuleException;

class PasswordPolicyTest {

    @Test
    void scoresMixedPasswordsHigh() {
        assertEquals(4, PasswordPolicy.strength("Password123!"));
        assertEquals("Strong", PasswordPolicy.label(4));
    }

    @Test
    void scoresShortSingleClassPasswordsLow() {
        assertTrue(PasswordPolicy.strength("abcdefgh") <= 1);
        assertEquals(0, PasswordPolicy.strength(""));
    }

    @Test
    void commonPasswordsScoreZero() {
        assertEquals(0, PasswordPolicy.strength("password123"));
        assertEquals(0, PasswordPolicy.strength("PASSWORD123"));
    }

    @Test
    void validationRejectsShortCommonAndWeakPasswords() {
        assertThrows(BusinessRuleException.class, () -> PasswordPolicy.validate("short"));
        assertThrows(BusinessRuleException.class, () -> PasswordPolicy.validate("password123"));
        assertThrows(BusinessRuleException.class, () -> PasswordPolicy.validate("abcdefgh"));
        PasswordPolicy.validate("Password123!");
    }
}
