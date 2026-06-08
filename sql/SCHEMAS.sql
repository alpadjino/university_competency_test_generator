BEGIN;

CREATE TABLE competencies (
    id SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL
);

CREATE TYPE question_category AS ENUM ('A', 'B', 'C');
CREATE TYPE question_type AS ENUM ('Closed', 'Open');
CREATE TYPE question_subtype AS ENUM ('One', 'Multiple', 'Matching', 'CorrectSequence', 'Addition', 'DetailedAnswer');

CREATE TYPE test_status AS ENUM ('in_progress', 'done');

CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    status test_status DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    files TEXT[]
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER,
    "text" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    category question_category NOT NULL,
    "type" question_type NOT NULL,
    subtype question_subtype NOT NULL,
    standard_answer TEXT,
    "order" INTEGER NOT NULL,
    options JSONB,

    CONSTRAINT fk_test
        FOREIGN KEY(test_id) 
        REFERENCES tests(id)
        ON DELETE CASCADE
);

CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    "text" TEXT NOT NULL,
    is_true BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE test_competencies (
    test_id INTEGER REFERENCES tests(id),
    competency_id INTEGER REFERENCES competencies(id),
    PRIMARY KEY (test_id, competency_id)
);

COMMIT;