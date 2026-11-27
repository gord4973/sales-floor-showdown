import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Coaching, Rep } from '../lib/types'
import { Coach, Fireworks } from '../components/Fireworks'

type BossState = { id: string; name: string; taunt: string; hp: number; maxHp: number; status: string; teamName: string }
type Hit = { name: string; damage: number; quality: string }
type Deal = { id: string; customer: string; context: string; responses: string[] }
type Result = {
  quality: string
  damage: number
  explanation: string
  best: string
  killed: boolean
  boss: BossState
  hits: Hit[]
  points: number
  rep: Rep
  coaching: Coaching | null
}

export function Boss() {
  const { setRep } = useAuth()
  const [boss, setBoss] = useState<BossState | null>(null)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [hits, setHits] = useState<Hit[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [burst, setBurst] = useState(0)
  const [error, setError] = useState('')

  async function load(fresh = false) {
    const data = await api<{ boss: BossState; objection: Deal | null; hits: Hit[] }>(`/api/boss${fresh ? '?deal=1' : ''}`)
    setBoss(data.boss)
    setHits(data.hits)
    if (data.objection) setDeal(data.objection)
    if (data.boss.status !== 'active') setDeal(null)
  }

  useEffect(() => {
    load(true).catch((err) => setError(err.message))
    const timer = window.setInterval(() => { load(false).catch(() => {}) }, 2000)
    return () => window.clearInterval(timer)
  }, [])

  async function swing(choice: number) {
    if (!deal) return
    const data = await api<Result>('/api/boss/hit', { objectionId: deal.id, choice })
    setResult(data)
    setBoss(data.boss)
    setHits(data.hits)
    setRep(data.rep)
    if (data.killed) {
      play('win')
      setBurst((value) => value + 1)
    } else if (data.damage > 0) play('hit')
    else play('wrong')
  }

  async function nextShot() {
    setResult(null)
    await load(true)
    play('tap')
  }

  async function summon() {
    const data = await api<{ boss: BossState }>('/api/boss/next', {})
    setBoss(data.boss)
    setResult(null)
    await load(true)
  }

  if (!boss) return <main className="screen"><p className="kicker">{error || 'The buyer is walking up…'}</p></main>
  const pct = boss.maxHp ? (boss.hp / boss.maxHp) * 100 : 0

  return (
    <main className="screen stack">
      <Fireworks burst={burst} />
      <p className="kicker">{boss.teamName} · shared HP</p>
      <h1>{boss.name}</h1>
      <p>{boss.taunt}</p>
      <div className="hp" data-testid="boss-hp"><span style={{ ['--p' as string]: pct }} /></div>
      <div className="rank-line"><span>{boss.hp} HP</span><span>{boss.maxHp}</span></div>
      {boss.status !== 'active' && (
        <section className="card stack" data-testid="boss-down">
          <h2>THE BUYER FOLDED.</h2>
          <p>Everyone who landed a shot shares the reward. The cup notices.</p>
          <button className="primary" onClick={() => void summon()}>BRING IN THE NEXT BUYER</button>
        </section>
      )}
      {boss.status === 'active' && deal && !result && (
        <>
          <section className="card">
            <div className="kicker">They say</div>
            <h2>{deal.customer}</h2>
            <p className="muted">{deal.context}</p>
          </section>
          {deal.responses.map((text, index) => (
            <button key={text} className="choice" data-testid={`boss-choice-${index}`} onClick={() => void swing(index)}>{text}</button>
          ))}
        </>
      )}
      {result && (
        <section className="card stack">
          <div className="kicker">{result.damage ? `-${result.damage} HP · +${result.points}` : 'No damage'}</div>
          <p>{result.explanation}</p>
          <p className="muted">Strongest line: {result.best}</p>
          <Coach coaching={result.coaching} />
          {boss.status === 'active' && <button className="primary" onClick={() => void nextShot()}>NEXT SHOT</button>}
        </section>
      )}
      <div className="card">
        <div className="kicker">Live hits</div>
        {hits.length === 0 && <p className="muted">Nobody has swung yet. The bar is full.</p>}
        {hits.map((hit, index) => (
          <div key={`${hit.name}-${index}`} className="feed-item">{hit.name} · {hit.quality} · {hit.damage ? `-${hit.damage}` : 'glanced'}</div>
        ))}
      </div>
    </main>
  )
}
