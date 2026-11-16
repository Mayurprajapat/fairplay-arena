from flask import Flask, render_template, request, jsonify
import os, random
from datetime import datetime

app = Flask(__name__)

QUIZ = [
("What does WADA stand for?", ["World Anti-Doping Agency","World Athlete Development Association","World Anti-Drug Alliance","Worldwide Athletics Data Agency"], 0, "WADA is the World Anti-Doping Agency."),
("What is a TUE?", ["Permission to skip testing","Authorization for a prohibited treatment for a legitimate medical need","A supplement brand","A sports licence"], 1, "A Therapeutic Use Exemption may permit medically necessary use when criteria are met."),
("Under strict liability, who is responsible for a prohibited substance found in an athlete's sample?", ["Coach only","Team doctor only","The athlete","Laboratory"], 2, "Athletes are responsible for substances found in their bodies, subject to applicable rules."),
("What is the purpose of the B sample?", ["Test another athlete","Allow confirmation analysis of the A sample","Replace blood testing","Check fitness"], 1, "The B sample may be analysed to confirm the A-sample result."),
("Which document lists prohibited substances and methods?", ["Olympic Charter","WADA Prohibited List","World Health List","Athlete handbook"], 1, "The WADA Prohibited List is updated regularly."),
("What should you do before taking a supplement?", ["Trust the label","Ask teammates","Assess ingredients and seek qualified advice","Take a higher dose"], 2, "Supplements may be contaminated or mislabelled; no supplement is risk-free."),
("What does ADRV mean?", ["Athlete Development Review Value","Anti-Doping Rule Violation","Annual Drug Regulation Visit","Approved Drug Research Version"], 1, "ADRV means Anti-Doping Rule Violation."),
("Can a substance be prohibited only in-competition?", ["Yes","No","Only for professionals","Only in team sports"], 0, "Some substances are prohibited in-competition only."),
("What is the safest first step if unsure about a medication?", ["Stop it immediately","Ask your doctor and anti-doping organization","Ask social media","Take half a dose"], 1, "Never stop prescribed treatment without medical advice."),
("What is doping control?", ["Fitness test","Sample collection and related anti-doping procedures","Nutrition plan","Coaching assessment"], 1, "Doping control includes notification, collection, documentation and secure handling."),
("Can contaminated supplements create anti-doping risks?", ["Never","Yes","Only powders","Only for professionals"], 1, "Contamination is a known risk; athletes should make informed decisions."),
("What does the Prohibited List include?", ["Only medicines","Substances and methods","Only recreational drugs","Only injections"], 1, "The List covers categories of substances and methods."),
("When can a substance be prohibited?", ["At all times, in-competition, or in particular sports","Only during training","Only at the Olympics","After a warning"], 0, "The List specifies the scope of each prohibition."),
("What should you do when notified for a test?", ["Ignore it","Follow the process and understand your rights","Leave the venue","Send a friend"], 1, "Athletes should comply and understand their rights and responsibilities."),
("What is the core goal of clean sport?", ["Win at any cost","Fairness, health and integrity","Avoid all medicines","Get sponsorship"], 1, "Clean sport protects athlete health and fair competition.")
]

