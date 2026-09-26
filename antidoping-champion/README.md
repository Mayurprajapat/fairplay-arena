# 🏆 ANTI-DOPING CHAMPION — The Ultimate Fair Play Challenge

B.Tech Major Project: **Gamification of Anti-Doping Information**

An original professional sports-quiz-show game (React + Vite + Tailwind + Framer Motion + Web Speech API).
No backend needed — progress persists in LocalStorage. No real money anywhere (FPP are virtual points).

## ▶ Run

```bash
cd antidoping-champion
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).

## 🎬 Demo flow (viva, ~5 min)

1. Landing → **START GAME** → enter name → host Arjun Verma speaks → **LET'S PLAY**
2. Answer a question → **LOCK ANSWER** → ✓/✕ animation → 💡 LEARN THIS → CONTINUE
3. Use a lifeline (50:50 / Athlete's Advice / Fair Play Poll / Expert Call)
4. Finish 15 → Final Result → **Reward Store** → redeem a badge (confirm popup math)
5. **My Rewards** + **Profile** + printable **Digital Certificate**
6. **About** page → gamification cycle (evaluation Q&A gold)

## 📁 Structure

```
src/
  components/  Host, QuestionCard, AnswerOption, Lifelines, PrizeLadder,
               Timer, VoiceControls, PointsDisplay, Achievement, RewardCard,
               ProfileCard, Confetti
  pages/       Home, Intro, Game, Results, RewardStore, Profile, About
  data/        questions.json (50), rewards.js
  utils/       gameLogic, points, achievements, localStorage→storage,
               speech (Web Speech API), sounds (original WebAudio SFX)
  App.jsx      routing + save state + achievement toasts
```

## 🛡 Notes for evaluation

- 50-question bank (Easy 14 / Medium 14 / Hard 12 / Expert 10); each game picks 5+5+3+2 randomly.
- Content aligned to WADA/NADA guidance; never explains how to dope or evade tests.
- All branding, host, voices, music and art are original (no KBC copying).
