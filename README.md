# Sales Floor Showdown

A phone-first game for the Tricity Mitsubishi sales floor in Port Coquitlam. Kee, Northline, and Tricity Retail play for a monthly cup. Every point comes from a selling skill: product knowledge, a clean objection, a payment conversation, a trade appraisal, or a close.

Reps sign in with a name, a team, and a 4-digit PIN. The same name and PIN on the same team brings the avatar back. No app install.

## Play locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43123 on your phone or in a narrow browser window. The showroom TV is http://127.0.0.1:43123/tv .

Local data lives in `data/showdown.sqlite` and survives restarts. Delete that file to reseed.

The question desk password on your machine is `showdown`. On Render it is the generated `ADMIN_PASSWORD`, not this default.

```bash
npm test          # scoring and fact checks
node scripts/smoke.mjs   # plays every mode against a running server
```

## Modes

- **Lightning** — 10 questions, 15 seconds each. Streaks hit x2, x3, x4. The right answer is explained after every tap.
- **Walk-In** — ten customers with a mood, a budget, and a hidden objection. Trust closes the deal and plays the key handover.
- **Objection Arena** — throw a room code. A teammate takes the other side or the floor votes live from their phones. Polling, so it works on one Render instance.
- **Beat the competition** — the wheel lands on RAV4, CR-V, Rogue, Tucson, CX-5, Kona, HR-V, or Corolla Cross. Thirty seconds to pick the three Mitsubishi lines that are actually true.
- **Month-end boss** — one shared HP bar per team. Correct replies hit it. The reward is shared.
- **Daily** — a five-letter floor word, a streak, and a shareable grid. Resets at midnight Pacific.
- **Board and TV** — season standings. Put `/tv` on the showroom screen.
- **Manager board** — each rep’s accuracy by skill, and the weak spot.
- **Question desk** (`/admin`) — add and edit questions, objections, and scenarios. Promote a rep to manager.

Ranks run Greeter, Closer, Pro, Legend. Outfits and showroom bays unlock as career XP climbs. Sound is on until you hit SND.

## What’s in the deck

Seeded from `content/*.json` on first boot. Admin edits are stored in the database and are not overwritten.

- 165 trivia questions on the 2026 Canadian lineup
- 10 Walk-In scenarios
- 33 objections
- 8 competitor pitch decks

The weekly lightning card rotates. Core warranty and honesty questions stay in every week.

Figures follow Mitsubishi Motors Canada public pages and brochures for model year 2026 (gas Outlander, Outlander PHEV, Eclipse Cross, RVR) and the final Mirage year, 2024. MSRPs are before freight, PDI, and taxes and change. The game tells reps to confirm the live build and let the desk quote the out-the-door number. The sister quiz at tricityquiz.onrender.com was unavailable while this deck was written.

Do not quote a campaign payment, a rebate, or a Surrey screenshot from memory. The desk confirms today’s number.

## Deploy on Render

`render.yaml` is a Blueprint for one Node web service and a Postgres database.

1. Push this repo to GitHub or GitLab.
2. In the Render dashboard, create a Blueprint and point it at the repo.
3. Render creates the web service and the database, and sets `DATABASE_URL` and a generated `ADMIN_PASSWORD`.
4. After the first deploy, open `/admin` and sign in with that generated password. It is under the service’s Environment tab.
5. Open `/tv` on the showroom display.

The service listens on `0.0.0.0:$PORT`. Postgres is used whenever `DATABASE_URL` is set. Without it, the app uses SQLite, which is the right local setup and the wrong one on Render, because Render’s disk is ephemeral.

Build command: `npm install --include=dev && npm run build`  
Start command: `node server/index.js`

## Content editing

Change `content/questions.json`, `content/scenarios.json`, `content/objections.json`, `content/competitors.json`, or `content/tips.json`, then restart. New ids are inserted. Rows an admin has edited are left alone.

Or use `/admin` and skip the files. The desk is the way managers should add a question after a Saturday.
