"""Port 3: Waitlist cleanup, drag rail, per player expiring passes, dark default wrapper."""
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

def cut_fn(name):
    """Remove a top level function by brace matching."""
    global s
    i = s.find("\nfunction " + name + "(")
    if i < 0:
        fails.append("cut_fn missing " + name); return
    j = s.find("{", i)
    depth, k = 0, j
    while k < len(s):
        if s[k] == "{": depth += 1
        elif s[k] == "}":
            depth -= 1
            if depth == 0: break
        k += 1
    s = s[:i] + s[k+1:]

# ================================================== 1. waitlist leftovers
cut_fn("scrTokOfferExpired")
rep('  { key:"waitlist", label:"Waitlist promotion" },\n', "", 1, "scenario entry")
rep('  ["/waitlist/w1","pub-waitlist-join, Join the waitlist"],\n', "", 1, "routelist wl")
rep('  ["/t/offer/expired","tok-offer, Waitlist offer, expired"], ["/t/name/expired","tok-name, Player name invite, expired"]',
    '  ["/t/name/expired","tok-name, Player name invite, expired"]', 1, "routelist offer")
rep("""    (S.waitlist.length ? '<button class="h" data-action="promote" data-i="0">Promote first waitlist entrant</button>' : "") +\n""", "", 1, "promote btn")
rep("""    Object.keys(S.offers).map(function(t){ return '<a class="h" style="display:block;text-align:center;text-decoration:none" href="#/t/offer/' + esc(t) + '" data-action="closesheet">Waitlist offer, active</a>'; }).join("") +
    '<a class="h" style="display:block;text-align:center;text-decoration:none" href="#/t/offer/expired" data-action="closesheet">Waitlist offer, expired</a>' +
    '<a class="h" style="display:block;text-align:center;text-decoration:none" href="#/t/offer/revoked" data-action="closesheet">Waitlist offer, revoked</a>' +\n""",
    "", 1, "offer demo links")
m = re.search(r'    case "waitlist":\n.*?go\("/waitlist/w1"\); break;\n', s, re.S)
if m: s = s.replace(m.group(0), "")
else: fails.append("scenario case waitlist")
m = re.search(r"  html \+= '<div class=\"section\"><h2 class=\"sec\">Waitlist</h2>';\n.*?\n  html \+= \"</div>\";\n", s, re.S)
if m: s = s.replace(m.group(0), "")
else: fails.append("staff waitlist section")

# ================================================== 2. drag rail
OLD_TIMES = re.search(
    r"  /\* times \*/\n  html \+= '<div class=\"section\"><h2 class=\"sec\" id=\"lbl-time\">Choose a start time</h2>';\n.*?\n  html \+= \"</div>\";\n\n  /\* durations \*/\n.*?A court is assigned automatically when your hold is created\. You do not choose a court number\.</p></div>';\n",
    s, re.S)
if not OLD_TIMES:
    fails.append("could not locate times + durations block")
else:
    NEW_TIMES = r"""  /* times: one drag rail, start and length in a single gesture */
  html += '<div class="section"><h2 class="sec" id="lbl-time">Choose your time</h2>';
  if (availOff){
    html += '<div class="banner">' + icon("alert") + "<div><p><strong>Live availability could not be confirmed.</strong></p>" +
      '<p class="legal">Holding a time is disabled until availability can be checked again.</p>' +
      '<p style="margin-top:var(--s2)"><button class="btn btn--secondary btn--sm" data-action="retry">Retry</button></p></div></div>';
  } else if (closedDay){
    html += '<div class="card"><p><strong>The venue is closed on ' + esc(dayLabel(baseDay(d.dayIndex))) + ".</strong></p>" +
      '<p class="legal" style="margin-top:var(--s2)">Nearest dates with availability:</p>' +
      '<div class="seg" style="margin-top:var(--s3)"><button data-action="pickday" data-i="2">' + esc(DSHORT.format(new Date(baseDay(2))) + " " + DNUM.format(new Date(baseDay(2)))) + "</button>" +
      '<button data-action="pickday" data-i="4">' + esc(DSHORT.format(new Date(baseDay(4))) + " " + DNUM.format(new Date(baseDay(4)))) + "</button></div></div>";
  } else if (S.injected === "Loading availability"){
    html += '<ul class="rows">' + [1,2,3,4].map(function(){ return '<li class="skel">Loading available times</li>'; }).join("") + "</ul>";
  } else {
    html += '<div class="railwrap">' +
      '<p class="railhint">' + icon("clock") + '<span id="railhint">Tap an hour. Hold and drag for longer.</span></p>' +
      '<div class="rail" id="rail" role="group" aria-labelledby="lbl-time">';
    RAIL_HOURS.forEach(function(h, idx){
      const st = railState(h);
      html += '<button type="button" class="hr" data-i="' + idx + '" data-fk="hr' + idx + '"' +
        (st === "unavailable" ? ' data-off="1" aria-disabled="true"' : "") +
        ' aria-label="' + esc(hourLabel(h) + (st === "unavailable" ? ", taken" : st === "limited" ? ", open, almost gone" : ", open")) + '">' +
        '<span class="hr__t">' + esc(hourLabel(h)) + "</span>" +
        '<span class="hr__s">' + (st === "unavailable" ? "Taken" : st === "limited" ? "Almost gone" : "Open") + "</span></button>";
    });
    html += '<div class="sel" id="sel" hidden>' +
      '<button type="button" class="hnd hnd--t" id="hnd-t" aria-label="Move the start time. Use the up and down arrow keys."></button>' +
      '<span class="sel__t" id="sel-t"></span><span class="sel__s" id="sel-s"></span>' +
      '<button type="button" class="hnd hnd--b" id="hnd-b" aria-label="Move the end time. Use the up and down arrow keys."></button>' +
      "</div></div></div>";
    html += '<p class="legal" style="margin-top:var(--s3)">Up to ' + MAX_HOURS + ' hours. ' + sampleMark("Sample durations") + " Allowed durations are not approved yet.</p>";
    html += '<p class="legal">A court is assigned automatically when your hold is created. You do not choose a court number.</p>';
  }
  html += "</div>";

  /* group size, because every player gets their own pass */
  html += '<div class="section"><h2 class="sec" id="lbl-pax">How many playing?</h2>' +
    '<p class="legal" style="margin-top:var(--s2)">Each player gets their own pass.</p>' +
    '<div class="stepper" style="margin-top:var(--s4)" role="group" aria-labelledby="lbl-pax">' +
    '<button data-action="pax" data-d="-1" data-fk="paxminus" aria-label="One fewer player"' + (d.pax <= 1 ? " disabled" : "") + ">" + icon("minus") + "</button>" +
    '<output aria-live="polite">' + d.pax + " " + plural(d.pax,"player","players") + "</output>" +
    '<button data-action="pax" data-d="1" data-fk="paxplus" aria-label="One more player"' + (d.pax >= 12 ? " disabled" : "") + ">" + icon("plus") + "</button>" +
    "</div></div>";
"""
    s = s.replace(OLD_TIMES.group(0), NEW_TIMES)

