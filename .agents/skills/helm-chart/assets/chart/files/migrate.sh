# Canvas's own migration runner (canvas/charts/app/templates/postgres.yaml), unchanged.
# Each pending file in its own transaction, ascending, recorded with its checksum. A file that
# already ran and has changed since is refused, not re-run: the fix is the next migration.
set -eu
for i in $(seq 1 60); do pg_isready -q -d "$DATABASE_URL" && break; sleep 5; done
q() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -qtA "$@"; }
q -c "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())"
for f in $(ls /migrations/*.sql | sort); do
  n=$(basename "$f"); sum=$(sha256sum "$f" | cut -d' ' -f1)
  had=$(q -c "SELECT checksum FROM schema_migrations WHERE name = '$n'")
  if [ -n "$had" ]; then
    [ "$had" = "$sum" ] || { echo "migration.edited: $n already ran and has changed since. Leave it as it was and add the next migration instead."; exit 1; }
    continue
  fi
  echo "applying $n"
  q -1 -f "$f" -c "INSERT INTO schema_migrations (name, checksum) VALUES ('$n', '$sum')" \
    || { echo "migration.failed: $n — the error above. Nothing from it was kept; the running version is untouched."; exit 1; }
done
echo "migrations up to date"
