import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Coaching, Rep } from '../lib/types'
import { Coach } from '../components/Fireworks'

type Guess = { guess: string; marks: string[] }
type Daily = {
  day: string
  guesses: Guess[]
  solved: boolean
  failed: boolean
  remaining: number
  streak: number
  tip: string | null
  word: string | null
  share: string
  rep?: Rep
  coaching?: Coaching | null
}

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export function Daily() {
  const { setRep } = useAuth()
  const [daily, setDaily] = useState<Daily | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api<Daily>('/api/daily').then(setDaily).catch((err) => setError(err.message))
  }, [])

  async function guess(word = draft) {
    if (word.length !== 5 || !daily || daily.solved || daily.failed) return
    try {
      const data = await api<Daily>('/api/daily/guess', { guess: word })
      setDaily(data)
      setDraft('')
      if (data.rep) setRep(data.rep)
      if (data.solved) play('fanfare')
      else if (data.failed) play('wrong')
      else play('tap')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No.')
      play('wrong')
    }
  }

  function type(key: string) {
    if (!daily || daily.solved || daily.failed) return
    if (key === 'ENTER') void guess()
    else if (key === 'DEL') setDraft((value) => value.slice(0, -1))
    else setDraft((value) => (value.length >= 5 ? value : value + key))
  }

  async function share() {
    if (!daily) return
    try {
      await navigator.clipboard.writeText(daily.share)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (!daily) return <main className="screen"><p className="kicker">{error || 'Setting the word…'}</p></main>
  const rows = [...daily.guesses]
  if (!daily.solved && !daily.failed) rows.push({ guess: draft.padEnd(5, ' '), marks: Array(5).fill('') })
  while (rows.length < 6) rows.push({ guess: '     ', marks: Array(5).fill('') })

  return (
    <main className="screen stack">
      <p className="kicker">{daily.day} · streak {daily.streak}</p>
      <h1>WORD ON THE FLOOR</h1>
      <div className="tiles" data-testid="wordle">
        {rows.slice(0, 6).map((row, rowIndex) => row.guess.split('').map((letter, index) => (
          <div key={`${rowIndex}-${index}`} className={`word ${row.marks[index] || ''}`}>{letter.trim()}</div>
        )))}
      </div>
      {(daily.solved || daily.failed) && (
        <section className="card stack">
          <h2>{daily.solved ? daily.word : `It was ${daily.word}`}</h2>
          <p>{daily.tip}</p>
          <button className="primary" data-testid="share" onClick={() => void share()}>{copied ? 'COPIED' : 'SHARE THE GRID'}</button>
          <Coach coaching={daily.coaching || null} />
        </section>
      )}
      <div className="keyboard">
        {ROWS.map((row) => (
          <div className="row" key={row}>
            {row.split('').map((key) => (
              <button key={key} className="key" data-testid={`key-${key}`} onClick={() => type(key)}>{key}</button>
            ))}
          </div>
        ))}
        <div className="row">
          <button className="key" data-testid="key-ENTER" onClick={() => type('ENTER')}>ENTER</button>
          <button className="key" data-testid="key-DEL" onClick={() => type('DEL')}>DEL</button>
        </div>
      </div>
      {error && <p>{error}</p>}
    </main>
  )
}
