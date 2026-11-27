import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Line = { skill: string; label: string; hits: number; n: number; accuracy: number }
type Person = { id: string; name: string; teamName: string; rank: string; level: number; xp: number; skills: Line[]; weak: Line | null }

export function Manager() {
  const [reps, setReps] = useState<Person[] | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [team, setTeam] = useState('all')

  async function load() {
    const data = await api<{ reps: Person[] }>('/api/manager')
    setReps(data.reps)
    setError('')
  }
  useEffect(() => { load().catch((err) => setError(err.message)) }, [])

  async function unlock() {
    try {
      const data = await api<{ token: string }>('/api/admin/login', { password })
      localStorage.setItem('sf-admin', data.token)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No.')
    }
  }

  const shown = (reps || []).filter((person) => team === 'all' || person.teamName === team)
  return (
    <main className="screen stack admin">
      <p className="kicker">Manager board</p>
      <h1>WHERE THE DEALS ARE LEAKING</h1>
      {error && (
        <section className="card stack">
          <p>{error}</p>
          <input className="field" type="password" value={password} placeholder="Desk password" data-testid="manager-password" onChange={(event) => setPassword(event.target.value)} />
          <button className="primary" data-testid="manager-unlock" onClick={() => void unlock()}>OPEN</button>
        </section>
      )}
      {reps && (
        <>
          <div className="row">
            {['all', 'Kee', 'Northline', 'Tricity Retail'].map((item) => (
              <button key={item} className={`ghost ${team === item ? 'on' : ''}`} onClick={() => setTeam(item)}>{item}</button>
            ))}
          </div>
          {shown.length === 0 && <p className="muted">No rounds yet. Weak spots show up after reps play.</p>}
          {shown.map((person) => (
            <article key={person.id} className="card stack" data-testid={`manager-${person.id}`}>
              <div className="rank-line">
                <strong>{person.name}</strong>
                <span>{person.teamName} · {person.rank} · LVL {person.level}</span>
              </div>
              {person.weak ? (
                <p>Weak spot: <b>{person.weak.label}</b> at {person.weak.accuracy}% over {person.weak.n} tries.</p>
              ) : <p className="muted">Not enough rounds to call a weak spot.</p>}
              {person.skills.map((line) => (
                <div key={line.skill}>
                  <div className="rank-line"><span>{line.label}</span><span>{line.accuracy}%</span></div>
                  <div className="bar"><span style={{ width: `${line.accuracy}%` }} /></div>
                </div>
              ))}
            </article>
          ))}
        </>
      )}
    </main>
  )
}
