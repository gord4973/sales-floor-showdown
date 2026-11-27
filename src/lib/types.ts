export type Rep = {
  id: string
  name: string
  team: string
  teamName: string
  xp: number
  seasonXp: number
  place: number
  teamSize: number
  rank: string
  level: number
  next: string | null
  nextAt: number | null
  pct: number
  outfit: string
  showroom: string
  role: string
  streak: number
  badges: { id: string; name: string; blurb: string }[]
  outfits: { id: string; name: string; xp: number; blurb: string; unlocked: boolean }[]
  showrooms: { id: string; name: string; xp: number; blurb: string; unlocked: boolean }[]
}

export type Badge = { id: string; name: string; blurb: string }

export type Coaching = {
  skill: string
  label: string
  accuracy: number | null
  attempts: number
  headline: string
  tip: { title: string; body: string } | null
}
