# Lingua Flow

Lingua Flow is a full-stack language translation web application built for software engineering portfolio and placement demos. It focuses on translation workflows, not chat, and combines real-time text translation, browser voice input, browser text-to-speech, learning mode, history, favorites, offline-friendly caching, and a future-ready live call translation UI.

## Tech Stack

- Frontend: React + Hooks, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express.js, Axios
- Persistence: JSON-backed history and favorites store in `backend/data/translations.json`
- Speech: Web Speech API for voice input, SpeechSynthesis API for audio output

## Features

- Text-to-text translation with auto language detection
- 20+ supported languages including English, Tamil, Hindi, Kannada, Telugu, Malayalam, Spanish, French, German, Chinese, Japanese, Arabic, and more
- Real-time translation while typing with debounce
- Voice input with microphone controls
- Instant translation after speech capture
- Translated voice playback in the selected target language
- Swap languages, copy output, clear input, download translation as a file
- Modern responsive UI with dark mode
- Learning mode with original sentence, translated sentence, and word-by-word hints
- Translation history and favorites
- Offline-friendly fallback using cached translations
- Future-scope live call translation interface ready for WebRTC integration

## Project Structure

```text
.
├── backend
│   ├── data
│   └── src
│       ├── config
│       ├── controllers
│       ├── routes
│       └── services
├── frontend
│   └── src
│       ├── components
│       ├── hooks
│       ├── pages
│       ├── services
│       └── utils
└── package.json
```

## Translation Provider

The backend is built with a provider abstraction.

- Default demo provider: `google-web`
- Optional hosted/self-hosted provider: `libretranslate`

For placement demos, the default provider works without extra keys. For stricter production deployment, switch to a managed or self-hosted translation provider and set backend environment variables accordingly.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create environment files from the examples:

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

Backend environment options:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
TRANSLATION_PROVIDER=google-web
TRANSLATION_API_URL=https://libretranslate.com
TRANSLATION_API_KEY=
HISTORY_LIMIT=50
CACHE_TTL_MS=86400000
REQUEST_TIMEOUT_MS=15000
```

Frontend environment options:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Start the app

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Demo Instructions

1. Enter text in the left panel and pause typing.
2. Select a target language from the right panel.
3. Use the swap button to reverse translation direction.
4. Click the microphone button to dictate text.
5. Click `Play audio` to hear the translated output.
6. Use `Copy` or `Download` for output actions.
7. Open recent items from the history panel and star favorites.
8. Review the `Learning Mode` section for sentence and word-level hints.
9. Inspect the `Live Call Translation` card for the future WebRTC-ready interaction model.

## Build

```bash
npm run build
```

## Deployment

### Frontend

- Vercel
- Netlify

Set `VITE_API_BASE_URL` to your deployed backend URL, for example:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

### Backend

- Render
- Railway

Set the backend environment variables from `backend/.env.example`. If you deploy frontend and backend on separate domains, update `CLIENT_URL` to the deployed frontend origin.

## Production Notes

- Browser speech recognition works best in Chromium-based browsers such as Chrome and Edge.
- Browser text-to-speech depends on available system voices.
- The learning mode word mapping is best-effort and intentionally lightweight.
- Cached translations provide graceful fallback, but live translation still requires a working provider.
- For a stricter production setup, replace the default demo provider with a managed or self-hosted translation service.

## Verification

The project has been verified with:

- `npm run build`
- Backend smoke test for `/api/translate`, `/api/languages`, and `/api/health`

