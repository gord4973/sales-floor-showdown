export const TEAMS = [
  { id: 'kee', name: 'Kee', short: 'Kee' },
  { id: 'northline', name: 'Northline', short: 'Northline' },
  { id: 'tricity', name: 'Tricity Retail', short: 'Tricity' },
]

export const TEAM_IDS = TEAMS.map((t) => t.id)

export function teamName(id) {
  return TEAMS.find((t) => t.id === id)?.name || id
}

export const RANKS = [
  { name: 'Greeter', min: 0 },
  { name: 'Closer', min: 300 },
  { name: 'Pro', min: 900 },
  { name: 'Legend', min: 2500 },
]

export function rankFor(xp) {
  let name = RANKS[0].name
  for (const rank of RANKS) if (xp >= rank.min) name = rank.name
  return name
}

export function levelFor(xp) {
  return 1 + Math.floor(Math.max(0, xp) / 100)
}

export function rankProgress(xp) {
  const rank = rankFor(xp)
  const index = RANKS.findIndex((r) => r.name === rank)
  const current = RANKS[index]
  const next = RANKS[index + 1] || null
  const span = next ? next.min - current.min : 1
  const into = next ? xp - current.min : span
  return {
    rank,
    level: levelFor(xp),
    next: next?.name || null,
    nextAt: next?.min || null,
    pct: next ? Math.max(0, Math.min(100, Math.round((into / span) * 100))) : 100,
  }
}

export const OUTFITS = [
  { id: 'polo', name: 'Lot Polo', xp: 0, blurb: 'Red polo. You are on the floor.' },
  { id: 'blazer', name: 'Closer Blazer', xp: 300, blurb: 'Black jacket, red tie. Ask for the business.' },
  { id: 'volt', name: 'PHEV Volt', xp: 700, blurb: 'Electric blue. You can explain a kilowatt-hour without flinching.' },
  { id: 'noir', name: 'Noir Suit', xp: 1200, blurb: 'Black on black, red stitch. Quiet confidence.' },
  { id: 'legend', name: 'Legend Jacket', xp: 2500, blurb: 'Gold shoulders. The floor listens when you talk.' },
]

export const SHOWROOMS = [
  { id: 'bay', name: 'Open Bay', xp: 0, blurb: 'Concrete, one neon strip, room to learn.' },
  { id: 'led', name: 'LED Floor', xp: 400, blurb: 'The bay answers when you walk.' },
  { id: 'spot', name: 'Spotlight Rig', xp: 1000, blurb: 'Two spots. This is a presentation, not a wander.' },
  { id: 'trophy', name: 'Trophy Wall', xp: 1800, blurb: 'Season hardware on the back wall.' },
]

export function unlocked(list, xp) {
  return list.filter((item) => xp >= item.xp)
}

export const BADGES = {
  'first-light': { name: 'First Light', blurb: 'Finished a Lightning Round.' },
  combo: { name: 'Combo', blurb: 'Hit a x3 streak.' },
  'on-fire': { name: 'On Fire', blurb: 'Hit a x4 streak.' },
  'first-deal': { name: 'Keys Across', blurb: 'Closed a Walk-In.' },
  diplomat: { name: 'Diplomat', blurb: 'Won an Objection Arena duel.' },
  voice: { name: 'Floor Voice', blurb: 'Voted in a live duel.' },
  'boss-hit': { name: 'Boss Hit', blurb: 'Landed a clean shot on the month-end boss.' },
  'boss-down': { name: 'Month-End', blurb: 'Your team dropped the boss.' },
  'streak-3': { name: 'Three-Peat', blurb: 'Three-day floor streak.' },
  'streak-7': { name: 'Week Warrior', blurb: 'Seven-day floor streak.' },
  'daily-solve': { name: 'Word on the Floor', blurb: 'Solved a daily challenge.' },
  straight: { name: 'Clean Pitch', blurb: 'Beat the wheel with no trap cards.' },
  legend: { name: 'Legend', blurb: 'Reached Legend.' },
}

