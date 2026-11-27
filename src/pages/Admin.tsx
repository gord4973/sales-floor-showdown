import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Question = { id: string; prompt: string; choices: string[]; answer: number; explanation: string; vehicle: string; category: string; skill: string; bucket: number; active: boolean }
type Objection = { id: string; customer: string; context: string; skill: string; category: string; explanation: string; responses: { text: string; quality: string }[]; active?: boolean }
type Scenario = { id: string; title: string; customer: string; active?: boolean; beats: unknown[] }

const emptyQuestion = (): Question => ({
  id: '',
  prompt: '',
  choices: ['', '', '', ''],
  answer: 0,
  explanation: '',
  vehicle: 'Outlander',
  category: 'custom',
  skill: 'product',
  bucket: 0,
  active: true,
})

export function Admin() {
  const [authed, setAuthed] = useState(Boolean(localStorage.getItem('sf-admin')))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'questions' | 'objections' | 'scenarios' | 'reps'>('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [objections, setObjections] = useState<Objection[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [reps, setReps] = useState<{ id: string; name: string; team: string; role: string; xp: number }[]>([])
  const [draft, setDraft] = useState<Question>(emptyQuestion())
  const [query, setQuery] = useState('')
  const [scenarioText, setScenarioText] = useState('')
  const [objection, setObjection] = useState<Objection | null>(null)

  async function load() {
    const data = await api<{ questions: Question[]; objections: Objection[]; scenarios: Scenario[]; reps: typeof reps }>('/api/admin/content')
    setQuestions(data.questions)
    setObjections(data.objections)
    setScenarios(data.scenarios)
    setReps(data.reps)
  }

  useEffect(() => {
    if (!authed) return
    load().catch((err) => { setError(err.message); setAuthed(false); localStorage.removeItem('sf-admin') })
  }, [authed])

  async function login() {
    try {
      const data = await api<{ token: string }>('/api/admin/login', { password })
      localStorage.setItem('sf-admin', data.token)
      setAuthed(true)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No.')
    }
  }

  async function saveQuestion() {
    const path = draft.id ? `/api/admin/questions/${draft.id}` : '/api/admin/questions'
    await api(path, draft, draft.id ? 'PUT' : 'POST')
    setDraft(emptyQuestion())
    await load()
  }

  async function saveObjection() {
    if (!objection) return
    const path = objections.some((item) => item.id === objection.id) && objection.id ? `/api/admin/objections/${objection.id}` : '/api/admin/objections'
    await api(path, objection, path.includes('/objections/') && objections.some((item) => item.id === objection.id) ? 'PUT' : 'POST')
    setObjection(null)
    await load()
  }

  async function saveScenario() {
    const data = JSON.parse(scenarioText)
    await api(`/api/admin/scenarios/${data.id}`, { data }, 'PUT')
    await load()
  }

  if (!authed) {
    return (
      <main className="screen stack">
        <p className="kicker">Question desk</p>
        <h1>PASSWORD</h1>
        <p className="muted">Local desk password is showdown. On Render it is the generated ADMIN_PASSWORD.</p>
        <input className="field" type="password" data-testid="admin-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p>{error}</p>}
        <button className="primary" data-testid="admin-login" onClick={() => void login()}>UNLOCK</button>
      </main>
    )
  }

  const filtered = questions.filter((question) => `${question.prompt} ${question.vehicle}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <main className="screen stack admin">
      <p className="kicker">Question desk</p>
      <div className="row">
        {(['questions', 'objections', 'scenarios', 'reps'] as const).map((item) => (
          <button key={item} className="ghost" data-testid={`tab-${item}`} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {error && <p>{error}</p>}
      {tab === 'questions' && (
        <>
          <input className="field search" placeholder="Search questions" value={query} onChange={(event) => setQuery(event.target.value)} />
          <article className="card stack">
            <h2>{draft.id ? 'Edit question' : 'New question'}</h2>
            <textarea className="field" data-testid="q-prompt" value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} placeholder="Prompt" />
            {draft.choices.map((choice, index) => (
              <label key={index} className="row">
                <input type="radio" name="answer" checked={draft.answer === index} onChange={() => setDraft({ ...draft, answer: index })} />
                <input className="field" data-testid={`q-choice-${index}`} value={choice} onChange={(event) => {
                  const choices = [...draft.choices]
                  choices[index] = event.target.value
                  setDraft({ ...draft, choices })
                }} />
              </label>
            ))}
            <textarea className="field" data-testid="q-explain" value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} placeholder="What the rep should say after" />
            <div className="row">
              <input className="field" value={draft.vehicle} onChange={(event) => setDraft({ ...draft, vehicle: event.target.value })} />
              <input className="field" value={draft.skill} onChange={(event) => setDraft({ ...draft, skill: event.target.value })} />
            </div>
            <button className="primary" data-testid="q-save" onClick={() => void saveQuestion().catch((err) => setError(err.message))}>SAVE QUESTION</button>
          </article>
          {filtered.slice(0, 30).map((question) => (
            <button key={question.id} className="choice" onClick={() => setDraft(question)}>
              <strong>{question.vehicle}</strong>
              <div>{question.prompt}</div>
            </button>
          ))}
        </>
      )}
      {tab === 'objections' && (
        <>
          <button className="ghost" onClick={() => setObjection({ id: '', customer: '', context: '', skill: 'objection', category: 'custom', explanation: '', responses: [{ text: '', quality: 'best' }, { text: '', quality: 'ok' }, { text: '', quality: 'poor' }, { text: '', quality: 'poor' }], active: true })}>New objection</button>
          {objection && (
            <article className="card stack">
              <textarea className="field" value={objection.customer} onChange={(event) => setObjection({ ...objection, customer: event.target.value })} placeholder="Customer line" />
              <textarea className="field" value={objection.context} onChange={(event) => setObjection({ ...objection, context: event.target.value })} placeholder="Context" />
              {objection.responses.map((response, index) => (
                <div key={index} className="row">
                  <select value={response.quality} onChange={(event) => {
                    const responses = objection.responses.map((item, itemIndex) => itemIndex === index ? { ...item, quality: event.target.value } : item)
                    setObjection({ ...objection, responses })
                  }}>
                    <option value="best">best</option>
                    <option value="ok">ok</option>
                    <option value="poor">poor</option>
                  </select>
                  <input className="field" value={response.text} onChange={(event) => {
                    const responses = objection.responses.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item)
                    setObjection({ ...objection, responses })
                  }} />
                </div>
              ))}
              <textarea className="field" value={objection.explanation} onChange={(event) => setObjection({ ...objection, explanation: event.target.value })} />
              <button className="primary" onClick={() => void saveObjection().catch((err) => setError(err.message))}>SAVE OBJECTION</button>
            </article>
          )}
          {objections.map((item) => (
            <button key={item.id} className="choice" onClick={() => setObjection(item)}>{item.customer}</button>
          ))}
        </>
      )}
      {tab === 'scenarios' && (
        <>
          <p className="muted">Pick a scenario, edit the JSON, save. New ones need an id and at least 4 beats with 3 choices each.</p>
          {scenarios.map((scenario) => (
            <button key={scenario.id} className="choice" onClick={() => setScenarioText(JSON.stringify(scenario, null, 2))}>{scenario.customer}: {scenario.title}</button>
          ))}
          <textarea className="field" style={{ minHeight: 220 }} value={scenarioText} onChange={(event) => setScenarioText(event.target.value)} />
          <button className="primary" onClick={() => void saveScenario().catch((err) => setError(err.message))}>SAVE SCENARIO</button>
        </>
      )}
      {tab === 'reps' && reps.map((rep) => (
        <div key={rep.id} className="card rank-line">
          <div><strong>{rep.name}</strong><div className="muted">{rep.team} · {rep.xp} XP · {rep.role}</div></div>
          <button className="ghost" onClick={() => void api(`/api/admin/reps/${rep.id}/role`, { role: rep.role === 'manager' ? 'rep' : 'manager' }, 'POST').then(load)}>
            {rep.role === 'manager' ? 'Make rep' : 'Make manager'}
          </button>
        </div>
      ))}
    </main>
  )
}