MODULES = [
("📜","The Anti-Doping Code","Foundation","The World Anti-Doping Code harmonizes anti-doping policies, rules and regulations across sports and countries.",["Know your rights and responsibilities","Understand WADA and your national anti-doping organization","Rules apply to athletes and athlete support personnel"]),
("🚫","The Prohibited List","Know the rules","The WADA Prohibited List is updated regularly. It includes S, M and P categories and specifies when a substance or method is prohibited.",["S categories cover groups of substances","M categories cover prohibited methods","P1 applies to particular sports","Always consult the current official List"]),
("🩺","Therapeutic Use Exemption","Health first","A TUE may permit use of a prohibited substance or method for a legitimate medical condition when applicable criteria are met.",["Apply through the appropriate anti-doping organization","Keep medical documentation","Do not stop prescribed treatment without medical advice"]),
("🧪","Testing & Samples","Doping control","Doping control can include urine or blood collection, notification, documentation, sealing and secure transport.",["Understand the sample collection process","Check seals and documentation","A B sample may confirm an A-sample result"]),
("🥤","Supplements & Risk","Stay informed","Supplements can be contaminated, mislabelled or contain undeclared ingredients. Athletes cannot eliminate every risk.",["Assess whether you need the supplement","Check ingredients and batch details","Keep receipts and packaging","No supplement can be guaranteed risk-free"]),
("⚖️","Violations & Consequences","Accountability","The Code describes 11 categories of Anti-Doping Rule Violations. Consequences depend on the violation and circumstances.",["Strict liability is a central principle","Intent and circumstances may affect consequences","Know the rules before competition"])
]
STORY = [
("The Shortcut","A teammate offers an unlabelled performance booster before a major event.","What is your best move?",[("Take it. The event is close.",-20,"Unknown ingredients can put your health and eligibility at risk."),("Decline and check it with a qualified professional.",20,"Good decision: pause, verify and seek qualified advice."),("Take a smaller amount.",-10,"A smaller dose does not make an unknown product safe.")]),
("The Prescription","Your doctor prescribes a medicine that may contain a prohibited substance.","What should you do?",[("Stop the medicine immediately.",-10,"Never stop prescribed treatment without medical advice."),("Discuss it with your doctor and ask about TUE procedures.",20,"Health comes first; TUE procedures may apply."),("Hide the medicine.",-20,"Concealing medication prevents proper guidance.")]),
("Doping Control","A doping control officer notifies you for testing after a competition.","How do you respond?",[("Ignore the officer.",-20,"Failure to comply can itself be a rule violation."),("Follow the process and understand your rights.",20,"Correct: cooperate and use the rights available under the rules."),("Ask a friend to provide the sample.",-20,"The notified athlete must provide the sample.")]),
("The Result","You receive an adverse analytical finding and suspect a supplement was contaminated.","What is responsible?",[("Delete purchase records.",-20,"Preserve relevant evidence and records."),("Seek qualified advice and preserve records.",20,"Responsible: understand the process and keep documentation."),("Make accusations online immediately.",-10,"Get reliable advice before making public claims.")]),
("The Final","A rival hints that a banned method could give you an advantage.","What defines your legacy?",[("Win at any cost.",-20,"A medal is not worth risking health and integrity."),("Compete clean and encourage teammates.",20,"Champion mindset: protect the integrity of sport."),("Let others decide.",-5,"Seek trusted guidance and stand for clean sport.")])
]

@app.route("/")
def home():
    return render_template("index.html", modules=MODULES)

@app.route("/learn")
def learn():
    return render_template("learn.html",modules=MODULES)

@app.route("/certificate")
def certificate():
    return render_template("certificate.html",date=datetime.now().strftime("%d %B %Y"))

@app.route("/api/quiz")
def api_quiz():
    q=QUIZ[:]; random.shuffle(q)
    return jsonify([{"q":x[0],"o":x[1],"a":x[2],"e":x[3]} for x in q])

@app.route("/api/check",methods=["POST"])
def api_check():
    data=request.get_json(silent=True) or {}
    term=str(data.get("substance","")).strip()
    examples={
      "testosterone":("Prohibited","S1 · Anabolic agents","Prohibited at all times in the WADA framework."),
      "epo":("Prohibited","S2 · Peptide hormones","Prohibited at all times. Educational example."),
      "caffeine":("Generally permitted","Monitoring Program","Monitored, not prohibited in the current framework; verify current rules."),
      "creatine":("Not listed as prohibited","Supplement risk","Creatine itself is not listed as prohibited, but supplement contamination remains possible."),
      "salbutamol":("Conditional rules apply","S3 · Beta-2 agonists","Some inhaled use may be permitted within specified limits; other use may require a TUE."),
      "morphine":("Prohibited in-competition","S7 · Narcotics","Prohibited in-competition; medical and TUE rules may be relevant."),
      "glucocorticoid":("Route and timing dependent","S9 · Glucocorticoids","Certain routes are prohibited in-competition. Verify the current List.")
    }
    for k,v in examples.items():
        if k in term.lower():
            return jsonify({"name":term,"status":v[0],"category":v[1],"detail":v[2],"found":True})
    return jsonify({"name":term,"status":"Not verified","category":"Check official sources","detail":"This demo has no live medicine database. Check the current WADA Prohibited List and ask your anti-doping organization and healthcare professional.","found":False})

@app.route("/api/story",methods=["GET"])
def api_story():
    return jsonify([{"title":x[0],"scene":x[1],"question":x[2],"choices":[{"label":c[0],"score":c[1],"feedback":c[2]} for c in x[3]]} for x in STORY])

@app.route("/manifest.json")
def manifest(): return app.send_static_file("manifest.json")

if __name__=="__main__":
    app.run(host="0.0.0.0",port=int(os.environ.get("PORT",5000)),debug=True)