export function scoreLightning({ correct, streak, elapsedMs }) {
  const timedOut = elapsedMs > 12500
  if (!correct || timedOut) {
    return { points: 0, xp: 0, streak: 0, multiplier: 1, timedOut: timedOut && correct, skillHit: false }
  }
  const next = streak + 1
  const multiplier = next >= 7 ? 4 : next >= 5 ? 3 : next >= 3 ? 2 : 1
  const speed = elapsedMs < 5000
  const xp = 6 * multiplier + (speed ? 4 : 0)
  const points = 100 * multiplier + (speed ? 25 : 0)
  return { points, xp, streak: next, multiplier, timedOut: false, speed, skillHit: true }
}

export function walkPoints(quality) {
  if (quality === 'best') return { xp: 12, points: 120, hit: true }
  if (quality === 'ok') return { xp: 6, points: 50, hit: true }
  return { xp: 0, points: 0, hit: false }
}

export function scorePitch(cards, selectedIds) {
  const unique = [...new Set(selectedIds)].slice(0, 3)
  const chosen = unique.map((id) => cards.find((c) => c.id === id)).filter(Boolean)
  let xp = 0
  let points = 0
  const results = chosen.map((card) => {
    if (card.good) {
      xp += 14
      points += 150
    } else {
      xp -= 8
      points -= 40
    }
    return { id: card.id, title: card.title, good: card.good, why: card.why }
  })
  const missed = cards.filter((c) => c.good && !unique.includes(c.id)).map((c) => ({ id: c.id, title: c.title, why: c.why }))
  const traps = results.filter((r) => !r.good).length
  const goods = results.filter((r) => r.good).length
  return {
    xp: Math.max(0, xp),
    points: Math.max(0, points),
    results,
    missed,
    traps,
    goods,
    clean: goods === 3 && traps === 0,
  }
}

export function wordleMarks(guess, answer) {
  const g = String(guess || '').toUpperCase()
  const a = String(answer || '').toUpperCase()
  const marks = Array(5).fill('absent')
  const left = a.split('')
  if (g.length !== 5 || a.length !== 5) return marks
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      marks[i] = 'correct'
      left[i] = null
    }
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] === 'correct') continue
    const j = left.indexOf(g[i])
    if (j !== -1) {
      marks[i] = 'present'
      left[j] = null
    }
  }
  return marks
}

export function pacificDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function prevDay(day) {
  const [y, m, d] = day.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().slice(0, 10)
}

export function monthKey(day) {
  return day.slice(0, 7)
}

export function isoWeekNumber(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const y = Number(parts.find((p) => p.type === 'year').value)
  const m = Number(parts.find((p) => p.type === 'month').value)
  const d = Number(parts.find((p) => p.type === 'day').value)
  const utc = new Date(Date.UTC(y, m - 1, d))
  const dayNum = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  return Math.ceil(((utc - yearStart) / 86400000 + 1) / 7)
}

export function rotationBucket(date = new Date()) {
  return (isoWeekNumber(date) % 4) + 1
}

export function wordForDay(day, words) {
  let h = 0
  for (const c of day) h = (h * 33 + c.charCodeAt(0)) >>> 0
  return words[h % words.length]
}

export function bossDamage(quality) {
  if (quality === 'best') return { damage: 70, xp: 10, points: 200, hit: true }
  if (quality === 'ok') return { damage: 35, xp: 5, points: 80, hit: true }
  return { damage: 0, xp: 0, points: 0, hit: false }
}

export function duelXp(quality) {
  if (quality === 'best') return 30
  if (quality === 'ok') return 14
  return 0
}

export const SKILL_LABELS = {
  product: 'Product knowledge',
  competitor: 'Competitor control',
  discovery: 'Needs discovery',
  objection: 'Objection handling',
  benefit: 'Feature to benefit',
  finance: 'Payment conversation',
  trade: 'Trade appraisal',
  close: 'Asking for the business',
  trust: 'Trust and honesty',
  phev: 'PHEV coaching',
}

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}
