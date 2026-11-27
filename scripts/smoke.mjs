const base = 'http://127.0.0.1:43123'

async function call(path, { token, admin, body, method } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (admin) headers['x-admin-token'] = admin
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(base + path, { method: method || (body !== undefined ? 'POST' : 'GET'), headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${method || (body ? 'POST' : 'GET')} ${path} ${response.status} ${data.error || ''}`)
  return data
}

const health = await call('/api/health')
if (health.questions < 150) throw new Error('questions')

const alex = await call('/api/auth', { body: { name: 'Alex Chen', team: 'kee', pin: '2026' } })
const sam = await call('/api/auth', { body: { name: 'Sam Dhaliwal', team: 'northline', pin: '1111' } })
const jo = await call('/api/auth', { body: { name: 'Jo Park', team: 'tricity', pin: '3333' } })
const again = await call('/api/auth', { body: { name: 'Alex Chen', team: 'kee', pin: '2026' } })
if (again.rep.id !== alex.rep.id) throw new Error('login did not persist the same rep')

const wrong = await fetch(base + '/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Alex Chen', team: 'kee', pin: '0000' }) })
if (wrong.status !== 401) throw new Error('bad pin should 401')

const start = await call('/api/lightning/start', { token: alex.token, body: {} })
if (!start.question || start.question.choices.length !== 4) throw new Error('lightning question')
let run = start
let correctSeen = false
for (let i = 0; i < start.total; i++) {
  const answered = await call('/api/lightning/answer', { token: alex.token, body: { runId: run.runId, choice: 0 } })
  if (answered.explanation.length < 20) throw new Error('missing explanation')
  if (answered.correct) correctSeen = true
  if (answered.done) {
    if (!answered.coaching?.tip?.body) throw new Error('no coaching')
    break
  }
  run = { ...run, question: answered.next }
}
if (!correctSeen) console.log('note: first choice was never correct this round, still explained')

const scenarios = await call('/api/scenarios', { token: alex.token })
if (scenarios.scenarios.length < 8) throw new Error('scenarios')
const walk = await call('/api/walk/start', { token: alex.token, body: { scenarioId: scenarios.scenarios[0].id } })
let beat = walk
let closed = null
while (beat) {
  const turn = await call('/api/walk/choose', { token: alex.token, body: { runId: walk.runId, choice: 0 } })
  if (turn.done) { closed = turn; break }
  beat = turn.next
}
if (!closed?.hidden) throw new Error('walk debrief')

const duel = await call('/api/duels', { token: alex.token, body: {} })
await call(`/api/duels/${duel.duel.id}/answer`, { token: alex.token, body: { choice: 0 } })
await call(`/api/duels/${duel.duel.id}/join`, { token: sam.token, body: {} })
await call(`/api/duels/${duel.duel.id}/answer`, { token: sam.token, body: { choice: 1 } })
const voting = await call(`/api/duels/${duel.duel.id}`, { token: jo.token })
if (voting.duel.status !== 'voting') throw new Error('vote did not open: ' + voting.duel.status)
const voteKey = voting.duel.options[0].key
await call(`/api/duels/${duel.duel.id}/vote`, { token: jo.token, body: { key: voteKey } })
const seen = await call(`/api/duels/${duel.duel.id}`, { token: alex.token })
if (!seen.duel.tally[voteKey]) throw new Error('vote not visible to the other browser session')
const revealed = await call(`/api/duels/${duel.duel.id}/reveal`, { token: alex.token, body: {} })
if (!revealed.duel.explanation) throw new Error('reveal')

const spin = await call('/api/pitch/spin', { token: alex.token, body: {} })
const pitched = await call('/api/pitch/submit', { token: alex.token, body: { runId: spin.runId, cardIds: spin.rival.cards.slice(0, 3).map((card) => card.id) } })
if (!pitched.results) throw new Error('pitch')

const boss = await call('/api/boss?deal=1', { token: alex.token })
const hit = await call('/api/boss/hit', { token: sam.token, body: {} }).catch((error) => error)
const swing = await call('/api/boss/hit', { token: alex.token, body: { objectionId: boss.objection.id, choice: 0 } })
if (typeof swing.boss.hp !== 'number') throw new Error('boss hp')
const samView = await call('/api/boss', { token: sam.token })
if (sam.rep.team === alex.rep.team && samView.boss.hp !== swing.boss.hp) throw new Error('shared hp')

const daily = await call('/api/daily', { token: alex.token })
const guessed = await call('/api/daily/guess', { token: alex.token, body: { guess: 'LEASE' } })
if (!guessed.guesses[0].marks) throw new Error('marks')

const board = await call('/api/leaderboard', { token: sam.token })
if (!board.people.find((person) => person.name === 'Alex Chen')) throw new Error('leaderboard missing alex')
const tv = await call('/api/tv')
if (!tv.teams || tv.teams.length !== 3) throw new Error('tv')

const admin = await call('/api/admin/login', { body: { password: 'showdown' } })
const created = await call('/api/admin/questions', {
  admin: admin.token,
  body: {
    prompt: 'Smoke question about the heated wheel on a gas Outlander?',
    choices: ['ES', 'SE', 'LE', 'GT'],
    answer: 1,
    explanation: 'The heated steering wheel arrives at SE. Confirm it on the sticker before you promise it.',
    vehicle: 'Outlander',
    skill: 'product',
  },
})
if (!created.question?.id) throw new Error('admin create')
await call(`/api/admin/reps/${alex.rep.id}/role`, { admin: admin.token, body: { role: 'manager' } })
const manager = await call('/api/manager', { token: alex.token })
if (!manager.reps.find((person) => person.name === 'Alex Chen')?.weak && manager.reps[0].skills.length === 0) {
  // weak spot can be null until 2 attempts; skills should exist
}
if (!manager.reps.some((person) => person.skills.length > 0)) throw new Error('manager skills')

const me = await call('/api/me', { token: alex.token })
if (me.rep.xp <= 0) throw new Error('xp did not persist on the rep')

console.log(JSON.stringify({
  ok: true,
  questions: health.questions,
  scenarios: scenarios.scenarios.length,
  walk: closed.won ? 'closed' : 'left',
  duelVotes: seen.duel.tally,
  bossHp: swing.boss.hp,
  xp: me.rep.xp,
  rank: me.rep.rank,
  seasonPeople: board.people.length,
}, null, 2))
