import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string }

export function Fireworks({ burst }: { burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !burst) return
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#ff3d9a', '#3dfff2', '#ffc14d', '#ffffff', '#ff2a3c']
    for (let burstIndex = 0; burstIndex < 4; burstIndex++) {
      const x = canvas.width * (0.2 + Math.random() * 0.6)
      const y = canvas.height * (0.18 + Math.random() * 0.35)
      for (let i = 0; i < 36; i++) {
        const angle = (Math.PI * 2 * i) / 36
        const speed = 1.8 + Math.random() * 3.4
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[i % colors.length],
        })
      }
    }
    let frame = 0
    let raf = 0
    const tick = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      particles.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.035
        particle.life -= 0.014
        context.globalAlpha = Math.max(particle.life, 0)
        context.fillStyle = particle.color
        context.fillRect(particle.x, particle.y, 3, 3)
      })
      particles.current = particles.current.filter((particle) => particle.life > 0)
      frame += 1
      if (particles.current.length && frame < 200) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [burst])

  return <canvas ref={ref} className="fireworks" aria-hidden="true" />
}

export function FloorScene({
  outfit,
  showroom,
}: {
  outfit: string
  showroom: string
}) {
  return (
    <div className={`stage ${showroom}`} data-testid="showroom">
      <div className="wall">
        <div className="dealer">TRICITY · PORT COQUITLAM</div>
        <div className="diamonds" aria-hidden="true"><i /><i /><i /></div>
        {showroom === 'trophy' && <div className="cups" aria-hidden="true"><b /><b /><b /></div>}
      </div>
      <div className="floor" />
      <div className="actor">
        <div className={`person outfit-${outfit}`}>
          <div className="head">
            <div className="hair" />
            <div className="eyes"><i /><i /></div>
          </div>
          <div className="torso" />
          <div className="legs" />
        </div>
        <div className="shadow" />
      </div>
    </div>
  )
}

export function Coach({ coaching }: { coaching: { headline: string; tip: { title: string; body: string } | null; label: string; accuracy: number | null } | null }) {
  if (!coaching?.tip) return null
  return (
    <section className="card stack" data-testid="coaching">
      <div className="kicker">60-second coaching</div>
      <h2>{coaching.headline}</h2>
      <strong>{coaching.tip.title}</strong>
      <p className="muted" style={{ margin: 0 }}>{coaching.tip.body}</p>
      {coaching.accuracy !== null && <div className="muted">{coaching.label}: {coaching.accuracy}% lately</div>}
    </section>
  )
}

export function Face({ mood, accent }: { mood: number; accent?: string }) {
  const state = mood >= 70 ? 'happy' : mood >= 45 ? 'calm' : mood >= 25 ? 'wary' : 'mad'
  return (
    <div className={`face ${state}`} style={{ ['--accent' as string]: accent || '#ff3d9a' }} data-testid={`face-${state}`}>
      <i className="brow l" /><i className="brow r" />
      <i className="eye l" /><i className="eye r" />
      <i className="mouth" />
    </div>
  )
}
