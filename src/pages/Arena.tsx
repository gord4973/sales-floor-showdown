import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Coaching, Rep } from '../lib/types'
import { Coach } from '../components/Fireworks'

type Duel = {
  id: string
  code: string
  status: string
  mode: string
  customer: string
  context: string
  responses: string[]
  host: { id: string; name: string; teamName: string; locked: boolean; choice: number | 'hidden' | null }
  opponent: { id: string; name: string; teamName: string; locked: boolean; choice: number | 'hidden' | null } | null
  you: 'host' | 'opponent' | 'floor'
  tally: Record<string, number>
  yourVote: string | null
  options?: { key: string; name: string; text: string }[]
  explanation?: string
  qualities?: string[]
  bestIndex?: number
  strongKeys?: string[]
}

export function Arena() {
  const [duels, setDuels] = useState<Duel[]>([])
  const [error, setError] = useState('')
  async function refresh() {
    const data = await api<{ duels: Duel[] }>('/api/duels')
    setDuels(data.duels)
  }
  useEffect(() => {
    refresh().catch((err) => setError(err.message))
    const timer = window.setInterval(() => { refresh().catch(() => {}) }, 2000)
    return () => window.clearInterval(timer)
  }, [])
  async function create() {
    const data = await api<{ duel: Duel }>('/api/duels', {})
    play('tap')
    window.location.assign(`/arena/${data.duel.id}`)
  }
  return (
    <main className="screen stack">
      <p className="kicker">Objection arena</p>
      <h1>THROW IT. THE FLOOR VOTES FROM THEIR PHONES.</h1>
      <button className="primary" data-testid="arena-create" onClick={() => void create()}>THROW A CHALLENGE</button>
      {error && <p>{error}</p>}
      {duels.length === 0 && <p className="muted">The floor is quiet. Be the one who starts it.</p>}
      {duels.map((duel) => (
        <Link key={duel.id} to={`/arena/${duel.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="kicker">{duel.status} · {duel.code}</div>
          <strong>{duel.host.name}{duel.opponent ? ` vs ${duel.opponent.name}` : ' · open seat'}</strong>
          <div>{duel.customer}</div>
        </Link>
      ))}
    </main>
  )
}

export function DuelRoom() {
  const { id } = useParams()
  const { setRep } = useAuth()
  const [duel, setDuel] = useState<Duel | null>(null)
  const [error, setError] = useState('')
  const [coaching, setCoaching] = useState<Coaching | null>(null)
  const [code, setCode] = useState('')

  async function load(key = id) {
    const data = await api<{ duel: Duel }>(`/api/duels/${key}`)
    setDuel(data.duel)
  }
  useEffect(() => {
    load().catch((err) => setError(err.message))
    const timer = window.setInterval(() => { load().catch(() => {}) }, 1200)
    return () => window.clearInterval(timer)
  }, [id])

  async function act(path: string, body?: object) {
    const data = await api<{ duel: Duel; rep?: Rep; coaching?: Coaching }>(`/api/duels/${duel?.id}/${path}`, body || {})
    setDuel(data.duel)
    if (data.rep) setRep(data.rep)
    if (data.coaching) setCoaching(data.coaching)
    play(path === 'vote' ? 'vote' : path === 'reveal' ? 'fanfare' : 'tap')
  }

  if (!duel) {
    return (
      <main className="screen stack">
        <p>{error || 'Finding the duel…'}</p>
        <input className="field" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Room code" data-testid="code-entry" />
        <button className="primary" onClick={() => load(code).catch((err) => setError(err.message))}>JOIN CODE</button>
      </main>
    )
  }

  const maxVotes = Math.max(1, ...Object.values(duel.tally || { x: 1 }))
  return (
    <main className="screen stack">
      <div className="kicker">{duel.status === 'voting' ? 'LIVE VOTE' : duel.status}</div>
      <h1 data-testid="duel-code" style={{ fontSize: 64, letterSpacing: '.18em' }}>{duel.code}</h1>
      <p className="muted">Teammates open Arena and tap this room, or type the code.</p>
      <section className="card">
        <div className="kicker">{duel.host.name}{duel.opponent ? ` vs ${duel.opponent.name}` : ''}</div>
        <h2>{duel.customer}</h2>
        <p className="muted">{duel.context}</p>
      </section>
      {duel.status === 'lobby' && (duel.you === 'host' || duel.you === 'opponent') && !(duel.you === 'host' ? duel.host.locked : duel.opponent?.locked) && (
        duel.responses.map((text, index) => (
          <button key={text} className="choice" data-testid={`duel-choice-${index}`} onClick={() => void act('answer', { choice: index })}>{text}</button>
        ))
      )}
      {duel.status === 'lobby' && duel.you === 'floor' && !duel.opponent && (
        <button className="primary" data-testid="join-duel" onClick={() => void act('join')}>TAKE THE OTHER SIDE</button>
      )}
      {duel.status === 'lobby' && duel.you === 'host' && duel.host.locked && (
        <button className="primary" data-testid="open-vote" onClick={() => void act('answer', { openVote: true })}>OPEN THE FLOOR VOTE</button>
      )}
      {duel.status === 'lobby' && duel.you === 'host' && duel.host.locked && (
        <p className="muted">Locked in. Open the vote now, or wait for a challenger to lock theirs.</p>
      )}
      {(duel.status === 'voting' || duel.status === 'closed') && duel.options?.map((option) => (
        <button
          key={option.key}
          className={`choice ${duel.yourVote === option.key ? 'on' : ''} ${duel.strongKeys?.includes(option.key) ? 'good' : ''}`}
          data-testid={`vote-${option.key}`}
          disabled={duel.you !== 'floor' || duel.status !== 'voting'}
          onClick={() => void act('vote', { key: option.key })}
        >
          <div className="kicker">{option.name}</div>
          {option.text}
          <div className="bar"><span style={{ width: `${((duel.tally[option.key] || 0) / maxVotes) * 100}%` }} /></div>
          <div className="muted">{duel.tally[option.key] || 0} votes</div>
        </button>
      ))}
      {duel.status === 'voting' && duel.you !== 'floor' && (
        <button className="primary" data-testid="reveal" onClick={() => void act('reveal')}>REVEAL</button>
      )}
      {duel.status === 'closed' && (
        <section className="card stack">
          <div className="kicker">The line that wins</div>
          <p>{duel.explanation}</p>
          <Coach coaching={coaching} />
        </section>
      )}
      {error && <p>{error}</p>}
    </main>
  )
}
