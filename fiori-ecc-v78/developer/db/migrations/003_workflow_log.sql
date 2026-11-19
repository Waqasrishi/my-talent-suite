-- The workflow log: who did what to which goal, and when. Rows are only ever added.
ALTER TABLE audit_log ADD COLUMN actor_employee_id text REFERENCES employees (employee_id);
ALTER TABLE audit_log ADD COLUMN action text NOT NULL DEFAULT 'event';
ALTER TABLE audit_log ADD COLUMN detail jsonb NOT NULL DEFAULT '{}';
ALTER TABLE audit_log ADD COLUMN occurred_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX audit_occurred ON audit_log (occurred_at DESC);
CREATE INDEX audit_actor ON audit_log (actor_employee_id);
