from flask import Flask, render_template, request, jsonify
import sqlite3, os, json, time, urllib.request, urllib.parse, xml.etree.ElementTree as ET

app = Flask(__name__)
# Vercel serverless has read-only disk except /tmp -> use /tmp there, local file otherwise
ON_VERCEL = bool(os.environ.get("VERCEL"))
_BASE = "/tmp" if ON_VERCEL else os.path.dirname(__file__)
DB = os.path.join(_BASE, "fairplay.db")
LIVE_CACHE = os.path.join(_BASE, "live_cache.json")
_MEM_SCORES = []  # in-memory fallback if disk writes fail (serverless)

# ---------------- LIVE NEWS (real-time with cache) ----------------
CURATED_NEWS = [
 {"title":"WADA's 2026 Prohibited List now in force (from 1 Jan 2026)","src":"WADA Official","date":"2026-01-01","url":"https://www.wada-ama.org/en/news/wadas-2026-prohibited-list-now-force","tag":"WADA LIST"},
 {"title":"WADA publishes 2027 Prohibited List (in force 1 Jan 2027)","src":"WADA Official","date":"2026-09-21","url":"https://www.wada-ama.org/en/news/wada-publishes-2027-prohibited-list","tag":"WADA LIST"},
 {"title":"2026 key change: non-diagnostic carbon-monoxide use banned (M1.4)","src":"WADA 2026 Summary","date":"2026-01-01","url":"https://www.wada-ama.org/en/news/wadas-2026-prohibited-list-now-force","tag":"RULE CHANGE"},
 {"title":"GAIIN anti-doping intelligence conference hosted by NADA, New Delhi","src":"NADA India","date":"2026-04-16","url":"https://nadaindia.yas.gov.in/news-2","tag":"NADA INDIA"},
 {"title":"NADA launches Fair Play Guide in ten regional languages","src":"NADA India","date":"2025-04-16","url":"https://nadaindia.yas.gov.in/news-2","tag":"NADA INDIA"},
 {"title":"NADA bans athletics coach for life; new sanctions across sports","src":"India Today via NADA","date":"2026-09-16","url":"https://www.indiatoday.in/sports/athletics/story/nada-rakesh-kumar-life-ban-gaurav-vats-doping-crackdown-2995860-2026-09-16","tag":"SANCTION"},
]

def fetch_live_rss():
    """Try Google News RSS (free, no key) for fresh anti-doping headlines. Returns list or []."""
    try:
        q = urllib.parse.quote("anti-doping WADA NADA")
        url = f"https://news.google.com/rss/search?q={q}&hl=en-IN&gl=IN&ceid=IN:en"
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            root = ET.fromstring(r.read())
        items = []
        for it in root.findall(".//item")[:12]:
            t = it.findtext("title","").strip()
            link = it.findtext("link","").strip()
            pub = it.findtext("pubDate","").strip()[:16]
            src = (it.find("source").text if it.find("source") is not None else "Google News").strip()
            if t: items.append({"title":t,"url":link,"src":src,"date":pub,"tag":"LIVE"})
        return items
    except Exception:
        return []

def get_live_news():
    now = time.time()
    try:
        if os.path.exists(LIVE_CACHE):
            with open(LIVE_CACHE) as f: cache = json.load(f)
            if now - cache.get("ts",0) < 1800 and cache.get("items"):
                return cache["items"], cache.get("live", False), cache.get("updated","")
    except Exception: pass
    items = fetch_live_rss()
    live = bool(items)
    if not items:
        items = CURATED_NEWS
    try:
        with open(LIVE_CACHE,"w") as f:
            json.dump({"ts":now,"items":items,"live":live,
                       "updated":time.strftime("%d %b %Y, %H:%M IST")}, f)
    except Exception: pass
    return items, live, time.strftime("%d %b %Y, %H:%M IST")

