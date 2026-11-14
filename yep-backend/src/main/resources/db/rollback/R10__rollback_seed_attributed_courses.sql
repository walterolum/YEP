-- R10 — manual rollback of V11. Run only with a backup of the yep database.
DELETE FROM lessons WHERE id BETWEEN 100 AND 139;
DELETE FROM modules WHERE id BETWEEN 100 AND 119;

DELETE FROM courses WHERE code IN ('MTH-APPLIED-L1', 'SFT-LEAD-L1', 'CRD-PLAN-L1', 'LIF-EVERYDAY-L1');
DELETE FROM career_paths WHERE slug IN ('applied-mathematics', 'leadership-essentials',
                                        'career-planning', 'everyday-life-skills');
DELETE FROM academies WHERE slug IN ('math-science', 'soft-skills-leadership',
                                     'career-development', 'life-skills');

UPDATE courses SET attribution_text = NULL, author = NULL, licence = NULL, licence_url = NULL,
    source_name = NULL, source_url = NULL;
