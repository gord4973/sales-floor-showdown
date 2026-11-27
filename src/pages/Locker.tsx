import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Rep } from '../lib/types'

export function Locker() {
  const { rep, setRep, signOut } = useAuth()
  const [error, setError] = useState('')
  if (!rep) return null
  async function equip(body: { outfit?: string; showroom?: string }) {
    try {
      const data = await api<{ rep: Rep }>('/api/me/equip', body)
      setRep(data.rep)
      play('tap')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Locked.')
    }
  }
  return (
    <main className="screen stack">
      <p className="kicker">Locker</p>
      <h1>{rep.rank.toUpperCase()}</h1>
      <p className="muted">{rep.badges.length} badges · {rep.xp} career XP · streak {rep.streak}</p>
      <h2>Outfits</h2>
      {rep.outfits.map((outfit) => (
        <button key={outfit.id} className={`choice ${rep.outfit === outfit.id ? 'on' : ''}`} disabled={!outfit.unlocked} data-testid={`outfit-${outfit.id}`} onClick={() => void equip({ outfit: outfit.id })}>
          <strong>{outfit.name}</strong>
          <div>{outfit.unlocked ? outfit.blurb : `Unlocks at ${outfit.xp} XP`}</div>
        </button>
      ))}
      <h2>Showroom</h2>
      {rep.showrooms.map((room) => (
        <button key={room.id} className={`choice ${rep.showroom === room.id ? 'on' : ''}`} disabled={!room.unlocked} data-testid={`room-${room.id}`} onClick={() => void equip({ showroom: room.id })}>
          <strong>{room.name}</strong>
          <div>{room.unlocked ? room.blurb : `Unlocks at ${room.xp} XP`}</div>
        </button>
      ))}
      <h2>Badges</h2>
      {rep.badges.length === 0 && <p className="muted">Win a round. The case fills itself.</p>}
      {rep.badges.map((badge) => <div key={badge.id} className="card"><strong>{badge.name}</strong><div className="muted">{badge.blurb}</div></div>)}
      {error && <p>{error}</p>}
      <Link to="/manager" className="ghost" style={{ textAlign: 'center', textDecoration: 'none' }}>Manager board</Link>
      <Link to="/admin" className="ghost" style={{ textAlign: 'center', textDecoration: 'none' }}>Question desk</Link>
      <button className="ghost" onClick={signOut}>Sign out</button>
    </main>
  )
}
