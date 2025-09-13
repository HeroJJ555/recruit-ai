-- Seed data for recruitment platform
-- This script adds sample data for testing and demonstration

-- Insert sample recruiters
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('anna.kowalska@techcorp.pl', '$2b$10$example_hash_1', 'Anna', 'Kowalska', '+48123456789', 'recruiter'),
('michal.nowak@startupxyz.pl', '$2b$10$example_hash_2', 'Michał', 'Nowak', '+48987654321', 'recruiter'),
('katarzyna.wisniewski@fintech.pl', '$2b$10$example_hash_3', 'Katarzyna', 'Wiśniewska', '+48555666777', 'recruiter');

-- Insert sample candidates
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('jan.kowalski@email.pl', '$2b$10$example_hash_4', 'Jan', 'Kowalski', '+48111222333', 'candidate'),
('maria.nowak@email.pl', '$2b$10$example_hash_5', 'Maria', 'Nowak', '+48444555666', 'candidate'),
('piotr.zielinski@email.pl', '$2b$10$example_hash_6', 'Piotr', 'Zieliński', '+48777888999', 'candidate');

-- Insert recruiter profiles
INSERT INTO recruiter_profiles (user_id, company_name, position, department, bio)
SELECT 
    u.id,
    CASE 
        WHEN u.email LIKE '%techcorp%' THEN 'TechCorp'
        WHEN u.email LIKE '%startupxyz%' THEN 'StartupXYZ'
        WHEN u.email LIKE '%fintech%' THEN 'FinTech Solutions'
    END,
    'Senior Recruiter',
    'Human Resources',
    'Doświadczony rekruter specjalizujący się w rekrutacji IT'
FROM users u WHERE u.role = 'recruiter';

-- Insert candidate profiles
INSERT INTO candidate_profiles (user_id, bio, location, salary_expectation_min, salary_expectation_max, availability, experience_level, skills, languages, education)
SELECT 
    u.id,
    'Doświadczony developer z pasją do nowoczesnych technologii',
    CASE 
        WHEN u.first_name = 'Jan' THEN 'Warszawa'
        WHEN u.first_name = 'Maria' THEN 'Kraków'
        ELSE 'Gdańsk'
    END,
    8000,
    15000,
    'immediately',
    CASE 
        WHEN u.first_name = 'Jan' THEN 'senior'
        WHEN u.first_name = 'Maria' THEN 'mid'
        ELSE 'junior'
    END,
    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    ARRAY['Polski (natywny)', 'Angielski (C1)'],
    'Magister Informatyki, Politechnika Warszawska'
FROM users u WHERE u.role = 'candidate';

-- Insert sample job postings
INSERT INTO job_postings (recruiter_id, title, description, requirements, responsibilities, location, salary_min, salary_max, employment_type, experience_level, skills_required, is_remote)
SELECT 
    r.id,
    'Senior Frontend Developer',
    'Poszukujemy doświadczonego Frontend Developera do pracy nad nowoczesnymi aplikacjami web.',
    'Minimum 5 lat doświadczenia w React, TypeScript, znajomość Next.js',
    'Rozwój aplikacji frontend, współpraca z zespołem backend, code review',
    'Warszawa',
    12000,
    18000,
    'Pełny etat',
    'senior',
    ARRAY['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    true
FROM users r WHERE r.role = 'recruiter' AND r.email LIKE '%techcorp%';

INSERT INTO job_postings (recruiter_id, title, description, requirements, responsibilities, location, salary_min, salary_max, employment_type, experience_level, skills_required, is_remote)
SELECT 
    r.id,
    'React Developer',
    'Dołącz do naszego dynamicznego zespołu i twórz innowacyjne rozwiązania.',
    'Minimum 2 lata doświadczenia w React, znajomość JavaScript ES6+',
    'Rozwój komponentów React, integracja z API, testowanie',
    'Kraków',
    8000,
    14000,
    'Pełny etat',
    'mid',
    ARRAY['React', 'JavaScript', 'Node.js', 'MongoDB'],
    false
FROM users r WHERE r.role = 'recruiter' AND r.email LIKE '%startupxyz%';

INSERT INTO job_postings (recruiter_id, title, description, requirements, responsibilities, location, salary_min, salary_max, employment_type, experience_level, skills_required, is_remote)
SELECT 
    r.id,
    'Full Stack Developer',
    'Poszukujemy Full Stack Developera do pracy nad platformą finansową.',
    'Doświadczenie w React i Node.js, znajomość baz danych',
    'Rozwój full-stack aplikacji, projektowanie API, optymalizacja',
    'Praca zdalna',
    10000,
    16000,
    'Kontrakt B2B',
    'mid',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS'],
    true
FROM users r WHERE r.role = 'recruiter' AND r.email LIKE '%fintech%';

-- Insert sample job applications
INSERT INTO job_applications (job_id, candidate_id, status, cover_letter, ai_match_score)
SELECT 
    j.id,
    c.id,
    CASE 
        WHEN c.first_name = 'Jan' THEN 'interview'
        WHEN c.first_name = 'Maria' THEN 'pending'
        ELSE 'reviewing'
    END,
    'Jestem bardzo zainteresowany tą pozycją i wierzę, że moje doświadczenie idealnie pasuje do Waszych potrzeb.',
    CASE 
        WHEN c.first_name = 'Jan' THEN 95
        WHEN c.first_name = 'Maria' THEN 88
        ELSE 82
    END
FROM job_postings j
CROSS JOIN users c
WHERE c.role = 'candidate'
LIMIT 6;

-- Insert sample AI analysis
INSERT INTO ai_analysis (candidate_id, job_id, analysis_type, analysis_data, confidence_score)
SELECT 
    c.id,
    j.id,
    'skill_match',
    jsonb_build_object(
        'matched_skills', ARRAY['React', 'TypeScript'],
        'missing_skills', ARRAY['AWS'],
        'experience_match', true,
        'location_match', true,
        'salary_match', true
    ),
    90
FROM users c
CROSS JOIN job_postings j
WHERE c.role = 'candidate'
LIMIT 3;
