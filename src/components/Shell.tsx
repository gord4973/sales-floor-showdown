import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { isMuted, setMuted, unlock } from '../lib/sound'

export function Shell() {
  const { rep, ready } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [muted, setMuteState] = useState(isMuted())
  const bare = location.pathname === '/login' || location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager')

  useEffect(() => {
    if (!ready) return
    if (!rep && !bare) navigate('/login', { replace: true })
  }, [ready, rep, bare, navigate])

  if (!ready) return <div className="phone screen"><p className="kicker">Cueing the floor…</p></div>
  if (!rep && !bare) return null

  return (
    <div className="phone">
      <header className="topbar">
        <div className="brand">
          <b>SHOWDOWN</b>
          <span>{rep ? rep.teamName : 'Tricity Mitsubishi'}</span>
        </div>
        <div className="row">
          {rep && <div className="xp-pill">LVL {rep.level} · {rep.xp} XP</div>}
          <button
            className={`icon-btn ${muted ? 'on' : ''}`}
            data-testid="mute"
            onClick={() => {
              unlock()
              const next = !muted
              setMuted(next)
              setMuteState(next)
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? 'MUTE' : 'SND'}
          </button>
        </div>
      </header>
      <Outlet />
      {rep && !bare && (
        <nav className="nav">
          <NavLink to="/" end>Floor</NavLink>
          <NavLink to="/board">Board</NavLink>
          <NavLink to="/daily">Daily</NavLink>
          <NavLink to="/locker">Locker</NavLink>
        </nav>
      )}
    </div>
  )
}
