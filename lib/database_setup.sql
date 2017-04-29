--echo-all
/* first drop test tables from previous session so we have a clean database */
/* DROP SCHEMA public cascade; http://stackoverflow.com/a/13823560/1148249 */
CREATE SCHEMA IF NOT EXISTS public;
/* DROP DATABASE IF EXISTS test; */
/* CREATE DATABASE test; */
/* create the people table */
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  name VARCHAR(100) DEFAULT NULL,
  password VARCHAR(60) NOT NULL
);
/* insert a person into the people table if it does not already exist */
/* stackoverflow.com/questions/4069718/postgres-insert-if-does-not-exist-already */
INSERT INTO people (email, name, password)
  SELECT email, name, password FROM people
  UNION
  VALUES (
    'test@test.net',
    'Jimmy Tester',
    '$2a$12$OgPE9DUNM0KaSodSQVJvw.36GjolssAeO.dfi7a9cmc9KbQTDTj7W'
  )
  EXCEPT
  SELECT email, name, password FROM people;
/* sessions */
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(36), -- using UUID/Hash ensures session_id is "unguessable"
  person_id INTEGER NOT NULL REFERENCES people (id),
  start_timestamp INTEGER DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
  end_timestamp INTEGER DEFAULT null
);
-- DECLARE @myvar VARCHAR(36);

INSERT INTO sessions (session_id, person_id)
VALUES (
  (SELECT md5(random()::text)),
  '1'
);
/* Unique Constraint on Column: http://stackoverflow.com/a/7327598/1148249 */
CREATE UNIQUE INDEX IF NOT EXISTS unique_session_id ON sessions (session_id);

CREATE TABLE IF NOT EXISTS store (
  store_id SERIAL PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL REFERENCES sessions (session_id),
  person_id INTEGER REFERENCES people (id),
  created_timestamp INTEGER DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
  data jsonb
);

DO $$
DECLARE
  sid VARCHAR := (SELECT md5(random()::text));
BEGIN
  RAISE NOTICE 'Value of sid: %', sid;

  INSERT INTO sessions (session_id, person_id)
  VALUES (
    sid,
    '1'
  );

  INSERT INTO store (session_id, person_id, data)
  VALUES (
    sid,
    '1',
    '{"hello":"world"}'
  );
END $$;
