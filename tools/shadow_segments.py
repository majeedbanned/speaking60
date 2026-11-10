"""Build sentence-by-sentence shadowing timings for every session video.

For each session it finds the YouTube video, then:
  1. if the video has real (manual) English captions -> sentences from the captions (cues merged up to . ? !)
  2. otherwise -> speech chunks from the audio's silences (ffmpeg silencedetect), long chunks split at
     word boundaries from YouTube's automatic captions when available.
Only start/end times are written to src/sessions.json (li.yt, li.sh) — never caption text or audio.

Usage:  tools/.venv/bin/python tools/shadow_segments.py [session numbers...]
Needs:  tools/.venv with yt-dlp, ffmpeg on PATH, node (yt-dlp JS runtime). Results are cached in tools/cache/.
"""
import json, re, subprocess, sys, pathlib, time, urllib.request, urllib.error

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent
CACHE = HERE / "cache"; CACHE.mkdir(exist_ok=True)
YTDLP = str(HERE / ".venv/bin/yt-dlp")

# Official TED / TEDx uploads for sessions whose talk lives on ted.com (ted.com's player can't be scripted).
TED_YT = {2:"arj7oStGLkU", 4:"cSohjlYQI2A", 5:"SciUx65Q94U", 6:"8_zk2DpgLCs", 7:"Zo62S0ulqhA", 8:"NHopJHSlVo4",
  13:"0MD4Ymjyc2I", 17:"FmpIMt95ndU", 21:"QleRgTBMX88", 23:"VO6XEQIsCoM", 24:"qp0HIF3SfI4", 25:"6Af6b_wyiwI",
  26:"jdpIKXLLYYM", 31:"K5wCfYujRdE", 32:"y3jYVe1RGaU", 33:"H0_yKBitO8M", 34:"3boKz0Exros", 35:"N7wF2AdVy2Q",
  36:"iueVZJVEmEs", 37:"fxbCHn6gE3U", 39:"-FOCpMAww28", 41:"KxDwieKpawg", 42:"-vZXgApsPCQ", 43:"F2hc2FLOdhI",
  46:"H14bBuluwB8", 49:"3E7hkPZ-HTk", 51:"1nYFpuc2Umk", 52:"XNbaR54Gpj4", 58:"8KkKuTCFvzI", 59:"iG9CE55wbtY"}

def video_id(li, n):
    m = re.search(r"[?&]v=([\w-]{11})", li["u"])
    return m.group(1) if m else TED_YT.get(n)

def info(vid):
    f = CACHE / f"{vid}.info.json"
    if f.exists(): return json.loads(f.read_text())
    r = subprocess.run([YTDLP, "--js-runtimes", "node", "-J", "--skip-download", "https://www.youtube.com/watch?v=" + vid], capture_output=True, text=True)
    d = json.loads(r.stdout)
    keep = {"duration": d.get("duration"), "subtitles": d.get("subtitles") or {}, "automatic_captions": d.get("automatic_captions") or {}}
    f.write_text(json.dumps(keep)); return keep

BLOCKED = False
FORCED = 0        # chunks that had to be cut without a pause (lower quality); printed per video   # set after YouTube answers 429 once: skip further caption downloads this run

def fetch_json(url, cache_file):
    global BLOCKED
    if cache_file.exists(): return json.loads(cache_file.read_text())
    if BLOCKED: return None
    for attempt in range(2):
        try:
            data = json.load(urllib.request.urlopen(url, timeout=30))
            cache_file.write_text(json.dumps(data)); time.sleep(2)
            return data
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            if attempt == 1: print("  captions blocked by YouTube (429) — using the audio from now on", flush=True); BLOCKED = True; return None
            print("  429 from YouTube, waiting 20s", flush=True); time.sleep(20)

def json3(tracks, langs, cache_key):
    for lang in langs:
        for t in tracks.get(lang, []):
            if t.get("ext") == "json3":
                return fetch_json(t["url"], CACHE / f"{cache_key}.{lang}.json3")
    return None

def range_end(li, duration):
    seg = li.get("seg", "")
    if "کل ویدیو" in seg: return duration
    if "۵ دقیقه" in seg: return min(300, duration)
    return min(180, duration)   # TED default: the first 3 minutes

NOISE = re.compile(r"^[\[\(♪].*[\]\)♪]$|^♪+$")

