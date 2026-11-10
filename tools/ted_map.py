"""Map every TED session to the official TED upload on YouTube (needed: ted.com's player can't be scripted)."""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from yt_search import search
S = json.load(open(pathlib.Path(__file__).parent.parent / "src/sessions.json", encoding="utf8"))
out = {}
for s in S:
    if s.get("review") or "ted.com" not in s["li"]["u"]: continue
    title = s["li"]["t"].split(" (")[0].replace("—", "")
    res = search(title + " TED")
    ted = [r for r in res if r[2].strip() == "TED"]
    out[s["n"]] = ted[0] if ted else None
    print(s["n"], "|", title, "=>", out[s["n"]], flush=True)
json.dump(out, open(pathlib.Path(__file__).parent / "ted_map.json", "w"), ensure_ascii=False, indent=1)
