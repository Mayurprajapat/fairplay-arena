# 🏟️ FairPlay Arena — Gamification of Anti-Doping Information
### Major Project | Play. Learn. Stay Clean.

**🌍 LIVE SITE: https://fairplay-arena-theta.vercel.app**
**📦 SOURCE: https://github.com/Mayurprajapat/fairplay-arena**

Attractive gamified website + mobile-app-like (PWA) for athletes to learn anti-doping through games.

## 🔄 Auto-update workflow (changes live kaise honge)
- **✅ CONNECTED (Option A):** GitHub repo `Mayurprajapat/fairplay-arena` Vercel se connected hai → har `git push` pe Vercel khud live site redeploy karega.
  ```bash
  git add . && git commit -m "update" && git push   # 30 sec me live!
  ```
- **Option B (quick manual):** Is folder me `vercel --prod` chalao → 20 sec me live site update.

## ✨ Features (jury ko impress karne wale — har game sikhata hai!)
- 🎯 **Quiz Quest** — 15 timed WADA questions, streak bonus, 50/50 lifeline, +100 XP
- ⚡ **Dope or Nope** — speed True/False battle, +75 XP
- 🧠 **Memory Match** — banned substance ↔ category pairs, +60 XP
- 🔥 **Road to Gold (STORY MODE — most unique!)** — 5-chapter career choices, Clean Score
- 🔍 **Substance Checker** — Banned / Allowed / TUE-needed instant result
- 📚 **Learn Lab** — 6 visual modules (Code, List, TUE, Testing, Supplements, Bans)
- 🛡️ **DopeGuard mascot** — floating AI coach on every page
- 🏆 **XP + Levels + Badges + Server Leaderboard** (SQLite)
- 🏅 **Printable Fair Play Certificate** (100+ XP unlock)
- 📲 **PWA — installs like mobile APK** + mobile bottom nav

## 🚀 How to Run (viva demo — 2 min)
```bash
python -m pip install flask
python app.py
```
Then open: **http://127.0.0.1:5000**

## 📲 How to make Mobile APK (free, 5 min)
1. Deploy link free on Render / PythonAnywhere, OR run on college WiFi IP
2. Go to **PWABuilder.com** → paste your link → **Android APK download**
3. Install APK on phone → bottom-nav app opens fullscreen!
4. Shortcut: Chrome → ⋮ → *Add to Home Screen / Install* (same feel, no APK needed)

## 🎤 Viva Q&A cheat-sheet
- **Topic?** Gamification increases retention — athletes learn WADA rules by playing, not reading PDFs.
- **Tech?** Python Flask backend + SQLite leaderboard + REST APIs + Tailwind + JS games + PWA.
- **WADA concepts covered?** Code, 11 ADRVs, Prohibited List S1-S9/M1-M3/P1, TUE, strict liability, A/B sample, bans up to 4 yrs.
- **Different from old projects?** Story-mode career + mascot + certificate + APK-ready PWA — sab ek me.
- **Future scope?** Hindi version, multiplayer quiz, real NADA API, AI chatbot coach.

## 📁 Structure
app.py (routes+APIs+data) | fairplay.db (auto) | templates/*.html | static/css, js, manifest, sw.js, icon.svg
