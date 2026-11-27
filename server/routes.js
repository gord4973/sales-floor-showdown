import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { readFileSync } from 'node:fs'
import {
  BADGES,
  OUTFITS,
  SHOWROOMS,
  SKILL_LABELS,
  TEAMS,
  TEAM_IDS,
  bossDamage,
  duelXp,
  levelFor,
  monthKey,
  pacificDay,
  prevDay,
  rankFor,
  rankProgress,
  roomCode,
  rotationBucket,
  scoreLightning,
  scorePitch,
  shuffle,
  teamName,
  walkPoints,
  wordForDay,
  wordleMarks,
} from './logic.js'
import { spawnBoss } from './seed.js'

const words = JSON.parse(readFileSync(new URL('../content/words.json', import.meta.url), 'utf8'))

function now() {
  return new Date().toISOString()
}
function id() {
  return crypto.randomUUID()
}
function fail(status, message) {
  const error = new Error(message)
  error.status = status
  error.expose = true
  throw error
}
function hashPin(pin, salt = randomBytes(16).toString('hex')) {
  return { hash: scryptSync(pin, salt, 32).toString('hex'), salt }
}
function verifyPin(pin, hash, salt) {
  const got = scryptSync(pin, salt, 32)
  const expected = Buffer.from(hash, 'hex')
  return got.length === expected.length && timingSafeEqual(got, expected)
}
function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD
  if (process.env.NODE_ENV === 'production') return null
  return 'showdown'
}
const attempts = new Map()
function rateLimited(ip) {
  const stamp = Date.now()
  const recent = (attempts.get(ip) || []).filter((item) => stamp - item < 60_000)
  if (recent.length >= 12) return true
  recent.push(stamp)
  attempts.set(ip, recent)
  return false
}

