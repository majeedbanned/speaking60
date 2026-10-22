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
