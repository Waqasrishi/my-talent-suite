// The goals database. On Canvas it is the app's own Postgres (DATABASE_URL, migrations applied by the platform).
// On a laptop with no DATABASE_URL it is PGlite, a real Postgres in the process, kept in .data/ and migrated here.
import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const MIGRATIONS = join(import.meta.dirname, "db", "migrations");
let handle;

async function open() {
  if (process.env.DATABASE_URL) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
    return {
      query: async (sql, params) => (await pool.query(sql, params)).rows,
      tx: async (fn) => {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          const out = await fn(async (sql, params) => (await c.query(sql, params)).rows);
          await c.query("COMMIT");
          return out;
        } catch (e) { await c.query("ROLLBACK").catch(() => {}); throw e; } finally { c.release(); }
      },
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  await mkdir(join(import.meta.dirname, ".data"), { recursive: true });
  const lite = new PGlite(join(import.meta.dirname, ".data", "pg"));
  await lite.waitReady;
  const have = await lite.query("SELECT to_regclass('public.goals') AS t");
  if (!have.rows[0].t) {
    for (const f of (await readdir(MIGRATIONS)).filter((n) => n.endsWith(".sql")).sort()) {
      await lite.exec(await readFile(join(MIGRATIONS, f), "utf8"));
    }
  }
  return {
    query: async (sql, params) => (await lite.query(sql, params)).rows,
    tx: (fn) => lite.transaction((t) => fn(async (sql, params) => (await t.query(sql, params)).rows)),
  };
}

export const db = () => (handle ??= open());
