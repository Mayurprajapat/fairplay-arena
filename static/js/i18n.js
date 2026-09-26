// In-house bilingual engine (EN/HI)
function LANG(){return localStorage.getItem('fp_lang')||'en'}
function setLang(l){localStorage.setItem('fp_lang',l);applyI18n();if(typeof afterLangChange==='function')afterLangChange();say(l==='hi'?'Hindi ON! 🇮🇳 Ab sab kuch Hindi me!':'English ON! Back to English!')}
function toggleLang(){setLang(LANG()==='hi'?'en':'hi')}
const I18N={
en:{
 'nav.home':'Home','nav.live':'Live Centre','nav.learn':'Learn','nav.quiz':'Quiz Quest','nav.run':'Doping Run','nav.raid':'Supplement Raid','nav.story':'Road to Gold','nav.checker':'Checker','nav.ranks':'Ranks','nav.cert':'🏅 Certificate','nav.install':'📲 Install App (APK-like)',
 'nav.tag':'ARENA • 🇮🇳 CLEAN SPORT INDIA',
 'tick':'🔴 LIVE • WADA 2026 Prohibited List IN FORCE since 1 Jan 2026  •  2027 List published (in force 1 Jan 2027)  •  NEW: non-diagnostic carbon-monoxide use banned (M1.4)  •  NADA India hosted GAIIN intel conference, New Delhi  •  Play 5 games • Earn 500 XP • Unlock Certificate 🏅',
 'foot':'FairPlay Arena • Major Project • Gamification of Anti-Doping Education • Sources: WADA + NADA India (linked) • Made for athletes 🏅',
 'av.title':'CHOOSE YOUR ATHLETE','av.sub':'Ye character har game me tumhare saath ladega 💪',
 'lvl.title':'LEVEL UP!','lvl.sub':'Tap anywhere to continue 🔥',
 'mascot.hi':'Welcome champ! Check Live Centre for 2026 rule changes!',
 'h.badge':'🇮🇳 TRICOLOR CHAMPION EDITION • MAJOR PROJECT',
 'h.desc':'Gamified anti-doping academy for Indian athletes — 7 games, real WADA 2026 rules, live updates, XP, badges & certificate.',
 'h.start':'▶ START QUEST','h.live':'LIVE CENTRE','h.check':'🔍 Check Substance',
 'h.games':'GAMES','h.wada':'WADA LIST LIVE','h.maxxp':'MAX XP',
 'h.list':'WADA LIST STATUS','h.inforce':'✅ 2026 List — IN FORCE since 1 Jan 2026','h.up':'📢 2027 List published Sep 2026 → in force 1 Jan 2027','h.chg':'⚡ New 2026: CO misuse banned (M1.4) • Salmeterol dosing changed • Blood rules clarified','h.open':'Open Live Centre →',
 'h.coach':'Your anti-doping coach • online','h.ask':'Ask DopeGuard a Tip',
 'h.mtitle':'🎮 CHOOSE YOUR MISSION','h.msub':'Every game teaches real WADA rules. Earn XP in all 7 to become Clean Legend.',
 'c.quiz.d':'15 timed questions • streak bonus • lifeline. Core WADA exam prep.','c.run.d':'Endless runner! Jump doping traps, grab clean fuel. Speed rises!','c.raid.d':'45-sec raid on the shady lab! Smash banned items, spare clean food.','c.live.d':'Real WADA/NADA headlines auto-updating + 2026 rule changes.','c.dn.d':'Learn Mode: answer, read the info box, press Next. 15 rounds!','c.mem.d':'Match banned substances with their category. Sharpens recall.','c.story.d':'5-chapter career story. Your choices decide ban or gold!','c.check.d':'Search 20+ medicines & supplements + Global DRO link.',
 'c.xp':'possible →','c.go':'Stay updated →','c.check.go':'Instant result →',
 'h.why':'✨ WHY THIS PROJECT IS DIFFERENT',
 'w.live.t':'Live Updates Centre','w.live.d':'Real WADA/NADA headlines auto-refresh — no static PDFs.',
 'w.story.t':'Story Mode career','w.story.d':'Choice-based Road to Gold with Clean Score.',
 'w.cert.t':'Printable certificate','w.cert.d':'100+ XP → Fair Play Oath certificate with your name.',
 'w.apk.t':'APK-ready PWA','w.apk.d':'New tricolor icon + install button + mobile bottom nav.',
 's1.t':'1️⃣ Check Live Centre','s1.d':'See what is actually banned in 2026 (2 min).',
 's2.t':'2️⃣ Play & earn XP','s2.d':'Quiz + Story = 200 XP in 15 minutes.',
 's3.t':'3️⃣ Get certified','s3.d':'Cross 100 XP → claim certificate & show jury.'
},
hi:{
 'nav.home':'होम','nav.live':'लाइव सेंटर','nav.learn':'सीखो','nav.quiz':'क्विज़ क्वेस्ट','nav.run':'डोपिंग रन','nav.raid':'सप्लीमेंट रेड','nav.story':'गोल्ड तक का सफर','nav.checker':'चेकर','nav.ranks':'रैंक','nav.cert':'🏅 प्रमाणपत्र','nav.install':'📲 ऐप इंस्टॉल करो (APK जैसा)',
 'nav.tag':'एरीना • 🇮🇳 क्लीन स्पोर्ट इंडिया',
 'tick':'🔴 लाइव • WADA 2026 प्रतिबंधित सूची 1 जनवरी 2026 से लागू  •  2027 सूची प्रकाशित (1 जनवरी 2027 से लागू)  •  नया: गैर-निदान कार्बन-मोनोऑक्साइड उपयोग प्रतिबंधित (M1.4)  •  NADA इंडिया ने नई दिल्ली में GAIIN सम्मेलन किया  •  5 गेम खेलो • 500 XP कमाओ • प्रमाणपत्र पाओ 🏅',
 'foot':'फेयरप्ले एरीना • मेजर प्रोजेक्ट • एंटी-डोपिंग शिक्षा का गेमिफिकेशन • स्रोत: WADA + NADA इंडिया • एथलीटों के लिए 🏅',
 'av.title':'अपना एथलीट चुनो','av.sub':'ये कैरेक्टर हर गेम में तुम्हारे साथ लड़ेगा 💪',
 'lvl.title':'लेवल अप!','lvl.sub':'आगे बढ़ने के लिए कहीं भी दबाओ 🔥',
 'mascot.hi':'स्वागत चैंपियन! 2026 के नियम लाइव सेंटर में देखो!',
 'h.badge':'🇮🇳 तिरंगा चैंपियन एडिशन • मेजर प्रोजेक्ट',
 'h.desc':'भारतीय एथलीटों के लिए गेम वाली एंटी-डोपिंग अकादमी — 7 गेम, असली WADA 2026 नियम, लाइव अपडेट, XP, बैज और प्रमाणपत्र।',
 'h.start':'▶ क्वेस्ट शुरू करो','h.live':'लाइव सेंटर','h.check':'🔍 पदार्थ चेक करो',
 'h.games':'गेम','h.wada':'WADA सूची लाइव','h.maxxp':'अधिकतम XP',
 'h.list':'WADA सूची की स्थिति','h.inforce':'✅ 2026 सूची — 1 जनवरी 2026 से लागू','h.up':'📢 2027 सूची सितंबर 2026 में प्रकाशित → 1 जनवरी 2027 से लागू','h.chg':'⚡ 2026 में नया: CO दुरुपयोग प्रतिबंधित (M1.4) • साल्मेटेरॉल खुराक बदली • रक्त नियम स्पष्ट','h.open':'लाइव सेंटर खोलो →',
 'h.coach':'तुम्हारा एंटी-डोपिंग कोच • ऑनलाइन','h.ask':'डोपगार्ड से टिप पूछो',
 'h.mtitle':'🎮 अपना मिशन चुनो','h.msub':'हर गेम असली WADA नियम सिखाता है। सातों में XP कमाकर क्लीन लेजेंड बनो।',
 'c.quiz.d':'15 समयबद्ध प्रश्न • स्ट्रीक बोनस • लाइफलाइन। WADA परीक्षा की तैयारी।','c.run.d':'एंडलेस रनर! डोपिंग जाल से कूदो, साफ ईंधन पकड़ो। स्पीड बढ़ती है!','c.raid.d':'छिपी लैब पर 45 सेकंड का छापा! प्रतिबंधित तोड़ो, साफ छोड़ो।','c.live.d':'असली WADA/NADA सुर्खियाँ ऑटो-अपडेट + 2026 नियम बदलाव।','c.dn.d':'लर्न मोड: जवाब दो, जानकारी पढ़ो, Next दबाओ। 15 राउंड!','c.mem.d':'प्रतिबंधित पदार्थों को उनकी श्रेणी से मिलाओ। याददाश्त तेज करो।','c.story.d':'5-अध्याय की करियर कहानी। तुम्हारे फैसले — बैन या गोल्ड!','c.check.d':'20+ दवाएँ व सप्लीमेंट खोजो + Global DRO लिंक।',
 'c.xp':'XP तक →','c.go':'अपडेट देखो →','c.check.go':'तुरंत परिणाम →',
 'h.why':'✨ ये प्रोजेक्ट सबसे अलग क्यों है',
 'w.live.t':'लाइव अपडेट सेंटर','w.live.d':'असली WADA/NADA सुर्खियाँ ऑटो-रिफ्रेश — कोई उबाऊ PDF नहीं।',
 'w.story.t':'कहानी वाला करियर मोड','w.story.d':'फैसलों वाली Road to Gold कहानी + क्लीन स्कोर।',
 'w.cert.t':'छपने वाला प्रमाणपत्र','w.cert.d':'100+ XP → तुम्हारे नाम वाला फेयर प्ले प्रमाणपत्र।',
 'w.apk.t':'APK-रेडी ऐप','w.apk.d':'नया तिरंगा आइकन + इंस्टॉल बटन + मोबाइल नेविगेशन।',
 's1.t':'1️⃣ लाइव सेंटर देखो','s1.d':'2026 में असल में क्या प्रतिबंधित है (2 मिनट)।',
 's2.t':'2️⃣ खेलो और XP कमाओ','s2.d':'क्विज़ + कहानी = 15 मिनट में 200 XP।',
 's3.t':'3️⃣ प्रमाणपत्र पाओ','s3.d':'100 XP पार → प्रमाणपत्र लो और जूरी को दिखाओ।'
}};
function applyI18n(){
 const L=LANG(),D=I18N[L]||I18N.en;
 document.documentElement.lang=(L==='hi'?'hi':'en');
 document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(D[k]!==undefined)el.textContent=D[k]});
 document.querySelectorAll('[data-i18n-ph]').forEach(el=>{const k=el.dataset.i18nPh;if(D[k]!==undefined)el.placeholder=D[k]});
 const b=document.getElementById('langBtn');if(b)b.textContent=(L==='hi'?'EN | हिंदी ✓':'EN | हिंदी');
 bindReveals();
}
const HI_TIPS=['2026 सूची 1 जनवरी 2026 से लागू है — लाइव सेंटर देखो!','नया 2026: गैर-निदान CO उपयोग प्रतिबंधित (M1.4)!','सख्त दायित्व: तुम्हारे शरीर में जो भी है, जिम्मेदारी तुम्हारी!','सप्लीमेंट? सिर्फ batch-tested (Informed-Sport) ब्रांड!','दवाई चाहिए? Global DRO चेक करो + TUE माँगो!','NADA हेल्पलाइन: डोपिंग दिखे तो speakup-nada@gov.in पर बताओ'];
document.addEventListener('DOMContentLoaded',applyI18n);
