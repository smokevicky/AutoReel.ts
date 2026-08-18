# 🚀 AutoReel.ts

> **Autonomous Culture-Jacking Marketing Engine for [@whispr.bot](https://t.me/whispr_chat_bot)**  
> Programmatically scrapes daily viral trends, maps them to a meme vault using Gemini 2.5 Flash, renders high-retention 9:16 vertical videos using Remotion V4, and publishes directly to Instagram Reels.

---

## 🧠 System Architecture

```
[ Reddit Trends API ] (r/me_irl, r/IndianTeenagers)
          │
          ▼ (Module 1: scripts/1-fetch-trends.ts)
   [ Cultural Pulse Text ]
          │
          ▼ (Module 2: scripts/2-generate-hook.ts)
[ Gemini 2.5 Flash + @google/generative-ai ] <─── [ Meme Vault: vault.json ]
          │
          ▼ { videoId, topSetupText, transitionText, pillText, caption }
[ Remotion V4 Bundler + Renderer ] (Module 3: src/components/DynamicReel.tsx)
          │
          ▼
   [ out/AutoReel.mp4 ]
          │
          ▼ (Module 4: scripts/3-post-reel.ts)
[ Instagram Graph API Publisher ] (Container Creation -> Status Poll -> Media Publish)
```

---

## 📦 Core Modules

### 1. The Trend Fetcher (`scripts/1-fetch-trends.ts`)
* Scrapes top daily discussions from Gen-Z subreddits (`r/me_irl` for universal relatable humor and `r/IndianTeenagers` for college & relationship drama).
* Aggregates topics into a consolidated "Cultural Pulse" string for the LLM.
* Includes zero-downtime fallback pulses for headless CRON resilience.

### 2. The LLM Brain & Vault Mapper (`scripts/2-generate-hook.ts` & `vault.json`)
* Uses `@google/generative-ai` with structured JSON schema.
* Ingests the daily cultural pulse and maps it against `vault.json` based on emotional resonance (*existential panic*, *accidental skip*, *wholesome connection*).
* Generates an unhinged Gen-Z Trojan Horse hook where `@whispr.bot` acts as the punchline.

### 3. Dynamic Remotion Composition (`src/components/DynamicReel.tsx` & `src/Root.tsx`)
* Implements a **2-part viral contrast format**:
  * **0.0s – 2.0s:** Top Setup Text with clean Instagram white typography.
  * **2.0s:** Transition / Beat Drop with flash overlay & screen punch.
  * **2.1s+:** Meme Video Container with signature floating **White Pill Badge** (e.g. `me after accidentally skipping my soulmate on whispr 😭💀`).
  * **Retention Hooks:** Animated top progress bar and bottom Whispr branding pill.
  * **Audio Sync:** Plays emotive slow synth/piano (`sad.mp3`), upbeat phonk (`music.mp3`), or wholesome tracks (`happy.mp3`).

### 4. Master Controller & Publisher (`scripts/3-post-reel.ts`)
* Executes Module 1 ➔ Module 2 ➔ Module 3 (renders 1080x1920 MP4 to `out/AutoReel.mp4`).
* Interfaces with the Instagram Graph API (2-step container creation + status polling + publish).

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root (see `.env.example`):
```env
# Gemini API Key (Required for LLM Brain)
GEMINI_API_KEY=your_gemini_api_key_here

# Instagram Graph API (Optional for local renders, required for auto-posting)
INSTAGRAM_USER_ID=your_instagram_business_account_id
INSTAGRAM_ACCESS_TOKEN=your_facebook_system_user_token
```

---

## 💻 Available Scripts

| Command | Description |
|---|---|
| `npm run auto-reel` | Runs the full autonomous pipeline (Fetch ➔ Map ➔ Render ➔ Publish) |
| `npm run fetch-trends` | Runs Module 1 to inspect today's Reddit trends |
| `npm run generate-hook` | Runs Module 2 to test LLM trend mapping & hook generation |
| `npm run build` | Verifies TypeScript types with `tsc` |

---

## 🎬 Customizing the Meme Vault (`vault.json`)

You can add new meme clips to `vault.json` and place the `.mp4` files in the `public/` directory:

```json
[
  {
    "id": "accidental-skip-soulmate",
    "vibe": "existential breakdown / regret / accidental slip",
    "description": "Accidentally skipping a 10/10 connection because your thumb slipped",
    "topSetupText": "Her: \"why is he taking so long to reply?\"",
    "transitionText": "Meanwhile me:",
    "pillText": "me after accidentally skipping my soulmate on whispr 😭💀",
    "videoUrl": "clip2.mp4",
    "durationInFrames": 210
  }
]
```

---

## ⏰ Production Deployment (CRON Job)

To run AutoReel once every day at 11:00 PM:
```cron
0 23 * * * cd /path/to/AutoReel.ts && npm run auto-reel >> /var/log/autoreel.log 2>&1
```

---

## 📜 License
Private & Proprietary — Built for **Whispr** (@whispr.bot).
