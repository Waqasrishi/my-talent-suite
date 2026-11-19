-- Uploads now arrive in chunks: a file row exists from the start and is complete once every chunk is in.
ALTER TABLE files ADD COLUMN complete boolean NOT NULL DEFAULT true;
