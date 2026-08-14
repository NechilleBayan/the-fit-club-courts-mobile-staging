"""Port 6: Remove the last dead waitlist code and copy."""
import re, sys

F = "/sessions/nice-intelligent-allen/mnt/outputs/v1-merged.html"
s = open(F, encoding="utf-8").read()
fails = []

def rep(old, new, count=1, label=""):
    global s
    c = s.count(old)
    if c != count:
        fails.append("%s: expected %d got %d" % (label or old[:60], count, c))
        return
    s = s.replace(old, new)

rep('  waitlist:       { phrase:"Waitlist",            glyph:"list-pos",     cls:"chip chip--strong" },\n', "", 1, "chip key")
m = re.search(r"  waitlisted: \{\n    eyebrow:\"On the waitlist\", glyph:\"list-pos\", cls:\"plate plate--dotted2\"\n  \},\n", s)
if m: s = s.replace(m.group(0), "")
else: fails.append("plate key waitlisted")

# dead action handlers
for name in ["joinwl", "withdraw", "promote"]:
    m = re.search(r"\n  " + name + r": function\(.*?\n  \},", s, re.S)
    if m: s = s.replace(m.group(0), "")
    else: fails.append("handler " + name)

rep('"Directions and contact details","Current rates"', '"Directions and contact details","Prices"', 1, "current rates copy")

open(F, "w", encoding="utf-8").write(s)
print("port6 written", len(s))
if fails:
    for f in fails: print("  ", f)
    sys.exit(1)
print("port6 ok")