def from_captions(data, end):
    cues = []
    for ev in data.get("events", []):
        if "segs" not in ev: continue
        txt = "".join(s.get("utf8", "") for s in ev["segs"]).replace("\n", " ").strip()
        if not txt or NOISE.match(txt): continue
        s = ev["tStartMs"] / 1000; e = s + ev.get("dDurationMs", 0) / 1000
        if s >= end: break
        cues.append([s, e, txt])
    sents, cur = [], None
    for s, e, t in cues:
        if cur and (s - cur[1] > 1.5): sents.append(cur); cur = None
        if cur is None: cur = [s, e, t, [s]]
        else: cur[1] = e; cur[2] += " " + t; cur[3].append(s)
        if re.search(r"[.?!][\"')\]]*$", cur[2]) or cur[1] - cur[0] >= 9: sents.append(cur); cur = None
    if cur: sents.append(cur)
    out = []
    for s, e, t, starts in sents:
        if e - s > 9 and len(starts) > 1:          # split long sentences at the cue boundary nearest the middle
            mid = min(starts[1:], key=lambda x: abs(x - (s + e) / 2)); out += [[s, mid], [mid, e]]
        else: out.append([s, e])
    return out

def audio(vid, end):
    f = CACHE / f"{vid}.m4a"
    if not f.exists():
        subprocess.run([YTDLP, "--js-runtimes", "node", "-q", "-f", "bestaudio", "--download-sections", f"*0-{int(end) + 2}",
                        "-x", "--audio-format", "m4a", "-o", str(CACHE / f"{vid}.%(ext)s"), "https://www.youtube.com/watch?v=" + vid], check=True)
    return f

def speech_intervals(path, end):
    """Pick the quietest silence threshold that still finds real pauses (noisy rooms need a higher one)."""
    best = None
    for db in (-33, -29, -25, -21, -18):
        iv = _intervals(path, end, db)
        lens = sorted(e - s for s, e in iv)
        median = lens[len(lens) // 2] if lens else end
        best = iv
        if len(iv) >= end / 10 and median <= 6: break
    return best

def _intervals(path, end, db):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", f"silencedetect=noise={db}dB:d=0.3", "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    out, t = [], 0.0
    for i, s in enumerate(starts):
        if s - t >= 0.25: out.append([t, min(s, end)])
        t = ends[i] if i < len(ends) else end
        if t >= end: break
    if t < end - 0.25: out.append([t, end])
    return [x for x in out if x[0] < end]

def words(data):
    w = []
    for ev in (data or {}).get("events", []):
        for sg in ev.get("segs", []) or []:
            if sg.get("utf8", "").strip(): w.append((ev["tStartMs"] + sg.get("tOffsetMs", 0)) / 1000)
    return sorted(w)

def from_audio(iv, wstarts):
    segs, cur = [], None
    for s, e in iv:
        if cur is None: cur = [s, e]; continue
        if (cur[1] - cur[0] < 1.2) or (s - cur[1] < 0.45 and e - cur[0] <= 5.5): cur[1] = e
        else: segs.append(cur); cur = [s, e]
    if cur: segs.append(cur)
    out = []; global FORCED
    for s, e in segs:
        if e - s <= 9: out.append([s, e]); continue
        FORCED += 1
        parts = max(2, round((e - s) / 5.5)); cuts = [s + (e - s) * k / parts for k in range(1, parts)]
        inside = [w for w in wstarts if s + 1 < w < e - 1]
        if inside: cuts = sorted({min(inside, key=lambda w: abs(w - c)) for c in cuts})
        edges = [s] + cuts + [e]
        out += [[edges[k], edges[k + 1]] for k in range(len(edges) - 1)]
    return out

def finish(segs, end):
    clean = []
    for s, e in segs:
        s = max(0.0, s - 0.1); e = min(end + 4, e + 0.2)
        if clean and s < clean[-1][1]: s = clean[-1][1]
        if e - s >= 0.6: clean.append([round(s, 2), round(e, 2)])
    return clean

def main(only):
    path = ROOT / "src/sessions.json"
    S = json.loads(path.read_text(encoding="utf8"))
    for s in S:
        if s.get("review") or (only and s["n"] not in only): continue
        li = s["li"]; vid = video_id(li, s["n"])
        d = info(vid); end = range_end(li, d["duration"])
        man = json3(d["subtitles"], [k for k in d["subtitles"] if k.startswith("en")], vid + ".man")
        if man:
            segs, src = from_captions(man, end), "captions"
        else:
            auto = json3(d["automatic_captions"], ["en-orig", "en", "en-GB", "en-US"], vid + ".auto")
            segs, src = from_audio(speech_intervals(audio(vid, end), end), words(auto)), "audio"
        global FORCED
        segs = finish(segs, end)
        li["yt"] = vid; li["sh"] = {"src": src, "segs": segs}
        lens = [e - st for st, e in segs]
        print(f"s{s['n']:>2} {vid} {src:8} end={int(end):>3}s segs={len(segs):>3} avg={sum(lens)/max(1,len(lens)):.1f}s max={max(lens or [0]):.1f}s forced={FORCED}", flush=True); FORCED = 0
        path.write_text(json.dumps(S, ensure_ascii=False, indent=1), encoding="utf8")   # save after every session

if __name__ == "__main__":
    main({int(x) for x in sys.argv[1:]})