# rail support code, inserted before scrCourtWhen
RAIL_LIB = r"""
/* ---------- hour rail model ---------- */
var MAX_HOURS = 4;
var RAIL_HOURS = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
function hourLabel(h){ const ap = h >= 12 ? "PM" : "AM"; let dd = h % 12; if (dd === 0) dd = 12; return dd + ":00 " + ap; }
function railState(h){
  const label = hourLabel(h);
  for (let i=0;i<COURT_TIMES.length;i++){ if (COURT_TIMES[i].t === label) return COURT_TIMES[i].state; }
  return "available";
}
function hourIndexOfLabel(label){
  for (let i=0;i<RAIL_HOURS.length;i++){ if (hourLabel(RAIL_HOURS[i]) === label) return i; }
  return -1;
}
function mountRail(){
  const rail = document.getElementById("rail");
  if (!rail) return;
  const sel = document.getElementById("sel");
  const selT = document.getElementById("sel-t");
  const selS = document.getElementById("sel-s");
  const hint = document.getElementById("railhint");
  const d = S.draft;
  const first = rail.querySelector(".hr");
  const ROW = first ? first.offsetHeight || 62 : 62;
  let mode = null, anchor = 0, holdT = null, downY = 0, downX = 0, pid = null, moved = false;

  function isOpen(i){ return railState(RAIL_HOURS[i]) !== "unavailable"; }
  function startIdx(){ return d.time ? hourIndexOfLabel(d.time) : -1; }
  function clampRun(a, b){
    let lo = Math.min(a,b), hi = Math.max(a,b), i;
    if (hi - lo + 1 > MAX_HOURS){ if (b >= a) hi = lo + MAX_HOURS - 1; else lo = hi - MAX_HOURS + 1; }
    if (b >= a){ for (i=a;i<=hi;i++){ if (!isOpen(i)){ hi = i - 1; break; } } lo = a; }
    else { for (i=a;i>=lo;i--){ if (!isOpen(i)){ lo = i + 1; break; } } hi = a; }
    if (hi < lo) hi = lo;
    return { s:lo, l:Math.max(1, hi - lo + 1) };
  }
  function paint(dragging){
    const si = startIdx();
    if (si < 0){ sel.hidden = true; return; }
    sel.hidden = false;
    sel.classList.toggle("dragging", !!dragging);
    sel.style.top = (si * ROW + 4) + "px";
    sel.style.height = (d.duration * ROW - 8) + "px";
    selT.textContent = hourLabel(RAIL_HOURS[si]) + " to " + hourLabel(RAIL_HOURS[si] + d.duration);
    selS.textContent = d.duration + " " + plural(d.duration,"hour","hours") + ", " + peso(RATE_COURT * d.duration);
    if (hint) hint.textContent = "Drag the white bars to change it";
  }
  function setRun(run){ d.time = hourLabel(RAIL_HOURS[run.s]); d.duration = run.l; }
  function idxAt(y){
    const r = rail.getBoundingClientRect();
    return Math.max(0, Math.min(RAIL_HOURS.length - 1, Math.floor((y - r.top) / ROW)));
  }
  function commit(dragging){
    paint(dragging);
    if (!dragging){ S.inPlace = true; render(); }
  }

  rail.addEventListener("pointerdown", function(e){
    const hnd = e.target.closest(".hnd");
    downY = e.clientY; downX = e.clientX; moved = false; pid = e.pointerId;
    if (hnd){
      const si = startIdx(); if (si < 0) return;
      mode = hnd.id === "hnd-t" ? "top" : "bot";
      anchor = mode === "top" ? (si + d.duration - 1) : si;
      try { rail.setPointerCapture(pid); } catch(err){}
      e.preventDefault(); sel.classList.add("armed");
      return;
    }
    const i = idxAt(e.clientY);
    if (!isOpen(i)) return;
    holdT = setTimeout(function(){
      holdT = null;
      if (moved) return;
      mode = "new"; anchor = i; setRun({ s:i, l:1 });
      try { rail.setPointerCapture(pid); } catch(err){}
      sel.classList.add("armed");
      if (navigator.vibrate) navigator.vibrate(12);
      paint(true);
    }, 190);
  });
  rail.addEventListener("pointermove", function(e){
    if (holdT && (Math.abs(e.clientY - downY) > 9 || Math.abs(e.clientX - downX) > 9)){
      moved = true; clearTimeout(holdT); holdT = null;
    }
    if (!mode) return;
    e.preventDefault();
    setRun(clampRun(anchor, idxAt(e.clientY)));
    paint(true);
  }, { passive:false });
  function endDrag(){
    if (holdT){ clearTimeout(holdT); holdT = null; }
    if (!mode) return;
    mode = null; sel.classList.remove("armed"); commit(false);
  }
  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);

  /* Tap path, so the rail is fully usable without any drag. */
  rail.addEventListener("click", function(e){
    const hr = e.target.closest(".hr"); if (!hr || mode) return;
    const i = parseInt(hr.getAttribute("data-i"),10);
    if (!isOpen(i)) return;
    const si = startIdx();
    if (si >= 0 && i >= si && i < si + d.duration){
      if (d.duration > 1) d.duration -= 1;
      else { d.time = null; d.duration = 1; }
    } else if (si >= 0 && i === si + d.duration && d.duration < MAX_HOURS){
      d.duration += 1;
    } else {
      setRun({ s:i, l:1 });
    }
    S.refocus = "hr" + i;
    commit(false);
  });

  [["hnd-t","top"],["hnd-b","bot"]].forEach(function(pair){
    const el = document.getElementById(pair[0]);
    if (!el) return;
    el.addEventListener("keydown", function(e){
      const step = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
      if (!step) return;
      e.preventDefault();
      const si = startIdx(); if (si < 0) return;
      if (pair[1] === "top"){ anchor = si + d.duration - 1; setRun(clampRun(anchor, Math.max(0, si + step))); }
      else { anchor = si; setRun(clampRun(anchor, Math.min(RAIL_HOURS.length - 1, si + d.duration - 1 + step))); }
      S.refocus = null; commit(false);
      const again = document.getElementById(pair[0]); if (again) again.focus({ preventScroll:true });
    });
  });

  paint(false);
}
"""
rep("/* ---------- SCR pub-court-when ---------- */", RAIL_LIB + "\n/* ---------- SCR pub-court-when ---------- */", 1, "rail lib anchor")

