// Game session logic: question selection, shuffling, poll generation
import QUESTIONS from "../data/questions.json";
import { LADDER } from "./points";

export function pickGameQuestions() {
  const by = { easy: [], medium: [], hard: [], expert: [] };
  for (const q of QUESTIONS) (by[q.difficulty] || by.easy).push(q);
  const take = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  const picked = [
    ...take(by.easy, 5),
    ...take(by.medium, 5),
    ...take(by.hard, 3),
    ...take(by.expert, 2),
  ];
  return picked.map((q, i) => ({ ...q, ladderPoints: LADDER[i] ?? q.points, order: i }));
}

export function shuffleOptions(question) {
  const idx = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  return {
    options: idx.map((i) => question.options[i]),
    correctAnswer: idx.indexOf(question.correctAnswer),
  };
}

// Dynamic audience poll: correct option leads, with random jitter
export function makePoll(question) {
  const base = [...question.pollPercentages];
  const j = base.map((p) => Math.max(2, p + Math.round((Math.random() - 0.5) * 8)));
  // ensure correct stays on top
  const ci = question.correctAnswer;
  const mx = Math.max(...j);
  if (j[ci] < mx) {
    const lead = j.indexOf(mx);
    const diff = mx - j[ci] + 4;
    j[ci] += diff;
    j[lead] = Math.max(3, j[lead] - diff);
  }
  const sum = j.reduce((a, b) => a + b, 0);
  return j.map((p) => Math.round((p / sum) * 100));
}

export const LETTERS = ["A", "B", "C", "D"];
