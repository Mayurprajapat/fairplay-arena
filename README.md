# 🏟️ FairPlay Arena
**Major Project — Gamification of Anti-Doping Information**
**Play. Learn. Stay Clean.**

A responsive, mobile-friendly learning website that teaches clean-sport and anti-doping concepts through mini-games, story choices, learning modules and a sample substance checker.

## Features
- Quiz Quest: 15 anti-doping knowledge questions
- Dope or Nope: rapid true/false challenge
- Memory Match: pair terminology with meanings
- Road to Gold: five-chapter clean-sport decision story
- Substance Checker: limited educational sample lookup (not a live drug database)
- Learn Lab: six learning modules
- XP, levels, badges and a per-browser leaderboard (saved in browser storage)
- Printable Fair Play certificate after 100 XP
- PWA manifest and service worker for installable mobile experience
- Responsive navigation and DopeGuard helper mascot

## Run in VS Code
1. Install Python 3.10+.
2. Open this folder in VS Code.
3. Open Terminal and run:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

python -m pip install -r requirements.txt
python app.py
```

4. Open **http://127.0.0.1:5000**.

Progress is saved in this browser's local storage. It is not shared across browsers or devices and does not require a database.

## Project structure
```text
fairplay-arena/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── learn.html
│   └── certificate.html
└── static/
    ├── css/style.css
    ├── js/app.js
    ├── js/games.js
    ├── manifest.json
    ├── sw.js
    └── icon.svg
```

## Deploy to Vercel
Vercel detects `app.py` and runs Flask as a Python Function. No database or environment variables are required. From the project folder:

```bash
vercel login
vercel
vercel --prod
```

XP and leaderboard data are saved in each visitor's browser, so they persist on that browser but are not shared across devices or visitors.

## PWA / Android
Deploy the app to an HTTPS host first. Open it in Chrome on Android and choose **⋮ → Install app / Add to Home Screen**. PWABuilder may package a compatible PWA, but APK generation depends on manifest, icons, HTTPS and platform requirements.

## Viva explanation
- **Problem:** Traditional anti-doping material can be difficult to engage with.
- **Approach:** Gamification turns important concepts into interactive learning activities.
- **Technology:** Python Flask, HTML, CSS and JavaScript; browser local storage, PWA manifest and service worker.
- **Learning areas:** Code, Prohibited List, TUE, testing, supplements, ADRVs and strict liability.
- **Future scope:** Hindi content, multiplayer mode, verified live NADA/WADA data integration and an AI learning assistant.

## Important academic and safety note
This is an educational prototype. The substance checker uses a small set of hard-coded examples and is **not** a medical tool or official anti-doping database. Rules and the WADA Prohibited List change. For real medication or competition decisions, consult the latest official WADA/NADA material, your anti-doping organization and a qualified healthcare professional. No game result or certificate represents official WADA/NADA accreditation.
