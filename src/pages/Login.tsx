import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { play, unlock } from '../lib/sound'

const TEAMS = [
  { id: 'kee', name: 'Kee', blurb: 'Cyan bay' },
  { id: 'northline', name: 'Northline', blurb: 'Gold bay' },
  { id: 'tricity', name: 'Tricity Retail', blurb: 'Red bay' },
]

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [team, setTeam] = useState('tricity')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function press(digit: string) {
    unlock()
    play('tap')
    setPin((current) => (current.length >= 4 ? current : current + digit))
  }

  async function enter() {
    setBusy(true)
    setError('')
    try {
      await signIn({ name, team, pin })
      play('fanfare')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Try again.')
      play('wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="screen stack">
      <p className="kicker">Tricity Mitsubishi · Port Coquitlam</p>
      <h1 className="display" style={{ fontSize: 52, lineHeight: 0.9 }}>SALES FLOOR<br />SHOWDOWN</h1>
      <p className="muted">Every point is a skill you will use on the next up. Name, team, four-digit PIN. Same name and PIN brings your avatar back.</p>
      <div className="team-pick">
        {TEAMS.map((item) => (
          <button key={item.id} data-testid={`team-${item.id}`} className={team === item.id ? 'on' : ''} onClick={() => { play('tap'); setTeam(item.id) }}>
            <strong className={item.id}>{item.name}</strong>
            <div className="muted">{item.blurb}</div>
          </button>
        ))}
      </div>
      <label className="stack">
        <span className="kicker">Your name</span>
        <input className="field" data-testid="login-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Chen" autoComplete="name" />
      </label>
      <div className="dots" aria-label="PIN">{[0, 1, 2, 3].map((index) => <i key={index} className={pin.length > index ? 'on' : ''} />)}</div>
      <div className="pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'C'].map((key) => (
          <button
            key={key}
            data-testid={key === 'DEL' ? 'pin-back' : key === 'C' ? 'pin-clear' : `pin-${key}`}
            onClick={() => {
              if (key === 'DEL') setPin((current) => current.slice(0, -1))
              else if (key === 'C') setPin('')
              else press(key)
            }}
          >
            {key}
          </button>
        ))}
      </div>
      {error && <p style={{ color: '#ff8fa0' }}>{error}</p>}
      <button className="primary" data-testid="enter-floor" disabled={busy || pin.length !== 4 || name.trim().length < 2} onClick={() => void enter()}>
        STEP ON THE FLOOR
      </button>
    </main>
  )
}
