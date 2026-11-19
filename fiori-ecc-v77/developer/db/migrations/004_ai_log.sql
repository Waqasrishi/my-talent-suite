-- Every AI call: who asked, what for, what the model answered, and which suggestion the person took.
CREATE TABLE ai_log (
  id          bigserial PRIMARY KEY,
  employee_id text REFERENCES employees (employee_id),
  task        text NOT NULL,
  model       text NOT NULL,
  request     jsonb NOT NULL DEFAULT '{}',
  response    jsonb,
  status      text NOT NULL,
  latency_ms  integer,
  tokens      integer,
  accepted    text,
  asked_by    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_log_created ON ai_log (created_at DESC);
CREATE INDEX ai_log_employee ON ai_log (employee_id);