export function mount(app, db) {
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

  async function repFrom(req) {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return null
    const session = await db.get('SELECT * FROM sessions WHERE token=?', [token])
    if (!session) return null
    return db.get('SELECT * FROM reps WHERE id=?', [session.rep_id])
  }
  async function requireRep(req) {
    const rep = await repFrom(req)
    if (!rep) fail(401, 'Sign in first.')
    return rep
  }
  async function adminFrom(req) {
    const token = req.headers['x-admin-token']
    if (!token) return null
    return db.get('SELECT token FROM admin_sessions WHERE token=?', [token])
  }
  async function requireAdmin(req) {
    const row = await adminFrom(req)
    if (!row) fail(401, 'Manager password required.')
    return row
  }

  async function earn(repId, badgeId) {
    if (!BADGES[badgeId]) return null
    const existing = await db.get('SELECT badge_id FROM badges WHERE rep_id=? AND badge_id=?', [repId, badgeId])
    if (existing) return null
    await db.run('INSERT INTO badges (rep_id, badge_id, earned_at) VALUES (?,?,?)', [repId, badgeId, now()])
    return badgeId
  }

  async function coachingFor(repId) {
    const rows = await db.all('SELECT skill, SUM(hit) AS hits, COUNT(*) AS n FROM skill_log WHERE rep_id=? GROUP BY skill', [repId])
    let worst = null
    for (const row of rows) {
      const hits = Number(row.hits)
      const n = Number(row.n)
      if (n < 2) continue
      const accuracy = hits / n
      if (!worst || accuracy < worst.accuracy) worst = { skill: row.skill, accuracy, n }
    }
    const skill = worst?.skill || 'discovery'
    const tipRow = await db.get('SELECT data FROM tips WHERE skill=?', [skill])
    const tip = tipRow ? JSON.parse(tipRow.data) : null
    return {
      skill,
      label: SKILL_LABELS[skill] || skill,
      accuracy: worst ? Math.round(worst.accuracy * 100) : null,
      attempts: worst?.n || 0,
      headline: worst
        ? `You give up the most ground on ${SKILL_LABELS[skill] || skill}.`
        : 'Play a few more rounds and the floor will show your weak spot.',
      tip,
    }
  }

  async function grant(rep, { xp = 0, score = 0, mode, summary, skills = [], roundId = null, badges = [] }) {
    if (xp) await db.run('UPDATE reps SET xp = xp + ? WHERE id=?', [xp, rep.id])
    let usedRound = roundId
    if (!usedRound) {
      usedRound = id()
      await db.run(
        'INSERT INTO rounds (id, rep_id, team, mode, xp, score, summary, day, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [usedRound, rep.id, rep.team, mode, xp, score, summary, pacificDay(), now()],
      )
    } else if (xp || score || summary) {
      await db.run('UPDATE rounds SET xp = xp + ?, score = score + ?, summary=? WHERE id=?', [xp, score, summary, usedRound])
    }
    for (const skill of skills) {
      await db.run('INSERT INTO skill_log (id, rep_id, skill, hit, mode, created_at) VALUES (?,?,?,?,?,?)', [
        id(),
        rep.id,
        skill.skill,
        skill.hit ? 1 : 0,
        mode,
        now(),
      ])
    }
    const fresh = await db.get('SELECT * FROM reps WHERE id=?', [rep.id])
    const earned = []
    for (const badge of badges) {
      const got = await earn(rep.id, badge)
      if (got) earned.push(got)
    }
    if (rankFor(fresh.xp) === 'Legend') {
      const got = await earn(rep.id, 'legend')
      if (got) earned.push(got)
    }
    return { fresh, roundId: usedRound, earned }
  }

  async function present(rep) {
    const badges = await db.all('SELECT badge_id FROM badges WHERE rep_id=? ORDER BY earned_at', [rep.id])
    const season = monthKey(pacificDay())
    const seasonRow = await db.get('SELECT COALESCE(SUM(xp),0) AS xp FROM rounds WHERE rep_id=? AND day LIKE ?', [rep.id, `${season}%`])
    const mates = await db.all(
      `SELECT id, COALESCE((SELECT SUM(xp) FROM rounds WHERE rep_id=reps.id AND day LIKE ?),0) AS season_xp
       FROM reps WHERE team=?`,
      [`${season}%`, rep.team],
    )
    const ordered = mates
      .map((mate) => ({ id: mate.id, seasonXp: Number(mate.season_xp) }))
      .sort((a, b) => b.seasonXp - a.seasonXp)
    const place = ordered.findIndex((mate) => mate.id === rep.id) + 1
    return {
      id: rep.id,
      name: rep.name,
      team: rep.team,
      teamName: teamName(rep.team),
      xp: rep.xp,
      seasonXp: Number(seasonRow.xp),
      place,
      teamSize: ordered.length,
      ...rankProgress(rep.xp),
      level: levelFor(rep.xp),
      outfit: rep.outfit,
      showroom: rep.showroom,
      role: rep.role,
      streak: rep.daily_streak,
      badges: badges.map((badge) => ({ id: badge.badge_id, ...BADGES[badge.badge_id] })),
      outfits: OUTFITS.map((item) => ({ ...item, unlocked: rep.xp >= item.xp })),
      showrooms: SHOWROOMS.map((item) => ({ ...item, unlocked: rep.xp >= item.xp })),
    }
  }

  app.get('/api/health', wrap(async (_req, res) => {
    const row = await db.get('SELECT COUNT(*) AS n FROM questions WHERE active=1')
    res.json({ ok: true, questions: Number(row.n), dialect: db.dialect, bucket: rotationBucket() })
  }))

  app.get('/api/meta', wrap(async (_req, res) => {
    res.json({
      teams: TEAMS,
      ranks: [
        { name: 'Greeter', min: 0 },
        { name: 'Closer', min: 300 },
        { name: 'Pro', min: 900 },
        { name: 'Legend', min: 2500 },
      ],
      skills: SKILL_LABELS,
      badges: BADGES,
    })
  }))

  app.post('/api/auth', wrap(async (req, res) => {
    if (rateLimited(req.ip || 'local')) fail(429, 'Too many tries. Give it a minute.')
    const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ')
    const team = String(req.body?.team || '')
    const pin = String(req.body?.pin || '')
    if (!/^[A-Za-z][A-Za-z .'-]{1,22}$/.test(name)) fail(400, 'Use a first and last name, letters only.')
    if (!TEAM_IDS.includes(team)) fail(400, 'Pick Kee, Northline, or Tricity Retail.')
    if (!/^\d{4}$/.test(pin)) fail(400, 'PIN is four digits.')
    const nameKey = name.toLowerCase()
    let rep = await db.get('SELECT * FROM reps WHERE name_key=? AND team=?', [nameKey, team])
    let created = false
    if (!rep) {
      const { hash, salt } = hashPin(pin)
      const repId = id()
      await db.run(
        'INSERT INTO reps (id, name, name_key, team, pin_hash, pin_salt, created_at) VALUES (?,?,?,?,?,?,?)',
        [repId, name, nameKey, team, hash, salt, now()],
      )
      rep = await db.get('SELECT * FROM reps WHERE id=?', [repId])
      created = true
    } else if (!verifyPin(pin, rep.pin_hash, rep.pin_salt)) {
      fail(401, 'That PIN does not match this rep on this team.')
    }
    const token = randomBytes(24).toString('hex')
    await db.run('INSERT INTO sessions (token, rep_id, created_at) VALUES (?,?,?)', [token, rep.id, now()])
    res.json({ token, created, rep: await present(rep) })
  }))

  app.get('/api/me', wrap(async (req, res) => {
    res.json({ rep: await present(await requireRep(req)) })
  }))

  app.post('/api/me/equip', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const outfit = OUTFITS.find((item) => item.id === req.body?.outfit)
    const showroom = SHOWROOMS.find((item) => item.id === req.body?.showroom)
    if (req.body?.outfit) {
      if (!outfit) fail(400, 'Unknown outfit.')
      if (rep.xp < outfit.xp) fail(400, `${outfit.name} unlocks at ${outfit.xp} XP.`)
      await db.run('UPDATE reps SET outfit=? WHERE id=?', [outfit.id, rep.id])
    }
    if (req.body?.showroom) {
      if (!showroom) fail(400, 'Unknown bay.')
      if (rep.xp < showroom.xp) fail(400, `${showroom.name} unlocks at ${showroom.xp} XP.`)
      await db.run('UPDATE reps SET showroom=? WHERE id=?', [showroom.id, rep.id])
    }
    const fresh = await db.get('SELECT * FROM reps WHERE id=?', [rep.id])
    res.json({ rep: await present(fresh) })
  }))

  app.post('/api/lightning/start', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const bucket = rotationBucket()
    const pool = await db.all('SELECT * FROM questions WHERE active=1 AND (bucket=0 OR bucket=?)', [bucket])
    const past = await db.all('SELECT qids FROM lightning_runs WHERE rep_id=? ORDER BY started_at DESC LIMIT 3', [rep.id])
    const avoid = new Set(past.flatMap((row) => JSON.parse(row.qids)))
    let source = pool.filter((question) => !avoid.has(question.id))
    if (source.length < 10) source = pool
    if (source.length < 4) fail(500, 'The question deck is empty. Ask a manager to seed it.')
    const picked = shuffle(source).slice(0, Math.min(10, source.length))
    const runId = id()
    const started = now()
    await db.run(
      'INSERT INTO lightning_runs (id, rep_id, qids, idx, streak, score, xp, question_started, done, started_at) VALUES (?,?,?,0,0,0,0,?,0,?)',
      [runId, rep.id, JSON.stringify(picked.map((question) => question.id)), started, started],
    )
    const first = picked[0]
    res.json({
      runId,
      index: 0,
      total: picked.length,
      streak: 0,
      score: 0,
      xp: 0,
      bucket,
      seconds: 15,
      question: { id: first.id, vehicle: first.vehicle, category: first.category, skill: first.skill, skillLabel: SKILL_LABELS[first.skill], prompt: first.prompt, choices: JSON.parse(first.choices) },
    })
  }))

  app.post('/api/lightning/answer', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const run = await db.get('SELECT * FROM lightning_runs WHERE id=? AND rep_id=?', [req.body?.runId, rep.id])
    if (!run || run.done) fail(400, 'That round is already over.')
    const qids = JSON.parse(run.qids)
    const question = await db.get('SELECT * FROM questions WHERE id=?', [qids[run.idx]])
    const elapsed = Date.now() - Date.parse(run.question_started)
    const choice = Number(req.body?.choice)
    const correct = choice === Number(question.answer)
    const scored = scoreLightning({ correct, streak: run.streak, elapsedMs: elapsed })
    const summary = `${question.vehicle}: ${scored.skillHit ? 'clean' : 'miss'}`
    const granted = await grant(rep, {
      xp: scored.xp,
      score: scored.points,
      mode: 'lightning',
      summary,
      roundId: run.round_id,
      skills: [{ skill: question.skill, hit: scored.skillHit }],
      badges: [scored.multiplier >= 4 ? 'on-fire' : null, scored.multiplier >= 3 ? 'combo' : null].filter(Boolean),
    })
    const nextIndex = run.idx + 1
    const done = nextIndex >= qids.length
    await db.run(
      'UPDATE lightning_runs SET idx=?, streak=?, score=?, xp=?, round_id=?, question_started=?, done=? WHERE id=?',
      [nextIndex, scored.streak, run.score + scored.points, run.xp + scored.xp, granted.roundId, now(), done ? 1 : 0, run.id],
    )
    let next = null
    if (!done) {
      const upcoming = await db.get('SELECT * FROM questions WHERE id=?', [qids[nextIndex]])
      next = {
        id: upcoming.id,
        vehicle: upcoming.vehicle,
        category: upcoming.category,
        skill: upcoming.skill,
        skillLabel: SKILL_LABELS[upcoming.skill],
        prompt: upcoming.prompt,
        choices: JSON.parse(upcoming.choices),
      }
    }
    if (done) {
      const fin = await grant(granted.fresh, { mode: 'lightning', summary: 'Lightning round complete', roundId: granted.roundId, badges: ['first-light'] })
      granted.earned.push(...fin.earned)
      granted.fresh = fin.fresh
    }
    res.json({
      correct: scored.skillHit,
      timedOut: scored.timedOut,
      answer: Number(question.answer),
      explanation: question.explanation,
      points: scored.points,
      xp: scored.xp,
      multiplier: scored.multiplier,
      streak: scored.streak,
      score: run.score + scored.points,
      totalXp: run.xp + scored.xp,
      skill: question.skill,
      skillLabel: SKILL_LABELS[question.skill],
      done,
      next,
      newBadges: granted.earned.map((badge) => ({ id: badge, ...BADGES[badge] })),
      rep: await present(granted.fresh),
      coaching: done ? await coachingFor(rep.id) : null,
    })
  }))

  app.get('/api/scenarios', wrap(async (req, res) => {
    await requireRep(req)
    const rows = await db.all('SELECT data FROM scenarios WHERE active=1')
    res.json({
      scenarios: rows.map((row) => {
        const data = JSON.parse(row.data)
        return { id: data.id, title: data.title, tag: data.tag, customer: data.customer, role: data.role, budget: data.budget, looking: data.looking, accent: data.accent }
      }),
    })
  }))

  app.post('/api/walk/start', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const row = await db.get('SELECT data FROM scenarios WHERE id=? AND active=1', [req.body?.scenarioId])
    if (!row) fail(404, 'That customer already left.')
    const scenario = JSON.parse(row.data)
    const runId = id()
    await db.run(
      'INSERT INTO walk_runs (id, rep_id, scenario_id, beat, trust, mood, xp, started_at) VALUES (?,?,?,?,?,?,0,?)',
      [runId, rep.id, scenario.id, 0, scenario.trust, scenario.mood, now()],
    )
    res.json({ runId, ...presentBeat(scenario, 0, scenario.trust, scenario.mood) })
  }))

  app.post('/api/walk/choose', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const run = await db.get('SELECT * FROM walk_runs WHERE id=? AND rep_id=?', [req.body?.runId, rep.id])
    if (!run || run.done) fail(400, 'That conversation is over.')
    const scenario = JSON.parse((await db.get('SELECT data FROM scenarios WHERE id=?', [run.scenario_id])).data)
    const beat = scenario.beats[run.beat]
    const choice = beat.choices[Number(req.body?.choice)]
    if (!choice) fail(400, 'Pick a response.')
    const points = walkPoints(choice.quality)
    const trust = clamp(run.trust + choice.trust)
    const mood = clamp(run.mood + choice.mood)
    const fatal = run.fatal || choice.fatal ? 1 : 0
    const granted = await grant(rep, {
      xp: points.xp,
      score: points.points,
      mode: 'walk',
      summary: `${scenario.customer}: ${choice.quality}`,
      roundId: run.round_id,
      skills: [{ skill: choice.skill, hit: points.hit && !choice.fatal }],
    })
    const last = run.beat + 1 >= scenario.beats.length
    let won = false
    let bonus = null
    if (last) {
      won = !fatal && trust >= 64 && choice.quality !== 'poor'
      if (won) {
        bonus = await grant(granted.fresh, {
          xp: 28,
          score: 300,
          mode: 'walk',
          summary: `Keys across to ${scenario.customer}`,
          roundId: granted.roundId,
          skills: [{ skill: 'close', hit: true }],
          badges: ['first-deal'],
        })
      }
    }
    await db.run('UPDATE walk_runs SET beat=?, trust=?, mood=?, xp=?, round_id=?, fatal=?, done=?, closed=? WHERE id=?', [
      run.beat + 1,
      trust,
      mood,
      run.xp + points.xp + (won ? 28 : 0),
      granted.roundId,
      fatal,
      last ? 1 : 0,
      won ? 1 : 0,
      run.id,
    ])
    const fresh = bonus?.fresh || granted.fresh
    const earned = [...granted.earned, ...(bonus?.earned || [])]
    res.json({
      reply: choice.reply,
      quality: choice.quality,
      trust,
      mood,
      points: points.points + (won ? 300 : 0),
      xp: points.xp + (won ? 28 : 0),
      skill: choice.skill,
      skillLabel: SKILL_LABELS[choice.skill],
      fatal: Boolean(fatal),
      done: last,
      won,
      hidden: last ? scenario.hidden : null,
      recommend: last ? scenario.recommend : null,
      customer: scenario.customer,
      next: last ? null : presentBeat(scenario, run.beat + 1, trust, mood),
      newBadges: earned.map((badge) => ({ id: badge, ...BADGES[badge] })),
      rep: await present(fresh),
      coaching: last ? await coachingFor(rep.id) : null,
    })
  }))

  app.get('/api/duels', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const cutoff = new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    const rows = await db.all(`SELECT * FROM duels WHERE status!='closed' AND created_at>? ORDER BY created_at DESC LIMIT 20`, [cutoff])
    const duels = []
    for (const duel of rows) duels.push(await presentDuel(duel, rep.id, false))
    res.json({ duels })
  }))

  app.post('/api/duels', wrap(async (req, res) => {
    const rep = await requireRep(req)
    let objection
    if (req.body?.objectionId) objection = await db.get('SELECT * FROM objections WHERE id=? AND active=1', [req.body.objectionId])
    if (!objection) {
      const rows = await db.all('SELECT * FROM objections WHERE active=1')
      objection = shuffle(rows)[0]
    }
    if (!objection) fail(500, 'No objections in the deck.')
    let code = roomCode()
    for (let i = 0; i < 5; i++) {
      const clash = await db.get('SELECT id FROM duels WHERE code=? AND status!=?', [code, 'closed'])
      if (!clash) break
      code = roomCode()
    }
    const duelId = id()
    await db.run(
      'INSERT INTO duels (id, code, objection_id, host_id, status, created_at) VALUES (?,?,?,?,?,?)',
      [duelId, code, objection.id, rep.id, 'lobby', now()],
    )
    const duel = await db.get('SELECT * FROM duels WHERE id=?', [duelId])
    res.json({ duel: await presentDuel(duel, rep.id, false) })
  }))

  app.get('/api/duels/:id', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const duel = await db.get('SELECT * FROM duels WHERE id=? OR code=?', [req.params.id, String(req.params.id).toUpperCase()])
    if (!duel) fail(404, 'That duel is gone.')
    res.json({ duel: await presentDuel(duel, rep.id, duel.status === 'closed') })
  }))

  app.post('/api/duels/:id/join', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const duel = await findDuel(req.params.id)
    if (duel.status !== 'lobby') fail(400, 'The floor is already voting.')
    if (duel.host_id === rep.id) fail(400, 'You are already the host.')
    if (duel.opponent_id) fail(400, 'Someone already took the other side.')
    await db.run('UPDATE duels SET opponent_id=? WHERE id=?', [rep.id, duel.id])
    const fresh = await db.get('SELECT * FROM duels WHERE id=?', [duel.id])
    res.json({ duel: await presentDuel(fresh, rep.id, false) })
  }))

  app.post('/api/duels/:id/answer', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const duel = await findDuel(req.params.id)
    if (duel.status === 'closed') fail(400, 'That duel is already revealed.')
    if (req.body?.openVote && rep.id === duel.host_id && duel.host_choice !== null && duel.host_choice !== undefined) {
      await db.run(`UPDATE duels SET status='voting', vote_opened_at=? WHERE id=? AND status='lobby'`, [now(), duel.id])
      const opened = await db.get('SELECT * FROM duels WHERE id=?', [duel.id])
      res.json({ duel: await presentDuel(opened, rep.id, false) })
      return
    }
    const choice = Number(req.body?.choice)
    if (!Number.isInteger(choice) || choice < 0 || choice > 3) fail(400, 'Pick a response.')
    if (rep.id === duel.host_id) {
      if (duel.host_choice !== null && duel.host_choice !== undefined) fail(400, 'You already locked a response.')
      await db.run('UPDATE duels SET host_choice=? WHERE id=?', [choice, duel.id])
    } else if (rep.id === duel.opponent_id) {
      if (duel.opponent_choice !== null && duel.opponent_choice !== undefined) fail(400, 'You already locked a response.')
      await db.run('UPDATE duels SET opponent_choice=? WHERE id=?', [choice, duel.id])
    } else fail(403, 'Join the duel before you answer.')
    let fresh = await db.get('SELECT * FROM duels WHERE id=?', [duel.id])
    const hostLocked = fresh.host_choice !== null && fresh.host_choice !== undefined
    const opponentLocked = fresh.opponent_id && fresh.opponent_choice !== null && fresh.opponent_choice !== undefined
    const open = req.body?.openVote && rep.id === fresh.host_id && hostLocked
    if ((hostLocked && opponentLocked) || open) {
      await db.run(`UPDATE duels SET status='voting', vote_opened_at=? WHERE id=?`, [now(), fresh.id])
      fresh = await db.get('SELECT * FROM duels WHERE id=?', [fresh.id])
    }
    res.json({ duel: await presentDuel(fresh, rep.id, false) })
  }))

  app.post('/api/duels/:id/vote', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const duel = await findDuel(req.params.id)
    if (duel.status !== 'voting') fail(400, 'Voting is not open yet.')
    if (rep.id === duel.host_id || rep.id === duel.opponent_id) fail(400, 'Duelists do not vote on their own objection.')
    const key = String(req.body?.key ?? '')
    if (!key) fail(400, 'Pick a side.')
    await db.run(
      'INSERT INTO votes (duel_id, rep_id, vote_key, created_at) VALUES (?,?,?,?) ON CONFLICT(duel_id, rep_id) DO UPDATE SET vote_key=?, created_at=?',
      [duel.id, rep.id, key, now(), key, now()],
    )
    const earned = []
    const voice = await earn(rep.id, 'voice')
    if (voice) earned.push(voice)
    res.json({ duel: await presentDuel(await db.get('SELECT * FROM duels WHERE id=?', [duel.id]), rep.id, false), newBadges: earned.map((badge) => ({ id: badge, ...BADGES[badge] })) })
  }))

  app.post('/api/duels/:id/reveal', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const duel = await findDuel(req.params.id)
    if (duel.status === 'closed') {
      res.json({ duel: await presentDuel(duel, rep.id, true) })
      return
    }
    if (duel.status !== 'voting') fail(400, 'Open the floor vote before the reveal.')
    if (rep.id !== duel.host_id && rep.id !== duel.opponent_id) fail(403, 'A duelist reveals the card.')
    const data = JSON.parse((await db.get('SELECT data FROM objections WHERE id=?', [duel.objection_id])).data)
    const bestIndex = data.responses.findIndex((item) => item.quality === 'best')
    const votes = await db.all('SELECT * FROM votes WHERE duel_id=?', [duel.id])
    const mode = voteMode(duel)
    const hostQuality = data.responses[duel.host_choice]?.quality
    const opponentQuality = duel.opponent_choice === null || duel.opponent_choice === undefined ? null : data.responses[duel.opponent_choice]?.quality
    async function pay(personId, quality, votesFor, votesAgainst) {
      if (!personId || quality == null) return []
      let xp = duelXp(quality)
      if (votesFor > votesAgainst && quality !== 'poor') xp += 15
      const person = await db.get('SELECT * FROM reps WHERE id=?', [personId])
      const granted = await grant(person, {
        xp,
        score: xp * 10,
        mode: 'duel',
        summary: `${data.customer.slice(0, 48)}`,
        skills: [{ skill: data.skill || 'objection', hit: quality === 'best' }],
        badges: quality === 'best' ? ['diplomat'] : [],
      })
      return granted.earned
    }
    const hostVotes = votes.filter((vote) => vote.vote_key === 'host').length
    const opponentVotes = votes.filter((vote) => vote.vote_key === 'opponent').length
    const earned = []
    if (duel.host_choice !== null && duel.host_choice !== undefined) {
      earned.push(...(await pay(duel.host_id, hostQuality, hostVotes, opponentVotes)))
    }
    if (opponentQuality) earned.push(...(await pay(duel.opponent_id, opponentQuality, opponentVotes, hostVotes)))
    const strongest = new Set(strongKeys(duel, data, mode))
    for (const vote of votes) {
      const voter = await db.get('SELECT * FROM reps WHERE id=?', [vote.rep_id])
      const hit = strongest.has(vote.vote_key)
      const granted = await grant(voter, {
        xp: hit ? 20 : 8,
        score: hit ? 80 : 20,
        mode: 'vote',
        summary: `Floor vote`,
        skills: [{ skill: 'objection', hit }],
      })
      earned.push(...granted.earned)
    }
    await db.run(`UPDATE duels SET status='closed', closed_at=? WHERE id=?`, [now(), duel.id])
    const fresh = await db.get('SELECT * FROM duels WHERE id=?', [duel.id])
    const me = await db.get('SELECT * FROM reps WHERE id=?', [rep.id])
    res.json({
      duel: await presentDuel(fresh, rep.id, true),
      newBadges: earned.filter((badge, index) => earned.indexOf(badge) === index).map((badge) => ({ id: badge, ...BADGES[badge] })),
      rep: await present(me),
      coaching: await coachingFor(rep.id),
    })
  }))

  app.post('/api/pitch/spin', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const rows = await db.all('SELECT data FROM competitors WHERE active=1')
    const rivals = rows.map((row) => JSON.parse(row.data))
    const order = ['rav4', 'crv', 'rogue', 'tucson', 'cx5', 'kona', 'hrv', 'corolla-cross']
    rivals.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    const index = Math.floor(Math.random() * rivals.length)
    const rival = rivals[index]
    const runId = id()
    await db.run('INSERT INTO pitch_runs (id, rep_id, competitor_id, started_at) VALUES (?,?,?,?)', [runId, rep.id, rival.id, now()])
    res.json({
      runId,
      index,
      seconds: 30,
      names: rivals.map((item) => item.name),
      rival: {
        id: rival.id,
        name: rival.name,
        vehicle: rival.vehicle,
        respect: rival.respect,
        cards: rival.cards.map((card) => ({ id: card.id, title: card.title, line: card.line })),
      },
    })
  }))

  app.post('/api/pitch/submit', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const run = await db.get('SELECT * FROM pitch_runs WHERE id=? AND rep_id=?', [req.body?.runId, rep.id])
    if (!run || run.done) fail(400, 'That spin is over.')
    const rival = JSON.parse((await db.get('SELECT data FROM competitors WHERE id=?', [run.competitor_id])).data)
    const elapsed = Date.now() - Date.parse(run.started_at)
    const timedOut = elapsed > 32000
    const scored = timedOut ? { xp: 0, points: 0, results: [], missed: [], traps: 0, goods: 0, clean: false } : scorePitch(rival.cards, req.body?.cardIds || [])
    const granted = await grant(rep, {
      xp: scored.xp,
      score: scored.points,
      mode: 'pitch',
      summary: `${rival.name}: ${scored.goods} strong${scored.traps ? `, ${scored.traps} trap` : ''}`,
      skills: [{ skill: 'competitor', hit: scored.goods > 0 && scored.traps === 0 }],
      badges: scored.clean ? ['straight'] : [],
    })
    await db.run('UPDATE pitch_runs SET done=1, xp=? WHERE id=?', [scored.xp, run.id])
    res.json({
      timedOut,
      ...scored,
      respect: rival.respect,
      name: rival.name,
      newBadges: granted.earned.map((badge) => ({ id: badge, ...BADGES[badge] })),
      rep: await present(granted.fresh),
      coaching: await coachingFor(rep.id),
    })
  }))

  app.get('/api/boss', wrap(async (req, res) => {
    const rep = await requireRep(req)
    let boss = await db.get('SELECT * FROM bosses WHERE team=? ORDER BY created_at DESC LIMIT 1', [rep.team])
    if (!boss) boss = await spawnBoss(db, rep.team)
    const used = await db.all('SELECT objection_id FROM boss_hits WHERE boss_id=? AND rep_id=?', [boss.id, rep.id])
    const usedIds = new Set(used.map((row) => row.objection_id))
    const deck = await db.all('SELECT data FROM objections WHERE active=1')
    let choices = deck.map((row) => JSON.parse(row.data)).filter((item) => !usedIds.has(item.id))
    if (!choices.length) choices = deck.map((row) => JSON.parse(row.data))
    const objection = req.query.deal === '1' && boss.status === 'active' ? shuffle(choices)[0] : null
    const hits = await recentHits(boss.id)
    res.json({
      boss: publicBoss(boss),
      objection: objection && { id: objection.id, customer: objection.customer, context: objection.context, responses: objection.responses.map((item) => item.text) },
      hits,
      mine: used.length,
    })
  }))

  app.post('/api/boss/hit', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const boss = await db.get(`SELECT * FROM bosses WHERE team=? AND status='active' ORDER BY created_at DESC LIMIT 1`, [rep.team])
    if (!boss) fail(400, 'The boss is already down. Bring in the next buyer.')
    const row = await db.get('SELECT data FROM objections WHERE id=?', [req.body?.objectionId])
    if (!row) fail(404, 'That objection left the deck.')
    const data = JSON.parse(row.data)
    const already = await db.get('SELECT id FROM boss_hits WHERE boss_id=? AND rep_id=? AND objection_id=?', [boss.id, rep.id, data.id])
    if (already) fail(400, 'You already answered that one. Take the next objection.')
    const response = data.responses[Number(req.body?.choice)]
    if (!response) fail(400, 'Pick a response.')
    const scored = bossDamage(response.quality)
    await db.run(
      `UPDATE bosses SET hp = CASE WHEN hp - ? < 0 THEN 0 ELSE hp - ? END,
        status = CASE WHEN hp - ? <= 0 THEN 'defeated' ELSE status END,
        defeated_at = CASE WHEN hp - ? <= 0 AND defeated_at IS NULL THEN ? ELSE defeated_at END
       WHERE id=? AND status='active'`,
      [scored.damage, scored.damage, scored.damage, scored.damage, now(), boss.id],
    )
    await db.run(
      'INSERT INTO boss_hits (id, boss_id, rep_id, objection_id, quality, damage, created_at) VALUES (?,?,?,?,?,?,?)',
      [id(), boss.id, rep.id, data.id, response.quality, scored.damage, now()],
    )
    const updated = await db.get('SELECT * FROM bosses WHERE id=?', [boss.id])
    const killed = updated.status === 'defeated'
    const granted = await grant(rep, {
      xp: scored.xp + (killed ? 40 : 0),
      score: scored.points + (killed ? 400 : 0),
      mode: 'boss',
      summary: killed ? `Dropped ${updated.name}` : `${updated.name}: ${scored.damage} damage`,
      skills: [{ skill: data.skill || 'objection', hit: scored.hit }],
      badges: scored.hit ? ['boss-hit'] : [],
    })
    const rewardBadges = []
    if (killed) {
      const people = await db.all('SELECT DISTINCT rep_id FROM boss_hits WHERE boss_id=?', [boss.id])
      for (const person of people) {
        const claimed = await db.get('SELECT boss_id FROM boss_rewards WHERE boss_id=? AND rep_id=?', [boss.id, person.rep_id])
        if (claimed) continue
        const mate = await db.get('SELECT * FROM reps WHERE id=?', [person.rep_id])
        const bonus = await grant(mate, {
          xp: 60,
          score: 600,
          mode: 'boss',
          summary: `Team reward: ${updated.name} is down`,
          skills: [{ skill: 'close', hit: true }],
          badges: ['boss-down'],
        })
        await db.run('INSERT INTO boss_rewards (boss_id, rep_id, xp, created_at) VALUES (?,?,?,?)', [boss.id, person.rep_id, 60, now()])
        if (person.rep_id === rep.id) rewardBadges.push(...bonus.earned)
      }
    }
    const fresh = await db.get('SELECT * FROM reps WHERE id=?', [rep.id])
    res.json({
      quality: response.quality,
      damage: scored.damage,
      explanation: data.explanation,
      best: data.responses.find((item) => item.quality === 'best')?.text,
      killed,
      boss: publicBoss(updated),
      hits: await recentHits(boss.id),
      xp: scored.xp + (killed ? 100 : 0),
      points: scored.points + (killed ? 400 : 0),
      newBadges: [...granted.earned, ...rewardBadges].filter((badge, index, list) => list.indexOf(badge) === index).map((badge) => ({ id: badge, ...BADGES[badge] })),
      rep: await present(fresh),
      coaching: await coachingFor(rep.id),
    })
  }))

  app.post('/api/boss/next', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const current = await db.get(`SELECT * FROM bosses WHERE team=? ORDER BY created_at DESC LIMIT 1`, [rep.team])
    if (current?.status === 'active') fail(400, 'The current buyer is still on the floor.')
    const boss = await spawnBoss(db, rep.team)
    res.json({ boss: publicBoss(boss) })
  }))

  app.get('/api/daily', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const day = pacificDay()
    const play = await db.get('SELECT * FROM daily_plays WHERE rep_id=? AND day=?', [rep.id, day])
    const word = wordForDay(day, words)
    const guesses = play ? JSON.parse(play.guesses) : []
    res.json(dailyPayload(rep, day, word, guesses, Boolean(play?.solved)))
  }))

  app.post('/api/daily/guess', wrap(async (req, res) => {
    const rep = await requireRep(req)
    const day = pacificDay()
    const guess = String(req.body?.guess || '').toUpperCase().replace(/[^A-Z]/g, '')
    if (guess.length !== 5) fail(400, 'Five letters.')
    const word = wordForDay(day, words)
    let play = await db.get('SELECT * FROM daily_plays WHERE rep_id=? AND day=?', [rep.id, day])
    const guesses = play ? JSON.parse(play.guesses) : []
    if (play?.solved || guesses.length >= 6) fail(400, 'You already played today. Share the grid.')
    guesses.push(guess)
    const solved = guess === word.word
    const failed = !solved && guesses.length >= 6
    let streak = rep.daily_streak
    let xp = 0
    if (solved || failed) {
      streak = solved ? (rep.last_daily === prevDay(day) ? rep.daily_streak + 1 : 1) : 0
      await db.run('UPDATE reps SET daily_streak=?, last_daily=? WHERE id=?', [streak, day, rep.id])
    }
    if (!play) {
      await db.run('INSERT INTO daily_plays (rep_id, day, guesses, solved, xp) VALUES (?,?,?,?,0)', [rep.id, day, JSON.stringify(guesses), solved ? 1 : 0])
    } else {
      await db.run('UPDATE daily_plays SET guesses=?, solved=? WHERE rep_id=? AND day=?', [JSON.stringify(guesses), solved ? 1 : 0, rep.id, day])
    }
    const earned = []
    if (solved) {
      xp = 25 + Math.min(10, streak)
      const granted = await grant({ ...rep, daily_streak: streak }, {
        xp,
        score: 200,
        mode: 'daily',
        summary: `Daily ${day}`,
        skills: [{ skill: 'product', hit: true }],
        badges: ['daily-solve', streak >= 7 ? 'streak-7' : null, streak >= 3 ? 'streak-3' : null].filter(Boolean),
      })
      earned.push(...granted.earned)
      await db.run('UPDATE daily_plays SET xp=? WHERE rep_id=? AND day=?', [xp, rep.id, day])
    }
    const fresh = await db.get('SELECT * FROM reps WHERE id=?', [rep.id])
    res.json({
      ...dailyPayload(fresh, day, word, guesses, solved),
      xp,
      newBadges: earned.map((badge) => ({ id: badge, ...BADGES[badge] })),
      rep: await present(fresh),
      coaching: solved || failed ? await coachingFor(rep.id) : null,
    })
  }))

  app.get('/api/leaderboard', wrap(async (req, res) => {
    await requireRep(req)
    res.json(await board())
  }))

  app.get('/api/tv', wrap(async (req, res) => {
    const payload = await board()
    const bosses = await db.all(`SELECT * FROM bosses WHERE status='active' OR defeated_at > ? ORDER BY created_at DESC`, [new Date(Date.now() - 3 * 86400000).toISOString()])
    const seen = new Set()
    const live = []
    for (const boss of bosses) {
      if (seen.has(boss.team)) continue
      seen.add(boss.team)
      live.push(publicBoss(boss))
    }
    res.json({ ...payload, bosses: live })
  }))

  app.get('/api/coaching', wrap(async (req, res) => {
    const rep = await requireRep(req)
    res.json({ coaching: await coachingFor(rep.id) })
  }))

  app.post('/api/admin/login', wrap(async (req, res) => {
    const password = adminPassword()
    if (!password) fail(503, 'Set ADMIN_PASSWORD on the server before using the desk.')
    if (String(req.body?.password || '') !== password) fail(401, 'Wrong password.')
    const token = randomBytes(24).toString('hex')
    await db.run('INSERT INTO admin_sessions (token, created_at) VALUES (?,?)', [token, now()])
    res.json({ token })
  }))

  app.get('/api/manager', wrap(async (req, res) => {
    const admin = await adminFrom(req)
    const rep = await repFrom(req)
    if (!admin && rep?.role !== 'manager') fail(401, 'Managers and the desk password can open this.')
    const reps = await db.all('SELECT id, name, team, xp, role, daily_streak, outfit FROM reps ORDER BY team, name')
    const skills = await db.all('SELECT rep_id, skill, SUM(hit) AS hits, COUNT(*) AS n FROM skill_log GROUP BY rep_id, skill')
    const byRep = new Map()
    for (const row of skills) {
      const list = byRep.get(row.rep_id) || []
      list.push({ skill: row.skill, label: SKILL_LABELS[row.skill] || row.skill, hits: Number(row.hits), n: Number(row.n), accuracy: Math.round((Number(row.hits) / Number(row.n)) * 100) })
      byRep.set(row.rep_id, list)
    }
    res.json({
      reps: reps.map((person) => {
        const lines = (byRep.get(person.id) || []).sort((a, b) => a.accuracy - b.accuracy)
        const weak = lines.find((line) => line.n >= 2) || null
        return { ...person, teamName: teamName(person.team), rank: rankFor(person.xp), level: levelFor(person.xp), skills: lines, weak }
      }),
    })
  }))

  app.get('/api/admin/content', wrap(async (req, res) => {
    await requireAdmin(req)
    const questions = await db.all('SELECT * FROM questions ORDER BY vehicle, id')
    const scenarios = await db.all('SELECT * FROM scenarios ORDER BY id')
    const objections = await db.all('SELECT * FROM objections ORDER BY id')
    const reps = await db.all('SELECT id, name, team, xp, role FROM reps ORDER BY name')
    res.json({
      questions: questions.map((question) => ({ ...question, choices: JSON.parse(question.choices), active: Boolean(question.active) })),
      scenarios: scenarios.map((row) => ({ ...JSON.parse(row.data), active: Boolean(row.active), custom: Boolean(row.custom) })),
      objections: objections.map((row) => ({ ...JSON.parse(row.data), active: Boolean(row.active), custom: Boolean(row.custom) })),
      reps,
    })
  }))

  app.post('/api/admin/questions', wrap(async (req, res) => {
    await requireAdmin(req)
    const saved = await saveQuestion(req.body || {}, null)
    res.json({ question: saved })
  }))

  app.put('/api/admin/questions/:id', wrap(async (req, res) => {
    await requireAdmin(req)
    res.json({ question: await saveQuestion(req.body || {}, req.params.id) })
  }))

  app.post('/api/admin/objections', wrap(async (req, res) => {
    await requireAdmin(req)
    res.json({ objection: await saveObjection(req.body || {}, null) })
  }))

  app.put('/api/admin/objections/:id', wrap(async (req, res) => {
    await requireAdmin(req)
    res.json({ objection: await saveObjection(req.body || {}, req.params.id) })
  }))

  app.put('/api/admin/scenarios/:id', wrap(async (req, res) => {
    await requireAdmin(req)
    const data = req.body?.data || req.body
    if (!data?.id || !Array.isArray(data.beats) || data.beats.length < 4) fail(400, 'A scenario needs an id and at least 4 beats.')
    const active = req.body?.active === false ? 0 : 1
    const existing = await db.get('SELECT id FROM scenarios WHERE id=?', [data.id])
    if (!existing) {
      await db.run('INSERT INTO scenarios (id, data, active, custom, seed_rev) VALUES (?,?,?,1,1)', [data.id, JSON.stringify(data), active])
    } else {
      await db.run('UPDATE scenarios SET data=?, active=?, custom=1 WHERE id=?', [JSON.stringify(data), active, data.id])
    }
    res.json({ ok: true })
  }))

  app.post('/api/admin/reps/:id/role', wrap(async (req, res) => {
    await requireAdmin(req)
    const role = req.body?.role === 'manager' ? 'manager' : 'rep'
    await db.run('UPDATE reps SET role=? WHERE id=?', [role, req.params.id])
    res.json({ ok: true })
  }))

  async function saveQuestion(body, existingId) {
    const choices = body.choices
    if (!body.prompt || !Array.isArray(choices) || choices.length !== 4) fail(400, 'Need a prompt and four choices.')
    const answer = Number(body.answer)
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) fail(400, 'Mark the correct choice.')
    if (!body.explanation || String(body.explanation).length < 20) fail(400, 'Write the explanation a rep should say out loud.')
    const questionId = existingId || body.id || `custom-${id().slice(0, 8)}`
    const fields = [body.vehicle || 'Lineup', body.category || 'custom', body.skill || 'product', body.prompt, JSON.stringify(choices.map(String)), answer, body.explanation, Number(body.bucket) || 0, body.active === false ? 0 : 1, questionId]
    const existing = await db.get('SELECT id FROM questions WHERE id=?', [questionId])
    if (!existing) {
      await db.run('INSERT INTO questions (vehicle, category, skill, prompt, choices, answer, explanation, bucket, active, id, custom, seed_rev) VALUES (?,?,?,?,?,?,?,?,?,?,1,1)', fields)
    } else {
      await db.run('UPDATE questions SET vehicle=?, category=?, skill=?, prompt=?, choices=?, answer=?, explanation=?, bucket=?, active=?, custom=1 WHERE id=?', fields)
    }
    const saved = await db.get('SELECT * FROM questions WHERE id=?', [questionId])
    return { ...saved, choices: JSON.parse(saved.choices) }
  }

  async function saveObjection(body, existingId) {
    const responses = body.responses
    if (!body.customer || !Array.isArray(responses) || responses.length !== 4) fail(400, 'Need the customer line and four responses.')
    if (responses.filter((item) => item.quality === 'best').length !== 1) fail(400, 'Mark exactly one best response.')
    const objectionId = existingId || body.id || `custom-${id().slice(0, 8)}`
    const data = {
      id: objectionId,
      customer: body.customer,
      context: body.context || '',
      skill: body.skill || 'objection',
      category: body.category || 'custom',
      responses: responses.map((item) => ({ quality: item.quality || 'poor', text: String(item.text || '') })),
      explanation: body.explanation || '',
      rev: 1,
    }
    const existing = await db.get('SELECT id FROM objections WHERE id=?', [objectionId])
    const active = body.active === false ? 0 : 1
    if (!existing) await db.run('INSERT INTO objections (id, data, active, custom, seed_rev) VALUES (?,?,?,1,1)', [objectionId, JSON.stringify(data), active])
    else await db.run('UPDATE objections SET data=?, active=?, custom=1 WHERE id=?', [JSON.stringify(data), active, objectionId])
    return data
  }

  async function findDuel(key) {
    const duel = await db.get('SELECT * FROM duels WHERE id=? OR code=?', [key, String(key).toUpperCase()])
    if (!duel) fail(404, 'That duel is gone.')
    return duel
  }

  function voteMode(duel) {
    const hostSet = duel.host_choice !== null && duel.host_choice !== undefined
    const oppSet = duel.opponent_choice !== null && duel.opponent_choice !== undefined
    if (hostSet && oppSet && duel.host_choice !== duel.opponent_choice) return 'heads'
    return 'floor'
  }

  function strongKeys(duel, data, mode) {
    if (mode === 'floor') return [String(data.responses.findIndex((item) => item.quality === 'best'))]
    const hostQ = rankQuality(data.responses[duel.host_choice]?.quality)
    const oppQ = rankQuality(data.responses[duel.opponent_choice]?.quality)
    const best = Math.max(hostQ, oppQ)
    const keys = []
    if (hostQ === best) keys.push('host')
    if (oppQ === best) keys.push('opponent')
    return keys
  }

  async function presentDuel(duel, viewerId, reveal) {
    const data = JSON.parse((await db.get('SELECT data FROM objections WHERE id=?', [duel.objection_id])).data)
    const host = await db.get('SELECT id, name, team FROM reps WHERE id=?', [duel.host_id])
    const opponent = duel.opponent_id ? await db.get('SELECT id, name, team FROM reps WHERE id=?', [duel.opponent_id]) : null
    const votes = await db.all('SELECT vote_key, COUNT(*) AS n FROM votes WHERE duel_id=? GROUP BY vote_key', [duel.id])
    const tally = Object.fromEntries(votes.map((vote) => [vote.vote_key, Number(vote.n)]))
    const mine = await db.get('SELECT vote_key FROM votes WHERE duel_id=? AND rep_id=?', [duel.id, viewerId])
    const mode = voteMode(duel)
    const base = {
      id: duel.id,
      code: duel.code,
      status: duel.status,
      mode: duel.status === 'lobby' ? 'lobby' : mode,
      customer: data.customer,
      context: data.context,
      responses: data.responses.map((item) => item.text),
      host: host && { id: host.id, name: host.name, team: host.team, teamName: teamName(host.team), locked: duel.host_choice !== null && duel.host_choice !== undefined, choice: duel.status !== 'lobby' || viewerId === host.id ? duel.host_choice : null },
      opponent: opponent && { id: opponent.id, name: opponent.name, team: opponent.team, teamName: teamName(opponent.team), locked: duel.opponent_choice !== null && duel.opponent_choice !== undefined, choice: duel.status !== 'lobby' || viewerId === opponent.id ? duel.opponent_choice : null },
      you: viewerId === duel.host_id ? 'host' : viewerId === duel.opponent_id ? 'opponent' : 'floor',
      tally,
      yourVote: mine?.vote_key || null,
      createdAt: duel.created_at,
    }
    if (duel.status === 'voting' || reveal || duel.status === 'closed') {
      if (mode === 'heads') {
        base.options = [
          { key: 'host', name: host.name, text: data.responses[duel.host_choice]?.text },
          { key: 'opponent', name: opponent?.name || 'Challenger', text: data.responses[duel.opponent_choice]?.text },
        ]
      } else {
        base.options = data.responses.map((item, index) => ({ key: String(index), name: `Response ${index + 1}`, text: item.text }))
      }
    }
    if (reveal || duel.status === 'closed') {
      base.explanation = data.explanation
      base.bestIndex = data.responses.findIndex((item) => item.quality === 'best')
      base.qualities = data.responses.map((item) => item.quality)
      base.skill = data.skill
      base.strongKeys = strongKeys(duel, data, mode)
    } else {
      if (viewerId !== duel.host_id) base.host = base.host && { ...base.host, choice: base.host.locked ? 'hidden' : null }
      if (viewerId !== duel.opponent_id && base.opponent) base.opponent = { ...base.opponent, choice: base.opponent.locked ? 'hidden' : null }
    }
    return base
  }

  async function recentHits(bossId) {
    const rows = await db.all(
      `SELECT boss_hits.*, reps.name, reps.team FROM boss_hits JOIN reps ON reps.id = boss_hits.rep_id
       WHERE boss_id=? ORDER BY created_at DESC LIMIT 8`,
      [bossId],
    )
    return rows.map((row) => ({ name: row.name, team: row.team, damage: row.damage, quality: row.quality, at: row.created_at }))
  }

  async function board() {
    const season = monthKey(pacificDay())
    const reps = await db.all('SELECT id, name, team, xp, outfit FROM reps')
    const rounds = await db.all('SELECT rep_id, SUM(xp) AS xp FROM rounds WHERE day LIKE ? GROUP BY rep_id', [`${season}%`])
    const seasonMap = new Map(rounds.map((row) => [row.rep_id, Number(row.xp)]))
    const people = reps
      .map((rep) => ({
        id: rep.id,
        name: rep.name,
        team: rep.team,
        teamName: teamName(rep.team),
        outfit: rep.outfit,
        career: rep.xp,
        season: seasonMap.get(rep.id) || 0,
        rank: rankFor(rep.xp),
        level: levelFor(rep.xp),
      }))
      .sort((a, b) => b.season - a.season || b.career - a.career)
    const teams = TEAMS.map((team) => ({
      ...team,
      season: people.filter((person) => person.team === team.id).reduce((sum, person) => sum + person.season, 0),
      reps: people.filter((person) => person.team === team.id).length,
    })).sort((a, b) => b.season - a.season)
    const feed = await db.all(
      `SELECT rounds.summary, rounds.xp, rounds.mode, rounds.created_at, reps.name, reps.team
       FROM rounds JOIN reps ON reps.id = rounds.rep_id ORDER BY rounds.created_at DESC LIMIT 14`,
    )
    return {
      season,
      seasonLabel: seasonLabel(season),
      leader: teams[0]?.season ? teams[0] : null,
      teams,
      people,
      feed: feed.map((row) => ({ ...row, teamName: teamName(row.team) })),
    }
  }

  function dailyPayload(rep, day, word, guesses, solved) {
    const failed = !solved && guesses.length >= 6
    return {
      day,
      guesses: guesses.map((guess) => ({ guess, marks: wordleMarks(guess, word.word) })),
      solved,
      failed,
      remaining: Math.max(0, 6 - guesses.length),
      streak: rep.daily_streak,
      length: 5,
      tip: solved || failed ? word.tip : null,
      word: solved || failed ? word.word : null,
      share: shareGrid(day, rep, guesses, word.word, solved),
    }
  }
}

