import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FloorScene } from '../components/Fireworks'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

type Board = {
  seasonLabel: string
  teams: { id: string; name: string; season: number }[]
  leader: { name: string } | null
}

export function Home() {
  const { rep } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  useEffect(() => {
    api<Board>('/api/leaderboard').then(setBoard).catch(() => setBoard(null))
  }, [])
  if (!rep) return null
  const max = Math.max(1, ...(board?.teams.map((team) => team.season) || [1]))
  return (
    <main className="screen">
      <FloorScene outfit={rep.outfit} showroom={rep.showroom} />
      <div className="rank-line">
        <h1>{rep.name}</h1>
        <span className="kicker">{rep.rank} · LVL {rep.level}</span>
      </div>
      <div className="bar" aria-label="Rank progress"><span style={{ width: `${rep.pct}%` }} /></div>
      <p className="muted" style={{ marginTop: 6 }}>{rep.next ? `${rep.nextAt! - rep.xp} XP to ${rep.next}` : 'Legend. The floor already knows.'} · Season rank {rep.place} of {rep.teamSize}</p>
      <div className="card" style={{ marginTop: 8 }}>
        <div className="kicker">{board?.seasonLabel || 'Season'}</div>
        <div className="season">
          {(board?.teams || []).map((team) => (
            <div key={team.id}>
              <span className={team.id}>{team.name}</span>
              <b>{team.season}</b>
              <div className="bar"><span style={{ width: `${(team.season / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="muted">{board?.leader ? `${board.leader.name} holds the cup.` : 'First points take the cup.'}</div>
      </div>
      <Link to="/daily" className="tile wide" style={{ textDecoration: 'none', color: 'inherit', marginTop: 10 }} data-testid="mode-daily">
        <em>Daily · streak {rep.streak}</em>
        <strong>Word on the floor</strong>
      </Link>
      <div className="grid-2" style={{ marginTop: 10 }}>
        <Link to="/lightning" className="tile" data-testid="mode-lightning"><em>Timed</em><strong>Lightning</strong></Link>
        <Link to="/walk" className="tile" data-testid="mode-walk"><em>Live buyer</em><strong>Walk-In</strong></Link>
        <Link to="/arena" className="tile" data-testid="mode-arena"><em>Phones out</em><strong>Arena</strong></Link>
        <Link to="/wheel" className="tile" data-testid="mode-wheel"><em>30 seconds</em><strong>Beat them</strong></Link>
        <Link to="/boss" className="tile wide" data-testid="mode-boss"><em>Whole team</em><strong>Month-end boss</strong></Link>
      </div>
    </main>
  )
}
