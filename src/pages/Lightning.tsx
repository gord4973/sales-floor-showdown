import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { play } from '../lib/sound'
import { useAuth } from '../lib/auth'
import type { Badge, Coaching, Rep } from '../lib/types'
import { Coach, Fireworks } from '../components/Fireworks'

type Question = { id: string; vehicle: string; category: string; skillLabel: string; prompt: string; choices: string[] }
type Start = { runId: string; total: number; question: Question; bucket: number }
type Result = {
  correct: boolean
  timedOut: boolean
  answer: number
  explanation: string
  points: number
  multiplier: number
  streak: number
  score: number
  done: boolean
  next: Question | null
  skillLabel: string
  newBadges: Badge[]
  rep: Rep
  coaching: Coaching | null
}

export function Lightning() {
  const { setRep } = useAuth()
  const [run, setRun] = useState<Start | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(10)
  const [left, setLeft] = useState(12)
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [error, setError] = useState('')
  const [burst, setBurst] = useState(0)
  const [shake, setShake] = useState(false)
  const lock = useRef(false)
  const answerRef = useRef<(choice: number) => void>(() => {})

  answerRef.current = async (choice: number) => {
    if (!run || !question || lock.current || result) return
    lock.current = true
    try {
      const data = await api<Result>('/api/lightning/answer', { runId: run.runId, choice })
      setResult(data)
      setScore(data.score)
      setStreak(data.streak)
      setRep(data.rep)
      if (data.correct && data.multiplier >= 2) {
        play('combo')
        setBurst((value) => value + 1)
      } else if (data.correct) play('correct')
      else {
        play('wrong')
        setShake(true)
        window.setTimeout(() => setShake(false), 400)
      }
      if (data.done) play('fanfare')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Missed the tower.')
      lock.current = false
    }
  }

  useEffect(() => {
    if (!question || result) return
    const started = Date.now()
    setLeft(12)
    const timer = window.setInterval(() => {
      const remain = Math.max(0, 12 - (Date.now() - started) / 1000)
      setLeft(remain)
      if (remain <= 0) {
        window.clearInterval(timer)
        answerRef.current(-1)
      }
    }, 80)
    return () => window.clearInterval(timer)
  }, [question?.id, result])

  async function start() {
    setError('')
    const data = await api<Start>('/api/lightning/start', {})
    setRun(data)
    setQuestion(data.question)
    setTotal(data.total)
    setIndex(0)
    setResult(null)
    setScore(0)
    setStreak(0)
    lock.current = false
    play('tap')
  }

  function next() {
    if (!result?.next) return
    setQuestion(result.next)
    setIndex((value) => value + 1)
    setResult(null)
    lock.current = false
    play('tap')
  }

  if (!run || !question) {
    return (
      <main className="screen stack">
        <p className="kicker">Lightning round</p>
        <h1 style={{ fontSize: 48 }}>TEN QUESTIONS. TWELVE SECONDS. COMBOS PAY.</h1>
        <p className="muted">Trims, warranty, PHEV range, and what you actually say when Surrey comes up. Streaks hit x2, x3, then x4 and the bay goes off.</p>
        {error && <p style={{ color: '#ff8fa0' }}>{error}</p>}
        <button className="primary" data-testid="lightning-start" onClick={() => void start()}>LIGHT IT UP</button>
      </main>
    )
  }

  return (
    <main className={`screen stack ${shake ? 'shake' : ''}`}>
      <Fireworks burst={burst} />
      {result?.correct && result.multiplier >= 2 && <div className="pop">x{result.multiplier} {result.skillLabel.toUpperCase()}</div>}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="kicker">Week card · {question.vehicle}</div>
          <div className="muted">{index + 1} / {total} · streak {streak}</div>
        </div>
        <div className="timer" style={{ ['--p' as string]: (left / 12) * 100 }}><span>{Math.ceil(left)}</span></div>
      </div>
      <h2 className="question">{question.prompt}</h2>
      {question.choices.map((choice, choiceIndex) => {
        let tone = ''
        if (result) {
          if (choiceIndex === result.answer) tone = 'good'
          else if (!result.correct) tone = 'bad'
        }
        return (
          <button key={choice} className={`slab ${tone}`} data-testid={`choice-${choiceIndex}`} disabled={Boolean(result)} onClick={() => answerRef.current(choiceIndex)}>
            {choice}
          </button>
        )
      })}
      {result && (
        <section className="card stack">
          <div className="kicker">{result.timedOut ? 'Time' : result.correct ? `+${result.points} ${result.skillLabel}` : 'Not that one'}</div>
          <p style={{ margin: 0 }}>{result.explanation}</p>
          {result.done ? (
            <>
              <h2>{score} points on the board</h2>
              <Coach coaching={result.coaching} />
              <button className="primary" onClick={() => { setRun(null); setQuestion(null) }}>RUN IT BACK</button>
            </>
          ) : (
            <button className="primary" data-testid="next-question" onClick={next}>NEXT</button>
          )}
          {result.newBadges[0] && <div className="badge-toast">BADGE · {result.newBadges[0].name}</div>}
        </section>
      )}
    </main>
  )
}