function presentBeat(scenario, index, trust, mood) {
  const beat = scenario.beats[index]
  return {
    index,
    total: scenario.beats.length,
    say: beat.say,
    choices: beat.choices.map((choice, choiceIndex) => ({ id: choiceIndex, text: choice.text })),
    trust,
    mood,
    customer: scenario.customer,
    role: scenario.role,
    budget: scenario.budget,
    looking: scenario.looking,
    tag: scenario.tag,
    accent: scenario.accent,
    title: scenario.title,
  }
}
function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)))
}
function publicBoss(boss) {
  return {
    id: boss.id,
    team: boss.team,
    teamName: teamName(boss.team),
    name: boss.name,
    taunt: boss.taunt,
    hp: boss.hp,
    maxHp: boss.max_hp,
    status: boss.status,
    defeatedAt: boss.defeated_at,
  }
}
function rankQuality(quality) {
  if (quality === 'best') return 2
  if (quality === 'ok') return 1
  return 0
}
function seasonLabel(season) {
  const [year, month] = season.split('-')
  const name = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleString('en-CA', { month: 'long', timeZone: 'UTC' })
  return `${name} ${year} Cup`
}
function shareGrid(day, rep, guesses, word, solved) {
  const lines = guesses.map((guess) => wordleMarks(guess, word).map((mark) => (mark === 'correct' ? '🟩' : mark === 'present' ? '🟨' : '⬛')).join(''))
  return [`SALES FLOOR SHOWDOWN`, day, teamName(rep.team), ...lines, solved ? `Solved` : `Unsolved`, `Streak ${rep.daily_streak}`].join('\n')
}

export function notFound(req, res, next) {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'That lane does not exist.' })
    return
  }
  next()
}

export function onError(err, _req, res, _next) {
  if (!err.expose) console.error(err)
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'The tower glitched. Try that again.' })
}
