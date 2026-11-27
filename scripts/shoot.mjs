import { chromium } from 'playwright-core'
import fs from 'node:fs'

const base = 'http://127.0.0.1:43123'
const dir = '/opt/cursor/artifacts'
fs.mkdirSync(dir, { recursive: true })
fs.mkdirSync('docs/screenshots', { recursive: true })

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function shot(page, name) {
  const file = `${dir}/${name}.png`
  await page.screenshot({ path: file, fullPage: true })
  fs.copyFileSync(file, `docs/screenshots/${name}.png`)
  console.log('shot', name)
}

const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const a = await browser.newContext(phone)
const page = await a.newPage()
page.on('pageerror', (error) => console.log('PAGE', error.message))

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="enter-floor"]')
await shot(page, '01-login')
await page.getByTestId('team-kee').click()
await page.getByTestId('login-name').fill('Morgan Lee')
for (const digit of ['2', '4', '6', '8']) await page.getByTestId(`pin-${digit}`).click()
await page.getByTestId('enter-floor').click()
await page.waitForSelector('[data-testid="showroom"]')
await shot(page, '02-floor')

await page.getByTestId('mode-lightning').click()
await page.getByTestId('lightning-start').click()
await page.waitForSelector('[data-testid="choice-0"]')
await shot(page, '03-lightning')
await page.getByTestId('choice-0').click()
await page.getByRole('button', { name: /NEXT|RUN IT BACK/ }).waitFor()
await shot(page, '04-lightning-explain')

await page.goto(base + '/walk', { waitUntil: 'networkidle' })
await page.locator('[data-testid^="scenario-"]').first().click()
await page.waitForSelector('[data-testid^="face-"]')
await shot(page, '05-walk-in')
await page.getByTestId('walk-choice-0').click()
await page.waitForTimeout(400)
await shot(page, '06-walk-reaction')

await page.goto(base + '/arena', { waitUntil: 'networkidle' })
await page.getByTestId('arena-create').click()
await page.waitForSelector('[data-testid="duel-code"]')
await page.getByTestId('duel-choice-0').click()
await page.getByTestId('open-vote').click()
await page.waitForSelector('[data-testid="reveal"]')
const code = (await page.getByTestId('duel-code').innerText()).trim()
await shot(page, '07-arena')

const b = await browser.newContext(phone)
const other = await b.newPage()
await other.goto(base + '/login', { waitUntil: 'networkidle' })
await other.getByTestId('team-northline').click()
await other.getByTestId('login-name').fill('Casey Ng')
for (const digit of ['1', '3', '5', '7']) await other.getByTestId(`pin-${digit}`).click()
await other.getByTestId('enter-floor').click()
await other.waitForSelector('[data-testid="showroom"]')
await other.goto(base + '/arena', { waitUntil: 'networkidle' })
await other.getByText(code).click()
await other.waitForSelector('[data-testid="vote-0"], [data-testid="vote-host"]')
const vote = (await other.getByTestId('vote-0').count()) ? 'vote-0' : 'vote-host'
await other.getByTestId(vote).click()
await page.waitForTimeout(1500)
await shot(page, '08-arena-vote')
await shot(other, '09-voter-phone')

await page.goto(base + '/wheel', { waitUntil: 'networkidle' })
await page.getByTestId('spin').click()
await page.waitForTimeout(4600)
await shot(page, '10-wheel')
await page.locator('[data-testid^="pitch-"]').nth(0).click()
await page.locator('[data-testid^="pitch-"]').nth(1).click()
await page.locator('[data-testid^="pitch-"]').nth(3).click()
await page.getByTestId('pitch-submit').click()
await page.waitForSelector('[data-testid="coaching"]')
await shot(page, '11-pitch-result')

await page.goto(base + '/boss', { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="boss-hp"]')
await shot(page, '12-boss')
await page.getByTestId('boss-choice-0').click()
await page.waitForTimeout(500)
await shot(page, '13-boss-hit')

await page.goto(base + '/daily', { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="wordle"]')
for (const letter of 'LEASE') await page.getByTestId(`key-${letter}`).click()
await page.getByTestId('key-ENTER').click()
await page.waitForTimeout(300)
await shot(page, '14-daily')

await page.goto(base + '/board', { waitUntil: 'networkidle' })
await page.waitForSelector('text=Reps')
await shot(page, '15-leaderboard')

await page.goto(base + '/locker', { waitUntil: 'networkidle' })
await page.waitForSelector('text=Outfits')
await shot(page, '16-locker')

const desk = await browser.newContext({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 1 })
const admin = await desk.newPage()
await admin.goto(base + '/admin', { waitUntil: 'networkidle' })
await admin.getByTestId('admin-password').fill('showdown')
await admin.getByTestId('admin-login').click()
await admin.waitForSelector('[data-testid="tab-questions"]')
await shot(admin, '17-admin')
await admin.goto(base + '/manager', { waitUntil: 'networkidle' })
await admin.waitForTimeout(600)
await shot(admin, '18-manager')

const tvContext = await browser.newContext({ viewport: { width: 1366, height: 768 } })
const tv = await tvContext.newPage()
await tv.goto(base + '/tv', { waitUntil: 'networkidle' })
await tv.waitForSelector('text=Join from your phone')
await shot(tv, '19-tv')

await browser.close()
console.log('done', code)
