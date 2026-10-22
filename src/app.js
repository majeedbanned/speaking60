/* ======================= Phases & checkpoints ======================= */
const PHASES = {
 1:{t:"پایه: شکستن عادت ترجمه", d:"معرفی، روال، Small Talk، سؤال پرسیدن، دور زدن کلمه‌های ناآشنا، گذشته و آینده، تلفن. هدف: جمله‌سازی سریع با زمان‌های پایه."},
 2:{t:"هستهٔ محیط کار", d:"Stand-up، درخواست، توضیح مشکل، جلسه، روشن‌سازی، تأخیر، سپردن کار، تماس تصویری، گزارش به مدیر."},
 3:{t:"نظر، بحث و متقاعدسازی", d:"نظر دادن، مخالفت مؤدبانه، مقایسه، Pitch، فرضیه‌ها، پیشنهاد، مذاکرهٔ ساده، ایده‌پردازی، بازخورد."},
 4:{t:"صحبت فنی و حل مسئله", d:"باگ، معماری، فرایند، Postmortem، تخمین، توضیح برای غیرفنی‌ها، trade-off، عیب‌یابی تلفنی، دمو."},
 5:{t:"قصه‌گویی و روانی اجتماعی", d:"قصه‌گویی، اشتباه و درس، احساسات، شبکه‌سازی، مصاحبه و STAR، خدمات روزمره، سفر، بحث‌های روز."},
 6:{t:"موقعیت‌های حساس و اجرای نهایی", d:"ارائه، Q&A، مذاکرهٔ جدی، گفتگوی دشوار، نه گفتن، ادارهٔ جلسه، تماس مشتری، صحبت بی‌مقدمه، صحبت ۵ دقیقه‌ای."}
};
const CHECK = {
 0:{q:"What's the most interesting thing about your city?", a2:"Describe a normal working day for you, from morning to evening."},
 10:{wpm:5, pauses:6, fillers:8, err:0, recall:70, listen:null, conf:1, run:15, q:"What's the best decision you've ever made? Why?", a2:"Describe a typical week at work and one thing you would change about it.", rp:"Networking: meet a stranger at a tech event, introduce yourself and keep the small talk going for 3 minutes."},
 20:{wpm:10, pauses:5, fillers:7, err:15, recall:70, listen:60, conf:1.5, run:20, q:"Describe a place that means a lot to you.", a2:"Describe the last meeting you attended: what was discussed and what was decided.", rp:"Give your manager a status update, including one delay, a risk and a request."},
 30:{wpm:15, pauses:4, fillers:6, err:25, recall:75, listen:70, conf:2, run:25, q:"If you could change one thing about the education system, what would it be?", a2:"Describe a tool or app you use every day and how it could be better.", rp:"Disagree politely with a plan in a meeting, then persuade the group to accept your alternative."},
 40:{wpm:20, pauses:3, fillers:5, err:35, recall:75, listen:70, conf:2.5, run:30, q:"Explain something you understand well that most people don't.", a2:"Describe a work problem you solved recently, step by step.", rp:"Explain a serious technical incident to a non-technical client and agree on next steps."},
 50:{wpm:25, pauses:2, fillers:4, err:45, recall:80, listen:75, conf:3, run:40, q:"Tell me about a person who has influenced you a lot.", a2:"Describe the most interesting person you've worked with.", rp:"A job interview: 'Tell me about yourself' plus two behavioral (STAR) questions."},
 60:{wpm:30, pauses:1, fillers:3, err:50, recall:80, listen:80, conf:3, run:45, q:"What have you learned about yourself during these 60 sessions?", a2:"Describe how your working life has changed over the last five years.", rp:"Chair a short meeting with a difficult client, handle objections and close with clear action items."}
};
const FOCUS = {
 fluency:{t:"روانی (مکث زیاد، کندی، ترجمهٔ ذهنی)", extra:"۵ دقیقهٔ اضافه: تمرین روانی همین جلسه را دو بار انجام بده و در بار دوم ۲۵٪ زمان را کم کن. هر روز یک Self-talk یک‌دقیقه‌ای (در ماشین، آشپزخانه…) دربارهٔ کاری که انجام می‌دهی.", gpt:"fluency: I pause a lot and translate from Persian in my head. Push me to answer faster; if I pause for too long, give me a starter phrase instead of waiting."},
 accuracy:{t:"دقت گرامری", extra:"۵ دقیقهٔ اضافه: بعد از گفتگو با ChatGPT، ۵ جملهٔ اشتباهت را با شکل درست ۳ بار بلند بگو و در دفتر خطا وارد کن. تمرین گرامر را یک بار هم با موضوع کار خودت تکرار کن.", gpt:"grammatical accuracy: be stricter than usual with grammar corrections (tenses, articles, prepositions, word order) and make me repeat each correction."},
 vocab:{t:"دایرهٔ لغات فعال", extra:"۵ دقیقهٔ اضافه: برای هر مورد اصلی و پشتیبان ۲ جملهٔ واقعی دربارهٔ زندگی خودت بگو (نه یکی) و موارد اضافه را هم یک بار بخوان.", gpt:"vocabulary: I use simple, repetitive words. When I use a basic word, suggest a more precise or natural alternative and ask me to use it in a new sentence."},
 pron:{t:"تلفظ و لهجه", extra:"۵ دقیقهٔ اضافه: Shadowing را دو برابر کن (۱۰ بار به جای ۵) و بار اول و آخر را ضبط و مقایسه کن. موارد تلفظ همین جلسه را در YouGlish با ۳ گویندهٔ مختلف گوش کن.", gpt:"pronunciation: correct my pronunciation of individual words and word stress when you notice a problem (especially w/v, th, short/long vowels, extra vowels before s-clusters), and make me repeat."},
 listening:{t:"شنیدن و فهم گفتار سریع", extra:"۵ دقیقهٔ اضافه: هر دو جلسه یک قسمت ۶ دقیقه‌ای از 6 Minute English (کانال YouTube یا سایت BBC Learning English) را بدون زیرنویس گوش کن، بعد با زیرنویس؛ ۳۰ ثانیه از آن را دیکته بنویس و مقایسه کن.", gpt:"listening: speak at a completely natural, fast speed with contractions and connected speech. Sometimes ask me to repeat or summarize what you just said to check that I understood."},
 confidence:{t:"اعتمادبه‌نفس و ترس از اشتباه", extra:"۵ دقیقهٔ اضافه: هر روز یک پیام صوتی ۶۰ ثانیه‌ای بدون ویرایش ضبط کن (دربارهٔ روزت) و گوش نده — فقط بفرست به خودت. هدف: عادت به حرف زدن ناقص ولی پیوسته.", gpt:"confidence: I'm afraid of making mistakes. Be encouraging, praise specific good things I do, and focus on communication first. Keep me talking even when I make errors."}
};
const BASE_SRS = [1,3,7,14,28];
const TRAPS = [
 ["he / she, his / her (قاطی کردن)","«او» در فارسی جنسیت ندارد؛ قبل از ضمیر یک لحظه به آن آدم فکر کن."],
 ["حذف a / the","I work in an office. The client called. — قبل از اسم مفرد شمردنی حرف تعریف لازم است."],
 ["I'm agree","I agree — agree خودش فعل است."],
 ["discuss about","discuss the plan — بدون about."],
 ["explain me","explain to me / explain it to me"],
 ["He said me","He told me / He said to me"],
 ["informations, advices, feedbacks","information, advice, feedback — غیرشمردنی‌اند."],
 ["since three years","for three years — since فقط با نقطهٔ زمانی (since 2020)."],
 ["Did you went?","Did you go? — بعد از did فعل ساده می‌آید."],
 ["make a research / do a mistake","do research / make a mistake"],
 ["Do you know where is it?","Do you know where it is? — در سؤال غیرمستقیم ترتیب خبری است."],
 ["I have 30 years","I'm 30 (years old)."],
 ["open / close the light","turn on / turn off the light"],
 ["married with","married to"],
 ["«اِسکول»، «وُرک»","school، work — بدون «اِ»ی اضافه و با /w/ نه /v/."]
];
const KIT = {
 think:["Well, let me think…","That's a good question.","How can I put it…","The thing is…","What I mean is…","Let me put it another way."],
 back:["Right.","I see.","Got it.","Makes sense.","Fair enough.","Really?"]
};

/* ======================= State (per-browser convenience) ======================= */
const KEY="sp60_v1";
const defaultState = () => ({done:{}, passed:{}, hard:{}, focus:[], err:[], metrics:{}, cando:{}, profile:{}, phrases:[], ttsRate:1, reports:{}});
let ST = defaultState();
try{ const raw = localStorage.getItem(KEY); if(raw){ ST = Object.assign(ST, JSON.parse(raw)); } }catch(e){}
ST.profile = ST.profile || {}; ST.phrases = ST.phrases || []; ST.reports = ST.reports || {};
function save(){ ST._ts=Date.now(); if(!ST.firstUse) ST.firstUse=ST._ts; const raw=JSON.stringify(ST); try{ localStorage.setItem(KEY, raw); }catch(e){} try{ IDB.put("kv","state",raw).catch(()=>{}); }catch(e){} }