# mount the rail from the court screen's view object
rep("""  return { id:"pub-court-when", shell:"task", title:"Reserve a Court: Date and time", html:html,
    back:{ label:"Back", to:"/" },""",
    """  return { id:"pub-court-when", shell:"task", title:"Reserve a Court: Date and time", html:html,
    back:{ label:"Back", to:"/" }, mount:mountRail,""",
    1, "court mount")

# dock label uses the rail state
rep("""      summary:{ label:peso(RATE_COURT) + " per court-hour", value:peso(total) },""",
    """      summary:{ label: ready ? (d.duration + " " + plural(d.duration,"hour","hours") + " at " + peso(RATE_COURT)) : "Nothing chosen yet", value:peso(total) },""",
    1, "court dock summary")

# draft gains pax
rep("""    product: null, dayIndex: 0, time: null, duration: 1,
    windowId: "w1", qty: 1,""",
    """    product: null, dayIndex: 0, time: null, duration: 1, pax: 4,
    windowId: "w1", qty: 1,""", 1, "draft pax")
s = s.replace('S.draft = { product:null, dayIndex:0, time:null, duration:1, windowId:"w1", qty:1,',
              'S.draft = { product:null, dayIndex:0, time:null, duration:1, pax:4, windowId:"w1", qty:1,')

# pax action
rep("""  pickday: function(el){""",
    """  pax: function(el){
    const n = Math.max(1, Math.min(12, S.draft.pax + parseInt(el.getAttribute("data-d"),10)));
    S.draft.pax = n; rerenderFrom(el);
  },
  pickday: function(el){""", 1, "pax action")

open(F, "w", encoding="utf-8").write(s)
print("port3 written", len(s))
if fails:
    print("FAILURES:")
    for f in fails: print("  ", f)
    sys.exit(1)
print("port3 ok")
