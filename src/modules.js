/* ======================= Durable storage: IndexedDB mirror of the state + recordings ======================= */
const IDB = (()=>{
  let dbp=null;
  function open(){
    if(dbp) return dbp;
    dbp = new Promise((res,rej)=>{
      if(!("indexedDB" in window)) return rej(new Error("no indexedDB"));
      const r = indexedDB.open("sp60",1);
      r.onupgradeneeded = ()=>{ const db=r.result; if(!db.objectStoreNames.contains("kv")) db.createObjectStore("kv"); if(!db.objectStoreNames.contains("rec")) db.createObjectStore("rec"); };
      r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn){
    const db = await open();
    return new Promise((res,rej)=>{ const t=db.transaction(store,mode); let out; const q=fn(t.objectStore(store)); if(q) q.onsuccess=()=>{ out=q.result; }; t.oncomplete=()=>res(out); t.onerror=()=>rej(t.error); t.onabort=()=>rej(t.error); });
  }
  return { get:(s,k)=>tx(s,"readonly",o=>o.get(k)), put:(s,k,v)=>tx(s,"readwrite",o=>o.put(v,k)), del:(s,k)=>tx(s,"readwrite",o=>o.delete(k)), keys:s=>tx(s,"readonly",o=>o.getAllKeys()) };
})();
const DAY = 86400000;
function reconcileState(){
  IDB.get("kv","state").then(raw=>{
    if(raw){ let o=null; try{ o=JSON.parse(raw); }catch(e){}
      if(o && (o._ts||0) > (ST._ts||0)){ ST=Object.assign(defaultState(), o); try{ localStorage.setItem(KEY, raw); }catch(e){} route(true); }
      else if((ST._ts||0) > ((o&&o._ts)||0)) IDB.put("kv","state",JSON.stringify(ST)).catch(()=>{});
    } else if(ST._ts) IDB.put("kv","state",JSON.stringify(ST)).catch(()=>{});
  }).catch(()=>{});
}
function requestPersist(){ try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p=>{ if(!p) navigator.storage.persist(); }); }catch(e){} }
const isStandalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
let INSTALL_PROMPT = null;
window.addEventListener("beforeinstallprompt", e=>{ e.preventDefault(); INSTALL_PROMPT=e; if(document.querySelector("[data-install]")) route(true); });
window.addEventListener("appinstalled", ()=>{ INSTALL_PROMPT=null; });
function installHelp(){
  if(isStandalone()) return `<p class="small"><b>برنامه نصب شده است ✓</b> داده‌هایت در فضای خود برنامه ذخیره می‌شوند.</p>`;
  const ios = `در <b>Safari</b> دکمهٔ Share (مربع با فلش رو به بالا) را بزن و <b>Add to Home Screen</b> را انتخاب کن. از آن به بعد برنامه را از آیکن صفحهٔ اصلی باز کن.`;
  const android = INSTALL_PROMPT ? `<button class="btn pri" data-install>نصب برنامه</button>` : `در Chrome از منوی ⋮ گزینهٔ <b>Install app</b> یا <b>Add to Home screen</b> را بزن.`;
  return `<p class="small">${isIOS?ios:android}</p><p class="small muted">نکتهٔ آیفون: برنامهٔ نصب‌شده فضای ذخیره‌سازی جدا از Safari دارد. اگر قبلاً در Safari پیشرفتی ثبت کرده‌ای، اول از «پیشرفت» فایل پشتیبان بگیر و بعد از نصب، در برنامه برگردانش.</p>`;
}
function bannerBlock(){
  const out=[]; const now=Date.now(); const doneCount=Object.keys(ST.done).filter(k=>ST.done[k]).length;
  if(!isStandalone() && !(ST.installSnooze && now-ST.installSnooze<14*DAY))
    out.push(`<div class="banner"><b>برنامه را روی گوشی نصب کن</b> تا بدون اینترنت باز شود و مرورگر پیشرفتت را پاک نکند (Safari داده‌های سایتی را که ۷ روز باز نشده پاک می‌کند).${installHelp()}<button class="btn small" data-snooze="install">بعداً</button></div>`);
  const since = ST.lastBackup || ST.firstUse;
  if(doneCount>=3 && since && now-since>7*DAY && !(ST.backupSnooze && now-ST.backupSnooze<3*DAY))
    out.push(`<div class="banner"><b>بیش از ۷ روز است از پیشرفتت پشتیبان نگرفته‌ای.</b> <a href="#progress">گرفتن فایل پشتیبان ←</a> <button class="btn small" data-snooze="backup">بعداً</button></div>`);
  return out.join("");
}
function backupFileName(){ const d=new Date(); const p=x=>String(x).padStart(2,"0"); return `speaking60-backup-${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.json`; }
async function saveBackupFile(btn){
  const text=JSON.stringify(ST); const name=backupFileName();
  const blob=new Blob([text],{type:"application/json"});
  try{
    const file=new File([blob],name,{type:"application/json"});
    if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:"Speaking60 backup"}); markBackup(btn); return; }
  }catch(e){ if(e && e.name==="AbortError") return; }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000);
  markBackup(btn);
}
function markBackup(btn){ ST.lastBackup=Date.now(); save(); if(btn) btn.textContent="پشتیبان گرفته شد ✓"; }

