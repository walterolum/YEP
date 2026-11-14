-- V7 — the six academy groups required by the mission, with one starter
--      career path per group and starter courses.
--
-- V6 created Tech & Digital and the YEP Core course; this migration adds the
-- other five academies and fills out the catalogue. Content is data, not code:
-- administrators can rename, unpublish or extend any of it from the console.

INSERT INTO academies (name, slug, tagline, description, icon, sort_order, published) VALUES
 ('Business & Entrepreneurship', 'business-entrepreneurship',
  'Enterprise, finance, marketing and management',
  'Turn an idea into a registered, profitable and resilient business.', '📈', 20, 1),
 ('Agriculture & Agribusiness', 'agriculture-agribusiness',
  'Farming, value chains, agri-tech and food systems',
  'Practical farming and agribusiness skills for food security and income.', '🌱', 30, 1),
 ('Creative & Media', 'creative-media',
  'Design, content, film, audio and storytelling',
  'Create, publish and monetise professional digital content.', '🎨', 40, 1),
 ('Professional & Life Skills', 'professional-life-skills',
  'Communication, employability, wellbeing and citizenship',
  'The workplace and life skills every employer expects.', '🧠', 50, 1),
 ('Vocational & Green Skills', 'vocational-green-skills',
  'Trades, installation, repair and green economy skills',
  'Hands-on trades and green technologies for self-employment.', '🔧', 60, 1);

INSERT INTO career_paths (academy_id, title, slug, summary, icon, sort_order, published)
SELECT a.id, v.title, v.slug, v.summary, v.icon, v.sort_order, 1
FROM academies a
JOIN (
    SELECT 'tech-digital' AS academy_slug, 'Software Development' AS title,
           'software-development' AS slug,
           'Front-end, back-end and mobile foundations.' AS summary,
           '⌨️' AS icon, 20 AS sort_order
    UNION ALL SELECT 'business-entrepreneurship', 'Small Business Management',
           'small-business-management',
           'Start, finance and grow a small enterprise.', '💼', 10
    UNION ALL SELECT 'agriculture-agribusiness', 'Agripreneurship', 'agripreneurship',
           'Turn farming into a profitable, sustainable business.', '🚜', 10
    UNION ALL SELECT 'creative-media', 'Digital Content Creation', 'digital-content-creation',
           'Create, edit and publish professional digital content.', '🎬', 10
    UNION ALL SELECT 'professional-life-skills', 'Employability Essentials',
           'employability-essentials',
           'CVs, interviews, communication and workplace behaviour.', '🤝', 10
    UNION ALL SELECT 'vocational-green-skills', 'Solar Installation', 'solar-installation',
           'Design, install and maintain small solar systems.', '☀️', 10
) v ON v.academy_slug = a.slug;

INSERT INTO courses (career_path_id, code, title, slug, summary, description, level, duration_hours, icon, sort_order, published)
SELECT p.id, v.code, v.title, v.slug, v.summary, v.description, v.level, v.hours, v.icon, v.sort_order, 1
FROM career_paths p
JOIN (
    SELECT 'software-development' AS path_slug, 'TECH-WEB-L1' AS code,
           'Web Development Fundamentals' AS title, 'web-development-fundamentals' AS slug,
           'HTML, CSS, JavaScript and the web platform.' AS summary,
           'Build and publish your first responsive website, then add interactivity with JavaScript.'
             AS description,
           1 AS level, 40 AS hours, '🌐' AS icon, 20 AS sort_order
    UNION ALL SELECT 'small-business-management', 'BUS-SBM-L1', 'Starting a Small Business',
           'starting-a-small-business', 'Ideation, registration, pricing and cash flow.',
           'Validate an idea, register the business, price products and keep simple records.', 1, 30, '🏪', 10
    UNION ALL SELECT 'small-business-management', 'BUS-SBM-L2', 'Growing a Small Business',
           'growing-a-small-business', 'Customers, marketing, records and financing.',
           'Find customers, market on a budget, manage records and access finance.', 2, 30, '📊', 20
    UNION ALL SELECT 'agripreneurship', 'AGR-AGRI-L1', 'Farm Business Basics',
           'farm-business-basics', 'Planning, inputs, yields and unit economics.',
           'Plan a season, cost inputs, estimate yields and calculate profit per acre.', 1, 30, '🌾', 10
    UNION ALL SELECT 'agripreneurship', 'AGR-AGRI-L2', 'Agri Value Chains',
           'agri-value-chains', 'Storage, processing, aggregation and market access.',
           'Reduce post-harvest loss and reach better markets through processing and aggregation.', 2, 30, '🚚', 20
    UNION ALL SELECT 'digital-content-creation', 'CRE-CONTENT-L1', 'Content Production',
           'content-production', 'Story, shooting, editing and publishing.',
           'Plan a story, shoot with a phone, edit and publish to the right platform.', 1, 30, '📷', 10
    UNION ALL SELECT 'digital-content-creation', 'CRE-CONTENT-L2', 'Brand and Audience',
           'brand-and-audience', 'Brand systems, analytics and monetisation.',
           'Build a consistent brand, read analytics and earn from an audience.', 2, 30, '📣', 20
    UNION ALL SELECT 'employability-essentials', 'PRO-EMP-L1', 'Work Readiness',
           'work-readiness', 'CV, cover letter, interview and workplace norms.',
           'Write a strong CV, prepare for interviews and behave professionally at work.', 1, 20, '📄', 10
    UNION ALL SELECT 'solar-installation', 'VOC-SOLAR-L1', 'Solar PV Basics',
           'solar-pv-basics', 'Components, safety, sizing and installation.',
           'Identify components, work safely, size a small system and install it correctly.', 1, 40, '🔆', 10
    UNION ALL SELECT 'solar-installation', 'VOC-SOLAR-L2', 'Solar Maintenance',
           'solar-maintenance', 'Testing, fault-finding and customer handover.',
           'Test panels, batteries and inverters, diagnose faults and hand over to a customer.', 2, 30, '🛠️', 20
) v ON v.path_slug = p.slug;
