-- Files attached to activities. The bytes live on the app's disk (DATA_DIR); this row says what they are.
CREATE TABLE files (
  id          bigint PRIMARY KEY,
  name        text NOT NULL,
  size        integer NOT NULL CHECK (size >= 0),
  type        text NOT NULL DEFAULT 'application/octet-stream',
  uploaded_by text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
