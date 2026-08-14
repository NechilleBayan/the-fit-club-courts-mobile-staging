"""Port 5: Wrap as a complete document, dark by default, final copy sweeps."""
import re, sys

F = "/sessions/nice-intelligent-allen/mnt/outputs/v1-merged.html"
s = open(F, encoding="utf-8").read()
fails = []

# ---- copy sweeps
s = s.replace("PHP 350 per court-hour", "₱350 per hour")
s = s.replace("PHP 150 per player admission", "₱150 per player")
s = s.replace("PHP 350", "₱350").replace("PHP 150", "₱150").replace("PHP 0", "₱0")
s = re.sub(r"PHP (\d)", r"₱\1", s)
s = s.replace("Hours: To be confirmed", "Hours: 6AM to 11PM")

# ---- em dashes must not exist
if "—" in s or "–" in s:
    s = s.replace("—", ",").replace("–", ",")

# ---- wrap
if not s.lstrip().startswith("<!doctype"):
    head = """<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
"""
    s = head + s + "\n</body>\n</html>\n"
    # close head, open body just before the sprite
    s = s.replace('<svg id="sprite"', "</head>\n<body>\n<svg id=\"sprite\"", 1)
else:
    fails.append("already wrapped")

open(F, "w", encoding="utf-8").write(s)
print("port5 written", len(s))
if fails:
    for f in fails: print("  ", f)
    sys.exit(1)
print("port5 ok")
