import { readFileSync } from 'node:fs'
import { teamName } from './logic.js'

function load(name) {
  return JSON.parse(readFileSync(new URL(`../content/${name}.json`, import.meta.url), 'utf8'))
}

async function upsertRow(db, table, id, rev, fields) {
  const existing = await db.get(`SELECT id, custom, seed_rev FROM ${table} WHERE id=?`, [id])
  if (!existing) {
    const cols = ['id', ...Object.keys(fields), 'custom', 'seed_rev']
    const values = [id, ...Object.values(fields), 0, rev]
    await db.run(
      `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
      values,
    )
    return
  }
  if (existing.custom) return
  if (existing.seed_rev >= rev) return
  const sets = Object.keys(fields).map((key) => `${key}=?`)
  await db.run(`UPDATE ${table} SET ${sets.join(',')}, seed_rev=? WHERE id=?`, [...Object.values(fields), rev, id])
}

export async function seed(db) {
  const questions = load('questions')
  const scenarios = load('scenarios')
  const objections = load('objections')
  const competitors = load('competitors')
  const tips = load('tips')
  for (const question of questions) {
    await upsertRow(db, 'questions', question.id, question.rev || 1, {
      vehicle: question.vehicle,
      category: question.category,
      skill: question.skill,
      prompt: question.prompt,
      choices: JSON.stringify(question.choices),
      answer: question.answer,
      explanation: question.explanation,
      bucket: question.bucket,
      active: 1,
    })
  }
  for (const scenario of scenarios) {
    await upsertRow(db, 'scenarios', scenario.id, scenario.rev || 1, {
      data: JSON.stringify(scenario),
      active: 1,
    })
  }
  for (const objection of objections) {
    await upsertRow(db, 'objections', objection.id, objection.rev || 1, {
      data: JSON.stringify(objection),
      active: 1,
    })
  }
  for (const rival of competitors) {
    await upsertRow(db, 'competitors', rival.id, rival.rev || 1, {
      data: JSON.stringify(rival),
      active: 1,
    })
  }
  for (const tip of tips) {
    const existing = await db.get('SELECT skill, custom, seed_rev FROM tips WHERE skill=?', [tip.skill])
    if (!existing) {
      await db.run('INSERT INTO tips (skill, data, custom, seed_rev) VALUES (?,?,0,1)', [tip.skill, JSON.stringify(tip)])
    } else if (!existing.custom && existing.seed_rev < 1) {
      await db.run('UPDATE tips SET data=?, seed_rev=1 WHERE skill=?', [JSON.stringify(tip), tip.skill])
    }
  }
  for (const team of ['kee', 'northline', 'tricity']) {
    const active = await db.get(`SELECT id FROM bosses WHERE team=? AND status='active'`, [team])
    if (!active) await spawnBoss(db, team)
  }
  const counts = await db.get('SELECT COUNT(*) AS n FROM questions')
  console.log(`Seed ready. ${counts.n} questions in ${db.dialect}. Teams: ${['kee', 'northline', 'tricity'].map(teamName).join(', ')}`)
}

const BOSSES = [
  { name: 'The Surrey Spreadsheet', taunt: 'I already screenshotted a cheaper one.', hp: 500 },
  { name: 'Auntie Reliability', taunt: 'We have always bought Toyota.', hp: 540 },
  { name: 'The Payment Wall', taunt: 'Say a number I can actually live with.', hp: 480 },
  { name: 'Whistler Chris', taunt: 'AWD is AWD. Impress me.', hp: 520 },
  { name: 'The Trade Ghost', taunt: 'You are going to lowball this car.', hp: 560 },
]

export async function spawnBoss(db, team) {
  const count = await db.get('SELECT COUNT(*) AS n FROM bosses WHERE team=?', [team])
  const pick = BOSSES[Number(count.n) % BOSSES.length]
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await db.run(
    `INSERT INTO bosses (id, team, name, taunt, hp, max_hp, status, created_at) VALUES (?,?,?,?,?,?, 'active', ?)`,
    [id, team, pick.name, pick.taunt, pick.hp, pick.hp, now],
  )
  return db.get('SELECT * FROM bosses WHERE id=?', [id])
}

export function bossCatalog() {
  return BOSSES
}
