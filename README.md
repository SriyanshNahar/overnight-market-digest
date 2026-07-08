# 🌙 Overnight Market Digest Bot

Fetches news from 9 PM–9 AM that could impact stock/trading markets
(geopolitics, Fed/RBI decisions, crude oil, war/tensions, big earnings, etc.),
summarizes each with Claude, tags impact (📈 bullish / 📉 bearish / ⚖️ neutral),
and sends you a digest every morning via **Telegram** and **Email**.

Runs automatically and for free using **GitHub Actions** (no server needed).

---

## How it works

```
RSS feeds (ET, Moneycontrol, CNBC, Reuters, etc.)
        ↓
Time filter (last ~13 hours) + keyword pre-filter
        ↓
Claude API → picks truly market-relevant items, writes summary + impact tag
        ↓
Telegram message  +  Email (SendGrid)
```

Runs daily at **9:00 AM IST** via a GitHub Actions cron job.

---

## Setup (one-time, ~15 minutes)

### 1. Get a Telegram bot token + chat ID

1. Open Telegram, search **@BotFather**, send `/newbot`, follow prompts.
   Copy the token it gives you (looks like `123456:AAxxxx...`).
2. Send your new bot any message (e.g. "hi") so it knows about you.
3. Get your chat ID: message **@userinfobot** on Telegram, it'll reply with your numeric ID.
   (Or visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` after messaging your bot,
   and look for `"chat":{"id": ...}` in the response.)

### 2. Get a SendGrid account + API key

1. Sign up free at [sendgrid.com](https://sendgrid.com) (100 emails/day free).
2. Verify a sender email (Settings → Sender Authentication → Single Sender Verification).
3. Create an API key (Settings → API Keys → Create API Key, "Full Access" or "Mail Send" scope).

### 3. Get an Anthropic (Claude) API key

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.
2. Add a small amount of credit (this bot costs pennies per month on Haiku).

### 4. Push this project to GitHub

```bash
cd overnight-market-digest
git init
git add .
git commit -m "Initial commit: overnight market digest bot"
git branch -M main
git remote add origin https://github.com/<your-username>/overnight-market-digest.git
git push -u origin main
```

### 5. Add your secrets to GitHub

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**.
Add each of these one by one:

| Secret name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your Claude API key |
| `TELEGRAM_BOT_TOKEN` | your bot token from BotFather |
| `TELEGRAM_CHAT_ID` | your numeric chat ID |
| `SENDGRID_API_KEY` | your SendGrid API key |
| `SENDGRID_FROM_EMAIL` | your verified sender email |
| `SENDGRID_TO_EMAIL` | your Gmail address (where you want to receive it) |
| `NEWSAPI_KEY` | *(optional)* key from newsapi.org for extra coverage |

### 6. Test it

Go to your repo's **Actions** tab → "Daily Overnight Market Digest" → **Run workflow**
(this is the `workflow_dispatch` manual trigger). Check your Telegram + email after ~30-60 seconds.

That's it — from tomorrow it'll run automatically every day at 9:00 AM IST.

---

## Running locally (optional, for testing/debugging)

```bash
npm install
cp .env.example .env
# fill in your keys in .env
npm start
```

---

## Customizing

- **Change the time it runs**: edit the `cron` line in `.github/workflows/daily-digest.yml`.
  Cron is in UTC. IST = UTC + 5:30. Use [crontab.guru](https://crontab.guru) to build the expression.
- **Add/remove news sources**: edit `src/sources.js` → `RSS_FEEDS` array.
- **Tune what counts as "important"**: edit `src/sources.js` → `TRADING_KEYWORDS` array,
  and/or the system prompt in `src/summarize.js`.
- **Change how many stories per digest**: edit `MAX_ITEMS` in `.env` / GitHub secret.
- **Add Hindi summaries**: tweak the system prompt in `src/summarize.js` to ask for
  a bilingual summary field.

---

## Cost estimate

| Item | Cost |
|---|---|
| GitHub Actions (public/private repo, low usage) | Free |
| Claude Haiku API (~1 call/day) | ~$1-2/month |
| SendGrid | Free (under 100 emails/day) |
| Telegram Bot API | Free |
| RSS feeds | Free |

**Total: roughly ₹100-150/month** at most, often less.

---

## Roadmap ideas (v2)

- [ ] Dedup across days (store sent article links in a small JSON/Firestore doc)
- [ ] Stock-specific watchlist alerts (highlight if a stock you track is mentioned)
- [ ] Weekly Sunday recap digest
- [ ] Interactive Telegram commands (`/news`, `/summary`, `/trading`)
- [ ] Hindi + English bilingual summaries
