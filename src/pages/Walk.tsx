import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Badge, Coaching, Rep } from '../lib/types'
import { Coach, Face, Fireworks } from '../components/Fireworks'

type Card = { id: string; title: string; tag: string; customer: string; role: string; budget: number; looking: string; accent: string }
type Beat = { index: number; total: number; say: string; choices: { id: number; text: string }[]; trust: number; mood: number; customer: string; role: string; budget: number; looking: string; tag: string; accent: string; title: string }
type Turn = {
  reply: string
  trust: number
  mood: number
  points: number
  xp: number
  skillLabel: string
  done: boolean
  won: boolean
  hidden: string | null
  recommend: string | null
  customer: string
  next: Beat | null
  newBadges: Badge[]
  rep: Rep
  coaching: Coaching | null
  quality: string
}

export function WalkList() {
  const [rows, setRows] = useState<Card[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    api<{ scenarios: Card[] }>('/api/scenarios').then((data) => setRows(data.scenarios)).catch((err) => setError(err.message))
  }, [])
  return (
    <main className="screen stack">
      <p className="kicker">The walk-in</p>
      <h1>A FACE, A BUDGET, A HIDDEN OBJECTION.</h1>
      <p className="muted">Pick the words. Watch the trust bar. Close it and you hand over the keys.</p>
      {error && <p>{error}</p>}
      {rows.map((row) => (
        <Link key={row.id} to={`/walk/${row.id}`} className="card" data-testid={`scenario-${row.id}`} style={{ textDecoration: 'none', color: 'inherit', borderColor: row.accent }}>
          <div className="kicker">{row.tag}</div>
          <strong>{row.customer}</strong>
          <div>{row.title}</div>
          <div className="muted">{row.role} · {row.looking} · {row.budget > 2000 ? `$${row.budget.toLocaleString('en-CA')} budget` : `$${row.budget}/mo`}</div>
        </Link>
      ))}
    </main>
  )
}

export function WalkPlay() {
  const { id } = useParams()
  const { setRep } = useAuth()
  const [runId, setRunId] = useState('')
  const [beat, setBeat] = useState<Beat | null>(null)
  const [turn, setTurn] = useState<Turn | null>(null)
  const [error, setError] = useState('')
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    let live = true
    api<Beat & { runId: string }>('/api/walk/start', { scenarioId: id }).then((data) => {
      if (!live) return
      setRunId(data.runId)
      setBeat(data)
    }).catch((err) => { if (live) setError(err.message) })
    return () => { live = false }
  }, [id])

  async function choose(choice: number) {
    const data = await api<Turn>('/api/walk/choose', { runId, choice })
    setTurn(data)
    setRep(data.rep)
    if (data.won) {
      play('key')
      setBurst((value) => value + 1)
    } else if (data.quality === 'poor') play('wrong')
    else play('correct')
  }

  function advance() {
    if (!turn) return
    if (turn.next) {
      setBeat({ ...turn.next, trust: turn.trust, mood: turn.mood })
      setTurn(null)
    }
  }

  if (error) return <main className="screen"><p>{error}</p></main>
  if (!beat) return <main className="screen"><p className="kicker">Someone just walked in…</p></main>
  const mood = turn?.mood ?? beat.mood
  const trust = turn?.trust ?? beat.trust
  const done = Boolean(turn?.done)

  return (
    <main className="screen stack">
      <Fireworks burst={burst} />
      <div className="kicker">{beat.tag} · {beat.index + 1}/{beat.total}</div>
      <Face mood={mood} accent={beat.accent} />
      <h1 style={{ textAlign: 'center' }}>{beat.customer}</h1>
      <div className="muted" style={{ textAlign: 'center' }}>{beat.role}<br />Looking at {beat.looking} · {beat.budget > 2000 ? `$${beat.budget.toLocaleString('en-CA')}` : `$${beat.budget}/mo`}</div>
      <div className="meters">
        <div><div className="kicker">Trust</div><div className="bar"><span style={{ width: `${trust}%` }} /></div></div>
        <div><div className="kicker">Mood</div><div className="bar"><span style={{ width: `${mood}%`, background: 'linear-gradient(90deg,#ffc14d,#ff3d9a)' }} /></div></div>
      </div>
      <div className="bubble">{turn ? turn.reply : beat.say}</div>
      {!turn && beat.choices.map((choice) => (
        <button key={choice.id} className="choice" data-testid={`walk-choice-${choice.id}`} onClick={() => void choose(choice.id)}>{choice.text}</button>
      ))}
      {turn && !done && <button className="primary" data-testid="walk-next" onClick={advance}>KEEP TALKING</button>}
      {turn?.done && (
        <>
          {turn.won && (
            <div className="handover" data-testid="handover">
              <div>
                <div className="handover-key" />
                <h1>KEYS ACROSS THE DESK</h1>
                <p>{turn.recommend}</p>
                <p className="muted">The objection you earned: {turn.hidden}</p>
                <Link to="/walk" className="primary" style={{ display: 'inline-grid', placeItems: 'center', textDecoration: 'none' }}>BACK TO THE LOT</Link>
              </div>
            </div>
          )}
          {!turn.won && (
            <section className="card stack">
              <h2>They took a brochure.</h2>
              <p>Hidden objection: {turn.hidden}</p>
              <p className="muted">The car that fit: {turn.recommend}</p>
            </section>
          )}
          <Coach coaching={turn.coaching} />
          {turn.newBadges[0] && <div className="badge-toast">BADGE · {turn.newBadges[0].name}</div>}
        </>
      )}
    </main>
  )
}
