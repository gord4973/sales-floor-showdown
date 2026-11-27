import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type Person = { id: string; name: string; teamName: string; team: string; season: number; rank: string; level: number }
type Payload = {
  seasonLabel: string
  leader: { name: string } | null
  teams: { id: string; name: string; season: number }[]
  people: Person[]
  feed: { name: string; summary: string; xp: number; team: string }[]
}

export function Board() {
  const [data, setData] = useState<Payload | null>(null)
  useEffect(() => {
    api<Payload>('/api/leaderboard').then(setData).catch(() => setData(null))
    const timer = window.setInterval(() => { api<Payload>('/api/leaderboard').then(setData).catch(() => {}) }, 4000)
    return () => window.clearInterval(timer)
  }, [])
  if (!data) return <main className="screen"><p className="kicker">Pulling the board…</p></main>
  const max = Math.max(1, ...data.teams.map((team) => team.season))
  return (
    <main className="screen stack">
      <p className="kicker">{data.seasonLabel}</p>
      <h1>{data.leader ? `${data.leader.name.toUpperCase()} HAS THE CUP` : 'THE CUP IS EMPTY'}</h1>
      {data.teams.map((team) => (
        <div key={team.id} className="card">
          <div className="rank-line"><strong className={team.id}>{team.name}</strong><b>{team.season}</b></div>
          <div className="bar"><span style={{ width: `${(team.season / max) * 100}%` }} /></div>
        </div>
      ))}
      <h2>Reps</h2>
      {data.people.length === 0 && <p className="muted">The board is clean. First rep on it takes the spotlight.</p>}
      {data.people.map((person, index) => (
        <div key={person.id} className="card rank-line">
          <div>
            <b>{index + 1}. {person.name}</b>
            <div className={`muted ${person.team}`}>{person.teamName} · {person.rank} · LVL {person.level}</div>
          </div>
          <strong>{person.season}</strong>
        </div>
      ))}
      <h2>Just now</h2>
      {data.feed.length === 0 && <p className="muted">No rounds yet tonight.</p>}
      {data.feed.map((item, index) => <div key={index} className="feed-item">{item.name} · {item.summary} · +{item.xp} XP</div>)}
      <Link to="/tv" className="primary" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}>SHOWROOM TV</Link>
    </main>
  )
}
