#!/usr/bin/env python3
"""Assemble index.html from src/. Run after editing anything in src/: python3 build.py"""
import json, pathlib
R = pathlib.Path(__file__).parent
src = R / "src"
sessions = json.loads((src / "sessions.json").read_text(encoding="utf8"))
data = "const SESSIONS = [];\nfunction S(o){ SESSIONS[o.n] = o; }\n" + "\n".join("S(" + json.dumps(s, ensure_ascii=False) + ");" for s in sessions)
html = (src / "shell.html").read_text(encoding="utf8")
for marker, text in [("/*STYLE*/", (src / "style.css").read_text(encoding="utf8")), ("/*DATA*/", data),
                     ("/*MODULES*/", (src / "modules.js").read_text(encoding="utf8")), ("/*APP*/", (src / "app.js").read_text(encoding="utf8"))]:
    assert marker in html, marker
    html = html.replace(marker, text, 1)
(R / "index.html").write_text(html, encoding="utf8")
print("index.html built:", len(html), "chars,", len(sessions), "sessions")
