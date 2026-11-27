import test from 'node:test'
import assert from 'node:assert/strict'
import {
  rankFor,
  levelFor,
  scoreLightning,
  scorePitch,
  wordleMarks,
  prevDay,
  bossDamage,
  rotationBucket,
} from './logic.js'

test('ranks climb Greeter, Closer, Pro, Legend', () => {
  assert.equal(rankFor(0), 'Greeter')
  assert.equal(rankFor(299), 'Greeter')
  assert.equal(rankFor(300), 'Closer')
  assert.equal(rankFor(900), 'Pro')
  assert.equal(rankFor(2500), 'Legend')
})

test('level steps every 100 XP', () => {
  assert.equal(levelFor(0), 1)
  assert.equal(levelFor(100), 2)
  assert.equal(levelFor(2500), 26)
})

test('lightning streak multiplies and a miss resets', () => {
  const first = scoreLightning({ correct: true, streak: 0, elapsedMs: 2000 })
  assert.equal(first.multiplier, 1)
  assert.equal(first.streak, 1)
  assert.ok(first.xp > 6)
  const combo = scoreLightning({ correct: true, streak: 6, elapsedMs: 8000 })
  assert.equal(combo.multiplier, 4)
  assert.equal(combo.streak, 7)
  const miss = scoreLightning({ correct: false, streak: 6, elapsedMs: 3000 })
  assert.equal(miss.streak, 0)
  assert.equal(miss.xp, 0)
  const late = scoreLightning({ correct: true, streak: 4, elapsedMs: 13000 })
  assert.equal(late.xp, 0)
  assert.equal(late.timedOut, true)
})

test('pitch rewards real advantages and punishes traps', () => {
  const cards = [
    { id: 'a', title: 'Seats', good: true, why: 'yes' },
    { id: 'b', title: 'Warranty', good: true, why: 'yes' },
    { id: 'c', title: 'S-AWC', good: true, why: 'yes' },
    { id: 'd', title: 'Fuel fib', good: false, why: 'no' },
  ]
  const clean = scorePitch(cards, ['a', 'b', 'c'])
  assert.equal(clean.clean, true)
  assert.equal(clean.xp, 42)
  const dirty = scorePitch(cards, ['a', 'd'])
  assert.equal(dirty.traps, 1)
  assert.equal(dirty.xp, 6)
  const onlyTrap = scorePitch(cards, ['d'])
  assert.equal(onlyTrap.xp, 0)
})

test('wordle marks doubles without stealing a green', () => {
  assert.deepEqual(wordleMarks('LEASE', 'LEASE'), ['correct', 'correct', 'correct', 'correct', 'correct'])
  assert.deepEqual(wordleMarks('STEEL', 'LEASE'), ['present', 'absent', 'present', 'present', 'present'])
  assert.deepEqual(wordleMarks('LLLLL', 'LEASE'), ['correct', 'absent', 'absent', 'absent', 'absent'])
})

test('yesterday is the calendar day before', () => {
  assert.equal(prevDay('2026-11-01'), '2026-10-31')
  assert.equal(prevDay('2026-03-01'), '2026-02-28')
})

test('boss damage matches the quality of the reply', () => {
  assert.equal(bossDamage('best').damage, 70)
  assert.equal(bossDamage('ok').damage, 35)
  assert.equal(bossDamage('poor').damage, 0)
})

test('weekly rotation stays inside 1 to 4', () => {
  const bucket = rotationBucket(new Date('2026-11-27T20:00:00Z'))
  assert.ok(bucket >= 1 && bucket <= 4)
})
