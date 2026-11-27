import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildQuestions } from '../scripts/bank/questions.mjs'
import { scenarios, objections, competitors } from '../scripts/bank/floor.mjs'

const questions = buildQuestions()
const byId = Object.fromEntries(questions.map((question) => [question.id, question]))

function answer(id) {
  const question = byId[id]
  assert.ok(question, id)
  return question.choices[question.answer]
}

test('deck is large enough to rotate weekly', () => {
  assert.ok(questions.length >= 150)
  assert.ok(scenarios.length >= 8)
  assert.ok(objections.length >= 25)
  assert.ok(competitors.length >= 8)
})

test('canonical Canadian lineup facts stay on the right choice', () => {
  assert.match(answer('ol-engine'), /1\.5L turbo/)
  assert.match(answer('ol-fuel'), /8\.7/)
  assert.match(answer('ol-seats'), /Seven/)
  assert.match(answer('ol-sunroof'), /SE S-AWC/)
  assert.match(answer('ol-hud'), /GT S-AWC/)
  assert.match(answer('war-pt'), /10 years \/ 160,000/)
  assert.match(answer('phev-range'), /72 km/)
  assert.match(answer('phev-battery'), /22\.7/)
  assert.match(answer('phev-hp'), /297/)
  assert.match(answer('phev-charge-l2'), /6\.5/)
  assert.match(answer('phev-pedal'), /still use the brake/)
  assert.match(answer('phev-price-es'), /\$46,998/)
  assert.match(answer('ol-price-es'), /\$36,398/)
  assert.match(answer('ec-engine'), /152 hp/)
  assert.match(answer('ec-modes'), /Normal, Snow and Gravel/)
  assert.match(answer('rvr-not-sawc'), /All-Wheel Control/)
  assert.match(answer('rvr-price-es'), /\$24,998/)
  assert.match(answer('rvr-es-engine'), /2\.0L/)
  assert.match(answer('mir-year'), /2024 was the final/)
  assert.match(answer('say-rav4-fuel'), /Agree/)
  assert.match(answer('say-surrey'), /side by side/)
  assert.match(answer('not-a-plug'), /does not plug in/)
})

test('seed files exist once generated', () => {
  const file = JSON.parse(readFileSync(new URL('../content/questions.json', import.meta.url), 'utf8'))
  assert.equal(file.length, questions.length)
})
