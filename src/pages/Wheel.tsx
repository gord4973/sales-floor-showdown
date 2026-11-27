import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Coaching, Rep } from '../lib/types'
import { Coach, Fireworks } from '../components/Fireworks'

const COLORS = ['#ff2a3c', '#3dfff2', '#ffc14d', '#ff3d9a', '#7aa2ff', '#b8ff7a', '#ff8a3d', '#ffffff']

type Spin = {
  runId: string
  index: number
  seconds: number
  names: string[]
  rival: { name: string; vehicle: string; respect: string; cards: { id: string; title: string; line: string }[] }
}
type Score = {
  timedOut: boolean
  points: number
  xp: number
  results: { title: string; good: boolean; why: string }[]
  missed: { title: string; why: string }[]
  clean: boolean
  respect: string
  name: string
  rep: Rep
  coaching: Coaching | null
}

export function Wheel() {
  const { setRep } = useAuth()
  const [spin, setSpin] = useState<Spin | null>(null)
  const [angle, setAngle] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'pitch' | 'done'>('idle')
  const [picked, setPicked] = useState<string[]>([])
  const pickedRef = useRef<string[]>([])
  pickedRef.current = picked
  const [left, setLeft] = useState(30)
  const [score, setScore] = useState<Score | null>(null)
  const [burst, setBurst] = useState(0)
  const [error, setError] = useState('')
  const sent = useRef(false)

  async function spinWheel() {
    setError('')
    setScore(null)
    setPicked([])
    const data = await api<Spin>('/api/pitch/spin', {})
    setSpin(data)
    sent.current = false
    setPhase('spinning')
    setAngle((current) => current - (current % 360) + 360 * 6 - (data.index * (360 / data.names.length) + 180 / data.names.length))
    play('tick')
    window.setTimeout(() => {
      setPhase('pitch')
      setLeft(30)
      play('fanfare')
    }, 4300)
  }

  useEffect(() => {
    if (phase !== 'pitch' || !spin) return
    const started = Date.now()
    const timer = window.setInterval(() => {
      const remain = Math.max(0, 30 - (Date.now() - started) / 1000)
      setLeft(remain)
      if (remain <= 0) {
        window.clearInterval(timer)
        void submit(pickedRef.current)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [phase, spin?.runId])

  async function submit(ids = picked) {
    if (!spin || sent.current) return
    sent.current = true
    setPhase('done')
    try {
      const data = await api<Score>('/api/pitch/submit', { runId: spin.runId, cardIds: ids })
      setScore(data)
      setRep(data.rep)
      if (data.clean) {
        play('win')
        setBurst((value) => value + 1)
      } else if (data.results.some((item) => !item.good)) play('wrong')
      else play('correct')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The wheel stuck.')
    }
  }

  function toggle(cardId: string) {
    if (phase !== 'pitch') return
    play('tap')
    setPicked((current) => {
      if (current.includes(cardId)) return current.filter((item) => item !== cardId)
      if (current.length >= 3) return current
      return [...current, cardId]
    })
  }

  const names = spin?.names || ['RAV4', 'CR-V', 'Rogue', 'Tucson', 'CX-5', 'Kona', 'HR-V', 'Corolla Cross']
  const slice = 360 / names.length
  const gradient = names.map((_, index) => `${COLORS[index]} ${index * slice}deg ${(index + 1) * slice}deg`).join(', ')

  return (
    <main className="screen stack">
      <Fireworks burst={burst} />
      <p className="kicker">Beat the competition</p>
      <h1>SPIN. THEN YOU HAVE 30 SECONDS.</h1>
      <div className="wheel-wrap">
        <div className="pointer" />
        <div className="wheel" data-testid="wheel" style={{ transform: `rotate(${angle}deg)`, background: `conic-gradient(${gradient})` }} />
      </div>
      {phase === 'idle' && <button className="primary" data-testid="spin" onClick={() => void spinWheel()}>SPIN THE WHEEL</button>}
      {phase === 'spinning' && <p className="kicker" style={{ textAlign: 'center' }}>The floor is watching…</p>}
      {spin && phase !== 'idle' && phase !== 'spinning' && (
        <>
          <h2>They came from a {spin.rival.name}</h2>
          <p>{spin.rival.respect}</p>
          <div className="muted">Pitch the {spin.rival.vehicle}. Pick the 3 strongest lines. {Math.ceil(left)}s</div>
          <div className="bar"><span style={{ width: `${(left / 30) * 100}%` }} /></div>
          {spin.rival.cards.map((card) => (
            <button key={card.id} className={`choice ${picked.includes(card.id) ? 'on' : ''}`} data-testid={`pitch-${card.id}`} onClick={() => toggle(card.id)}>
              <strong>{card.title}</strong>
              <div>{card.line}</div>
            </button>
          ))}
          {phase === 'pitch' && <button className="primary" data-testid="pitch-submit" onClick={() => void submit()}>LOCK THE PITCH</button>}
        </>
      )}
      {score && (
        <section className="card stack">
          <div className="kicker">{score.timedOut ? 'They checked their phone' : `+${score.points}`}</div>
          {score.results.map((item) => (
            <p key={item.title}><strong style={{ color: item.good ? '#3dff9a' : '#ff8fa0' }}>{item.good ? 'Lands' : 'Trap'}: {item.title}.</strong> {item.why}</p>
          ))}
          {score.missed.slice(0, 2).map((item) => <p key={item.title} className="muted">Also strong: {item.title}. {item.why}</p>)}
          <Coach coaching={score.coaching} />
          <button className="primary" onClick={() => { setPhase('idle'); setSpin(null); setScore(null) }}>SPIN AGAIN</button>
        </section>
      )}
      {error && <p>{error}</p>}
    </main>
  )
}
