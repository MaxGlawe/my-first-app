import puppeteer from "puppeteer";
const URL = "https://wwwpraxis-os.com/shop/chronischer-kreuzschmerz";
const b = await puppeteer.launch({ headless:"new", args:["--no-sandbox","--disable-setuid-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.3 });
const errs = [];
p.on("console", m => { if (m.type()==="error") errs.push(m.text()); });
p.on("pageerror", e => errs.push("PAGEERROR: "+e.message));
try { await p.goto(URL, { waitUntil:"networkidle2", timeout: 45000 }); } catch(e){ console.log("goto:", e.message); }
await new Promise(r=>setTimeout(r,2500));
const txt = await p.evaluate(()=>document.body.innerText);
for (const m of ["Chronischer Kreuzschmerz","399","Wer dich begleitet","So fühlt es sich an","Launch","Bonus","Jetzt kaufen"]) console.log((txt.includes(m)?"FOUND  ":"MISSING")+" "+m);
console.log("CONSOLE ERRORS:", errs.length ? errs.slice(0,5).join(" || ") : "none");
await p.screenshot({ path: "public/images/masterclass/chronischer-kreuzschmerz/_qa-prod.png" });
await b.close();
