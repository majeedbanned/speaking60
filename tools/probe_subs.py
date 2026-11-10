import json, subprocess, sys, pathlib
HERE = pathlib.Path(__file__).parent
def info(vid):
    r = subprocess.run([str(HERE/".venv/bin/yt-dlp"), "--js-runtimes", "node", "-J", "--skip-download", "https://www.youtube.com/watch?v="+vid], capture_output=True, text=True)
    return json.loads(r.stdout) if r.stdout.strip() else None
if __name__ == "__main__":
    for vid in sys.argv[1:]:
        d = info(vid)
        if not d: print(vid, "NO INFO"); continue
        man = [k for k in (d.get("subtitles") or {}) if k.startswith("en")]
        auto = [k for k in (d.get("automatic_captions") or {}) if k in ("en","en-US","en-GB","en-orig")]
        print(vid, int(d.get("duration") or 0), "manual:", man, "auto:", auto, flush=True)
