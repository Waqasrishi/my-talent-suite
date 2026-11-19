-- Deleting a goal hides it; the row, its activities and its workflow history stay, so the log is never lost.
ALTER TABLE goals ADD COLUMN deleted_at timestamptz;
ALTER TABLE goals ADD COLUMN deleted_by text;
CREATE INDEX goals_live ON goals (employee_id) WHERE deleted_at IS NULL;
