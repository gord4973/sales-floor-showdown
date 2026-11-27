let ctx: AudioContext | null = null
let muted = typeof localStorage !== 'undefined' && localStorage.getItem('sf-mute') === '1'

export function isMuted() {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  localStorage.setItem('sf-mute', value ? '1' : '0')
}

export function unlock() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(freq: number, duration: number, type: OscillatorType, peak: number, slide?: number) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t = ctx.currentTime
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + duration)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

function noise(duration: number, peak: number) {
  if (!ctx) return
  const length = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 900
  const gain = ctx.createGain()
  gain.gain.value = peak
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

export function play(name: string) {
  if (muted) return
  unlock()
  if (!ctx) return
  if (name === 'tap') tone(240, 0.05, 'square', 0.04, 180)
  if (name === 'correct') {
    tone(523, 0.09, 'square', 0.07)
    window.setTimeout(() => tone(659, 0.09, 'square', 0.07), 80)
    window.setTimeout(() => tone(784, 0.16, 'square', 0.08), 160)
  }
  if (name === 'wrong') tone(180, 0.22, 'sawtooth', 0.05, 70)
  if (name === 'combo') {
    tone(660, 0.08, 'square', 0.07)
    window.setTimeout(() => tone(880, 0.08, 'square', 0.07), 70)
    window.setTimeout(() => tone(1174, 0.18, 'square', 0.08), 140)
  }
  if (name === 'fanfare') {
    ;[523, 659, 784, 1046].forEach((freq, index) => window.setTimeout(() => tone(freq, 0.18, 'square', 0.07), index * 110))
  }
  if (name === 'tick') noise(0.03, 0.04)
  if (name === 'key') {
    tone(880, 0.1, 'triangle', 0.08)
    window.setTimeout(() => tone(1320, 0.22, 'triangle', 0.07), 90)
  }
  if (name === 'hit') tone(140, 0.12, 'square', 0.08, 60)
  if (name === 'win') {
    tone(392, 0.12, 'square', 0.07)
    window.setTimeout(() => tone(523, 0.12, 'square', 0.07), 120)
    window.setTimeout(() => tone(784, 0.28, 'square', 0.08), 240)
  }
  if (name === 'vote') tone(700, 0.07, 'triangle', 0.05)
}