/* ======================= Helpers ======================= */
const $ = s => document.querySelector(s);
const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fa = n => String(n).replace(/\d/g, d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
const ALL = () => SESSIONS.filter(Boolean);
function nextSession(){ for(let i=1;i<=60;i++){ if(!ST.done[i]) return i; } return 60; }
function contentBefore(m){ while(m>=1 && SESSIONS[m] && SESSIONS[m].review) m--; return m; }
function dueSessions(n){
  const out=[]; for(const k of BASE_SRS){ const m=contentBefore(n-k); if(m>=1 && !out.some(o=>o.m===m)) out.push({m,k:n-m}); } return out;
}
function itemKey(n,type,i){ return n+"|"+type+"|"+i; }
function itemBy(key){ const [n,t,i]=key.split("|"); const s=SESSIONS[+n]; return s && s[t] && s[t][+i]; }
function hardList(){ return Object.keys(ST.hard).filter(k=>ST.hard[k]).map(k=>({k, it:itemBy(k)})).filter(x=>x.it); }
function yg(t){
  if(/ vs /.test(t)) return null;
  const c = t.split("→")[0].replace(/\(.*?\)|\/.*?\/|[↘↗→|…✓✗?!.,]/g,"").replace(/\s+/g," ").trim();
  if(!c || c.split(" ").length>3 || !/^[A-Za-z' -]+$/.test(c)) return null;
  return "https://youglish.com/pronounce/"+encodeURIComponent(c.toLowerCase())+"/english";
}
function pronHtml(t){
  const parts = / \/ /.test(t) ? t.split(" / ") : [t];
  return parts.map(x=>{ const u=yg(x); return `<span class="pitem">${u?`<a href="${u}" target="_blank" rel="noopener">${esc(x)}</a>`:esc(x)}${TTS.btn(x,true)}</span>`; }).join("");
}
function pick(arr, count, seed){ const out=[]; if(!arr||!arr.length) return out; for(let i=0;i<Math.min(count,arr.length);i++){ out.push(arr[(seed+i)%arr.length]); } return out; }
async function copyText(text, btn){
  const label=btn.textContent;
  try{ await navigator.clipboard.writeText(text); btn.textContent="کپی شد ✓"; setTimeout(()=>btn.textContent=label,1800); }
  catch(e){ const pre=btn.parentElement.querySelector("pre"); if(pre){ const r=document.createRange(); r.selectNodeContents(pre); const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);} btn.textContent="انتخاب شد — Ctrl/⌘+C"; }
}

/* ---- items: must (5) + support (5) + optional extra; repeats are labelled as review ---- */
const norm = x => x.toLowerCase().replace(/\(.*?\)/g,"").replace(/[^a-z ]/g,"").replace(/\s+/g," ").trim();
const FIRST = {};
for(const s of ALL()){ if(s.review) continue; ["v","pv","ex"].forEach(t=>s[t].forEach(it=>{ const k=norm(it[0]); if(!(k in FIRST)) FIRST[k]=s.n; })); }
const TYPE_L = {v:"لغت", pv:"فعل چندکلمه‌ای", ex:"عبارت"};
function entries(s){ const out=[]; ["v","pv","ex"].forEach(t=>s[t].forEach((it,i)=>{ const f=FIRST[norm(it[0])]; out.push({type:t,i,it,key:itemKey(s.n,t,i),rec:(f&&f<s.n)?f:null}); })); return out; }
function split(s){
  const all=entries(s);
  const must=(s.must||[]).map(k=>all.find(e=>e.it[0]===k)).filter(Boolean);
  const taken=new Set(must.map(e=>e.key));
  const pool=["ex","pv","v"].flatMap(t=>all.filter(e=>e.type===t && !e.rec && !taken.has(e.key)));
  const support=pool.slice(0,5); support.forEach(e=>taken.add(e.key));
  const extra=all.filter(e=>!taken.has(e.key));
  return {must, support, extra, core:[...must,...support]};
}

/* ======================= Prompt builders ======================= */
function learner(){
  const p=ST.profile||{};
  const base = "I'm a Persian speaker. My English is between intermediate and upper-intermediate (around B1+/B2). My main goal is to speak fluently and naturally at work and in daily life, and to stop translating from Persian in my head.";
  const rows=[["Role",p.role],["Company / product",p.org],["I work with",p.team],["Current projects",p.projects],["Situations where I need English",p.situations],["Typical problems at work",p.problems]].filter(r=>r[1]&&r[1].trim());
  if(!rows.length) return base+" I work in tech (software).";
  return base+"\n\nMY WORK PROFILE — use these real details in your questions and role-plays. If a role-play below mentions a job, product or company that doesn't match, adapt it to my real work:\n"+rows.map(r=>"- "+r[0]+": "+r[1].trim()).join("\n");
}
function focusLines(){ return (ST.focus||[]).filter(f=>FOCUS[f]).map(f=>"- "+FOCUS[f].gpt).join("\n"); }
function errLines(){ return (ST.err||[]).filter(e=>!e.done).slice(-6).map(e=>"- I said \""+e.wrong+"\" → correct: \""+e.right+"\"").join("\n"); }
function phraseLines(){ return (ST.phrases||[]).slice(-8).map(p=>"- "+p).join("\n"); }
const RULES = `RULES FOR YOU:
- Use American English.
- Keep your turns short (1–3 sentences). I should be talking at least 70% of the time.
- Ask one question at a time, then wait for me.
- If my answer is shorter than 3 sentences, push me: "Tell me more", "Why?", "Can you give me an example?"
- When I make a clear mistake (grammar, word choice, pronunciation, or an unnatural "Persian-style" phrase), correct it right away but briefly: say "Quick fix:" and the natural version, ask me to repeat it once, then continue. Max one correction per turn so the conversation keeps flowing.
- Always correct these typical Persian-speaker errors: mixing up he/she and his/her, missing or wrong articles (a/the), "discuss about", "explain me", "He said me", "informations/advices/feedbacks", "I'm agree", "since three years", make/do confusion, and statement word order in indirect questions.
- If I go silent for more than a few seconds, remind me to use a thinking-time phrase ("Well, let me think…", "How can I put it…") instead of silence.
- Speak at a natural, normal speed. Don't simplify your English too much.
- Never switch to Persian, even if I ask for a translation; explain in simple English instead.
- If I'm stuck for words, don't give me the answer immediately: first ask me to describe it another way.`;
const REPORT_LINES = `ERRORS:
- I said: "<my exact words>" | Correct: "<natural version>" | Type: <grammar|vocabulary|pronunciation|persian-style>`;
const REPORT_SESSION = `WHEN I TYPE "REPORT" (after the voice conversation ends), reply with ONLY this block in plain text — nothing before or after it:
=== SESSION REPORT ===
SCORES: fluency=<1-10>; accuracy=<1-10>; vocabulary=<1-10>; pronunciation=<1-10>
MUST-USED: <number>/5
${REPORT_LINES}
(3 to 6 ERRORS lines with my most important mistakes)
=== END ===`;
const REPORT_CHECK = quiz => `WHEN I TYPE "REPORT" (after the voice conversation ends), reply with ONLY this block in plain text — nothing before or after it:
=== CHECKPOINT REPORT ===
BANDS: fluency=<1-9>; lexical=<1-9>; grammar=<1-9>; pronunciation=<1-9>
CEFR: <B1|B1+|B2|B2+|C1>${quiz?"\nQUIZ: correct=<n>; almost=<n>; missed=<n>":""}
${REPORT_LINES}
(3 to 6 ERRORS lines with my most important mistakes)
=== END ===`;
const REPORT_TRANSCRIPT = `8) Finally, end your answer with this block in plain text, exactly in this format:
=== TRANSCRIPT REPORT ===
METRICS: wpm_avg=<number>; errors_per_min_avg=<number>; band_fluency=<1-9>
CEFR: <B1|B1+|B2|B2+|C1>
${REPORT_LINES}
(up to 8 ERRORS lines — the same mistakes as in your Error Log table)
=== END ===`;
const WRAP = `WHEN I SAY "FEEDBACK" (or after about 15 minutes), stop the conversation and give me:
1) My top 3 recurring mistakes, each with the correct version and a one-line rule.
2) 5 more natural phrases I could have used, based on what I said.
3) Which of the 5 MUST-USE items I used correctly, and which I didn't use at all.
4) Scores from 1 to 10 for fluency, accuracy, vocabulary range and pronunciation, with one sentence of reasoning each.
5) One sentence for me to practice saying 5 times.

${REPORT_SESSION}`;

function buildPrompt(s){
  const sp=split(s);
  const rev=[];
  dueSessions(s.n).forEach((d,j)=>{ rev.push(...pick(split(SESSIONS[d.m]).core,3,s.n+j).map(e=>e.it[0])); });
  hardList().slice(0,8).forEach(h=>rev.push(h.it[0]));
  const g7=contentBefore(s.n-7), fl=focusLines(), el=errLines(), pl=phraseLines();
  return `You are my personal English speaking coach. ${learner()}

This is Session ${s.n} of a 60-session speaking program. Today's topic: "${s.en}".

TODAY'S TARGET LANGUAGE:
- MUST-USE (make sure I use all 5 before the end; if I haven't used one, ask a question that forces it): ${sp.must.map(e=>e.it[0]).join(" | ")}
- Also try to bring in: ${sp.support.map(e=>e.it[0]).join(" | ")}
- Grammar focus: ${s.g.t}${g7>=1?`
- Grammar review from an earlier session — ask at least one question that makes me use: ${SESSIONS[g7].g.t}`:""}
${rev.length?`
REVIEW ITEMS FROM EARLIER SESSIONS (spaced repetition) — naturally work at least 5 of these into your questions so I have to use them:
${rev.join(", ")}
`:""}${pl?`
MY WORK PHRASE BANK — sentences I really say at work. Create 2–3 moments where I can use one of them naturally:
${pl}
`:""}${el?`
MY RECENT MISTAKES — if I repeat any of these, correct me firmly:
${el}
`:""}${fl?`
MY WEAKEST AREAS (from my assessment) — pay extra attention to:
${fl}
`:""}
HOW TO RUN TODAY'S SESSION (about 15 minutes):
1. Warm-up (2 min): short, friendly small talk connected to today's topic.
2. Questions (5 min): ask me these one at a time and follow up on each answer:
${s.qs.map(q=>"   - "+q).join("\n")}
3. Role-play (6–8 min): ${s.rp.scene} You play ${s.rp.role}. Stay in character, make it realistic, and add one unexpected complication I have to handle.
4. Finish with the feedback described below.

${RULES}

${WRAP}

Start now with the warm-up. Don't repeat these instructions back to me.`;
}

function reviewItems(n){
  const ph = SESSIONS[n].ph, from = SESSIONS[n].final ? 1 : (ph-1)*10+1;
  return ALL().filter(s=>!s.review && s.n>=from && s.n<n);
}
function buildReviewPrompt(n){
  const s=SESSIONS[n], c=CHECK[n];
  const items=[]; reviewItems(n).forEach((o,j)=>{ const sp=split(o); items.push(...pick(s.final?sp.must:sp.core, s.final?1:3, j).map(e=>e.it[0])); });
  hardList().slice(0,10).forEach(h=>items.push(h.it[0]));
  const topics = reviewItems(n).map(o=>o.en).join("; ");
  const fl=focusLines(), el=errLines();
  return `You are my English speaking coach and examiner. ${learner()}

This is Session ${n} of my 60-session program: a REVIEW and CHECKPOINT session${s.final?" — the FINAL one":""}. The sessions I'm reviewing covered: ${topics}.

Run this review in 4 parts (about 20 minutes in total):

PART 1 — ACTIVE RECALL QUIZ (6 min). Choose 15 items at random from the list below. For each one, give me a short situation, and I must respond using that item naturally within a few seconds. Say "correct", "almost" (and fix it) or "missed" (and show me a model sentence). Keep a count.
ITEMS: ${items.join(", ")}

PART 2 — MIXED QUESTIONS (5 min). Ask me open questions that mix the topics above. Push me to speak for at least 45 seconds per answer.

PART 3 — CHECKPOINT ROLE-PLAY (6 min). ${c.rp} You play the other person(s). Make it realistic and a little challenging.

PART 4 — REPORT. When I say "FEEDBACK", give me:
1) My quiz score (correct / almost / missed out of 15) and the items I missed.
2) Scores from 1 to 9 (IELTS-style bands) for Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation, with one reason each.
3) An honest CEFR estimate (B1, B1+, B2, B2+, C1) for today's performance.
4) My 5 most frequent error patterns, with examples from what I said and corrections.
5) Which of the typical Persian-speaker errors listed in the rules I still made today, with examples.
6) The two areas I should focus on most in the next 10 sessions.
${el?`
MY RECENT MISTAKES — check whether I still make them:
${el}
`:""}${fl?`
MY WEAKEST AREAS:
${fl}
`:""}
${RULES.replace("RULES FOR YOU:","RULES FOR YOU (in parts 1–3):")}

${REPORT_CHECK(true)}

Start now with Part 1.`;
}
function assessTranscriptPrompt(){ return `You are an experienced IELTS Speaking examiner and English speaking coach. ${learner()}

Below are automatic transcripts of my speaking. Ignore punctuation and capitalization — they come from speech-to-text, which may also have removed filler words like "um", so don't count fillers.
- TASK A: a 2-minute monologue: "Describe your job, a project you're working on and a challenge you're facing." (the same question every checkpoint)
- TASK A2: a 2-minute monologue on a new question (written before the transcript).
- TASK B: a 90-second answer to an unexpected question (written before the transcript).

Please analyze them and give me:
1) For each task: total words, words per minute (A and A2 = 2 minutes, B = 1.5 minutes), and the number of grammar and word-choice errors per minute. Then the average WPM and errors per minute across all three.
2) Band scores from 1 to 9 for Fluency & Coherence, Lexical Resource, and Grammatical Range & Accuracy, with reasons. (You can't judge pronunciation from text — skip it.)
3) An honest CEFR estimate (B1, B1+, B2, B2+, C1), with reasoning.
4) My 5 most frequent error patterns, with examples from my text. Check especially for typical Persian-speaker errors: he/she mix-ups, missing articles, "discuss about", "explain me", "He said me", uncountable nouns with -s, "since three years", make/do, and indirect-question word order.
5) My 3 biggest weaknesses in order of priority, choosing from: fluency, grammatical accuracy, vocabulary range, pronunciation, listening, confidence.
6) An "Error Log" table with three columns: What I said | Natural version | Rule / reason. Include up to 12 rows.
7) 10 more natural or advanced ways to say things I said.
${REPORT_TRANSCRIPT}
Be honest and specific, not just encouraging.

TASK A transcript:
[paste here]

TASK A2 question: [write the question]
TASK A2 transcript:
[paste here]

TASK B question: [write the question]
TASK B transcript:
[paste here]`; }
function assessVoicePrompt(){ return `You are an experienced IELTS Speaking examiner. ${learner()}

Run a realistic 3-part speaking test with me in voice mode, about 12 minutes in total. Use American English. Do NOT correct me or give feedback during the test — act like a real examiner.
- Part 1 (4 min): short questions about my work, my home town, my daily routine and technology.
- Part 2 (4 min): give me a topic card (e.g. "Describe a problem you solved at work"), say "You have one minute to prepare", wait until I say "ready", then let me speak for up to 2 minutes without interrupting.
- Part 3 (4 min): a deeper discussion connected to the Part 2 topic, with abstract "why" and "what if" questions.

When I say "RESULTS", give me:
1) Band scores from 1 to 9 for Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation, with specific evidence from what I said.
2) An honest CEFR estimate.
3) Specific pronunciation problems you noticed (sounds, word stress, intonation), with example words.
4) How often I paused, hesitated or used filler words, the longest stretch I managed without a long pause, and whether I seemed to be translating in my head.
5) Which typical Persian-speaker errors I made (he/she, articles, prepositions, uncountable nouns, make/do, word order).
6) My top 3 priorities for the next 60 sessions.

${REPORT_CHECK(false)}

Start with Part 1 now.`; }

/* ======================= ChatGPT round-trip ======================= */
function gptBlock(text){
  const enc=encodeURIComponent(text), direct=enc.length<=12000;
  return `<div class="prompt"><div class="row"><a class="btn pri" href="${direct?"https://chatgpt.com/?q="+enc:"https://chatgpt.com/"}" target="_blank" rel="noopener" data-gptopen>باز کردن در ChatGPT</a><button class="btn copy" type="button" data-copy>کپی پرامپت</button></div><p class="small muted">${direct?"پرامپت در یک چت جدید خودکار فرستاده می‌شود و در حافظهٔ گوشی هم کپی می‌شود. اگر اپ ChatGPT باز شد و پرامپت را نشان نداد، فقط Paste کن و بفرست.":"پرامپت امروز برای لینک مستقیم بلند است: با زدن دکمه کپی می‌شود و ChatGPT باز می‌شود؛ فقط Paste کن و بفرست."}</p><details class="howd"><summary>دیدن متن پرامپت</summary><pre>${esc(text)}</pre></details></div>`;
}
const REPORT_KEY = (kind,n) => (kind==="session"||kind==="review") ? String(n) : (kind==="transcript" ? "t"+n : "v"+n);
function parseReport(t){
  t=String(t||"").replace(/[“”„″]/g,'"').replace(/[‘’]/g,"'").replace(/\*\*|`/g,"");
  const line=label=>{ const m=t.match(new RegExp("^[\\s>*-]*"+label+"\\s*:(.*)$","im")); return m?m[1]:null; };
  const kv=x=>{ if(!x) return null; const o={}; x.split(/[;,]/).forEach(p=>{ const m=p.match(/([a-z_]+)\s*[=:]\s*(\d+(?:\.\d+)?)/i); if(m) o[m[1].toLowerCase()]=+m[2]; }); return Object.keys(o).length?o:null; };
  const r={scores:kv(line("SCORES")), bands:kv(line("BANDS")), errors:[]};
  const met=kv(line("METRICS")); if(met){ r.wpm=met.wpm_avg!=null?met.wpm_avg:met.wpm; r.epm=met.errors_per_min_avg!=null?met.errors_per_min_avg:met.errors_per_min; r.bandF=met.band_fluency; }
  const mu=t.match(/MUST-USED\s*:\s*(\d)\s*\/\s*5/i); if(mu) r.must=+mu[1];
  const ce=t.match(/^[\s>*-]*CEFR\s*:\s*([ABC][12]\+?)/im); if(ce) r.cefr=ce[1].toUpperCase();
  const qz=kv(line("QUIZ")); if(qz) r.quiz={correct:qz.correct||0, almost:qz.almost||0, missed:qz.missed||0};
  const re=/I said:\s*"([^"]+)"\s*\|\s*Correct:\s*"([^"]+)"(?:\s*\|\s*Type:\s*([A-Za-z\- ]+))?/gi; let m;
  while((m=re.exec(t))) r.errors.push({wrong:m[1].trim(), right:m[2].trim(), type:(m[3]||"").toLowerCase()});
  return r;
}
function saveReport(kind, n, text){
  const r=parseReport(text);
  if(!(r.scores||r.bands||r.wpm!=null||r.must!=null||r.cefr||r.errors.length)) return {ok:false};
  const rec={ts:Date.now()};
  ["scores","must","bands","cefr","quiz","wpm","epm"].forEach(k=>{ if(r[k]!=null) rec[k]=r[k]; });
  if(kind!=="session"){
    const m=ST.metrics[n]=ST.metrics[n]||{};
    if(r.wpm!=null) m.wpm=r.wpm; if(r.epm!=null) m.err=r.epm;
    const bf=(r.bands&&r.bands.fluency!=null)?r.bands.fluency:r.bandF;
    if(bf!=null && (kind!=="transcript" || m.band==null)) m.band=bf;
  }
  const tmap=t=>/gram/.test(t)?"g":/pron/.test(t)?"p":/persian/.test(t)?"f":"v";
  const have=new Set((ST.err||[]).map(e=>e.wrong.toLowerCase())); let added=0;
  r.errors.forEach(e=>{ const k=e.wrong.toLowerCase(); if(have.has(k)) return; ST.err.push({s:n, wrong:e.wrong, right:e.right, type:tmap(e.type), done:false}); have.add(k); added++; });
  rec.nerr=added;
  ST.reports[REPORT_KEY(kind,n)]=rec; save();
  return {ok:true, rec};
}
const dash = v => v==null ? "-" : fa(v);
function reportSummary(r){
  if(!r) return "";
  const p=[];
  if(r.scores) p.push(`روانی ${dash(r.scores.fluency)} · دقت ${dash(r.scores.accuracy)} · واژگان ${dash(r.scores.vocabulary)} · تلفظ ${dash(r.scores.pronunciation)}`);
  if(r.must!=null) p.push(`موارد اصلی ${fa(r.must)} از ۵`);
  if(r.bands) p.push(`Band روانی ${dash(r.bands.fluency)} · واژگان ${dash(r.bands.lexical)} · گرامر ${dash(r.bands.grammar)} · تلفظ ${dash(r.bands.pronunciation)}`);
  if(r.cefr) p.push(`CEFR ${r.cefr}`);
  if(r.quiz) p.push(`Quiz: ${fa(r.quiz.correct)} درست، ${fa(r.quiz.almost)} تقریباً، ${fa(r.quiz.missed)} غلط`);
  if(r.wpm!=null) p.push(`WPM ${fa(r.wpm)}`); if(r.epm!=null) p.push(`خطا در دقیقه ${fa(r.epm)}`);
  if(r.nerr) p.push(`${fa(r.nerr)} اشتباه به دفتر خطا اضافه شد`);
  return `<div class="small ok">ثبت‌شده: ${p.join(" · ")}</div>`;
}
function reportBox(kind, n){
  const how={
    session:`بعد از تمام شدن گفتگو، Voice را ببند و در همان چت تایپ کن <span class="en">REPORT</span>. جواب را کامل کپی کن و اینجا Paste کن: نمره‌ها در «پیشرفت» جمع می‌شوند و اشتباه‌ها به دفتر خطا می‌روند.`,
    review:`بعد از گفتگو، Voice را ببند و تایپ کن <span class="en">REPORT</span>. جواب را اینجا Paste کن: Band روانی در جدول پیشرفت، CEFR و نتیجهٔ Quiz ثبت می‌شوند و اشتباه‌ها به دفتر خطا می‌روند.`,
    transcript:`جواب کامل ChatGPT را اینجا Paste کن: WPM میانگین، خطا در دقیقه و Band روانی در جدول پیشرفت ثبت می‌شوند و Error Log به دفتر خطا می‌رود.`,
    voice:`بعد از آزمون، Voice را ببند و تایپ کن <span class="en">REPORT</span>. جواب را اینجا Paste کن: Band روانی خط پایه و CEFR ثبت می‌شوند.`
  }[kind];
  const tag={session:"SESSION",review:"CHECKPOINT",transcript:"TRANSCRIPT",voice:"CHECKPOINT"}[kind];
  return `<div class="report" data-report="${kind}" data-n="${n}"><div class="sub">برگرداندن گزارش ChatGPT به برنامه</div><p class="small">${how}</p><textarea class="en" data-reporttext placeholder="=== ${tag} REPORT === …"></textarea><div class="row"><button class="btn pri" type="button" data-reportsave>ثبت گزارش</button><span class="small" data-reportmsg></span></div><div data-reportsum>${reportSummary(ST.reports[REPORT_KEY(kind,n)])}</div></div>`;
}
function scoresSection(){
  const rep=ST.reports||{};
  const nums=Object.keys(rep).filter(k=>/^\d+$/.test(k)).map(Number).sort((a,b)=>a-b);
  const sess=nums.filter(n=>rep[n].scores), chk=nums.filter(n=>rep[n].bands||rep[n].cefr);
  if(!sess.length && !chk.length && !rep.v0) return `<h2>نمره‌های جلسه‌ها</h2><p class="small muted">بعد از هر گفتگو با ChatGPT، جواب REPORT را در بخش ۸ همان جلسه Paste کن تا نمره‌ها اینجا جمع شوند.</p>`;
  const L=["fluency","accuracy","vocabulary","pronunciation"], N=["روانی","دقت","واژگان","تلفظ"];
  const avg=(arr,k)=>{ const v=arr.map(n=>rep[n].scores[k]).filter(x=>x!=null); return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:null; };
  const trend = sess.length>=6 ? `<p class="small">میانگین ۵ جلسهٔ اول ← ۵ جلسهٔ آخر: ${L.map((k,i)=>`${N[i]} ${dash(avg(sess.slice(0,5),k))} ← <b>${dash(avg(sess.slice(-5),k))}</b>`).join(" · ")}</p>` : "";
  const cps=[...(rep.v0?[`خط پایه: CEFR ${rep.v0.cefr||"-"} · Band روانی ${dash(rep.v0.bands&&rep.v0.bands.fluency)}`]:[]), ...chk.map(n=>`جلسهٔ ${fa(n)}: CEFR ${rep[n].cefr||"-"} · Band روانی ${dash(rep[n].bands&&rep[n].bands.fluency)}`)];
  const table = sess.length ? `<div class="tbl"><table><thead><tr><th>جلسه</th>${N.map(x=>`<th>${x}</th>`).join("")}<th>موارد اصلی</th></tr></thead><tbody>${sess.slice().reverse().map(n=>`<tr><td class="kpi">${fa(n)}</td>${L.map(k=>`<td class="kpi">${dash(rep[n].scores[k])}</td>`).join("")}<td class="kpi">${rep[n].must!=null?fa(rep[n].must)+" از ۵":"-"}</td></tr>`).join("")}</tbody></table></div>` : "";
  return `<h2>نمره‌های جلسه‌ها (از گزارش ChatGPT)</h2>${trend}${cps.length?`<p class="small">${cps.join(" | ")}</p>`:""}${table}`;
}

/* ======================= Rendering: shell ======================= */
const TABS=[["today","امروز"],["list","جلسه‌ها"],["errors","دفتر من"],["more","بیشتر"]];
let LASTN=1, CURN=null;
function stepsDone(){ return (ST.steps&&ST.steps[CURN])||[]; }
function route(keep){
  if(REC.active) REC.stop();
  if(TTS.ok) try{ speechSynthesis.cancel(); }catch(e){}
  const h=(location.hash||"").replace("#","");
  let view="today", n=null;
  if(/^s\d+$/.test(h)){ view="s"; n=Math.min(60,Math.max(1,parseInt(h.slice(1)))); }
  else if(["guide","assess","errors","progress","list","more"].includes(h)) view=h;
  if(view==="today") n=nextSession();
  CURN = n!=null ? n : (view==="assess" ? "a" : null);
  const on = view==="s" ? (n===nextSession()?"today":"list") : (["guide","assess","progress"].includes(view)?"more":view);
  $("#tabs").innerHTML = TABS.map(([k,l])=>`<a href="#${k}" class="${on===k?"on":""}">${l}</a>`).join("");
  const app=$("#app");
  if(view==="guide") app.innerHTML=renderGuide();
  else if(view==="assess") app.innerHTML=renderAssess();
  else if(view==="errors") app.innerHTML=renderErrors();
  else if(view==="progress") app.innerHTML=renderProgress();
  else if(view==="list") app.innerHTML=renderList();
  else if(view==="more") app.innerHTML=renderMore();
  else app.innerHTML=renderSessionShell(n);
  if(n!=null) LASTN=n;
  bind(view,n);
  tidy();
  REC.mountAll();
  const opened=openStep();
  if(keep && opened) opened.scrollIntoView({block:"start"});
  else if(!keep) window.scrollTo(0,0);
}
function sideList(cur){
  let h="";
  for(let p=1;p<=6;p++){
    h+=`<div class="ph-group"><h4>فاز ${fa(p)} · ${esc(PHASES[p].t)}</h4>`;
    for(let i=(p-1)*10+1;i<=p*10;i++){ const s=SESSIONS[i];
      h+=`<a href="#s${i}" class="${i===cur?"cur":""} ${s.review?"rv":""}"><span class="num">${fa(i)}</span><span>${esc(s.t)}</span><span class="tick">${ST.done[i]?"✓":""}</span></a>`; }
    h+=`</div>`;
  }
  return h;
}
function renderList(){
  const nx=nextSession();
  return `<div class="biglist" style="margin-top:16px"><p class="small muted">${fa(Object.keys(ST.done).filter(k=>ST.done[k]).length)} از ۶۰ جلسه انجام شده · جلسهٔ امروز: <a href="#today">${fa(nx)}</a></p>${sideList(nx)}</div>`;
}
function renderMore(){
  const card=(href,t,d)=>`<a class="card morecard" href="${href}"><b>${t}</b><span class="small muted">${d}</span></a>`;
  return `<div class="morelist" style="margin-top:16px"><div class="card"><b>نصب روی گوشی</b>${installHelp()}</div>
  ${card("#assess","ارزیابی اولیه","یک بار قبل از جلسهٔ ۱ — تعیین سطح و ضعف‌ها")}
  ${card("#errors","دفتر من","پروفایل کاری، بانک جمله‌ها، دفتر خطا و لیست سخت‌ها")}
  ${card("#progress","پیشرفت با عدد","ثبت عددهای ارزیابی‌ها و پشتیبان‌گیری")}
  ${card("#guide","راهنمای برنامه","ساختار، قوانین، تله‌های فارسی‌زبان‌ها و منابع")}</div>`;
}
function profileEmpty(){ const p=ST.profile||{}; return !["role","org","projects"].some(k=>p[k]&&p[k].trim()); }
function renderSessionShell(n){
  const s=SESSIONS[n], total=s.review?5:10, d=stepsDone().length;
  const notAssessed = n===1 && !(ST.metrics&&ST.metrics[0]&&ST.metrics[0].wpm);
  return `<div class="layout"><aside class="list" aria-label="فهرست جلسه‌ها">${sideList(n)}</aside><main>
  <div class="today-bar"><span>جلسهٔ ${fa(n)} از ۶۰${ST.done[n]?" · انجام شده ✓":""}</span><span>${fa(d)} از ${fa(total)} بخش</span></div>
  <div class="progress-bar thin" aria-hidden="true"><i style="width:${Math.round(d/total*100)}%"></i></div>
  ${notAssessed?`<p class="small" style="margin:10px 0 0"><a href="#assess">قبل از شروع: ارزیابی اولیه (فقط یک بار) ←</a></p>`:""}
  ${profileEmpty()?`<p class="small" style="margin:6px 0 0"><a href="#errors">پروفایل کاری‌ات را پر کن تا گفتگوها دربارهٔ کار واقعی خودت باشد (۲ دقیقه) ←</a></p>`:""}
  ${bannerBlock()}
  ${s.review?renderReview(s):renderSession(s)}${navRow(n)}</main></div>`;
}
function navRow(n){
  return `<div class="navrow">${n>1?`<a class="btn" href="#s${n-1}">→ جلسهٔ ${fa(n-1)}</a>`:"<span></span>"}${n<60?`<a class="btn" href="#s${n+1}">جلسهٔ ${fa(n+1)} ←</a>`:""}</div>`;
}
function step(num, title, time, body, cls=""){
  const done=stepsDone().includes(num);
  return `<details class="step ${cls} ${done?"isdone":""}" data-step="${num}"><summary class="sh"><span class="n">${done?"✓":fa(num)}</span><h2>${title}</h2>${time?`<span class="t">${time}</span>`:""}</summary><div class="sb">${body}<button class="btn pri stepbtn" data-stepdone="${num}">${done?"بخش بعدی ←":"انجام شد، برو بعدی ←"}</button></div></details>`;
}
function openStep(){
  const all=[...document.querySelectorAll("details.step")]; if(!all.length) return null;
  const t=all.find(d=>!d.classList.contains("isdone")); if(t) t.open=true; return t||null;
}
function tidy(){
  document.querySelectorAll(".sb .how").forEach(h=>{ const d=document.createElement("details"); d.className="howd"; d.innerHTML="<summary>روش انجام</summary>"; h.replaceWith(d); d.appendChild(h); });
  document.querySelectorAll(".focusbox").forEach(f=>{ const d=document.createElement("details"); d.className="howd"; d.innerHTML="<summary>تمرین اضافهٔ مخصوص تو</summary>"; f.replaceWith(d); d.appendChild(f); });
  document.querySelectorAll(".srs-src").forEach(s=>{ const r=document.createElement("div"); r.className="reveal"; r.hidden=true; s.appendChild(r); });
}
function itemList(arr){
  return `<div class="items">${arr.map(e=>{ const x=e.it, k=e.key; return `<div class="item"><button class="star ${ST.hard[k]?"on":""}" data-star="${k}" title="سخت است / بلد نیستم — به لیست مرور اضافه شود" aria-label="علامت سخت">★</button><div><div class="top"><span class="w">${esc(x[0])}</span>${TTS.btn(x[0])}<span class="fa">${esc(x[1])}</span></div><div class="ex">${TTS.btn(x[2])}${esc(x[2])}</div><div class="tags"><span class="tag">${TYPE_L[e.type]}</span>${e.rec?`<span class="tag rec">مرور از جلسهٔ ${fa(e.rec)}</span>`:""}</div></div></div>`; }).join("")}</div>`;
}
const chipHtml = e => `<button class="chip ${ST.hard[e.key]?"on":""}" data-star="${e.key}" title="${esc(e.it[1])} — ${esc(e.it[2])}">${esc(e.it[0])}</button>`;
function srsBlock(n){
  const due=dueSessions(n); const hard=hardList(); const errs=(ST.err||[]).filter(e=>!e.done).slice(-5);
  const g7=contentBefore(n-7), p4=contentBefore(n-4);
  if(!due.length && !hard.length && !errs.length) return `<p>این اولین جلسهٔ آموزشی است؛ چیزی برای مرور نداری. به جایش نتیجهٔ ارزیابی اولیه‌ات و ۳ ضعف اصلی‌ات را مرور کن و یک بار دیگر ضبط Task A را گوش بده.</p>`;
  let h=`<div class="how"><b>روش:</b> روی هر مورد بزن تا معنی و مثالش بیاید. قبل از نگاه کردن، در کمتر از ۵ ثانیه یک جملهٔ <b>واقعی دربارهٔ زندگی یا کار خودت</b> بلند بگو. بعد «بلد بودم» یا «سخت بود» را بزن؛ موارد سخت در جلسه‌های بعد و پرامپت ChatGPT تکرار می‌شوند.</div><div class="srs-block">`;
  due.forEach(d=>{ const o=SESSIONS[d.m];
    h+=`<div class="srs-src"><div class="lbl">از جلسهٔ ${fa(d.m)} (${fa(d.k)} جلسه پیش) — ${esc(o.t)}</div><div class="chips">${split(o).core.map(chipHtml).join("")}</div></div>`; });
  if(g7>=1){ const g=SESSIONS[g7].g; h+=`<div class="srs-src"><div class="lbl">مرور گرامر (جلسهٔ ${fa(g7)}): <span class="en">${esc(g.t)}</span></div><div class="small">۳ جملهٔ سریع دربارهٔ امروزت با همین ساختار بگو. نمونه: <span class="en">${esc(g.ex[0])}</span></div></div>`; }
  if(p4>=1){ const pr=SESSIONS[p4].pr; h+=`<div class="srs-src"><div class="lbl">مرور تلفظ (جلسهٔ ${fa(p4)}): <span class="en">${esc(pr.t)}</span> — هر کدام را ۳ بار بلند بگو</div><div class="pron">${pr.items.slice(0,5).map(pronHtml).join("")}</div></div>`; }
  if(hard.length) h+=`<div class="srs-src" style="border-color:var(--amber)"><div class="lbl">لیست سخت‌ها (${fa(hard.length)} مورد)</div><div class="chips">${hard.slice(0,14).map(x=>`<button class="chip on" data-star="${x.k}" title="${esc(x.it[1])} — ${esc(x.it[2])}">${esc(x.it[0])}</button>`).join("")}</div></div>`;
  if(errs.length) h+=`<div class="srs-src" style="border-color:var(--rec)"><div class="lbl">آخرین اشتباه‌های دفتر خطا — هر کدام را درست، ۳ بار بلند بگو</div>${errs.map(e=>`<div class="small"><span class="en" style="text-decoration:line-through;opacity:.6">${esc(e.wrong)}</span> ← <span class="en"><b>${esc(e.right)}</b></span></div>`).join("")}</div>`;
  return h+`</div>`;
}
function focusBlock(){
  const f=(ST.focus||[]).filter(x=>FOCUS[x]); if(!f.length) return "";
  return `<div class="focusbox"><h4>تمرین اضافه برای ضعف‌های تو (از ارزیابی اولیه)</h4>${f.map(x=>`<div class="small"><b>${esc(FOCUS[x].t)}:</b> ${esc(FOCUS[x].extra)}</div>`).join("")}</div>`;
}
const repeatOf = n => (n>=8 && n%2===0) ? contentBefore(n-7) : 0;
function coldBlock(s){
  const n=s.n, m=repeatOf(n);
  let h=`<p><b>قبل از هر یادگیری، همین الان و بدون آماده‌سازی</b> چالش امروز را ۶۰ ثانیه انجام بده و با دکمهٔ زیر ضبط کن (ضبط «قبل»). خراب شدنش طبیعی است؛ قرار است جاهای خالی‌ات را خودت ببینی. آخر جلسه همین را دوباره ضبط می‌کنی.</p><div class="drill"><b>چالش امروز:</b> ${esc(s.ch)}</div>${recBox("s"+n+":before","ضبط «قبل»",90)}`;
  if(m>=1) h+=`<div class="drill"><b>تکرار یک کار قدیمی (۶۰ ثانیه):</b> چالش جلسهٔ ${fa(m)} («${esc(SESSIONS[m].t)}») را دوباره ضبط کن و با ضبط همان روز مقایسه کن: روان‌تر شد؟ مکث‌ها کمتر شد؟ تکرار همان کار یکی از مؤثرترین روش‌های روان شدن است.<div class="small muted" style="margin-top:4px">${esc(SESSIONS[m].ch)}</div>${recBox("s"+m+":after","ضبط جلسهٔ "+fa(m),0,'data-readonly="1"')}${recBox("s"+n+":repeat","ضبط تکرار",90,'data-compare="s'+m+':after" data-compare-label="جلسهٔ '+fa(m)+'"')}</div>`;
  if(n<=20) h+=`<div class="kit"><div class="sub">جعبه‌ابزار روانی — به جای سکوت این‌ها را بگو</div><div class="small muted">برای فکر کردن:</div><div class="pron">${KIT.think.map(t=>`<span class="pitem">${esc(t)}${TTS.btn(t)}</span>`).join("")}</div><div class="small muted">وقتی گوش می‌دهی (نشان بده دنبال می‌کنی):</div><div class="pron">${KIT.back.map(t=>`<span class="pitem">${esc(t)}${TTS.btn(t)}</span>`).join("")}</div></div>`;
  return h;
}
const SHADOW_HOW = `<div class="how"><b>روش Shadowing (تاک تک‌نفره):</b><ol><li>فقط بازهٔ تعیین‌شده را یک بار بدون متن گوش کن و موضوع را در یک جمله بلند بگو. دیدن کامل ویدیو اختیاری است و خارج از وقت جلسه.</li><li>با متن (Transcript) گوش کن؛ عبارات ناآشنا را یادداشت کن.</li><li>۶۰ ثانیهٔ اول را جمله‌به‌جمله: Pause کن و ۲–۳ بار با همان لحن و ریتم تکرار کن.</li><li>Shadowing هم‌زمان: ۵ بار همراه گوینده (با فاصلهٔ نیم‌ثانیه) بگو؛ ریتم، تکیه و لحن مهم‌تر از تک‌تک کلمه‌هاست.</li><li>بار آخر را ضبط کن و با اصل مقایسه کن.</li></ol>اگر ted.com باز نشد، نام تاک را در YouTube جستجو کن.</div>`;
const SHADOW_DIALOG_HOW = `<div class="how"><b>روش Shadowing دیالوگ (نقش‌گیری):</b><ol><li>یک بار بدون زیرنویس گوش کن و بگو چه اتفاقی افتاد.</li><li>با زیرنویس انگلیسی (CC) دوباره ببین؛ عبارات کاری را یادداشت کن. متن کامل: زیر ویدیو «…more» ← «Show transcript».</li><li>یک شخصیت را انتخاب کن. هر بار قبل از جملهٔ او Pause کن و جمله‌اش را خودت با همان لحن بگو (۳ بار).</li><li>دوباره پخش کن و هم‌زمان با همان شخصیت حرف بزن (۳ بار).</li><li>بار آخر با صدای ویدیو کم، نقش او را جواب بده و ضبط کن. این تمرین مستقیماً برای مکالمهٔ واقعی است، نه سخنرانی.</li></ol></div>`;
const isHumanWeek = n => n>=21 && (n-21)%5===0;
function humanBlock(s){
  return `<div class="humanbox"><h4>گفتگوی انسانی این هفته (۱۵–۲۰ دقیقه)</h4><div class="small">این هفته یک بار با یک آدم واقعی انگلیسی حرف بزن: یک همکار، دوستی که انگلیسی یاد می‌گیرد، یا یک هم‌زبان‌آموز (اپ‌هایی مثل Tandem یا HelloTalk). از Role-play همین جلسه استفاده کنید. آدم‌ها برخلاف ChatGPT وسط حرف می‌پرند، نامفهوم حرف می‌زنند و استرس واقعی می‌سازند — دقیقاً همان جایی که معمولاً یخ می‌زنی. بعدش ۲ جایی که گیر کردی را در دفتر خطا بنویس.</div><div class="en small" style="margin-top:6px"><b>Role-play:</b> ${esc(s.rp.scene)}</div></div>`;
}

function renderSession(s){
  const n=s.n, ph=PHASES[s.ph], sp=split(s);
  const head=`<div class="s-head"><div class="kick"><span class="pill acc">فاز ${fa(s.ph)} · ${esc(ph.t)}</span></div>
  <h1>${esc(s.t)}</h1><div class="ent en">${esc(s.en)}</div><div class="goal"><b>هدف جلسه:</b> ${esc(s.goal)}</div>${focusBlock()}</div>`;
  const rep=repeatOf(n);
  const s1=step(1,"شروع سرد: اول حرف بزن",rep?"۴ دقیقه":"۳ دقیقه",coldBlock(s),"challenge");
  const s2=step(2,"مرور فاصله‌دار","۷ دقیقه",srsBlock(n));
  const s3=step(3,"ورودی جدید: ۵ مورد اصلی + ۵ پشتیبان","۸ دقیقه",
    rateBar()+`<div class="how"><b>روش:</b> هر مورد و مثالش را <b>بلند</b> بخوان، بعد یک جملهٔ جدید دربارهٔ زندگی یا کار خودت بساز و بلند بگو. ننویس. ۵ مورد اصلی باید امروز در گفتگو با ChatGPT به کار بروند (پرامپت مجبورت می‌کند). موارد اضافه اختیاری‌اند. هر موردی که جمله‌سازی با آن سخت بود را ★ بزن.</div>
    <div class="sub">۵ مورد اصلی امروز — حتماً در گفتگو استفاده کن</div>${itemList(sp.must)}
    <div class="sub">۵ مورد پشتیبان</div>${itemList(sp.support)}
    ${sp.extra.length?`<details class="howd"><summary>موارد اضافه (اختیاری · ${fa(sp.extra.length)} مورد)</summary>${itemList(sp.extra)}</details>`:""}`);
  const s4=step(4,`گرامر گفتاری: <span class="en">${esc(s.g.t)}</span>`,"۶ دقیقه",
    `<p>${esc(s.g.fa)}</p><ul class="gram-ex">${s.g.ex.map(e=>`<li>${TTS.btn(e)}${esc(e)}</li>`).join("")}</ul><div class="drill"><b>Drill شفاهی:</b> ${esc(s.g.drill)}</div>`);
  const isTed = s.li.u.includes("ted.com/talks/");
  const s5=step(5,s.li.dialog?"شنیدن و Shadowing دیالوگ":"شنیدن و Shadowing","۸ دقیقه",
    `<p><b>امروز:</b> <a href="${esc(s.li.u)}" target="_blank" rel="noopener"><span class="en">${esc(s.li.t)}</span></a>${isTed?` · <a href="${esc(s.li.u)}/transcript" target="_blank" rel="noopener">متن کامل (Transcript)</a>`:""}</p><p><b>بازه:</b> ${esc(s.li.seg)}</p><p>${esc(s.li.task)}</p>${s.li.dialog?SHADOW_DIALOG_HOW:SHADOW_HOW}`);
  const s6=step(6,`تلفظ و گفتار پیوسته: <span class="en">${esc(s.pr.t)}</span>`,"۴ دقیقه",
    rateBar()+`<p>${esc(s.pr.fa)}</p><div class="pron">${s.pr.items.map(pronHtml).join("")}</div><div class="how">🔊 را بزن تا تلفظ آمریکایی را بشنوی (بدون اینترنت هم کار می‌کند). برای شنیدن از زبان آدم‌های واقعی، موارد لینک‌دار را در YouGlish باز کن. هر مورد را ۵ بار بلند بگو، سپس یک جمله با آن بساز. حروف بزرگ = هجای تکیه‌دار؛ ↗ / ↘ = لحن بالارونده / پایین‌رونده. مدل تلفظ این برنامه انگلیسی آمریکایی است.</div>`);
  const s7=step(7,"تمرین روانی (Fluency Drill)","۵ دقیقه",`<p>${esc(s.fl)}</p><div class="how">قانون تمرین روانی: <b>نایست، برنگرد، ترجمه نکن.</b> اگر کلمه‌ای یادت نیامد، دورش بزن (It's a kind of…) یا از جعبه‌ابزار روانی استفاده کن (Well, let me think…) و ادامه بده. درستی در این بخش مهم نیست؛ سرعت و پیوستگی مهم است.</div>`);
  const s8=step(8,"صحبت با ChatGPT Voice","۱۵ دقیقه",
    `<ol class="small mini-steps"><li>«باز کردن در <span class="en">ChatGPT</span>» را بزن.</li><li>دکمهٔ <span class="en">Voice</span> را بزن و حدود ۱۵ دقیقه حرف بزن.</li><li>آخر کار بگو <span class="en">"FEEDBACK"</span>.</li><li><span class="en">Voice</span> را ببند، تایپ کن <span class="en">REPORT</span> و جواب را در کادر پایین <span class="en">Paste</span> کن.</li></ol><div class="how">پرامپت خودکار ساخته شده: ۵ مورد اصلی و ۵ پشتیبان امروز، مرور جلسه‌های قبل و گرامر ۷ جلسه پیش، پروفایل کاری و بانک جمله‌هایت، لیست سخت‌ها، اشتباه‌های دفتر خطا، تله‌های فارسی‌زبان‌ها و ضعف‌هایت.</div>
    ${gptBlock(buildPrompt(s))}${reportBox("session",n)}`,"gpt");
  const s9=step(9,"چالش پایانی (ضبط «بعد»)","۵ دقیقه",
    `<p>${esc(s.ch)}</p>${recBox("s"+n+":after","ضبط «بعد»",n===59?330:200,'data-compare="s'+n+':before" data-compare-label="قبل"')}${recBox("s"+n+":before","ضبط «قبل»",0,'data-readonly="1"')}<div class="how">با دکمهٔ ضبط، چالش را ضبط کن. برنامه مکث‌ها و طولانی‌ترین تکه را خودکار با ضبط «قبل» مقایسه می‌کند. هر دو را پشت سر هم گوش کن و ۲ تفاوت مشخص پیدا کن. اگر معیار را نگرفتی، فردا قبل از جلسهٔ بعد <b>فقط همین چالش</b> را دوباره انجام بده (حداکثر یک تکرار؛ بعد جلو برو).</div>
    <label class="check-line"><input type="checkbox" id="passed" ${ST.passed[n]?"checked":""}> معیار قبولی چالش را گرفتم</label>`,"challenge");
  const s10=step(10,"بستن جلسه: دفتر خطا، بانک جمله‌ها، کار واقعی","۲ دقیقه",
    `${isHumanWeek(n)?humanBlock(s):""}<p><b>دفتر خطا:</b> ۳ اشتباه امروز (از بازخورد ChatGPT یا ضبط چالش) را در <a href="#errors">دفتر من</a> وارد کن.</p><p><b>بانک جمله‌ها:</b> اگر امروز جمله‌ای ساختی که واقعاً سر کار می‌گویی، به بانک جمله‌ها اضافه کن.</p><p><b>کار واقعی امروز:</b> ${esc(s.work)}</p>
    <label class="check-line"><input type="checkbox" id="done" ${ST.done[n]?"checked":""}> این جلسه را کامل انجام دادم</label>`);
  return head+`<div class="steps">${s1}${s2}${s3}${s4}${s5}${s6}${s7}${s8}${s9}${s10}</div>`;
}

/* ======================= Review sessions ======================= */
function benchmarkTests(n){
  const c=CHECK[n]||CHECK[0];
  return `<ol>
  <li><b>Task A — تک‌گویی ثابت (۲ دقیقه):</b> <span class="en">"Describe your job, a project you're working on and a challenge you're facing."</span> ضبط کن. همان سؤال همهٔ ارزیابی‌ها برای مقایسه — بین ارزیابی‌ها جوابش را تمرین و حفظ نکن.${recBox("cp"+n+":A","ضبط Task A",125,'data-cp="'+n+'"')}</li>
  <li><b>Task A2 — تک‌گویی تازه (۲ دقیقه):</b> <span class="en">"${esc(c.a2)}"</span> ضبط کن. این سؤال هر بار عوض می‌شود تا عددها با جواب حفظ‌شده بالا نروند.${recBox("cp"+n+":A2","ضبط Task A2",125)}</li>
  <li><b>Task B — سؤال غیرمنتظره (۹۰ ثانیه، ۱۰ ثانیه فکر):</b> <span class="en">"${esc(c.q)}"</span> ضبط کن.${recBox("cp"+n+":B","ضبط Task B",95)}</li>
  <li><b>Task C — ChatGPT Voice:</b> پرامپت همین بخش را بده و آزمون شفاهی را انجام بده (نمرهٔ ۱–۹ Fluency را یادداشت کن).</li>
  <li><b>Task D — یادآوری فعال:</b> ۳۰ مورد از موارد مرور همین صفحه را تصادفی انتخاب کن؛ برای هر کدام در ۵ ثانیه یک جملهٔ درست بگو. درصد موفقیت = Recall٪.</li>
  <li><b>Task E — شنیدن:</b> یک قسمت تازه از 6 Minute English را (<a href="https://www.youtube.com/@bbclearningenglish/search?query=6%20minute%20english" target="_blank" rel="noopener">کانال YouTube</a> یا <a href="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english" target="_blank" rel="noopener">سایت BBC</a>) <b>بدون زیرنویس</b> گوش کن و درصد فهمت را تخمین بزن (۰–۱۰۰)؛ بعد ۳۰ ثانیه از آن را دیکته بنویس و با متن مقایسه کن.</li></ol>`;
}
const MEASURE_HOW = `<div class="how"><b>چطور عددها را بگیری:</b><ul><li><b>خودکار:</b> اگر با دکمهٔ ضبط داخل برنامه ضبط کنی، تعداد مکث‌های بالای ۳ ثانیه و طولانی‌ترین تکهٔ بدون مکث خودکار حساب می‌شوند (تقریبی، از روی بلندی صدا) و با «ثبت در جدول پیشرفت» وارد جدول می‌شوند. در جای ساکت ضبط کن تا تشخیص دقیق‌تر باشد.</li><li><b>کلمه در دقیقه (WPM):</b> ضبط Task A، A2 و B را متن کن (Transcript خودکار ضبط‌کنندهٔ گوشی، یا دکمهٔ میکروفون داخل باکس متنی ChatGPT — نه حالت Voice) و در پرامپت تحلیل Paste کن. میانگین WPM را ثبت کن.</li><li><b>مکث‌های طولانی (اگر بیرون از برنامه ضبط کردی):</b> ضبط Task A را گوش کن و مکث‌های بیش از ۳ ثانیه را بشمار.</li><li><b>طولانی‌ترین تکهٔ بدون مکث (اگر بیرون از برنامه ضبط کردی):</b> در ضبط Task A، طولانی‌ترین بازه‌ای که بدون مکث بیش از ۱ ثانیه حرف زدی را (به ثانیه) با تایمر ضبط پیدا کن.</li><li><b>Filler در دقیقه:</b> umm / err / «اِ» / like بی‌جا را <b>با گوش</b> در ضبط بشمار ÷ ۲. متن خودکار معمولاً این‌ها را حذف می‌کند، پس از روی متن نشمار.</li><li><b>خطا در دقیقه:</b> از تحلیل ChatGPT (بخش ۱، میانگین).</li><li><b>اعتمادبه‌نفس:</b> ۱ تا ۱۰، صادقانه: «اگر همین الان یک جلسهٔ کاری انگلیسی داشتم، چقدر راحت بودم؟»</li></ul></div>`;
function targetsTable(n){
  const c=CHECK[n];
  return `<div class="tbl"><table><thead><tr><th>معیار</th><th>هدف این مرحله (نسبت به جلسهٔ صفر)</th></tr></thead><tbody>
  <tr><td>سرعت گفتار (میانگین WPM)</td><td>حداقل ${fa(c.wpm)}٪ بیشتر از خط پایه${n>=50?" (یا بالای ۱۲۵)":""}</td></tr>
  <tr><td>مکث‌های بیش از ۳ ثانیه (در ۲ دقیقه)</td><td>حداکثر ${fa(c.pauses)}</td></tr>
  <tr><td>طولانی‌ترین تکهٔ بدون مکث</td><td>حداقل ${fa(c.run)} ثانیه</td></tr>
  <tr><td>Filler در دقیقه</td><td>حداکثر ${fa(c.fillers)}</td></tr>
  ${c.err?`<tr><td>خطای گرامری/واژگانی در دقیقه</td><td>حداقل ${fa(c.err)}٪ کمتر از خط پایه</td></tr>`:""}
  <tr><td>Recall٪ موارد مرور</td><td>حداقل ${fa(c.recall)}٪</td></tr>
  ${c.listen?`<tr><td>فهم 6 Minute English بدون زیرنویس</td><td>حداقل ${fa(c.listen)}٪</td></tr>`:""}
  <tr><td>اعتمادبه‌نفس (۱–۱۰)</td><td>حداقل ${fa(c.conf)} واحد بیشتر از خط پایه</td></tr></tbody></table></div>`;
}
function trapsTable(){
  return `<div class="tbl"><table><thead><tr><th>تله</th><th>شکل درست / نکته</th></tr></thead><tbody>${TRAPS.map(t=>`<tr><td>${esc(t[0])}</td><td>${esc(t[1])}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderReview(s){
  const n=s.n, ph=PHASES[s.ph], items=reviewItems(n);
  const head=`<div class="s-head"><div class="kick"><span class="pill amb">جلسهٔ مرور و ارزیابی</span></div>
  <h1>${esc(s.t)}</h1><div class="ent en">${esc(s.en)}</div>
  <div class="goal"><b>هدف:</b> ${s.final?"سنجش نهایی با همان آزمون‌های جلسهٔ صفر، مقایسهٔ قبل و بعد، و ساختن برنامهٔ ادامه.":"سنجیدن پیشرفت با همان آزمون‌های جلسهٔ صفر + مرور فشردهٔ همهٔ فاز "+fa(s.ph)+" ("+esc(ph.t)+")."}</div></div>`;
  let groups="";
  items.forEach(o=>{ const sp=split(o); groups+=`<div class="srs-src"><div class="lbl">جلسهٔ ${fa(o.n)} — ${esc(o.t)}</div><div class="chips">${(s.final?sp.must:sp.core).map(chipHtml).join("")}</div></div>`; });
  const hard=hardList();
  const s1=step(1,"آزمون‌های ثابت (مثل جلسهٔ صفر)","۲۲ دقیقه", benchmarkTests(n)+MEASURE_HOW+`<p>پرامپت تحلیل متن Task A، A2 و B:</p>${gptBlock(assessTranscriptPrompt())}${reportBox("transcript",n)}`,"challenge");
  const s2=step(2,s.final?"مرور کل برنامه":"مرور فشردهٔ فاز","۱۵ دقیقه",
    `<div class="how"><b>روش:</b> روی هر مورد بزن؛ قبل از دیدن معنی، در ۵ ثانیه یک جملهٔ واقعی بگو و بعد «بلد بودم» یا «سخت بود» را بزن. این همان Task D است؛ تعداد «بلد بودم»ها را بشمار. ${s.final?"در مرور نهایی فقط ۵ مورد اصلی هر جلسه آمده؛ لازم نیست همه را امروز تمام کنی — ۳۰ مورد تصادفی برای Task D کافی است.":"فقط موارد اصلی و پشتیبان هر جلسه اینجا هستند."}</div><div class="srs-block">${groups}${hard.length?`<div class="srs-src" style="border-color:var(--amber)"><div class="lbl">لیست سخت‌ها (${fa(hard.length)})</div><div class="chips">${hard.map(x=>`<button class="chip on" data-star="${x.k}" title="${esc(x.it[1])} — ${esc(x.it[2])}">${esc(x.it[0])}</button>`).join("")}</div></div>`:""}</div>`);
  const s3=step(3,"مرور و آزمون شفاهی با ChatGPT Voice","۲۰ دقیقه",
    `<div class="how">این پرامپت شامل Quiz یادآوری فعال، سؤال‌های ترکیبی از کل فاز، یک Role-play ارزیابی و گزارش نمره (همراه با تله‌های فارسی‌زبان‌ها) است. بعد از گفتگو، جواب REPORT را پایین همین بخش Paste کن تا Band روانی، CEFR و نتیجهٔ Quiz خودکار ثبت شوند.</div>${gptBlock(buildReviewPrompt(n))}${reportBox("review",n)}`,"gpt");
  const s4=step(4,"تله‌ها، ثبت عددها و تصمیم","۱۰ دقیقه",
    `<p><b>بررسی تله‌های فارسی‌زبان‌ها:</b> ضبط Task A و A2 را گوش کن و هر تله‌ای که هنوز در آن افتادی را در دفتر خطا ثبت کن.</p>${trapsTable()}
    <p>عددها را در <a href="#progress">صفحهٔ پیشرفت</a> (ردیف جلسهٔ ${fa(n)}) وارد کن. هدف‌های این مرحله:</p>${targetsTable(n)}
    <div class="note"><b>قانون تصمیم:</b> اگر به <b>۴ هدف یا بیشتر</b> رسیدی → با خیال راحت جلو برو. اگر به ۲–۳ هدف رسیدی → جلو برو اما در ۵ جلسهٔ بعد «تمرین اضافه» ضعیف‌ترین حوزه را از صفحهٔ «ارزیابی اولیه» فعال کن. اگر کمتر از ۲ هدف → قبل از ادامه، ۲ جلسه از این فاز را که چالششان را قبول نشدی (یا سخت‌ترین‌ها) یک بار دیگر کامل انجام بده. <b>هرگز بیش از ۲ جلسه عقب برنگرد</b>؛ پیشرفت Speaking غیرخطی است.</div>`);
  const reflect = s.final ? `<ol><li>ضبط Task A امروز را با ضبط جلسهٔ صفر پشت سر هم گوش کن. ۳ تفاوت مشخص را بنویس.${recBox("cp0:A","Task A — جلسهٔ صفر",0,'data-readonly="1"')}${recBox("cp60:A","Task A — امروز",0,'data-readonly="1"')}</li><li>ضبط ۵ دقیقه‌ای جلسهٔ ۵۹ را گوش کن: کجا هنوز ترجمه می‌کنی؟${recBox("s59:after","ضبط جلسهٔ ۵۹",0,'data-readonly="1"')}</li><li>پرامپت ارزیابی صوتی (صفحهٔ ارزیابی اولیه) را دوباره اجرا کن و نمرهٔ هر ۴ معیار را با روز اول مقایسه کن.</li><li>خودارزیابی «می‌توانم…» را در صفحهٔ ارزیابی اولیه دوباره پر کن (ستون جلسهٔ ۶۰).</li></ol>
    <h3 style="margin-top:8px">برنامهٔ بعد از ۶۰ جلسه (نگه‌داشتن و ادامهٔ پیشرفت)</h3><ul><li><b>روزانه (۲۰ دقیقه):</b> ۱۰ دقیقه ChatGPT Voice با یک موقعیت واقعی کاری آن روز + ۵ دقیقه Shadowing یک دیالوگ یا تاک تازه + ۵ دقیقه مرور لیست سخت‌ها، دفتر خطا و بانک جمله‌ها.</li><li><b>هفتگی:</b> یک گفتگوی انسانی ۲۰ دقیقه‌ای + یک جلسهٔ ۲۰ دقیقه‌ای مرور یکی از فازها (به ترتیب ۱ تا ۶) با پرامپت جلسهٔ مرور همان فاز.</li><li><b>ماهانه:</b> Task A، A2 و B را ضبط کن و عددها را ثبت کن؛ اگر WPM یا خطاها ۲ ماه ثابت ماند، دور دوم این برنامه را از فاز ضعیف‌تر شروع کن.</li><li><b>قدم بعدی:</b> اگر CEFR تخمینی به B2+ رسیده، هدف بعدی را «C1 کاری» بگذار: ارائه‌های ۱۰ دقیقه‌ای، مذاکرهٔ واقعی و گفتگوی منظم با انسان‌ها.</li></ul>`
    : `<ol><li>در این ۹ جلسه، کدام موقعیت را الان واقعاً راحت‌تر انجام می‌دهی؟ یک مثال مشخص بزن.</li><li>کدام ۳ مورد از لیست سخت‌ها هنوز سخت است؟ برای هر کدام همین الان ۳ جمله بگو.</li><li>پرتکرارترین اشتباه دفتر خطا چیست؟ یک قانون ۱ جمله‌ای برای خودت بنویس.</li><li>۵ جملهٔ کاری تازه که در این فاز یاد گرفتی و واقعاً سر کار می‌گویی را به «بانک جمله‌ها» اضافه کن.</li><li>در ۱۰ جلسهٔ بعد، کدام ضعف را باید «تمرین اضافه» بگیری؟ در صفحهٔ ارزیابی اولیه به‌روزش کن.</li></ol>`;
  const s5=step(5, s.final?"مقایسهٔ قبل و بعد + برنامهٔ ادامه":"بازتاب (بلند و به انگلیسی)", s.final?"۱۵ دقیقه":"۵ دقیقه", reflect+`<label class="check-line"><input type="checkbox" id="done" ${ST.done[n]?"checked":""}> این جلسه را کامل انجام دادم</label>`);
  return head+`<div class="steps">${s1}${s2}${s3}${s4}${s5}</div>`;
}

/* ======================= Guide ======================= */
function renderGuide(){
  const nx=nextSession(), doneCount=Object.keys(ST.done).filter(k=>ST.done[k]).length, s=SESSIONS[nx];
  const assessed = ST.metrics && ST.metrics[0] && ST.metrics[0].wpm;
  return `<div class="hero"><div class="doc">
    <h1>یک برنامهٔ ۶۰ جلسه‌ای برای اینکه واقعاً انگلیسی <span style="color:var(--accent)">حرف بزنی</span></h1>
    <p class="lead">هر جلسه حدود ۶۵ دقیقه و ۱۰ بخش است و با حرف زدن شروع می‌شود، نه با خواندن. هر جلسه فقط ۵ مورد اصلی و ۵ مورد پشتیبان برای فعال کردن دارد، دیالوگ‌های واقعی محیط کار برای Shadowing، پرامپت آمادهٔ ChatGPT Voice که دربارهٔ کار واقعی خودت است، و چالشی که اول و آخر جلسه ضبط می‌شود تا پیشرفت را بشنوی.</p>
  </div><div class="next">
    <div class="small" style="opacity:.75">${assessed?"جلسهٔ بعدی تو":"قدم اول"}</div>
    <div class="big">${assessed?`جلسهٔ ${fa(nx)} — ${esc(s.t)}`:"ارزیابی اولیه (جلسهٔ صفر)"}</div>
    <div class="progress-bar" aria-label="پیشرفت"><i style="width:${Math.round(doneCount/60*100)}%"></i></div>
    <div class="small" style="opacity:.75">${fa(doneCount)} از ۶۰ جلسه انجام شده</div>
    <a class="btn" href="${assessed?"#s"+nx:"#assess"}">${assessed?"شروع جلسه":"شروع ارزیابی"} ←</a>
  </div></div>

  <div class="doc" style="margin-top:28px">
  <section><h2>مسیر: ۶ فاز، هر فاز ۱۰ جلسه</h2><p class="muted small">جلسه‌های ۱۰، ۲۰، ۳۰، ۴۰، ۵۰ و ۶۰ جلسهٔ مرور و ارزیابی‌اند و همان آزمون‌های جلسهٔ صفر را تکرار می‌کنند تا پیشرفت با عدد دیده شود.</p>
  <div class="phase-grid">${[1,2,3,4,5,6].map(p=>`<div class="card"><span class="pill acc">فاز ${fa(p)} · جلسه‌های ${fa((p-1)*10+1)}–${fa(p*10)}</span><h3 style="margin-top:6px">${esc(PHASES[p].t)}</h3><p class="small muted">${esc(PHASES[p].d)}</p></div>`).join("")}</div></section>

  <section><h2>ساختار ثابت هر جلسه</h2><div class="tbl"><table><thead><tr><th>بخش</th><th>زمان</th><th>چرا</th></tr></thead><tbody>
  <tr><td>۱. شروع سرد</td><td>۳–۴′</td><td>قبل از هر یادگیری، چالش امروز را ضبط می‌کنی تا جاهای خالی‌ات را ببینی. هر دو جلسه یک بار، چالش ۷ جلسه قبل را هم دوباره انجام می‌دهی (تکرار همان کار، روانی را سریع بالا می‌برد).</td></tr>
  <tr><td>۲. مرور فاصله‌دار</td><td>۷′</td><td>موارد اصلی جلسه‌های ۱، ۳، ۷، ۱۴ و ۲۸ جلسه قبل، گرامر ۷ جلسه پیش و تلفظ ۴ جلسه پیش؛ با جمله‌سازی بلند.</td></tr>
  <tr><td>۳. ورودی جدید</td><td>۸′</td><td>۵ مورد اصلی (حتماً در گفتگو) + ۵ پشتیبان. بقیه اختیاری‌اند. موارد تکراری با برچسب «مرور» مشخص شده‌اند.</td></tr>
  <tr><td>۴. گرامر گفتاری</td><td>۶′</td><td>گرامری که در Speaking لازم است، از جمله تله‌های فارسی‌زبان‌ها: he/she، a/the، اسم‌های غیرشمردنی، حروف اضافه، make/do و نقل‌قول غیرمستقیم.</td></tr>
  <tr><td>۵. شنیدن و Shadowing</td><td>۸′</td><td>نزدیک به نیمی از جلسه‌ها دیالوگ‌های واقعی محیط کار (BBC English at Work) هستند و بقیه تاک‌های TED با بازهٔ مشخص؛ چند منبع با لهجهٔ غیربومی.</td></tr>
  <tr><td>۶. تلفظ</td><td>۴′</td><td>خطاهای مخصوص فارسی‌زبان‌ها (w/v، th، «اِسکول»، تکیه، schwa) با لینک YouGlish.</td></tr>
  <tr><td>۷. تمرین روانی</td><td>۵′</td><td>روش‌هایی مثل ۴/۳/۲ و صحبت بی‌توقف؛ برای شکستن عادت ترجمهٔ ذهنی.</td></tr>
  <tr><td>۸. ChatGPT Voice</td><td>۱۵′</td><td>پرامپت آماده با موارد امروز، مرورها، پروفایل کاری، بانک جمله‌ها، اشتباه‌های قبلی و تله‌ها.</td></tr>
  <tr><td>۹. چالش «بعد»</td><td>۵′</td><td>همان چالش شروع جلسه، دوباره؛ مقایسهٔ دو ضبط نشان می‌دهد در همین جلسه چه چیزی بهتر شد.</td></tr>
  <tr><td>۱۰. بستن جلسه</td><td>۲′</td><td>دفتر خطا، بانک جمله‌ها، کار واقعی روز؛ و از فاز ۳ هفته‌ای یک گفتگوی انسانی.</td></tr></tbody></table></div></section>

  <section><h2>قوانین برنامه</h2><ul>
  <li><b>همه چیز را بلند بگو.</b> خواندن در ذهن ≠ تمرین Speaking. حتی مرور لغات را با جمله‌سازی بلند انجام بده.</li>
  <li><b>قبل از حرف زدن ننویس.</b> نوشتن جمله و بعد خواندنش همان ترجمهٔ ذهنی است که می‌خواهیم حذفش کنیم.</li>
  <li><b>پروفایل کاری‌ات را یک بار پر کن</b> (در «دفتر من»). از آن به بعد همهٔ پرامپت‌ها دربارهٔ کار واقعی خودت است، نه یک شغل فرضی.</li>
  <li><b>در تمرین روانی، روانی از دقت مهم‌تر است.</b> در Drillهای گرامر و چالش، دقت مهم‌تر است. این دو را جدا تمرین می‌کنیم.</li>
  <li><b>هر چالش را دو بار ضبط کن</b> (اول و آخر جلسه) و ضبط‌ها را نگه دار؛ در جلسه‌های بعد و جلسهٔ ۶۰ با آن‌ها مقایسه می‌کنی.</li>
  <li><b>از فاز ۳ هفته‌ای یک بار با یک آدم واقعی حرف بزن.</b> ChatGPT صبور و قابل‌پیش‌بینی است؛ یخ زدن معمولاً جلوی آدم واقعی پیش می‌آید.</li>
  <li><b>ریتم پیشنهادی:</b> ۵ جلسه در هفته (۱۲ هفته). حداقل ۳ جلسه در هفته (۲۰ هفته). اگر ۳ روز یا بیشتر وقفه افتاد، اول فقط مرور فاصله‌دار و ChatGPT جلسهٔ آخر را تکرار کن، بعد ادامه بده.</li>
  <li><b>روزهای شلوغ (نسخهٔ ۲۰ دقیقه‌ای):</b> فقط بخش ۲ (مرور) + بخش ۸ (ChatGPT) را انجام بده و روز بعد جلسه را کامل کن. بیش از ۲ بار در هفته از نسخهٔ کوتاه استفاده نکن.</li></ul></section>

  <section><h2>مدل تلفظ: انگلیسی آمریکایی</h2><p>همهٔ تلفظ‌ها، املاها و پرامپت‌ها بر اساس انگلیسی آمریکایی است (رایج‌ترین مدل در محیط‌های فنی). هر جا شکل بریتانیایی آمده، فقط برای فهمیدن است.</p></section>

  <section><h2>تله‌های فارسی‌زبان‌ها</h2><p class="small muted">این‌ها پرتکرارترین خطاهای فارسی‌زبان‌ها در صحبت‌اند. ChatGPT در همهٔ جلسه‌ها روی آن‌ها حساس است و در هر جلسهٔ مرور یک بار با ضبط خودت چکشان می‌کنی.</p>${trapsTable()}</section>

  <section><h2>استفاده از ChatGPT Voice</h2><ul>
  <li>دکمهٔ <b>«باز کردن در ChatGPT»</b> پرامپت جلسه را در یک چت جدید می‌فرستد (و کپی هم می‌کند). بعد دکمهٔ Voice را بزن. اگر پرامپت نرسید، فقط Paste کن و بفرست. پرامپت بلند را با صدا نخوان.</li>
  <li>بعد از گفتگو، Voice را ببند و تایپ کن <span class="en">REPORT</span>. جواب را در کادر «برگرداندن گزارش» همان جلسه Paste کن: نمره‌ها در «پیشرفت» جمع می‌شوند و اشتباه‌ها خودکار به دفتر خطا می‌روند. در ارزیابی‌ها، WPM، خطا در دقیقه، Band و CEFR هم خودکار وارد جدول می‌شوند.</li>
  <li>اگر وسط کار ChatGPT قوانین را فراموش کرد (مثلاً زیاد حرف زد یا تصحیح نکرد)، بگو: <span class="en">"Remember the rules: short turns, correct my mistakes."</span></li>
  <li>در پایان بگو <span class="en">"FEEDBACK"</span>. بعد از بستن Voice، بازخورد به صورت متن در چت هست؛ از آنجا دفتر خطا را پر کن.</li>
  <li>اگر در حالت Voice صدایت را اشتباه متن می‌کند، معمولاً یعنی تلفظ آن کلمه واضح نیست — آن کلمه را در دفتر خطا با نوع «تلفظ» ثبت کن.</li></ul></section>

  <section><h2>منابع ثابتی که در برنامه استفاده می‌شوند</h2><ul>
  <li><a href="https://www.youtube.com/@bbclearningenglish" target="_blank" rel="noopener">BBC Learning English (YouTube)</a> — دیالوگ‌های English at Work و Office English برای Shadowing مکالمه؛ لینک دقیق هر قسمت در جلسه‌اش هست.</li>
  <li><a href="https://www.ted.com/talks" target="_blank" rel="noopener">TED Talks</a> — برای Shadowing ریتم و ارائه؛ همه متن کامل (Transcript) دارند.</li>
  <li><a href="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english" target="_blank" rel="noopener">6 Minute English</a> — شنیدن استاندارد در جلسه‌های ارزیابی (روی کانال YouTube هم هست).</li>
  <li><a href="https://youglish.com/" target="_blank" rel="noopener">YouGlish</a> — شنیدن هر کلمه از زبان ده‌ها گویندهٔ واقعی (لینک مستقیم در بخش تلفظ هر جلسه).</li>
  <li><a href="https://www.youtube.com/@RachelsEnglish" target="_blank" rel="noopener">Rachel's English</a> — تلفظ آمریکایی؛ اگر در ارزیابی، تلفظ ضعف اصلی‌ات بود، هفته‌ای ۲ ویدیو اضافه کن.</li></ul>
  <p class="small muted">از داخل ایران، YouTube و گاهی TED و BBC فقط با VPN باز می‌شوند.</p></section>

  <section><h2>ابزارهای داخل برنامه</h2><ul>
  <li><b>ضبط صدا:</b> چالش‌ها و آزمون‌ها را با دکمهٔ قرمز داخل خود برنامه ضبط کن. ضبط‌ها روی گوشی می‌مانند و برنامه تعداد مکث‌های بالای ۳ ثانیه و طولانی‌ترین تکهٔ بدون مکث را خودکار حساب می‌کند و «قبل» و «بعد» را مقایسه می‌کند.</li>
  <li><b>🔊 تلفظ:</b> کنار هر لغت، عبارت، مثال و مورد تلفظ دکمهٔ 🔊 هست که با صدای خود گوشی و لهجهٔ آمریکایی می‌خواند؛ بدون اینترنت هم کار می‌کند. سرعت «آهسته» هم دارد.</li>
  <li><b>بدون اینترنت:</b> بعد از اولین باز شدن، خود برنامه بدون اینترنت و VPN باز می‌شود. فقط ویدیوها، YouGlish و ChatGPT اینترنت لازم دارند.</li></ul></section>
  <section class="card"><h2>نصب و ذخیره‌سازی</h2>${installHelp()}<p class="small">داده‌هایت در دو جای مرورگر ذخیره می‌شوند (localStorage و IndexedDB). ضبط‌های صوتی فقط روی همین گوشی‌اند و داخل فایل پشتیبان نیستند. هفته‌ای یک بار از صفحهٔ «پیشرفت» فایل پشتیبان بگیر؛ برنامه یادت می‌اندازد.</p></section>
  </div>`;
}

/* ======================= Assessment (session 0) ======================= */
const CANDO=[
 "می‌توانم ۱ دقیقه بدون مکث طولانی خودم و کارم را معرفی کنم.",
 "می‌توانم یک Small Talk ۳ دقیقه‌ای را شروع کنم و ادامه بدهم.",
 "وقتی کلمه‌ای یادم نمی‌آید، می‌توانم دورش بزنم و ادامه بدهم.",
 "می‌توانم یک ماجرای گذشته را با زمان‌های درست تعریف کنم.",
 "می‌توانم در جلسه وسط حرف بپرم و نظرم را بگویم.",
 "می‌توانم وضعیت یک پروژه را واضح و خلاصه گزارش بدهم.",
 "می‌توانم مؤدبانه مخالفت کنم و دلیل بیاورم.",
 "می‌توانم یک مشکل فنی را برای آدم غیرفنی توضیح بدهم.",
 "می‌توانم پشت تلفن حرف طرف را بفهمم و درخواست تکرار کنم.",
 "یک گفتگوی کاری بین دو انگلیسی‌زبان را بدون زیرنویس تا حد زیادی می‌فهمم.",
 "وقتی انگلیسی حرف می‌زنم، کمتر در ذهنم از فارسی ترجمه می‌کنم.",
 "در یک مکالمهٔ انگلیسی کاری احساس راحتی و اعتمادبه‌نفس دارم."];
function renderAssess(){
  const cd=ST.cando||{};
  const rows=CANDO.map((t,i)=>`<tr><td>${esc(t)}</td>${[0,60].map(cp=>`<td><select data-cando="${cp}|${i}" aria-label="امتیاز">${["—","۱","۲","۳","۴","۵"].map((l,v)=>`<option value="${v}" ${(cd[cp]&&cd[cp][i]==v)?"selected":""}>${l}</option>`).join("")}</select></td>`).join("")}</tr>`).join("");
  const sum=cp=>{ const a=(cd[cp]||[]).filter(x=>x>0); return a.length?fa(a.reduce((p,c)=>p+ +c,0))+" از "+fa(a.length*5):"—"; };
  return `<div class="doc" style="margin-top:24px">
  <div class="kick"><span class="pill amb">جلسهٔ صفر · حدود ۶۵ دقیقه · یک بار، قبل از جلسهٔ ۱</span></div>
  <h1>ارزیابی اولیه: سطح دقیق و ضعف‌های اصلی</h1>
  <p class="lead">این ارزیابی دو کار می‌کند: (۱) یک <b>خط پایه با عدد</b> می‌سازد که هر ۱۰ جلسه با همان آزمون‌ها مقایسه می‌شود، (۲) ضعف‌های اصلی‌ات را پیدا می‌کند تا برنامه روی آن‌ها «تمرین اضافه» بگذارد و ChatGPT روی همان‌ها سخت‌گیرتر باشد. قبل از شروع، <a href="#errors">پروفایل کاری</a>‌ات را پر کن تا پرامپت‌ها دربارهٔ کار واقعی خودت باشند.</p>

  ${step(1,"ضبط سه تک‌گویی (بدون آمادگی)","۱۲ دقیقه",`${benchmarkTests(0)}${MEASURE_HOW}`,"challenge")}
  ${step(2,"تحلیل متن ضبط‌ها با ChatGPT","۱۰ دقیقه",`<p>متن Task A، A2 و B را در جای خودشان Paste کن و پرامپت را در یک چت جدید بفرست. بعد جواب کامل را در کادر زیر Paste کن تا WPM، خطا در دقیقه و Error Log خودکار ثبت شوند.</p>${gptBlock(assessTranscriptPrompt())}${reportBox("transcript",0)}`)}
  ${step(3,"آزمون شفاهی شبیه IELTS با ChatGPT Voice","۱۵ دقیقه",`<p>این بخش تلفظ، تعامل و سرعت واکنش را می‌سنجد (چیزهایی که از روی متن معلوم نمی‌شود). در چت جدید Paste کن، بعد Voice را بزن. در پایان بگو <span class="en">"RESULTS"</span>، بعد Voice را ببند و تایپ کن <span class="en">REPORT</span>.</p>${gptBlock(assessVoicePrompt())}${reportBox("voice",0)}`,"gpt")}
  ${step(4,"خودارزیابی «می‌توانم…»","۵ دقیقه",`<p class="small muted">به هر جمله از ۱ (اصلاً) تا ۵ (کاملاً) نمره بده. ستون ۶۰ را در جلسهٔ آخر پر می‌کنی.</p><div class="tbl"><table class="cando"><thead><tr><th>جمله</th><th>جلسهٔ ۰</th><th>جلسهٔ ۶۰</th></tr></thead><tbody>${rows}<tr><td><b>جمع</b></td><td class="kpi">${sum(0)}</td><td class="kpi">${sum(60)}</td></tr></tbody></table></div>`)}
  ${step(5,"تشخیص: روی چه چیزی بیشتر تمرکز کنی؟","۵ دقیقه",`<p>بر اساس بخش ۵ تحلیل ChatGPT (۳ ضعف اصلی) و نمره‌های پایین خودارزیابی، <b>حداکثر ۲</b> مورد را انتخاب کن. انتخابت در هر جلسه یک «تمرین اضافهٔ ۵ دقیقه‌ای» نشان می‌دهد و به همهٔ پرامپت‌های ChatGPT اضافه می‌شود. بعد از هر جلسهٔ مرور می‌توانی تغییرش بدهی.</p>
  <div class="tbl"><table><thead><tr><th></th><th>ضعف</th><th>نشانه‌اش</th><th>چه چیزی به برنامه اضافه می‌شود</th></tr></thead><tbody>
  ${Object.entries(FOCUS).map(([k,f])=>`<tr><td><input type="checkbox" data-focus="${k}" ${(ST.focus||[]).includes(k)?"checked":""} aria-label="${esc(f.t)}"></td><td><b>${esc(f.t)}</b></td><td class="small">${esc({fluency:"WPM زیر ۱۰۰، بیش از ۶ مکث طولانی در ۲ دقیقه، طولانی‌ترین تکه زیر ۱۵ ثانیه، Band روانی ≤ ۵.۵",accuracy:"بیش از ۳ خطا در دقیقه، Band گرامر ≤ ۵.۵",vocab:"تکرار کلمات ساده، Band واژگان ≤ ۵.۵",pron:"ChatGPT حرفت را اشتباه متن می‌کند، Band تلفظ ≤ ۵.۵",listening:"فهم 6 Minute English بدون زیرنویس زیر ۶۰٪",confidence:"نمرهٔ اعتمادبه‌نفس ≤ ۴ یا نمرهٔ خودارزیابی ۱۲ جمله زیر ۳۰"}[k])}</td><td class="small">${esc(f.extra)}</td></tr>`).join("")}</tbody></table></div>`)}
  ${step(6,"ثبت خط پایه","۵ دقیقه",`<p>عددها را در <a href="#progress">صفحهٔ پیشرفت</a> (ردیف «۰») ثبت کن: میانگین WPM، مکث‌ها، طولانی‌ترین تکه، Fillerها، خطا در دقیقه، نمرهٔ Fluency از ChatGPT، درصد فهم شنیداری و اعتمادبه‌نفس. بعد برو سراغ <a href="#s1">جلسهٔ ۱</a>.</p>
  <div class="how"><b>تعبیر تقریبی نتیجه:</b> Band ۵–۵.۵ ≈ B1 · Band ۶ ≈ B1+/B2 · Band ۶.۵ ≈ B2 · Band ۷ ≈ B2+/C1. سرعت گفتار بومی در مکالمه معمولاً ۱۲۰–۱۶۰ کلمه در دقیقه است؛ بیشتر زبان‌آموزان B1/B2 در شروع بین ۷۰ تا ۱۰۵ هستند. هدف این برنامه «سریع حرف زدن» نیست، بلکه کم کردن مکث‌ها و طولانی‌تر کردن تکه‌های پیوسته است — WPM فقط یکی از نشانه‌هاست. نمره‌ای که ChatGPT از روی متن می‌دهد تقریبی است؛ روند تغییرش مهم‌تر از خود عدد است.</div>`)}
  </div>`;
}

/* ======================= My notebook: profile, phrase bank, error log, hard list ======================= */
const PROFILE_FIELDS=[["role","نقش و سمت","Software engineer and founder"],["org","شرکت و محصول","A school-management platform"],["team","با چه کسانی کار می‌کنی","Two developers, a designer, school principals"],["projects","پروژه‌های فعلی","A new mobile app release"],["situations","کجا انگلیسی لازم داری","Calls with foreign partners, documentation, interviews"],["problems","مشکلات رایج کاری","Deadlines, bugs before release, unclear requirements"]];
function renderErrors(){
  const errs=ST.err||[]; const hard=hardList(); const p=ST.profile||{}; const ph=ST.phrases||[];
  const typeL={g:"گرامر",v:"واژه/عبارت",p:"تلفظ",f:"فارسی‌وار"};
  return `<div class="doc" style="margin-top:24px">
  <h1>دفتر من</h1>
  <section class="card"><h2>پروفایل کاری</h2><p class="small muted">یک بار پر کن (انگلیسی، کوتاه). همهٔ پرامپت‌های ChatGPT از این به بعد سؤال‌ها و Role-playها را با کار واقعی تو تطبیق می‌دهند.</p>
  <form id="profform" class="pgrid">${PROFILE_FIELDS.map(([k,l,ph_])=>`<label>${l}<input type="text" class="en" id="pf-${k}" value="${esc(p[k]||"")}" placeholder="e.g. ${esc(ph_)}"></label>`).join("")}
  <div class="row"><button class="btn pri" type="submit">ذخیرهٔ پروفایل</button><span id="prof-msg" class="small"></span></div></form></section>

  <section class="card"><h2>بانک جمله‌های کاری من (${fa(ph.length)})</h2><p class="small muted">جمله‌هایی که واقعاً هر هفته سر کار می‌گویی یا لازم داری (Stand-up، جلسه، ایمیل شفاهی، تماس). هدف تا آخر برنامه: حداقل ۳۰ جمله. ۸ جملهٔ آخر خودکار به پرامپت ChatGPT اضافه می‌شوند تا در گفتگو تمرینشان کنی.</p>
  <form id="phform" class="row" style="align-items:end"><label style="flex:1 1 260px">جمله<input id="ph-new" type="text" class="en" style="width:100%" placeholder="I'm still waiting on the design team for the final screens."></label><button class="btn pri" type="submit">افزودن</button></form>
  ${ph.length?`<ol class="phlist">${ph.map((x,i)=>`<li><span class="en">${esc(x)}</span> <button class="btn small" data-phdel="${i}">حذف</button></li>`).join("")}</ol>`:`<p class="small muted">هنوز جمله‌ای نداری. از جلسهٔ ۱ شروع کن: جملهٔ معرفی کاری‌ات اولین جمله است.</p>`}</section>

  <section><h2>دفتر خطا</h2>
  <p>هر جلسه ۳ اشتباه اصلی را اینجا ثبت کن. ۵ اشتباه آخرِ «حل‌نشده» در مرور هر جلسه نشان داده می‌شوند و ۶ مورد آخر خودکار به پرامپت ChatGPT اضافه می‌شوند تا اگر تکرارشان کردی، اصلاحت کند. وقتی یک اشتباه را در ۳ جلسهٔ پشت سر هم تکرار نکردی، تیک «حل شد» را بزن.</p>
  <div class="card"><form id="errform" class="row" style="align-items:end">
    <label style="flex:1 1 220px">آنچه گفتم<br><input id="e-wrong" type="text" class="en" style="width:100%" placeholder="I am agree with you"></label>
    <label style="flex:1 1 220px">شکل درست / طبیعی<br><input id="e-right" type="text" class="en" style="width:100%" placeholder="I agree with you"></label>
    <label>نوع<br><select id="e-type">${Object.entries(typeL).map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select></label>
    <button class="btn pri" type="submit">افزودن</button></form></div>
  <div class="tbl"><table><thead><tr><th>جلسه</th><th>آنچه گفتم</th><th>شکل درست</th><th>نوع</th><th>حل شد</th><th></th></tr></thead><tbody>
  ${errs.length?errs.map((e,i)=>`<tr style="${e.done?"opacity:.5":""}"><td class="kpi">${fa(e.s||"-")}</td><td class="en">${esc(e.wrong)}</td><td class="en"><b>${esc(e.right)}</b></td><td>${typeL[e.type]||""}</td><td><input type="checkbox" data-errdone="${i}" ${e.done?"checked":""} aria-label="حل شد"></td><td><button class="btn small" data-errdel="${i}">حذف</button></td></tr>`).reverse().join(""):`<tr><td colspan="6" class="muted">هنوز چیزی ثبت نشده. فهرست تله‌های رایج فارسی‌زبان‌ها در <a href="#guide">راهنما</a> هست.</td></tr>`}
  </tbody></table></div></section>
  <section><h2>لیست سخت‌ها (${fa(hard.length)})</h2>
  <p class="small muted">موردهایی که ★ زده‌ای. روی هر کدام بزن تا از لیست خارج شود.</p>
  <div class="chips">${hard.length?hard.map(x=>`<button class="chip on" data-star="${x.k}" title="${esc(x.it[1])} — ${esc(x.it[2])}">${esc(x.it[0])}</button>`).join(""):`<span class="muted small">خالی است.</span>`}</div></section>
  </div>`;
}

/* ======================= Progress ======================= */
const MET=[["wpm","WPM (میانگین)"],["pauses","مکث >۳ثانیه"],["run","طولانی‌ترین تکه (ثانیه)"],["fillers","Filler/دقیقه"],["err","خطا/دقیقه"],["recall","Recall٪"],["listen","فهم شنیداری٪"],["band","Band روانی (۱–۹)"],["conf","اعتمادبه‌نفس (۱–۱۰)"]];
function evalCell(cp, key, val){
  const base=(ST.metrics[0]||{})[key]; const c=CHECK[cp]; if(!c || c.wpm==null || val===""||val==null) return "";
  const v=+val, b=+base;
  let ok=null;
  if(key==="wpm" && base) ok = v >= b*(1+c.wpm/100) || (cp>=50 && v>=125);
  if(key==="pauses") ok = v <= c.pauses;
  if(key==="run") ok = v >= c.run;
  if(key==="fillers") ok = v <= c.fillers;
  if(key==="err" && base && c.err) ok = v <= b*(1-c.err/100);
  if(key==="recall") ok = v >= c.recall;
  if(key==="listen" && c.listen) ok = v >= c.listen;
  if(key==="conf" && base) ok = v >= b + c.conf;
  if(ok===null) return "";
  return ok?` <span class="ok" title="به هدف رسیدی">✓</span>`:` <span class="bad" title="هنوز به هدف نرسیده">✗</span>`;
}
function renderProgress(){
  const m=ST.metrics||{};
  const rows=[0,10,20,30,40,50,60].map(cp=>`<tr><td class="kpi"><b>${cp===0?"خط پایه (۰)":"جلسهٔ "+fa(cp)}</b></td>${MET.map(([k])=>{ const v=(m[cp]||{})[k]; return `<td style="white-space:nowrap"><input type="number" step="any" style="width:74px" data-met="${cp}|${k}" value="${v==null?"":esc(v)}" aria-label="${k}">${cp?evalCell(cp,k,v):""}</td>`; }).join("")}</tr>`).join("");
  const b=m[0]||{}, last=[60,50,40,30,20,10].find(cp=>m[cp]&&Object.values(m[cp]).some(x=>x!==""&&x!=null));
  let delta="";
  if(last && b.wpm){ const L=m[last];
    const d=(k,better)=>{ if(L[k]==null||L[k]===""||b[k]==null||b[k]==="") return null; const diff=(+L[k])-(+b[k]); return {diff, good: better==="up"?diff>0:diff<0}; };
    const items=[["wpm","سرعت گفتار","up"],["pauses","مکث‌های طولانی","down"],["run","طولانی‌ترین تکه","up"],["fillers","Filler","down"],["err","خطا در دقیقه","down"],["band","Band روانی","up"],["conf","اعتمادبه‌نفس","up"]].map(([k,l,dir])=>{ const x=d(k,dir); return x?`<div class="card" style="padding:10px 14px"><div class="small muted">${l}</div><div class="kpi" style="font-size:20px;font-weight:800;color:${x.good?"var(--good)":"var(--rec)"}">${x.diff>0?"+":""}${fa(Math.round(x.diff*10)/10)}</div></div>`:""; }).join("");
    delta=`<h2>تغییر از خط پایه تا جلسهٔ ${fa(last)}</h2><div class="phase-grid">${items}</div>`;
  }
  return `<div class="doc" style="margin-top:24px; max-width:1100px">
  <h1>پیشرفت با عدد</h1>
  <p>بعد از جلسهٔ صفر و هر جلسهٔ مرور (۱۰، ۲۰، … ۶۰) عددها را وارد کن. ✓ یعنی به هدف آن مرحله رسیده‌ای. هدف‌ها نسبت به خط پایهٔ خودت تعریف شده‌اند، نه یک سطح ثابت؛ چون هدف پیشرفت واقعی توست.</p>
  <div class="tbl"><table><thead><tr><th>نقطهٔ سنجش</th>${MET.map(([,l])=>`<th>${l}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
  <div class="how"><b>هدف‌های کلی تا جلسهٔ ۶۰:</b> WPM حداقل ۳۰٪ بیشتر از خط پایه (یا ۱۳۰+) · حداکثر ۱ مکث بیش از ۳ ثانیه در ۲ دقیقه · تکه‌های پیوستهٔ حداقل ۴۵ ثانیه‌ای · حداکثر ۳ Filler در دقیقه · نصف شدن خطاها در دقیقه · Recall حداقل ۸۰٪ · فهم ۸۰٪ یک قسمت 6 Minute English بدون زیرنویس · اعتمادبه‌نفس ۳ واحد بالاتر · یک صحبت پیوستهٔ ۵ دقیقه‌ای (جلسهٔ ۵۹). راهنمای اندازه‌گیری در جلسهٔ صفر است.</div>
  ${delta}
  ${scoresSection()}
  <h2>جلسه‌های انجام‌شده</h2>
  <p class="kpi">${fa(Object.keys(ST.done).filter(k=>ST.done[k]).length)} از ۶۰ جلسه · چالش‌های قبول‌شده: ${fa(Object.keys(ST.passed).filter(k=>ST.passed[k]).length)} · موارد لیست سخت‌ها: ${fa(hardList().length)} · اشتباه‌های حل‌نشده: ${fa((ST.err||[]).filter(e=>!e.done).length)} · جمله‌های بانک: ${fa((ST.phrases||[]).length)}</p>
  <h2>ذخیره‌سازی و پشتیبان</h2>
  <p class="small" id="storage-info">در حال بررسی…</p>
  <p class="small muted">تیک‌ها، ستاره‌ها، دفتر من و عددها روی همین گوشی در دو جا ذخیره می‌شوند (localStorage و IndexedDB). ضبط‌های صوتی هم روی همین گوشی‌اند ولی داخل فایل پشتیبان نیستند. آخرین پشتیبان: <b>${ST.lastBackup?new Date(ST.lastBackup).toLocaleDateString("fa-IR"):"هنوز نگرفته‌ای"}</b>.</p>
  <div class="row"><button class="btn pri" type="button" id="backup-file">ذخیرهٔ فایل پشتیبان</button><label class="btn" for="restore-file">برگرداندن از فایل</label><input type="file" id="restore-file" accept="application/json,.json" hidden></div>
  <details class="howd"><summary>پشتیبان متنی (کپی و Paste)</summary>
  <div class="prompt"><button class="btn pri copy" data-copy data-backup>کپی پشتیبان</button><pre id="backup">${esc(JSON.stringify(ST))}</pre></div>
  <label for="restore" class="small">برگرداندن از متن:</label><textarea id="restore" class="en" placeholder='{"done":{...}}'></textarea>
  <div class="row"><button class="btn" id="restore-btn">برگرداندن</button></div></details>
  <p><span id="restore-msg" class="small"></span></p>
  <h2>ضبط‌ها</h2><p class="small muted">ضبط‌های ارزیابی (جلسهٔ صفر و جلسه‌های مرور) برای مقایسهٔ نهایی نگه داشته می‌شوند. اگر فضای گوشی کم شد، ضبط‌های جلسه‌های عادی را پاک کن.</p>
  <button class="btn" type="button" id="clear-recs">حذف ضبط‌های جلسه‌های عادی</button>
  </div>`;
}

/* ======================= Events ======================= */
function bind(view,n){
  document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>{ copyText((b.closest(".prompt")||b.parentElement).querySelector("pre").textContent,b); if("backup" in b.dataset){ ST.lastBackup=Date.now(); save(); } }));
  document.querySelectorAll("[data-gptopen]").forEach(a=>a.addEventListener("click",()=>{ const pre=a.closest(".prompt").querySelector("pre"); try{ navigator.clipboard.writeText(pre.textContent).catch(()=>{}); }catch(e){} }));
  document.querySelectorAll("[data-reportsave]").forEach(b=>b.addEventListener("click",()=>{ const box=b.closest(".report"), ta=box.querySelector("[data-reporttext]"), msg=box.querySelector("[data-reportmsg]");
    const res=saveReport(box.dataset.report, +box.dataset.n, ta.value);
    if(!res.ok){ msg.textContent="گزارشی پیدا نشد. مطمئن شو جواب REPORT را کامل کپی کرده‌ای."; msg.className="small bad"; return; }
    ta.value=""; msg.textContent="ثبت شد ✓"; msg.className="small ok"; box.querySelector("[data-reportsum]").innerHTML=reportSummary(res.rec); }));
  document.querySelectorAll("[data-snooze]").forEach(b=>b.addEventListener("click",()=>{ ST[b.dataset.snooze+"Snooze"]=Date.now(); save(); route(true); }));
  document.querySelectorAll("[data-install]").forEach(b=>b.addEventListener("click",async ()=>{ if(!INSTALL_PROMPT) return; INSTALL_PROMPT.prompt(); try{ await INSTALL_PROMPT.userChoice; }catch(e){} INSTALL_PROMPT=null; route(true); }));
  const bf=$("#backup-file"); if(bf) bf.addEventListener("click",()=>saveBackupFile(bf));
  const rf=$("#restore-file"); if(rf) rf.addEventListener("change",async ()=>{ const f=rf.files&&rf.files[0]; if(!f) return; try{ const o=JSON.parse(await f.text()); if(typeof o!=="object"||!o||!("done" in o)) throw 0; ST=Object.assign(defaultState(),o); save(); route(true); $("#restore-msg").textContent="برگردانده شد ✓"; }catch(e){ $("#restore-msg").textContent="فایل پشتیبان معتبر نیست."; } });
  const cr=$("#clear-recs"); if(cr) cr.addEventListener("click",()=>clearSessionRecordings(cr));
  if(view==="progress") storageInfo();
  const setHard=(k,v)=>{ if(v) ST.hard[k]=true; else delete ST.hard[k]; save(); document.querySelectorAll(`[data-star="${k}"]`).forEach(x=>x.classList.toggle("on",!!v)); };
  document.querySelectorAll("[data-star]").forEach(b=>b.addEventListener("click",()=>{ const k=b.dataset.star; const src=b.closest(".srs-src");
    if(b.classList.contains("chip") && src){ const r=src.querySelector(".reveal"), it=itemBy(k); if(!r||!it) return;
      src.querySelectorAll(".chip").forEach(c=>c.classList.remove("sel")); b.classList.add("sel");
      r.hidden=false; r.innerHTML=`<div class="en"><b>${esc(it[0])}</b> ${TTS.btn(it[0])}</div><div>${esc(it[1])}</div><div class="en ex">${TTS.btn(it[2])} ${esc(it[2])}</div><div class="row"><button class="btn" data-know="${k}">بلد بودم ✓</button><button class="btn" data-hardset="${k}">سخت بود ★</button></div>`;
      r.querySelector("[data-know]").onclick=()=>{ setHard(k,false); b.classList.add("known"); r.hidden=true; };
      r.querySelector("[data-hardset]").onclick=()=>{ setHard(k,true); r.hidden=true; };
      return; }
    setHard(k,!ST.hard[k]); if(view==="errors") route(true); }));
  document.querySelectorAll("[data-stepdone]").forEach(b=>b.addEventListener("click",()=>{ const num=+b.dataset.stepdone; ST.steps=ST.steps||{}; const arr=ST.steps[CURN]=ST.steps[CURN]||[]; if(!arr.includes(num)) arr.push(num);
    const total=document.querySelectorAll("details.step").length; if(typeof CURN==="number" && arr.length>=total) ST.done[CURN]=true; save(); route(true);
    if(typeof CURN==="number" && ST.done[CURN] && arr.length>=total){ const nr=document.querySelector(".navrow"); if(nr) nr.scrollIntoView({block:"center"}); } }));
  document.querySelectorAll("details.step").forEach(d=>d.addEventListener("toggle",()=>{ if(d.open) document.querySelectorAll("details.step").forEach(o=>{ if(o!==d) o.open=false; }); }));
  const d=$("#done"); if(d) d.addEventListener("change",()=>{ ST.done[n]=d.checked; if(!d.checked) delete ST.done[n]; save(); });
  const p=$("#passed"); if(p) p.addEventListener("change",()=>{ ST.passed[n]=p.checked; if(!p.checked) delete ST.passed[n]; save(); });
  document.querySelectorAll("[data-focus]").forEach(c=>c.addEventListener("change",()=>{ const set=new Set(ST.focus||[]); c.checked?set.add(c.dataset.focus):set.delete(c.dataset.focus); ST.focus=[...set]; save(); }));
  document.querySelectorAll("[data-cando]").forEach(sel=>sel.addEventListener("change",()=>{ const [cp,i]=sel.dataset.cando.split("|"); ST.cando[cp]=ST.cando[cp]||[]; ST.cando[cp][+i]=+sel.value; save(); route(true); }));
  const pf=$("#profform"); if(pf) pf.addEventListener("submit",e=>{ e.preventDefault(); PROFILE_FIELDS.forEach(([k])=>{ ST.profile[k]=$("#pf-"+k).value.trim(); }); save(); $("#prof-msg").textContent="ذخیره شد ✓ — از این به بعد در پرامپت‌ها هست."; });
  const phf=$("#phform"); if(phf) phf.addEventListener("submit",e=>{ e.preventDefault(); const v=$("#ph-new").value.trim(); if(!v) return; ST.phrases.push(v); save(); route(true); });
  document.querySelectorAll("[data-phdel]").forEach(b=>b.addEventListener("click",()=>{ ST.phrases.splice(+b.dataset.phdel,1); save(); route(true); }));
  const f=$("#errform"); if(f) f.addEventListener("submit",e=>{ e.preventDefault(); const w=$("#e-wrong").value.trim(), r=$("#e-right").value.trim(); if(!w||!r) return; ST.err.push({s:LASTN, wrong:w, right:r, type:$("#e-type").value, done:false}); save(); route(true); });
  document.querySelectorAll("[data-errdone]").forEach(c=>c.addEventListener("change",()=>{ ST.err[+c.dataset.errdone].done=c.checked; save(); route(true); }));
  document.querySelectorAll("[data-errdel]").forEach(b=>b.addEventListener("click",()=>{ ST.err.splice(+b.dataset.errdel,1); save(); route(true); }));
  document.querySelectorAll("[data-met]").forEach(inp=>inp.addEventListener("change",()=>{ const [cp,k]=inp.dataset.met.split("|"); ST.metrics[cp]=ST.metrics[cp]||{}; if(inp.value==="") delete ST.metrics[cp][k]; else ST.metrics[cp][k]=+inp.value; save(); route(true); }));
  const rb=$("#restore-btn"); if(rb) rb.addEventListener("click",()=>{ try{ const o=JSON.parse($("#restore").value); if(typeof o!=="object"||!o) throw 0; ST=Object.assign(defaultState(),o); save(); route(true); }catch(e){ $("#restore-msg").textContent="متن پشتیبان معتبر نیست؛ کل متن را دقیق کپی کن."; } });
}
window.addEventListener("hashchange",()=>route());
TTS.init();
route();
reconcileState();
requestPersist();
if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
