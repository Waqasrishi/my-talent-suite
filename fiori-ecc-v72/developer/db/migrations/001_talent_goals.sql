-- Goals, activities and pushes, each with its own unique ID and the employee it belongs to.
-- One sequence hands out the ids for goals and activities, so no two rows share a number.
CREATE SEQUENCE ts_id START 1001;

CREATE TABLE employees (
  employee_id text PRIMARY KEY,
  label       text NOT NULL,
  level       text NOT NULL,
  manager_id  text REFERENCES employees (employee_id) DEFERRABLE INITIALLY DEFERRED,
  note        text NOT NULL DEFAULT ''
);

CREATE TABLE goals (
  id                      bigint PRIMARY KEY,
  code                    text GENERATED ALWAYS AS ('G-' || lpad(id::text, 6, '0')) STORED,
  employee_id             text NOT NULL REFERENCES employees (employee_id),
  title                   text NOT NULL,
  description             text NOT NULL DEFAULT '',
  measure                 text NOT NULL DEFAULT '',
  due                     text NOT NULL DEFAULT '',
  weight                  integer CHECK (weight BETWEEN 0 AND 100),
  progress                integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status                  text NOT NULL DEFAULT 'att',
  status_text             text NOT NULL DEFAULT '',
  parent_title            text NOT NULL DEFAULT '',
  pushed_from_goal_id     bigint,
  pushed_from_employee_id text REFERENCES employees (employee_id),
  extra                   jsonb NOT NULL DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  updated_by              text
);
CREATE INDEX goals_employee ON goals (employee_id);
CREATE INDEX goals_pushed_from ON goals (pushed_from_goal_id);

CREATE TABLE activities (
  id          bigint PRIMARY KEY,
  code        text GENERATED ALWAYS AS ('A-' || lpad(id::text, 6, '0')) STORED,
  goal_id     bigint NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  employee_id text NOT NULL REFERENCES employees (employee_id),
  progress    integer NOT NULL CHECK (progress BETWEEN 0 AND 100),
  note        text NOT NULL,
  has_note    boolean NOT NULL DEFAULT false,
  done_on     text NOT NULL,
  files       jsonb NOT NULL DEFAULT '[]',
  position    integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activities_goal ON activities (goal_id);
CREATE INDEX activities_employee ON activities (employee_id);

CREATE TABLE pushes (
  id             bigserial PRIMARY KEY,
  goal_id        bigint NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  to_employee_id text NOT NULL REFERENCES employees (employee_id),
  progress       integer NOT NULL DEFAULT 0,
  note           text NOT NULL DEFAULT '',
  due            text NOT NULL DEFAULT '',
  updated_on     text NOT NULL DEFAULT '',
  position       integer NOT NULL,
  UNIQUE (goal_id, to_employee_id)
);

CREATE TABLE contributors (
  id          bigserial PRIMARY KEY,
  goal_id     bigint NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  employee_id text REFERENCES employees (employee_id),
  position    integer NOT NULL,
  data        jsonb NOT NULL
);
CREATE INDEX contributors_goal ON contributors (goal_id);

CREATE TABLE audit_log (
  id       bigserial PRIMARY KEY,
  goal_id  bigint NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  position integer NOT NULL,
  on_date  text NOT NULL,
  entry    text NOT NULL
);
CREATE INDEX audit_goal ON audit_log (goal_id);
