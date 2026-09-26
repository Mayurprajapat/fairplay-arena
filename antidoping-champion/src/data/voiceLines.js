// Host voice lines — English + Hindi (original lines, KBC-style feel)
export const LINES = {
  en: {
    welcome:
      "Welcome to Anti-Doping Champion. Your knowledge of clean sport is about to be tested. Are you ready?",
    intro:
      "Welcome to Anti-Doping Champion. Today, your knowledge of clean sport will be tested. Answer questions, earn Fair Play Points and unlock exclusive achievements.",
    nextQ: "Here comes your next question.",
    correct: [
      "That's correct! Excellent work.",
      "Absolutely right! Brilliant play.",
      "Wow! Spot on. Keep it going.",
    ],
    wrong: [
      "That's not quite right. But remember, every mistake is an opportunity to learn.",
      "No problem! Look at the correct answer and learn from it.",
    ],
    lifeline: "You've chosen to use a lifeline.",
    timeout: "Time's up! Let's see the correct answer.",
    final: (c, t, e) =>
      `Congratulations! You have completed the Anti-Doping Champion challenge. ${c} correct out of ${t}, earning ${e} Fair Play Points.`,
  },
  hi: {
    welcome:
      "एंटी डोपिंग चैंपियन में आपका स्वागत है। स्वच्छ खेल के आपके ज्ञान की परीक्षा होने वाली है। क्या आप तैयार हैं?",
    intro:
      "एंटी डोपिंग चैंपियन में स्वागत है। आज स्वच्छ खेल के ज्ञान की परीक्षा होगी। प्रश्नों के उत्तर दीजिए, फेयर प्ले पॉइंट्स कमाइए और उपलब्धियाँ पाइए।",
    nextQ: "अगला प्रश्न आ रहा है।",
    correct: [
      "बिल्कुल सही! बहुत बढ़िया।",
      "एकदम सही जवाब! शानदार खेल।",
      "वाह! क्या बात है। ऐसे ही आगे बढ़ते रहिए।",
    ],
    wrong: [
      "यह बिल्कुल सही नहीं है। लेकिन याद रखिए, हर गलती सीखने का मौका है।",
      "कोई बात नहीं! सही उत्तर देखिए और उससे सीखिए।",
    ],
    lifeline: "आपने लाइफलाइन चुनी है।",
    timeout: "समय समाप्त! चलिए सही उत्तर देखते हैं।",
    final: (c, t, e) =>
      `बधाई हो! आपने एंटी डोपिंग चैंपियन चुनौती पूरी कर ली। ${t} में से ${c} सही उत्तर, और ${e} फेयर प्ले पॉइंट्स।`,
  },
};

export const pickLine = (arr, qi) => arr[qi % arr.length];
