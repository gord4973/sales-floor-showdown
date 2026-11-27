import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { api } from '../lib/api'

type Payload = {
  seasonLabel: string
  leader: { id: string; name: string; season: number } | null
  teams: { id: string; name: string; season: number }[]
  people: { id: string; name: string; teamName: string; team: string; season: number; rank: string }[]
  feed: { name: string; summary: string; xp: number }[]
  bosses: { teamName: string; name: string; hp: number; maxHp: number; status: string }[]
}

export function TV() {
  const [data, setData] = useState<Payload | null>(null)
  const [qr, setQr] = useState('')
  useEffect(() => {
    QRCode.toDataURL(window.location.origin, { margin: 1, width: 220, color: { dark: '#120814', light: '#3dfff2' } }).then(setQr).catch(() => {})
    const pull = () => api<Payload>('/api/tv').then(setData).catch(() => {})
    pull()
    const timer = window.setInterval(pull, 2500)
    return () => window.clearInterval(timer)
  }, [])
  if (!data) return <main className="tv-screen"><p className="kicker">Lighting the showroom…</p></main>
  const max = Math.max(1, ...data.teams.map((team) => team.season))
  return (
    <main className="tv-screen">
      <div className="kicker">Tricity Mitsubishi · Port Coquitlam · Live</div>
      <h1 style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>{data.seasonLabel}</h1>
      <div className="tv-grid">
        <div className="stack">
          {data.teams.map((team) => (
            <section key={team.id} className={data.leader?.id === team.id ? 'card leader' : 'card'}>
              <div className="rank-line">
                <strong className={team.id} style={{ fontSize: 28 }}>{team.name}</strong>
                {data.leader?.id === team.id && <span className="kicker">Cup</span>}
              </div>
              <div className="tv-score">{team.season}</div>
              <div className="bar"><span style={{ width: `${(team.season / max) * 100}%` }} /></div>
            </section>
          ))}
        </div>
        <div className="stack">
          <section className="card">
            <div className="kicker">Join from your phone</div>
            {qr && <img src={qr} alt="QR code to open the game" width={180} height={180} />}
            <div>{window.location.origin.replace(/^https?:\/\//, '')}</div>
          </section>
          <section className="card">
            <div className="kicker">Boss HP</div>
            {data.bosses.map((boss) => (
              <div key={boss.name + boss.teamName}>
                <div className="rank-line"><span>{boss.teamName}</span><span>{boss.status === 'active' ? `${boss.hp}/${boss.maxHp}` : 'DOWN'}</span></div>
                <div className="hp"><span style={{ ['--p' as string]: boss.maxHp ? (boss.hp / boss.maxHp) * 100 : 0 }} /></div>
                <div className="muted">{boss.name}</div>
              </div>
            ))}
          </section>
          <section className="card">
            <div className="kicker">Top of the board</div>
            {data.people.slice(0, 8).map((person, index) => (
              <div key={person.id} className="rank-line feed-item">
                <span>{index + 1}. {person.name}</span>
                <b>{person.season}</b>
              </div>
            ))}
            {data.people.length === 0 && <p>Waiting for the first rep.</p>}
          </section>
          <section className="card">
            <div className="kicker">Floor feed</div>
            {data.feed.slice(0, 6).map((item, index) => <div key={index} className="feed-item">{item.name} · {item.summary} · +{item.xp}</div>)}
          </section>
        </div>
      </div>
    </main>
  )
}
