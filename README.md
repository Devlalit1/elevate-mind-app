# ElevateMind 🧠

> **Your holistic space for professional growth and mental clarity.**

A modern, production-ready full-stack web application built with **Node.js + Express 5**, **SQLite**, and a clean Vanilla JS frontend — no framework bloat required.

[![CI](https://github.com/Devlalit1/elevate-mind-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Devlalit1/elevate-mind-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Career Assessment** | 5-question quiz → personalized career path with roles & resources |
| 🧠 **Mood Tracker** | Log daily moods with journal notes, stored in SQLite |
| 🌬️ **Guided Breathing** | 4-2-6 breathing cycle with animated visual feedback |
| 📅 **Session Booking** | Book 1-on-1 coaching sessions with validation & cancel support |
| 📊 **Dashboard** | Live stats, daily greeting, rotating motivational quotes |
| 🌙 **PWA Ready** | Installable on mobile with manifest.json |
| 🔒 **Security** | Helmet, CORS, rate limiting, input validation |

## 🏗️ Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5
- **Database**: SQLite via `better-sqlite3` (WAL mode)
- **Security**: `helmet`, `express-rate-limit`, `express-validator`
- **Logging**: `winston` + `morgan`
- **DevOps**: Docker, GitHub Actions CI
- **Frontend**: Semantic HTML5, CSS Custom Properties, Vanilla ES2022 JS

## 📁 Project Structure

```
elevate-mind-app/
├── .github/workflows/ci.yml    # CI pipeline
├── src/
│   ├── controllers/            # Business logic
│   ├── routes/                 # Express routers with validation
│   ├── middleware/             # Error handler, validator
│   ├── db/                     # SQLite setup
│   └── utils/                  # Logger
├── public/                     # Static frontend
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── manifest.json           # PWA
├── data/                       # SQLite DB (gitignored)
├── logs/                       # Log files (gitignored)
├── .env.example                # Environment template
├── Dockerfile                  # Multi-stage production Docker
├── eslint.config.js
└── server.js                   # App entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Devlalit1/elevate-mind-app.git
cd elevate-mind-app

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Start dev server (with hot reload)
npm run dev
```

Open http://localhost:3000 🎉

### Production

```bash
NODE_ENV=production npm start
```

### Docker

```bash
# Build image
docker build -t elevate-mind-app .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production elevate-mind-app
```

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/moods` | Get all mood logs |
| POST | `/api/moods` | Create mood log |
| DELETE | `/api/moods/:id` | Delete mood log |
| POST | `/api/career-assessment` | Submit career quiz |
| GET | `/api/bookings` | Get bookings |
| POST | `/api/bookings` | Create booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

## 🔑 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `LOG_LEVEL` | `info` | Winston log level |
| `DB_PATH` | `./data/elevatemind.db` | SQLite file path |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |

## 📜 License

MIT © [Devlalit1](https://github.com/Devlalit1)
