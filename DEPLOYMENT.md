# PrivacyShield — Production Deployment & Distribution Guide

This guide provides end-to-end instructions for deploying the **PrivacyShield Proxy Server** to the cloud (Render, Railway, Vercel, or Docker) and publishing the **Browser Extension** to the Chrome Web Store and Firefox Add-ons (AMO).

---

## 🏗️ Architecture Overview

```
[ Browser Extension ] (Chrome / Firefox MV3)
        │
        │ HTTPS (POST /api/agent)
        ▼
[ Cloud Proxy Server ] (Render / Railway / Vercel / Docker)
        │
        │ Gemini API (Server-Side Key)
        ▼
[ Google Gemini 3.6 Flash / Open-Weight VLM ]
```

---

## Part 1: Cloud Proxy Server Deployment

Choose any of the following 1-click cloud providers:

---

### Option A: Render.com (Recommended — 100% Free & HTTPS)

1. Sign in to [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing PrivacyShield.
4. Set the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY_HERE` |
   | `GEMINI_MODEL` | `gemini-3.6-flash` |
6. Click **Create Web Service**.
7. Once deployed, copy your public service URL (e.g., `https://privacyshield-proxy.onrender.com`).
8. Open the PrivacyShield extension → **Settings (Options)** → Paste your URL into **Proxy Server URL**:
   ```
   https://privacyshield-proxy.onrender.com/api/agent
   ```
   Click **Test Connection** → **Save Changes**.

---

### Option B: Railway.app (1-Click Cloud Deployment)

1. Sign in to [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository and specify root as `/server`.
4. Add the environment variable:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   GEMINI_MODEL=gemini-3.6-flash
   ```
5. Railway will automatically build using `railway.json` and generate an HTTPS domain.

---

### Option C: Docker / Self-Hosted VPS (AWS, DigitalOcean, Hetzner)

1. Clone repository on your server:
   ```bash
   git clone <your-repo-url>
   cd "sih fresh extension/server"
   ```
2. Start the container with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
3. Verify status:
   ```bash
   curl http://localhost:3001/health
   ```

---

### Option D: Vercel (Serverless Function)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to server folder: `cd server`
3. Deploy: `vercel --prod`
4. Set environment variable in Vercel dashboard:
   - `GEMINI_API_KEY = YOUR_GEMINI_API_KEY_HERE`
   - `GEMINI_MODEL = gemini-3.6-flash`

---

## Part 2: Browser Extension Distribution

Pre-built production distribution zip files are located in `dist/`:
- **Chrome Web Store Package**: `dist/privacyshield-chrome-v1.0.0.zip` (0.66 MB)
- **Firefox AMO Package**: `dist/privacyshield-firefox-v1.0.0.zip` (0.66 MB)

To regenerate packages at any time:
```bash
npm run package
```

---

### Publishing to the Chrome Web Store

1. Open the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Pay the one-time $5 developer registration fee (if new account).
3. Click **New Item** → Upload `dist/privacyshield-chrome-v1.0.0.zip`.
4. Copy the metadata, description, and permissions justification directly from `CHROMEWEBSTORE.md`.
5. Upload store screenshots (1280×800) and small promo tile.
6. Submit for review!

---

### Publishing to Mozilla Firefox Add-ons (AMO)

1. Open the [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. Click **Submit a New Add-on** → **On this site**.
3. Upload `dist/privacyshield-firefox-v1.0.0.zip`.
4. Select category **Privacy & Security** / **Productivity**.
5. Submit for automated validation and signing.

---

## Part 3: Local Development & Quick Demo

To run everything locally:

1. **Start the local proxy server**:
   ```bash
   cd server
   npm start
   ```
2. **Load the extension in Chrome**:
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select the extension folder
3. **Open Evaluation Test Page**:
   - Open `test/evaluation_page.html` in your browser.
   - Click the floating **Shield** icon.
   - Type `"auto fill the form"` and click **Go**.
