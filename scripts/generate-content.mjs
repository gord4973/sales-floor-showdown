import { writeFileSync } from 'node:fs'
import { buildQuestions } from './bank/questions.mjs'
import { scenarios, objections, competitors, tips, words } from './bank/floor.mjs'

const questions = buildQuestions()
writeFileSync('content/questions.json', JSON.stringify(questions, null, 2))
writeFileSync('content/scenarios.json', JSON.stringify(scenarios, null, 2))
writeFileSync('content/objections.json', JSON.stringify(objections, null, 2))
writeFileSync('content/competitors.json', JSON.stringify(competitors, null, 2))
writeFileSync('content/tips.json', JSON.stringify(tips, null, 2))
writeFileSync('content/words.json', JSON.stringify(words, null, 2))
console.log(
  `Wrote ${questions.length} questions, ${scenarios.length} scenarios, ${objections.length} objections, ${competitors.length} rivals, ${tips.length} tips, ${words.length} words.`,
)
