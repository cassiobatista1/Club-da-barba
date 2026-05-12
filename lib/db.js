import { createClient } from '@libsql/client';

let _client = null;

function getDb() {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL || 'file:///tmp/loovi.db';
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  _client = createClient({ url, authToken });
  return _client;
}

export async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      tel       TEXT DEFAULT '',
      carro     TEXT DEFAULT '',
      cidade    TEXT DEFAULT '',
      status    TEXT DEFAULT 'Novo',
      origem    TEXT DEFAULT 'Outros',
      valor     REAL DEFAULT 0,
      followup  TEXT DEFAULT '',
      exec      TEXT DEFAULT 'Cássio',
      obs       TEXT DEFAULT '',
      created   TEXT DEFAULT (datetime('now'))
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vendas (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente  TEXT NOT NULL,
      data     TEXT NOT NULL,
      carro    TEXT DEFAULT '',
      plano    TEXT DEFAULT 'Completo',
      valor    REAL DEFAULT 0,
      origem   TEXT DEFAULT 'Outros',
      exec     TEXT DEFAULT 'Cássio',
      created  TEXT DEFAULT (datetime('now'))
    )
  `);
  return db;
}

export { getDb };