/* ======================= Pronunciation audio (device text-to-speech, works offline) ======================= */
const TTS = {
  voice:null, ok:("speechSynthesis" in window) && typeof SpeechSynthesisUtterance!=="undefined",
  init(){
    if(!this.ok){ document.documentElement.classList.add("no-tts"); return; }
    const pick=()=>{ const vs=speechSynthesis.getVoices().filter(v=>/^en[-_]US/i.test(v.lang));
      const pref=["Samantha","Ava","Allison","Susan","Google US English","Microsoft Aria","Microsoft Jenny","Alex"];
      this.voice = pref.map(p=>vs.find(v=>v.name.includes(p))).find(Boolean) || vs.find(v=>v.localService) || vs[0] || null; };
    pick(); try{ speechSynthesis.addEventListener("voiceschanged", pick); }catch(e){ speechSynthesis.onvoiceschanged=pick; }
  },
  clean(t, lower){
    let s=String(t).split("→")[0];
    s=s.replace(/\/[^\s\/][^\/]*?\//g," ").replace(/[؀-ۿ‌]+/g," ").replace(/\(\s*\)/g," ").replace(/\((pause|slow|breath|sincere|sarcastic|surprised|sympathy|soft, slow)\)/gi," ");
    s=s.replace(/\s\/\s/g,", ").replace(/\s+vs\s+/g,", ").replace(/\.\.\.|…|[↘↗→|~]/g," ").replace(/[()]/g," ").replace(/\s+/g," ").trim().replace(/^[,.\s]+|[,\s]+$/g,"");
    if(!s || /[əɪæʌɑɔɜɝθðʃʒŋʊː]/.test(s) || !/[A-Za-z]/.test(s)) return null;
    if(lower) s=s.replace(/\b(?!I\b)[A-Za-z']+\b/g, w=>w.toLowerCase());
    return s;
  },
  btn(t, lower){ if(!this.ok) return ""; const c=this.clean(t, lower); return c?`<button class="say" type="button" data-say="${esc(c)}" aria-label="پخش تلفظ" title="پخش تلفظ">🔊</button>`:""; },
  speak(text){
    if(!this.ok) return; speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.lang="en-US"; if(this.voice) u.voice=this.voice; u.rate=ST.ttsRate||1;
    speechSynthesis.speak(u);
  }
};
const rateBar = () => TTS.ok ? `<div class="ttsbar small">🔊 سرعت تلفظ: <button class="btn small ${(ST.ttsRate||1)===1?"on":""}" data-rate="1">عادی</button><button class="btn small ${(ST.ttsRate||1)<1?"on":""}" data-rate="0.7">آهسته</button></div>` : "";
document.addEventListener("click", e=>{
  const s=e.target.closest("[data-say]"); if(s){ e.preventDefault(); e.stopPropagation(); TTS.speak(s.dataset.say); return; }
  const r=e.target.closest("[data-rate]"); if(r){ ST.ttsRate=+r.dataset.rate; save(); document.querySelectorAll("[data-rate]").forEach(b=>b.classList.toggle("on", +b.dataset.rate===ST.ttsRate)); }
}, true);

/* ======================= Voice recorder with automatic pause / longest-run analysis ======================= */
const REC = {
  active:null, urls:[],
  supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),
  mime(){ const c=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg;codecs=opus"]; try{ return c.find(m=>MediaRecorder.isTypeSupported(m))||""; }catch(e){ return ""; } },
  analyze(levels, dt){
    if(!levels || levels.length < 20) return null;
    const sorted=[...levels].sort((a,b)=>a-b), q=p=>sorted[Math.min(sorted.length-1, Math.floor(p*sorted.length))];
    const floor=q(0.15), peak=q(0.95);
    if(peak < 0.004) return {silent:true};
    const thr=Math.max(floor + (peak-floor)*0.18, floor*1.8);
    const sp=levels.map(v=>v>thr);
    const fill=(arr,val,maxLen)=>{ let i=0; while(i<arr.length){ if(arr[i]===val){ let j=i; while(j<arr.length && arr[j]===val) j++; const inner=i>0 && j<arr.length; if(inner && (j-i)<=maxLen) for(let k=i;k<j;k++) arr[k]=!val; i=j; } else i++; } };
    fill(sp,false,Math.round(0.3/dt)); fill(sp,true,Math.round(0.15/dt));
    const f=sp.indexOf(true), l=sp.lastIndexOf(true); if(f<0) return {silent:true};
    let pauses3=0, longest=0, runStart=f, i=f;
    while(i<=l){
      if(!sp[i]){ let j=i; while(j<=l && !sp[j]) j++; const gap=(j-i)*dt;
        if(gap>=3) pauses3++;
        if(gap>=1){ longest=Math.max(longest,(i-runStart)*dt); runStart=j; }
        i=j; } else i++;
    }
    longest=Math.max(longest,(l+1-runStart)*dt);
    const talk=(l-f+1)*dt, speech=sp.slice(f,l+1).filter(Boolean).length*dt;
    return {pauses3, longest:Math.round(longest), talk:Math.round(talk), ratio:Math.round(100*speech/Math.max(talk,0.1))};
  },
  fmt(sec){ sec=Math.max(0,Math.round(sec)); return fa(Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0")); },
  async start(box){
    if(this.active) this.stop();
    const key=box.dataset.rec, limit=+box.dataset.limit||120;
    const AC=window.AudioContext||window.webkitAudioContext; let ctx=null; try{ ctx=AC?new AC():null; }catch(e){}
    let stream;
    try{ stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }
    catch(e){ if(ctx) ctx.close(); box.querySelector(".recmsg").textContent="دسترسی به میکروفون داده نشد. در تنظیمات مرورگر اجازهٔ میکروفون را برای این سایت روشن کن."; return; }
    const levels=[], dt=0.05; let an=null, buf=null;
    if(ctx){ try{ await ctx.resume(); const src=ctx.createMediaStreamSource(stream); an=ctx.createAnalyser(); an.fftSize=1024; src.connect(an); buf=new Float32Array(an.fftSize); }catch(e){ an=null; } }
    const mime=this.mime(); let mr; try{ mr=new MediaRecorder(stream, mime?{mimeType:mime}:undefined); }catch(e){ mr=new MediaRecorder(stream); }
    const chunks=[]; mr.ondataavailable=e=>{ if(e.data && e.data.size) chunks.push(e.data); };
    const t0=performance.now();
    box.innerHTML=`<div class="row"><button class="btn recbtn" type="button" data-recstop>■ توقف</button><span class="rectime kpi">${this.fmt(0)} / ${this.fmt(limit)}</span></div><div class="meter"><i></i></div>`;
    box.querySelector("[data-recstop]").addEventListener("click",()=>this.stop());
    const meter=box.querySelector(".meter i"), timeEl=box.querySelector(".rectime");
    const tick=setInterval(()=>{
      const el=(performance.now()-t0)/1000;
      if(an){ an.getFloatTimeDomainData(buf); let s=0; for(let k=0;k<buf.length;k++) s+=buf[k]*buf[k]; const rms=Math.sqrt(s/buf.length); levels.push(rms); if(meter && meter.isConnected) meter.style.width=Math.min(100,rms*600)+"%"; }
      if(timeEl && timeEl.isConnected) timeEl.textContent=`${this.fmt(el)} / ${this.fmt(limit)}`;
      if(el>=limit) this.stop();
    }, dt*1000);
    this.active={key, mr, stream, ctx, tick, levels, dt, t0, mime:mr.mimeType||mime};
    mr.onstop=async ()=>{
      const a=this.active && this.active.key===key ? this.active : {levels, dt, t0, mime:mr.mimeType||mime};
      const dur=(performance.now()-a.t0)/1000;
      const blob=new Blob(chunks,{type:a.mime||"audio/webm"});
      const m=an ? this.analyze(a.levels,a.dt) : null;
      try{ await IDB.put("rec",key,{blob, mime:blob.type, dur:Math.round(dur), ts:Date.now(), m}); }catch(e){}
      if(this.active && this.active.key===key) this.active=null;
      document.querySelectorAll(`[data-rec="${key}"]`).forEach(b=>this.hydrate(b));
      document.querySelectorAll(`[data-compare="${key}"]`).forEach(b=>this.hydrate(b));
    };
    mr.start(1000);
  },
  stop(){
    const a=this.active; if(!a) return;
    clearInterval(a.tick);
    try{ if(a.mr.state!=="inactive") a.mr.stop(); }catch(e){}
    try{ a.stream.getTracks().forEach(t=>t.stop()); }catch(e){}
    try{ if(a.ctx) a.ctx.close(); }catch(e){}
  },
  metricsLine(m){ if(!m) return ""; if(m.silent) return `<span class="small muted">صدایی تشخیص داده نشد.</span>`; return `<span class="small">مکث‌های بالای ۳ ثانیه: <b>${fa(m.pauses3)}</b> · طولانی‌ترین تکهٔ بدون مکث: <b>${fa(m.longest)} ثانیه</b> · مدت صحبت: ${this.fmt(m.talk)}</span>`; },
  async hydrate(box){
    const key=box.dataset.rec, label=box.dataset.label||"ضبط", readonly=box.dataset.readonly==="1";
    if(!this.supported && !readonly){ box.innerHTML=`<span class="small muted">ضبط داخل برنامه در این مرورگر پشتیبانی نمی‌شود؛ با ضبط‌کنندهٔ گوشی ضبط کن.</span>`; return; }
    let rec=null; try{ rec=await IDB.get("rec",key); }catch(e){}
    if(this.active && this.active.key===key) return;
    if(!rec){
      box.innerHTML = readonly ? `<span class="small muted">${esc(label)}: ضبطی ذخیره نشده.</span>` : `<div class="row"><button class="btn recbtn" type="button" data-recstart>● ${esc(label)}</button><span class="small muted">حداکثر ${this.fmt(+box.dataset.limit||120)}</span></div><div class="recmsg small"></div>`;
      const b=box.querySelector("[data-recstart]"); if(b) b.addEventListener("click",()=>this.start(box));
      return;
    }
    const url=URL.createObjectURL(rec.blob); this.urls.push(url);
    let cmp="";
    if(box.dataset.compare && rec.m && !rec.m.silent){ let o=null; try{ o=await IDB.get("rec",box.dataset.compare); }catch(e){}
      if(o && o.m && !o.m.silent) cmp=`<div class="small cmp">${esc(box.dataset.compareLabel||"قبل")} ← حالا: مکث‌ها ${fa(o.m.pauses3)} ← <b>${fa(rec.m.pauses3)}</b> · طولانی‌ترین تکه ${fa(o.m.longest)} ← <b>${fa(rec.m.longest)}</b> ثانیه</div>`; }
    const cp=box.dataset.cp;
    box.innerHTML=`<div class="small"><b>${esc(label)}</b> · ${this.fmt(rec.dur)}</div><audio controls preload="metadata" src="${url}"></audio>${this.metricsLine(rec.m)}${cmp}${readonly?"":`<div class="row"><button class="btn small" type="button" data-recredo>ضبط دوباره</button><button class="btn small" type="button" data-recdel>حذف</button>${cp!=null&&cp!==""&&rec.m&&!rec.m.silent?`<button class="btn small" type="button" data-recmet>ثبت در جدول پیشرفت</button>`:""}</div>`}<div class="recmsg small"></div>`;
    const redo=box.querySelector("[data-recredo]"); if(redo) redo.addEventListener("click",()=>this.start(box));
    const del=box.querySelector("[data-recdel]"); if(del) del.addEventListener("click",async ()=>{ if(del.dataset.sure!=="1"){ del.dataset.sure="1"; del.textContent="مطمئنی؟ دوباره بزن"; return; } try{ await IDB.del("rec",key); }catch(e){} this.hydrate(box); });
    const met=box.querySelector("[data-recmet]"); if(met) met.addEventListener("click",()=>{ ST.metrics[cp]=ST.metrics[cp]||{}; ST.metrics[cp].pauses=rec.m.pauses3; ST.metrics[cp].run=rec.m.longest; save(); met.textContent="ثبت شد ✓ (مکث‌ها و طولانی‌ترین تکه)"; });
  },
  mountAll(){ this.urls.forEach(u=>URL.revokeObjectURL(u)); this.urls=[]; document.querySelectorAll("[data-rec]").forEach(b=>this.hydrate(b)); }
};
const recBox = (key, label, limit, extra="") => `<div class="rec" data-rec="${key}" data-label="${esc(label)}" data-limit="${limit}" ${extra}></div>`;
async function storageInfo(){
  const el=document.getElementById("storage-info"); if(!el) return;
  let persisted=null, usage=null, n=0;
  try{ if(navigator.storage && navigator.storage.persisted) persisted=await navigator.storage.persisted(); }catch(e){}
  try{ if(navigator.storage && navigator.storage.estimate){ const e=await navigator.storage.estimate(); usage=e.usage; } }catch(e){}
  try{ n=(await IDB.keys("rec")).length; }catch(e){}
  el.innerHTML=`ذخیره‌سازی پایدار: ${persisted===true?`<b class="ok">فعال ✓</b>`:persisted===false?`<b class="bad">فعال نیست</b> — برنامه را روی گوشی نصب کن`:"نامشخص"} · فضای استفاده‌شده: ${usage!=null?fa((usage/1048576).toFixed(1))+" مگابایت":"نامشخص"} · ضبط‌ها: ${fa(n)}`;
}
async function clearSessionRecordings(btn){
  if(btn.dataset.sure!=="1"){ btn.dataset.sure="1"; btn.textContent="مطمئنی؟ دوباره بزن"; return; }
  try{ const keys=await IDB.keys("rec"); for(const k of keys) if(String(k).startsWith("s")) await IDB.del("rec",k); }catch(e){}
  btn.textContent="ضبط‌های جلسه‌ها حذف شد ✓"; storageInfo();
}

/* ======================= Shadowing player: one sentence, pause, your turn, next ======================= */
const SH = { cur:null };
function shCfg(){ ST.shadowCfg = Object.assign({mode:"auto", reps:1, rate:1, cc:true, text:true}, ST.shadowCfg||{}); return ST.shadowCfg; }
let YT_API = null;
function loadYT(){
  if(YT_API) return YT_API;
  YT_API = new Promise((res,rej)=>{
    if(window.YT && window.YT.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = ()=>{ if(prev) try{ prev(); }catch(e){} res(window.YT); };
    const s=document.createElement("script"); s.src="https://www.youtube.com/iframe_api"; s.async=true;
    s.onerror=()=>{ YT_API=null; rej(new Error("youtube")); };
    document.head.appendChild(s);
    setTimeout(()=>{ if(!(window.YT && window.YT.Player)){ YT_API=null; rej(new Error("timeout")); } }, 20000);
  });
  return YT_API;
}
async function ytAdapter(el, vid, startAt){
  const YTns = await loadYT();
  return new Promise(res=>{
    const A = { playingCb:null };
    const p = new YTns.Player(el, { videoId:vid, width:"100%", height:"100%",
      playerVars:{ playsinline:1, rel:0, modestbranding:1, cc_load_policy: shCfg().cc?1:0, cc_lang_pref:"en", hl:"en", start:Math.floor(startAt||0), iv_load_policy:3 },
      events:{ onReady:()=>res(A), onStateChange:e=>{ if(e.data===1 && A.playingCb) A.playingCb(); } } });
    Object.assign(A, {
      play:()=>{ try{ p.playVideo(); }catch(e){} }, pause:()=>{ try{ p.pauseVideo(); }catch(e){} },
      seek:t=>{ try{ p.seekTo(t,true); }catch(e){} }, now:()=>{ try{ return p.getCurrentTime(); }catch(e){ return null; } },
      rate:r=>{ try{ p.setPlaybackRate(r); }catch(e){} },
      captions:on=>{ try{ if(on){ p.loadModule("captions"); p.setOption("captions","track",{languageCode:"en"}); } else p.unloadModule("captions"); }catch(e){} },
      destroy:()=>{ try{ p.destroy(); }catch(e){} }
    });
  });
}
function mediaAdapter(media){
  const A = { playingCb:null };
  media.addEventListener("playing", ()=>{ if(A.playingCb) A.playingCb(); });
  return Object.assign(A, { play:()=>{ const pr=media.play(); if(pr && pr.catch) pr.catch(()=>{}); }, pause:()=>media.pause(),
    seek:t=>{ media.currentTime=t; }, now:()=>media.currentTime, rate:r=>{ media.playbackRate=r; }, captions:()=>{}, destroy:()=>{ try{ media.pause(); }catch(e){} } });
}
function shadowUI(o){
  const c=shCfg(), on=(a,b)=>a===b?"on":"";
  return `<div class="sh-ui">
  <div class="sh-status"><b class="sh-label">آماده</b><span class="sh-count kpi"></span></div>
  <div class="sh-bar"><i></i></div>
  ${o.hasText?`<div class="sh-text en" ${c.text?"":"hidden"}></div>`:""}
  <div class="sh-ctrl"><button class="btn" type="button" data-sh="prev">→ قبلی</button><button class="btn" type="button" data-sh="repeat">🔁 تکرار</button><button class="btn pri sh-main" type="button" data-sh="toggle">▶ شروع</button><button class="btn" type="button" data-sh="next">بعدی ←</button></div>
  <div class="sh-opts small">
    <span>حالت:</span><button class="btn small ${on(c.mode,"auto")}" type="button" data-shmode="auto">خودکار</button><button class="btn small ${on(c.mode,"manual")}" type="button" data-shmode="manual">دستی</button>
    <span>هر جمله:</span>${[1,2,3].map(r=>`<button class="btn small ${on(c.reps,r)}" type="button" data-shreps="${r}">${fa(r)}×</button>`).join("")}
    <span>سرعت:</span><button class="btn small ${on(c.rate,1)}" type="button" data-shrate="1">عادی</button><button class="btn small ${on(c.rate,0.75)}" type="button" data-shrate="0.75">آهسته</button>
    ${o.yt?`<button class="btn small ${c.cc?"on":""}" type="button" data-shcc>زیرنویس</button>`:""}${o.hasText?`<button class="btn small ${c.text?"on":""}" type="button" data-shtext>متن</button>`:""}
  </div></div>`;
}
/* A: adapter, segs: [[start,end]...] (live mode grows it from silences), texts: optional sentence texts */
function makeShadow(root, A, o){
  const c=shCfg();
  let segs=(o.segs||[]).slice(), texts=o.texts||null, i=Math.max(0, Math.min(o.start||0, Math.max(0,segs.length-1)));
  let rep=0, state="idle", timers=[], tick=null, wake=null;
  const $q=s=>root.querySelector(s), label=$q(".sh-label"), countEl=$q(".sh-count"), barI=$q(".sh-bar i"), textEl=$q(".sh-text"), main=$q(".sh-main");
  const clear=()=>{ timers.forEach(clearTimeout); timers=[]; if(tick){ clearInterval(tick); tick=null; } A.playingCb=null; };
  const lockScreen=async()=>{ try{ if(!wake && navigator.wakeLock) wake=await navigator.wakeLock.request("screen"); }catch(e){} };
  const unlockScreen=()=>{ try{ if(wake) wake.release(); }catch(e){} wake=null; };
  function bar(ms, cls){ barI.className=cls||""; barI.style.transition="none"; barI.style.width="0%"; void barI.offsetWidth; if(ms>0){ barI.style.transition=`width ${ms}ms linear`; barI.style.width="100%"; } }
  function set(s, txt){ state=s; root.dataset.state=s; label.textContent=txt; main.textContent = (s==="listen"||s==="turn") ? "⏸ توقف" : (s==="done" ? "▶ از اول" : (s==="idle" ? "▶ شروع" : "▶ ادامه")); }
  function count(){ countEl.textContent = o.live && i>=segs.length ? `جملهٔ ${fa(i+1)}` : `جملهٔ ${fa(i+1)} از ${fa(segs.length)}${o.live?"+":""}`; if(textEl) textEl.textContent=(texts&&texts[i])||""; if(o.onIndex) o.onIndex(i); }
  function play(k){
    clear(); lockScreen();
    if(k<0) k=0;
    if(k>=segs.length){ if(o.live){ i=k; return live(); } i=segs.length-1; set("done","تمام شد ✓ — آفرین!"); bar(0); A.pause(); unlockScreen(); return; }
    i=k; count();
    const [s,e]=segs[i]; let started=false;
    set("listen","گوش کن…"); bar(0);
    A.pause(); A.rate(c.rate); A.seek(s);
    A.playingCb=()=>{ if(started||!(state==="listen"||state==="tap")) return; started=true; if(state==="tap") set("listen","گوش کن…");
      const dur=(e-s)/c.rate; bar(dur*1000,"listen"); timers.push(setTimeout(stop, Math.max(0, dur*1000-40))); };
    A.play();
    // An ad or a blocked autoplay: keep waiting for the video to really start, but offer a manual tap.
    timers.push(setTimeout(()=>{ if(!started && state==="listen") set("tap", o.live?"برای پخش «ادامه» را بزن":"منتظر پخش… اگر تبلیغ YouTube پخش می‌شود صبر کن؛ اگر چیزی پخش نمی‌شود «ادامه» را بزن"); }, 2500));
    function stop(){ const t=A.now(); if(t!=null && t < e-0.5){ timers.push(setTimeout(stop, 200)); return; } A.pause(); turn(e-s); }
  }
  function live(){   // file without subtitles: play until the next pause in the speech
    clear(); lockScreen(); count();
    const start=A.now(); let sp=0, sil=0, began=false, t0=0;
    set("listen","گوش کن…"); bar(0); A.rate(c.rate);
    A.playingCb=()=>{ if(began) return; began=true; t0=performance.now();
      tick=setInterval(()=>{
        if(o.ended && o.ended()){ clearInterval(tick); tick=null; if(A.now()-start>0.8) segs[i]=[start,A.now()]; set("done","فایل تمام شد ✓ — آفرین!"); bar(0); unlockScreen(); return; }
        const v=o.level(); const el=(performance.now()-t0)/1000*c.rate;
        if(v>o.thr()) { sp+=0.04; sil=0; } else sil+=0.04;
        if((sp>0.6 && el>1.2 && sil>=0.35) || el>=10){ clearInterval(tick); tick=null; A.pause(); const end=Math.max(start+0.5, A.now()-Math.min(sil,0.3)); segs[i]=[start,end]; count(); turn(end-start); }
      }, 40); };
    A.play();
  }
  function turn(len){
    const ms=Math.round((len*1.1+1.0)*1000);
    set("turn","نوبت تو — بلند تکرار کن 🎙"); bar(ms,"turn");
    timers.push(setTimeout(()=>{
      if(state!=="turn") return;
      if(c.mode==="auto"){ rep++; if(rep<c.reps) play(i); else { rep=0; play(i+1); } }
      else set("wait","«تکرار» یا «بعدی» را بزن");
    }, ms));
  }
  function pause(){ clear(); A.pause(); bar(0); set("paused","متوقف شد"); unlockScreen(); }
  root.querySelectorAll("[data-sh]").forEach(b=>b.addEventListener("click",()=>{
    const a=b.dataset.sh; rep=0;
    if(o.onUserStart) o.onUserStart();
    if(a==="prev") play(i-1);
    else if(a==="next") play(i+1);
    else if(a==="repeat") play(Math.min(i, segs.length-1));
    else if(state==="listen"||state==="turn") pause();
    else play(state==="done"?0:(o.live && i>=segs.length ? i : i));
  }));
  const pick=(sel,key,val)=>root.querySelectorAll(sel).forEach(b=>b.addEventListener("click",()=>{ c[key]=val(b); save(); root.querySelectorAll(sel).forEach(x=>x.classList.toggle("on", x===b)); }));
  pick("[data-shmode]","mode",b=>b.dataset.shmode); pick("[data-shreps]","reps",b=>+b.dataset.shreps); pick("[data-shrate]","rate",b=>+b.dataset.shrate);
  const cc=$q("[data-shcc]"); if(cc) cc.addEventListener("click",()=>{ c.cc=!c.cc; save(); cc.classList.toggle("on",c.cc); A.captions(c.cc); });
  const tx=$q("[data-shtext]"); if(tx) tx.addEventListener("click",()=>{ c.text=!c.text; save(); tx.classList.toggle("on",c.text); if(textEl) textEl.hidden=!c.text; });
  count(); set("idle", o.live?"آماده — از نقطه‌ای که ویدیو هست شروع می‌شود":"آماده");
  return { pause, destroy:()=>{ clear(); unlockScreen(); A.destroy(); }, setSegs:(n,t)=>{ segs=n; texts=t||null; i=0; count(); } };
}
/* A — the session's own video */
async function startSessionShadow(box){
  const n=+box.dataset.shadow, s=SESSIONS[n], sh=s.li.sh;
  if(SH.cur){ SH.cur.destroy(); SH.cur=null; }
  ST.shadowPos=ST.shadowPos||{};
  const start=Math.min(ST.shadowPos[n]||0, sh.segs.length-1);
  box.innerHTML=`<div class="sh-video"><div id="shv-${n}"></div></div>${shadowUI({yt:true})}<p class="small muted">${start?`از جملهٔ ${fa(start+1)} ادامه می‌دهی (جای قبلی‌ات).`:""} ویدیو بعد از هر جمله خودکار می‌ایستد؛ در «نوبت تو» همان جمله را با همان ریتم و لحن بلند بگو.</p>`;
  const label=box.querySelector(".sh-label"); label.textContent="در حال بارگذاری ویدیو…";
  try{
    const A=await ytAdapter(box.querySelector(`#shv-${n}`), s.li.yt, sh.segs[start][0]);
    if(!box.isConnected){ A.destroy(); return; }
    SH.cur=makeShadow(box, A, {segs:sh.segs, start, onIndex:k=>{ ST.shadowPos[n]=k; save(); }});
  }catch(e){ label.textContent="ویدیو بارگذاری نشد. اتصال اینترنت را چک کن و دوباره امتحان کن."; }
}
/* B — the user's own file (+ optional .srt / .vtt) */
const SHF = { url:null, media:null, ctx:null, an:null, buf:null, floor:0.01, levels:[], segs:null, texts:null, name:"" };
function parseSubs(txt){
  const t=String(txt).replace(/\r/g,""), cues=[];
  const re=/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s*-->\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})[^\n]*\n([\s\S]*?)(?=\n\s*\n|$)/g;
  const sec=(h,m,s,ms)=>(+h||0)*3600+(+m)*60+(+s)+(+(ms+"00").slice(0,3))/1000;
  let m; while((m=re.exec(t))){
    const text=m[9].replace(/<[^>]+>|\{[^}]+\}/g,"").replace(/\n/g," ").replace(/^-\s*/,"").trim();
    if(!text || /^[\[\(♪].*[\]\)♪]$/.test(text)) continue;
    cues.push([sec(m[1],m[2],m[3],m[4]), sec(m[5],m[6],m[7],m[8]), text]);
  }
  const segs=[], texts=[]; let cur=null;
  for(const [s,e,x] of cues){
    if(cur && s-cur[1]>1.5){ segs.push([cur[0],cur[1]]); texts.push(cur[2]); cur=null; }
    if(!cur) cur=[s,e,x]; else { cur[1]=e; cur[2]+=" "+x; }
    if(/[.?!]["')\]]*$/.test(cur[2]) || cur[1]-cur[0]>=8){ segs.push([cur[0],cur[1]]); texts.push(cur[2]); cur=null; }
  }
  if(cur){ segs.push([cur[0],cur[1]]); texts.push(cur[2]); }
  const out=segs.map(([s,e])=>[Math.max(0,s-0.1), e+0.15]);
  for(let k=1;k<out.length;k++) if(out[k][0]<out[k-1][1]) out[k][0]=out[k-1][1];   // no overlap between neighbours
  return {segs:out, texts};
}
function shfLevel(){
  if(!SHF.an) return 0;
  SHF.an.getFloatTimeDomainData(SHF.buf); let s=0; for(let k=0;k<SHF.buf.length;k++) s+=SHF.buf[k]*SHF.buf[k];
  const v=Math.sqrt(s/SHF.buf.length); SHF.levels.push(v); if(SHF.levels.length>300) SHF.levels.shift(); return v;
}
function shfThr(){ const a=[...SHF.levels].sort((x,y)=>x-y); const floor=a.length>20?a[Math.floor(a.length*0.1)]:0.005; return Math.max(floor*2.2, floor+0.006, 0.006); }
function shfBuild(){
  const host=document.getElementById("shf-player"); if(!host || !SHF.media) return;
  if(SH.cur){ SH.cur.destroy(); SH.cur=null; }
  const hasText=!!(SHF.texts&&SHF.texts.length);
  host.querySelector(".sh-mount").innerHTML=shadowUI({hasText});
  const A=mediaAdapter(SHF.media);
  const pos=((ST.shadowFiles||{})[SHF.name])||0;
  let start=0; if(SHF.segs){ const k=SHF.segs.findIndex(x=>x[1]>pos); start=k<0?0:k; } else if(pos) SHF.media.currentTime=pos;
  SH.cur=makeShadow(host.querySelector(".sh-mount"), A, { segs:SHF.segs||[], texts:SHF.texts, start, live:!SHF.segs, level:shfLevel, thr:shfThr, ended:()=>SHF.media.ended,
    onUserStart:()=>{ if(!SHF.segs){ shfEnsureAudio(); try{ if(SHF.ctx && SHF.ctx.state!=="running") SHF.ctx.resume(); }catch(e){} } },
    onIndex:k=>{ ST.shadowFiles=ST.shadowFiles||{}; const seg=(SHF.segs||[])[k]; ST.shadowFiles[SHF.name]=seg?seg[0]:SHF.media.currentTime; save(); } });
  const info=document.getElementById("shf-info");
  if(info) info.innerHTML=`<b class="en">${esc(SHF.name)}</b> · ${SHF.segs?`${fa(SHF.segs.length)} جمله از روی زیرنویس`:"بدون زیرنویس: جمله‌ها از روی مکث‌های صدا پیدا می‌شوند"}`;
}
function shfEnsureAudio(){
  if(SHF.ctx || !SHF.media) return;
  try{ const AC=window.AudioContext||window.webkitAudioContext; SHF.ctx=new AC(); const src=SHF.ctx.createMediaElementSource(SHF.media);
    SHF.an=SHF.ctx.createAnalyser(); SHF.an.fftSize=1024; SHF.buf=new Float32Array(SHF.an.fftSize); src.connect(SHF.an); SHF.an.connect(SHF.ctx.destination); }catch(e){ SHF.ctx=null; SHF.an=null; }
}
function shfPickMedia(file){
  if(SH.cur){ SH.cur.destroy(); SH.cur=null; }
  if(SHF.url) URL.revokeObjectURL(SHF.url);
  if(SHF.ctx){ try{ SHF.ctx.close(); }catch(e){} SHF.ctx=null; SHF.an=null; }
  SHF.url=URL.createObjectURL(file); SHF.name=file.name; SHF.levels=[]; SHF.segs=null; SHF.texts=null;
  shfMount();
}
function shfMount(){
  const host=document.getElementById("shf-player"); if(!host || !SHF.url) return;
  if(SHF.ctx){ try{ SHF.ctx.close(); }catch(e){} SHF.ctx=null; SHF.an=null; }
  host.innerHTML=`<div class="sh-video file"><video playsinline controls preload="metadata" src="${SHF.url}"></video></div><div class="sh-mount"></div><p class="small muted">برای شروع از وسط فیلم، اول با نوار خود ویدیو به همان نقطه برو و بعد «شروع» را بزن.</p>`;
  SHF.media=host.querySelector("video");
  shfBuild();
}
async function shfPickSubs(file){
  const info=document.getElementById("shf-info");
  try{ const r=parseSubs(await file.text()); if(!r.segs.length) throw 0; SHF.segs=r.segs; SHF.texts=r.texts; if(SHF.media) shfBuild(); else if(info) info.textContent=`زیرنویس خوانده شد (${fa(r.segs.length)} جمله). حالا فیلم یا صدا را انتخاب کن.`; }
  catch(e){ if(info) info.textContent="این فایل زیرنویس خوانده نشد؛ فقط فایل‌های srt یا vtt انگلیسی."; }
}
function renderShadowFile(){
  return `<div class="doc" style="margin-top:24px">
  <h1>Shadowing با فایل خودت</h1>
  <p>یک فیلم، قسمتی از سریال یا پادکست انگلیسی که روی گوشی داری را انتخاب کن. برنامه آن را جمله‌به‌جمله پخش می‌کند، بعد از هر جمله می‌ایستد تا تکرار کنی و بعد سراغ جملهٔ بعد می‌رود. فایل از گوشی بیرون نمی‌رود و بدون اینترنت کار می‌کند.</p>
  <div class="card"><div class="row"><label class="btn pri" for="shf-media">انتخاب فیلم یا صدا</label><input type="file" id="shf-media" accept="video/*,audio/*" hidden><label class="btn" for="shf-sub">زیرنویس انگلیسی (اختیاری: srt / vtt)</label><input type="file" id="shf-sub" accept=".srt,.vtt" hidden></div>
  <p class="small muted" id="shf-info">${SHF.name?`<b class="en">${esc(SHF.name)}</b>`:"هنوز فایلی انتخاب نشده."}</p></div>
  <div id="shf-player"></div>
  <div class="how"><b>نکته‌ها:</b><ul><li><b>با زیرنویس</b> جمله‌ها دقیق‌اند و متن هر جمله هم نمایش داده می‌شود. بدون زیرنویس، برنامه جمله‌ها را از روی مکث‌های صدا پیدا می‌کند؛ در صحنه‌هایی که موسیقی زمینه دارد ممکن است جمله‌ها را بلندتر ببُرد (حداکثر ۱۰ ثانیه).</li><li>صحنه‌های گفتگوی آرام (سریال‌های کاری، مصاحبه، پادکست) برای Shadowing بهترند تا صحنه‌های پرسروصدا.</li><li>برنامه جای آخرت را برای هر فایل (با همان اسم) به خاطر می‌سپارد.</li></ul></div>
  </div>`;
}