LIST_STATUS = {
 "current":"2026 List — IN FORCE since 1 Jan 2026",
 "upcoming":"2027 List — published Sep 2026, in force 1 Jan 2027",
 "changes2026":["Salmeterol dosing intervals changed","Non-diagnostic carbon-monoxide (CO) use banned — new M1.4","Blood withdrawal rules clarified","Cell components (mitochondria etc.) added to cell-doping ban","Glucocorticoid washout table clarified"],
 "links":{"wada_list":"https://www.wada-ama.org/en/prohibited-list","nada":"https://nadaindia.yas.gov.in/","global_dro":"https://www.globaldro.com/Home","adel":"https://adel.wada-ama.org/"}
}

# ---------------- DATABASE (Vercel-safe: sqlite file, else memory) ----------------
def init_db():
    try:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        cur.execute("""CREATE TABLE IF NOT EXISTS scores(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player TEXT, game TEXT, xp INTEGER, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        con.commit(); con.close()
    except Exception:
        pass  # read-only FS -> memory fallback
init_db()

def add_score(player, game, xp):
    try:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        cur.execute("INSERT INTO scores(player,game,xp) VALUES(?,?,?)", (player, game, xp))
        con.commit(); con.close()
    except Exception:
        _MEM_SCORES.append({"player": player, "game": game, "xp": xp})

def top_players():
    try:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        cur.execute("SELECT player, SUM(xp) as total, COUNT(*) as games FROM scores GROUP BY player ORDER BY total DESC LIMIT 10")
        rows = [{"player": r[0], "xp": r[1], "games": r[2]} for r in cur.fetchall()]
        con.close()
    except Exception:
        rows = []
    if _MEM_SCORES:
        agg = {}
        for s in _MEM_SCORES:
            a = agg.setdefault(s["player"], {"player": s["player"], "xp": 0, "games": 0})
            a["xp"] += s["xp"]; a["games"] += 1
        rows = sorted(agg.values(), key=lambda r: r["xp"], reverse=True)[:10] + rows
    return rows[:10]

# ---------------- DATA ----------------
QUIZ = [
 {"q":"Which organization publishes the World Anti-Doping Code?","options":["WADA","FIFA","IOC","NADA only"],"answer":0,"fact":"WADA (World Anti-Doping Agency) maintains the Code & Prohibited List."},
 {"q":"What does TUE stand for?","options":["Therapeutic Use Exemption","Total Urine Exam","Test Until Exhausted","Therapy Under Evaluation"],"answer":0,"fact":"TUE lets athletes use a banned medicine for genuine medical need with approval."},
 {"q":"Anabolic steroids are banned because they…","options":["Artificially build muscle & strength","Improve eyesight","Reduce weight safely","Cure injuries instantly"],"answer":0,"fact":"Steroids = S1 Anabolic Agents, banned at all times."},
 {"q":"Blood doping mainly improves…","options":["Oxygen delivery/endurance","Flexibility","Reaction time only","Bone density"],"answer":0,"fact":"EPO & blood transfusions boost red blood cells — banned under M1."},
 {"q":"During testing, an athlete refuses to give a sample. This is…","options":["An anti-doping rule violation","Allowed if tired","Allowed once per year","Only a warning"],"answer":0,"fact":"Refusing/evading sample collection = violation (Article 2.3)."},
 {"q":"Which is a common risk of contaminated supplements?","options":["Hidden banned substances","Extra vitamins only","Better sleep always","No risk at all"],"answer":0,"fact":"~15% supplements may be contaminated. Strict liability applies — athlete is responsible!"},
 {"q":"Whereabouts rule applies to…","options":["Registered Testing Pool athletes","All school students","Only coaches","Only retired players"],"answer":0,"fact":"RTP athletes must give 1-hour daily slot for testing."},
 {"q":"Cannabis (THC) in-competition is…","options":["Prohibited","Always allowed","Allowed for all sports","Only banned for swimming"],"answer":0,"fact":"S8 Cannabinoids prohibited in-competition above threshold."},
 {"q":"Diuretics are banned mainly because they…","options":["Mask other drugs & cut weight fast","Build muscle","Increase height","Improve memory"],"answer":0,"fact":"S5 Diuretics hide evidence & cause dangerous dehydration."},
 {"q":"Growth Hormone (hGH) belongs to…","options":["Peptide hormones (S2)","Stimulants","Narcotics","Beta-blockers"],"answer":0,"fact":"S2 Peptide Hormones, Growth Factors — banned always."},
 {"q":"An athlete needs an inhaler with a banned dose. Correct step?","options":["Apply for TUE before use","Hide it from officials","Borrow friend's inhaler","Stop treatment silently"],"answer":0,"fact":"Check Global DRO + apply TUE via NADA/WADA."},
 {"q":"Sample bottles A & B are used for…","options":["B confirms if A is positive","Two different athletes","Practice tests","Water storage"],"answer":0,"fact":"Athlete can request B-sample analysis if A is adverse."},
 {"q":"Stimulants like amphetamine are…","options":["Banned in-competition","Allowed freely","Banned only for chess","Never tested"],"answer":0,"fact":"S6 Stimulants banned in-competition (some also out-of-competition)."},
 {"q":"Beta-blockers are banned in which sports?","options":["Shooting, Archery, Golf, Darts","100m sprint only","Football","Marathon"],"answer":0,"fact":"P1 Beta-blockers banned in precision sports (calm tremor = advantage)."},
 {"q":"Maximum ban for first serious intentional doping?","options":["4 years","1 week","1 month","Lifetime for all cases"],"answer":0,"fact":"Intentional violation = up to 4 years. Second offence can be lifetime."},
]

SUBSTANCES = [
 {"name":"Stanozolol","status":"BANNED","cat":"S1 Anabolic Steroid","info":"Muscle-building steroid. Banned always. 4-yr ban risk."},
 {"name":"Nandrolone","status":"BANNED","cat":"S1 Anabolic Steroid","info":"Classic steroid, long detection window (months)."},
 {"name":"Testosterone (exogenous)","status":"BANNED","cat":"S1 Anabolic Steroid","info":"Extra testosterone = unfair muscle + aggression + heart risk."},
 {"name":"Clenbuterol","status":"BANNED","cat":"S1 / S3","info":"Fat-burner in meat contamination cases too. Strict liability!"},
 {"name":"EPO (Erythropoietin)","status":"BANNED","cat":"S2 Peptide Hormone","info":"Boosts RBC/endurance. Biological passport catches it."},
 {"name":"hGH (Growth Hormone)","status":"BANNED","cat":"S2 Peptide Hormone","info":"Banned always. Needs specialized blood test."},
 {"name":"Insulin (misuse)","status":"BANNED","cat":"S4 Hormone modulator","info":"Misused for anabolism. Diabetics need TUE."},
 {"name":"Furosemide","status":"BANNED","cat":"S5 Diuretic","info":"Masks drugs + rapid weight cut. Dangerous dehydration."},
 {"name":"Hydrochlorothiazide","status":"BANNED","cat":"S5 Diuretic","info":"Common BP drug — athletes need TUE."},
 {"name":"Amphetamine","status":"BANNED","cat":"S6 Stimulant (in-competition)","info":"Focus/energy stimulant. Banned on match day."},
 {"name":"Cocaine","status":"BANNED","cat":"S6 Stimulant (in-competition)","info":"Banned in-competition. Substance of Abuse rule may reduce ban with rehab."},
 {"name":"Methylphenidate","status":"BANNED*","cat":"S6 *needs TUE","info":"ADHD medicine — allowed ONLY with valid TUE."},
 {"name":"Salbutamol (high dose)","status":"CONDITIONAL","cat":"S3 Beta-2 Agonist","info":"Inhaler allowed within limits (1600mcg/24h). Over = violation."},
 {"name":"Tramadol","status":"BANNED","cat":"S7 Narcotic (in-competition)","info":"Painkiller banned in-competition since 2024."},
 {"name":"Morphine","status":"BANNED","cat":"S7 Narcotic","info":"Strong painkiller, banned in-competition."},
 {"name":"THC / Cannabis","status":"BANNED","cat":"S8 Cannabinoid (in-competition)","info":"Banned in-competition above 150 ng/mL."},
 {"name":"Propranolol","status":"BANNED*","cat":"P1 Beta-blocker (precision sports)","info":"Banned in shooting/archery/golf. Needs TUE there."},
 {"name":"Meldonium","status":"BANNED","cat":"S4 Hormone/Metabolic","info":"Famous Sharapova case. Banned since 2016."},
 {"name":"Caffeine","status":"ALLOWED","cat":"Not prohibited","info":"Allowed. Was monitored, now free (but don't overdose!)."},
 {"name":"Paracetamol","status":"ALLOWED","cat":"Not prohibited","info":"Normal pain/fever medicine — allowed."},
 {"name":"Vitamin C","status":"ALLOWED","cat":"Supplement","info":"Allowed, but buy batch-tested (Informed-Sport) products."},
 {"name":"Creatine","status":"ALLOWED","cat":"Supplement","info":"Allowed, but contamination risk — buy certified brands only."},
 {"name":"Protein powder (certified)","status":"ALLOWED","cat":"Supplement","info":"Allowed IF batch-tested. Uncertified = risky."},
]

DOPE_NOPE = [
 {"t":"Drinking normal water before a test is doping","a":False,"why":"Hydration is fine and encouraged."},
 {"t":"Taking your friend's inhaler before final is OK","a":False,"why":"Never share prescriptions. Need own TUE + prescription."},
 {"t":"Protein from a certified (Informed-Sport) brand is safer","a":True,"why":"Batch-tested = lower contamination risk."},
 {"t":"Refusing a dope test has no punishment","a":False,"why":"Refusal = violation, up to 4-year ban."},
 {"t":"EPO increases endurance illegally","a":True,"why":"EPO boosts red blood cells — banned S2."},
 {"t":"Caffeine in normal chai/coffee is banned","a":False,"why":"Caffeine is allowed."},
 {"t":"Diuretics can mask other drugs","a":True,"why":"Yes — S5 banned always."},
 {"t":"TUE lets you use a banned drug for real medical need","a":True,"why":"With NADA/WADA approval, yes."},
 {"t":"Beta-blockers give advantage in shooting","a":True,"why":"Reduce tremor — banned in precision sports."},
 {"t":"Supplements can never be contaminated","a":False,"why":"Studies show contamination is common. Strict liability!"},
 {"t":"B-sample can be requested if A-sample is positive","a":True,"why":"Athlete right to B-sample analysis."},
 {"t":"Cannabis is allowed on match day","a":False,"why":"Banned in-competition above threshold."},
 {"t":"Blood transfusion for performance is legal","a":False,"why":"M1 Prohibited Method — banned."},
 {"t":"Paracetamol for fever is generally allowed","a":True,"why":"Not on prohibited list."},
 {"t":"Coaches can be punished for helping doping","a":True,"why":"Trafficking/complicity = violation for support staff too."},
]

STORY = [
 {"chapter":"District Trials","hchapter":"जिला ट्रायल्स","text":"You are 17-year-old sprinter Aarav. Coach says 'beta, ye injection le lo, selection pakka'. Teammate offers an unknown powder for instant energy. What do you do?","htext":"तुम 17 साल के धावक आरव हो। कोच कहता है 'बेटा, ये इंजेक्शन ले लो, सिलेक्शन पक्का'। साथी तुरंत एनर्जी के लिए अनजान पाउडर देता है। क्या करोगे?","choices":[
   {"t":"Refuse & ask what's inside + report to NADA","ht":"इनकार करो, पूछो अंदर क्या है + NADA को बताओ","score":20,"fb":"Brave! You protected your career. +20 Clean Score","hfb":"बहादुर! तुमने करियर बचाया। +20 क्लीन स्कोर"},
   {"t":"Take it once, 'ek baar se kya hoga'","ht":"एक बार ले लो, 'एक बार से क्या होगा'","score":-20,"fb":"Risky! One dose can fail a test for months. -20","hfb":"खतरनाक! एक खुराक महीनों तक टेस्ट फेल करा सकती है। -20"},
   {"t":"Ask parents + doctor first","ht":"पहले माता-पिता + डॉक्टर से पूछो","score":10,"fb":"Smart pause. Trusted advice matters. +10","hfb":"समझदारी भरा ठहराव। भरोसेमंद सलाह जरूरी। +10"}]},
 {"chapter":"National Camp","hchapter":"राष्ट्रीय शिविर","text":"You have asthma. Big final in 3 days. Doctor prescribes an inhaler that is on the banned list above certain dose. What now?","htext":"तुम्हें दमा है। 3 दिन में बड़ा फाइनल। डॉक्टर ने इनहेलर लिखा जो एक खुराक से ऊपर प्रतिबंधित सूची में है। अब क्या?","choices":[
   {"t":"Apply for TUE + check Global DRO with doctor","ht":"TUE आवेदन करो + डॉक्टर से Global DRO चेक कराओ","score":20,"fb":"Perfect process! TUE protects you. +20","hfb":"एकदम सही प्रक्रिया! TUE तुम्हें बचाएगा। +20"},
   {"t":"Use secretly, nobody will know","ht":"चुपके से ले लो, किसी को पता नहीं चलेगा","score":-20,"fb":"Secret use = violation if tested. -20","hfb":"छिपा उपयोग = टेस्ट में उल्लंघन। -20"},
   {"t":"Skip medicine & suffer in silence","ht":"दवा छोड़ दो और चुपचाप सहो","score":-10,"fb":"Health first! Never skip care — ask for TUE. -10","hfb":"सेहत पहले! इलाज मत छोड़ो — TUE माँगो। -10"}]},
 {"chapter":"Sponsor Offer","hchapter":"स्पॉन्सर ऑफर","text":"A supplement brand offers ₹50,000 to promote 'SuperBulk Powder' with no lab certificate. Teammates use it. Your move?","htext":"एक सप्लीमेंट ब्रांड बिना लैब सर्टिफिकेट वाले 'सुपरबल्क पाउडर' के प्रचार के लिए ₹50,000 देता है। साथी इसे लेते हैं। तुम्हारी चाल?","choices":[
   {"t":"Demand batch-test certificate, refuse till then","ht":"बैच-टेस्ट सर्टिफिकेट माँगो, तब तक इनकार","score":20,"fb":"Pro move! No certificate = no deal. +20","hfb":"प्रो चाल! सर्टिफिकेट नहीं = डील नहीं। +20"},
   {"t":"Promote it, money + fame!","ht":"प्रचार करो, पैसा + शोहरत!","score":-20,"fb":"Contaminated product could end your career. -20","hfb":"मिलावटी उत्पाद करियर खत्म कर सकता है। -20"},
   {"t":"Take free supply but don't promote","ht":"मुफ्त सप्लाई लो पर प्रचार मत करो","score":-10,"fb":"Still risky — contamination doesn't care about money. -10","hfb":"फिर भी खतरनाक — मिलावट पैसे नहीं देखती। -10"}]},
 {"chapter":"Surprise Test","hchapter":"अचानक टेस्ट","text":"6 AM knock — Doping Control Officer at your hostel. You drank 2L water, feeling nervous. Officer asks for sample. You…","htext":"सुबह 6 बजे दस्तक — हॉस्टल में डोपिंग नियंत्रण अधिकारी। तुम 2 लीटर पानी पी चुके, घबराहट है। अधिकारी नमूना माँगता है। तुम…","choices":[
   {"t":"Cooperate, show ID, give sample, note medicines","ht":"सहयोग करो, ID दिखाओ, नमूना दो, दवाएँ लिखो","score":20,"fb":"Champion behaviour! Rights + duties both done. +20","hfb":"चैंपियन जैसा व्यवहार! अधिकार + कर्तव्य दोनों। +20"},
   {"t":"Say 'I'm sleeping, come tomorrow'","ht":"कहो 'सो रहा हूँ, कल आना'","score":-20,"fb":"Refusal/evasion = violation. -20","hfb":"इनकार/बचना = उल्लंघन। -20"},
   {"t":"Add water to sample to dilute","ht":"नमूने में पानी मिलाकर पतला करो","score":-20,"fb":"Tampering = 4-year ban. Never! -20","hfb":"छेड़छाड़ = 4 साल बैन। कभी नहीं! -20"}]},
 {"chapter":"The Final","hchapter":"फाइनल","text":"Gold-medal race! Rival whispers 'everyone dopes, you can't win clean'. Crowd roars. Last decision…","htext":"गोल्ड मेडल रेस! प्रतिद्वंद्वी फुसफुसाता है 'सब डोप करते हैं, साफ खेलकर नहीं जीत सकते'। भीड़ गरजती है। आखिरी फैसला…","choices":[
   {"t":"Run clean, trust training + chant Fair Play Oath","ht":"साफ दौड़ो, मेहनत पर भरोसा + फेयर प्ले शपथ","score":20,"fb":"LEGEND! Clean gold shines forever. +20 — Certificate unlocked!","hfb":"लीजेंड! साफ सोना हमेशा चमकता है। +20 — प्रमाणपत्र अनलॉक!"},
   {"t":"Take rival's 'energy pill' in washroom","ht":"वॉशरूम में प्रतिद्वंद्वी की 'एनर्जी गोली' लो","score":-30,"fb":"One pill destroyed years of training. Career over. -30","hfb":"एक गोली ने सालों की मेहनत मिटाई। करियर खत्म। -30"},
   {"t":"Report rival's tip to officials after race","ht":"रेस के बाद प्रतिद्वंद्वी की बात अधिकारियों को बताओ","score":15,"fb":"Clean + courageous citizen of sport. +15","hfb":"खेल के साफ व साहसी नागरिक। +15"}]},
]

# ---------------- ROUTES ----------------
@app.route("/")
def home(): return render_template("index.html")

@app.route("/learn")
def learn(): return render_template("learn.html")

@app.route("/quiz")
def quiz(): return render_template("quiz.html")

@app.route("/dope-nope")
def dope_nope(): return render_template("dope_nope.html")

@app.route("/memory")
def memory(): return render_template("memory.html")

@app.route("/story")
def story(): return render_template("story.html")

@app.route("/checker")
def checker(): return render_template("checker.html")

@app.route("/dashboard")
def dashboard(): return render_template("dashboard.html", leaders=top_players())

@app.route("/certificate")
def certificate(): return render_template("certificate.html")

@app.route("/live")
def live(): return render_template("live.html")

@app.route("/champion")
def champion(): return render_template("champion.html")

# ---------------- LIVE APIs ----------------
@app.route("/api/live-news")
def api_live():
    items, is_live, updated = get_live_news()
    return jsonify({"items":items, "live":is_live, "updated":updated})

@app.route("/api/list-status")
def api_list(): return jsonify(LIST_STATUS)

# ---------------- APIs ----------------
@app.route("/api/questions")
def api_q(): return jsonify(QUIZ)

@app.route("/api/dope-nope")
def api_dn(): return jsonify(DOPE_NOPE)

@app.route("/api/story")
def api_story(): return jsonify(STORY)

@app.route("/api/substances")
def api_sub():
    q = request.args.get("q","").lower()
    if not q: return jsonify(SUBSTANCES)
    return jsonify([s for s in SUBSTANCES if q in s["name"].lower() or q in s["cat"].lower()])

@app.route("/api/score", methods=["POST"])
def api_score():
    d = request.json or {}
    player = (d.get("player") or "Guest").strip()[:30] or "Guest"
    game = d.get("game","quiz")[:30]
    xp = int(d.get("xp",0))
    if xp < -100 or xp > 500: return jsonify({"ok":False}), 400
    add_score(player, game, xp)
    return jsonify({"ok":True, "total": sum(r["xp"] for r in top_players() if r["player"]==player)})

@app.route("/api/leaderboard")
def api_lb(): return jsonify(top_players())

if __name__ == "__main__":
    print(" * FairPlay Arena running on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=not ON_VERCEL)
