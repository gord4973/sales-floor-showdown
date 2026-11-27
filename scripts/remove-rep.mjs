// Optional maintenance: remove one rep and all of their rows.
// No-op unless REMOVE_REP_ID is set (runs after `npm run build` on Render).
import pg from 'pg'

const repId = (process.env.REMOVE_REP_ID || '').trim()
const url = process.env.DATABASE_URL
if (!repId || !url) process.exit(0)

const ssl = /sslmode=require/i.test(url) || /\.render\.com/i.test(url) ? { rejectUnauthorized: false } : undefined
const client = new pg.Client({ connectionString: url, ssl })
try {
  await client.connect()
  await client.query('BEGIN')
  for (const table of ['sessions', 'badges', 'lightning_runs', 'walk_runs', 'pitch_runs', 'votes', 'boss_hits', 'boss_rewards', 'daily_plays', 'rounds', 'skill_log']) {
    await client.query(`DELETE FROM ${table} WHERE rep_id = $1`, [repId])
  }
  await client.query('DELETE FROM duels WHERE host_id = $1 OR opponent_id = $1', [repId])
  const result = await client.query('DELETE FROM reps WHERE id = $1', [repId])
  await client.query('COMMIT')
  console.log(`remove-rep: removed ${result.rowCount} rep(s) with id ${repId}`)
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  console.log(`remove-rep: skipped (${error.message})`)
} finally {
  await client.end().catch(() => {})
}
