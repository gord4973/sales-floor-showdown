import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import pg from 'pg'

function toPg(sql) {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

function wrapSqlite(sqlite) {
  return {
    dialect: 'sqlite',
    async all(sql, params = []) {
      return sqlite.prepare(sql).all(...params)
    },
    async get(sql, params = []) {
      return sqlite.prepare(sql).get(...params)
    },
    async run(sql, params = []) {
      const info = sqlite.prepare(sql).run(...params)
      return { changes: info.changes }
    },
  }
}

function wrapPg(pool) {
  return {
    dialect: 'postgres',
    async all(sql, params = []) {
      const result = await pool.query(toPg(sql), params)
      return result.rows
    },
    async get(sql, params = []) {
      const result = await pool.query(toPg(sql), params)
      return result.rows[0]
    },
    async run(sql, params = []) {
      const result = await pool.query(toPg(sql), params)
      return { changes: result.rowCount }
    },
  }
}

export async function openDatabase() {
  const url = process.env.DATABASE_URL
  if (url) {
    const ssl = /sslmode=require/i.test(url) || /\.render\.com/i.test(url) ? { rejectUnauthorized: false } : undefined
    const pool = new pg.Pool({ connectionString: url, ssl, max: 5 })
    const db = wrapPg(pool)
    await migrate(db)
    return db
  }
  const dir = path.resolve('data')
  fs.mkdirSync(dir, { recursive: true })
  const sqlite = new Database(path.join(dir, 'showdown.sqlite'))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('busy_timeout = 4000')
  const db = wrapSqlite(sqlite)
  await migrate(db)
  return db
}

async function migrate(db) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS reps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_key TEXT NOT NULL,
      team TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      pin_salt TEXT NOT NULL,
      outfit TEXT NOT NULL DEFAULT 'polo',
      showroom TEXT NOT NULL DEFAULT 'bay',
      xp INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL DEFAULT 'rep',
      daily_streak INTEGER NOT NULL DEFAULT 0,
      last_daily TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(name_key, team)
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS badges (
      rep_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at TEXT NOT NULL,
      PRIMARY KEY (rep_id, badge_id)
    )`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      vehicle TEXT,
      category TEXT,
      skill TEXT,
      prompt TEXT NOT NULL,
      choices TEXT NOT NULL,
      answer INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      bucket INTEGER NOT NULL DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 1,
      custom INTEGER NOT NULL DEFAULT 0,
      seed_rev INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      custom INTEGER NOT NULL DEFAULT 0,
      seed_rev INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS objections (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      custom INTEGER NOT NULL DEFAULT 0,
      seed_rev INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      custom INTEGER NOT NULL DEFAULT 0,
      seed_rev INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS tips (
      skill TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      custom INTEGER NOT NULL DEFAULT 0,
      seed_rev INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS lightning_runs (
      id TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL,
      qids TEXT NOT NULL,
      idx INTEGER NOT NULL,
      streak INTEGER NOT NULL,
      score INTEGER NOT NULL,
      xp INTEGER NOT NULL,
      round_id TEXT,
      question_started TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS walk_runs (
      id TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL,
      scenario_id TEXT NOT NULL,
      beat INTEGER NOT NULL,
      trust INTEGER NOT NULL,
      mood INTEGER NOT NULL,
      xp INTEGER NOT NULL,
      round_id TEXT,
      fatal INTEGER NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      closed INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS pitch_runs (
      id TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL,
      competitor_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      xp INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS duels (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      objection_id TEXT NOT NULL,
      host_id TEXT NOT NULL,
      opponent_id TEXT,
      host_choice INTEGER,
      opponent_choice INTEGER,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      vote_opened_at TEXT,
      closed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS votes (
      duel_id TEXT NOT NULL,
      rep_id TEXT NOT NULL,
      vote_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (duel_id, rep_id)
    )`,
    `CREATE TABLE IF NOT EXISTS bosses (
      id TEXT PRIMARY KEY,
      team TEXT NOT NULL,
      name TEXT NOT NULL,
      taunt TEXT NOT NULL,
      hp INTEGER NOT NULL,
      max_hp INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      defeated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS boss_hits (
      id TEXT PRIMARY KEY,
      boss_id TEXT NOT NULL,
      rep_id TEXT NOT NULL,
      objection_id TEXT NOT NULL,
      quality TEXT NOT NULL,
      damage INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS boss_rewards (
      boss_id TEXT NOT NULL,
      rep_id TEXT NOT NULL,
      xp INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (boss_id, rep_id)
    )`,
    `CREATE TABLE IF NOT EXISTS daily_plays (
      rep_id TEXT NOT NULL,
      day TEXT NOT NULL,
      guesses TEXT NOT NULL,
      solved INTEGER NOT NULL DEFAULT 0,
      xp INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (rep_id, day)
    )`,
    `CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL,
      team TEXT NOT NULL,
      mode TEXT NOT NULL,
      xp INTEGER NOT NULL,
      score INTEGER NOT NULL,
      summary TEXT NOT NULL,
      day TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS skill_log (
      id TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      hit INTEGER NOT NULL,
      mode TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
  ]
  for (const statement of statements) await db.run(statement)
}
