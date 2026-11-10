"""Search YouTube (no API key) and return (videoId, title, channel, length) tuples."""
import json, re, urllib.request, urllib.parse
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"

def search(q):
    url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(q)
    html = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"}), timeout=25).read().decode("utf8", "ignore")
    data = json.loads(re.search(r"var ytInitialData = (\{.*?\});</script>", html).group(1))
    out = []
    def walk(o):
        if isinstance(o, dict):
            if "videoRenderer" in o:
                v = o["videoRenderer"]
                t = "".join(r.get("text", "") for r in v.get("title", {}).get("runs", []))
                ch = "".join(r.get("text", "") for r in v.get("ownerText", {}).get("runs", []))
                out.append((v["videoId"], t, ch, v.get("lengthText", {}).get("simpleText", "")))
            for x in o.values(): walk(x)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(data)
    return out

def oembed(video_id):
    u = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote("https://www.youtube.com/watch?v=" + video_id)
    return json.load(urllib.request.urlopen(u, timeout=20))
