"""Port 4: Per player expiring QR passes, replacing the single check-in code."""
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

# ============================================== 1. state
rep("  waitlist: [],\n", "  arrivalOpen: false,           // simulated arrival window, drives pass liveness\n", 1, "state arrivalOpen")
s = s.replace("S.waitlist = []; ", "S.arrivalOpen = false; ")

# ============================================== 2. passes on the order
rep("""    admissions: spec.admissions || [],""",
    """    admissions: spec.admissions || [],
    passes: buildPasses(spec.passCount || (spec.admissions || []).length || 1),""",
    1, "order passes")

PASS_LIB = r"""
/* ============================================================
   PASSES
   One per paid admission. The token rotates, so a screenshot
   handed to a stranger is worthless within a minute.
   ============================================================ */
var PASS_TTL = 60;
function passToken(){
  let t = "";
  for (let i=0;i<12;i++) t += "0123456789ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random()*33));
  return t;
}
function buildPasses(n){
  const out = [];
  for (let i=0;i<n;i++) out.push({ n:i+1, name:"", token:passToken(), usedAt:null, usedBy:null });
  return out;
}
function passesOf(o){
  if (!o.passes || !o.passes.length) o.passes = buildPasses(Math.max(1, o.admissions.length || 1));
  return o.passes;
}
/* A pass is only ever as true as the booking under it. */
function passState(o, p){
  const st = displayStatus(o);
  if (st.key !== "confirmed" && st.key !== "checked_in") return "none";
  if (p.usedAt) return "used";
  if (!S.arrivalOpen) return "dormant";
  return "live";
}
/* Sample matrix, deterministic from the token. Not a real encoder. */
function qrMatrix(seed){
  const N = 25;
  let h = 2166136261, i, j;
  for (i=0;i<seed.length;i++){ h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  function rnd(){ h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; }
  const g = [];
  for (i=0;i<N;i++){ g.push([]); for (j=0;j<N;j++) g[i].push(0); }
  function reserved(r,c){
    if (r < 8 && c < 8) return true;
    if (r < 8 && c >= N-8) return true;
    if (r >= N-8 && c < 8) return true;
    if (r === 6 || c === 6) return true;
    if (r >= N-9 && r <= N-5 && c >= N-9 && c <= N-5) return true;
    return false;
  }
  for (i=0;i<N;i++) for (j=0;j<N;j++) if (!reserved(i,j)) g[i][j] = rnd() > 0.5 ? 1 : 0;
  function finder(r,c){
    for (let a=0;a<7;a++) for (let b=0;b<7;b++){
      const edge = (a===0||a===6||b===0||b===6), core = (a>=2&&a<=4&&b>=2&&b<=4);
      g[r+a][c+b] = (edge||core) ? 1 : 0;
    }
  }
  finder(0,0); finder(0,N-7); finder(N-7,0);
  for (i=8;i<N-8;i++){ g[6][i] = i % 2 === 0 ? 1 : 0; g[i][6] = i % 2 === 0 ? 1 : 0; }
  for (i=0;i<5;i++) for (j=0;j<5;j++){
    const e = (i===0||i===4||j===0||j===4), c2 = (i===2&&j===2);
    g[N-9+i][N-9+j] = (e||c2) ? 1 : 0;
  }
  let path = "";
  for (i=0;i<N;i++) for (j=0;j<N;j++) if (g[i][j]) path += "M" + j + " " + i + "h1v1h-1z";
  return '<svg viewBox="0 0 ' + N + ' ' + N + '" shape-rendering="crispEdges" aria-hidden="true"><path fill="#141618" d="' + path + '"/></svg>';
}
function passChip(state){
  return state === "used" ? '<span class="chip chip--strong">' + icon("check-double") + "<span>Checked in</span></span>"
    : state === "live" ? '<span class="chip chip--strong">' + icon("ticket") + "<span>Ready to scan</span></span>"
    : '<span class="chip chip--quiet">' + icon("clock") + "<span>Opens later</span></span>";
}
function arrivalToggle(){
  return '<div class="card card--sunken hatch" style="margin-top:var(--s6);border:2px dashed var(--border-default)">' +
    '<p class="legal"><strong>Staging control.</strong> Passes stay dormant until the arrival window opens.</p>' +
    '<p style="margin-top:var(--s3)"><button class="btn btn--secondary btn--sm" data-action="arrival">' +
    (S.arrivalOpen ? "Close the arrival window" : "Open the arrival window") + "</button></p></div>";
}

/* ---------- SCR pub-passes ---------- */
function scrPasses(params){
  const code = params.code;
  let o = null;
  Object.keys(S.orders).forEach(function(k){ if (S.orders[k].bookingCode === code) o = S.orders[k]; });
  if (!o) return scrLink({});
  const st = displayStatus(o);
  if (st.key !== "confirmed" && st.key !== "checked_in"){
    let h = '<h1 class="screen">No passes yet</h1>';
    h += '<div class="section">' + plate(st.key,{ phrase:st.phrase,
      truth:["There is no confirmed booking on this order, so no pass exists."],
      meta:["Order reference " + o.bookingCode] }) + "</div>";
    return { id:"pub-passes", shell:"task", title:"No passes", html:h,
      back:{ label:"Back to booking", to:"/booking/" + encodeURIComponent(o.bookingCode) },
      dock:{ action:{ label:"Back to booking", action:"nav", to:"/booking/" + encodeURIComponent(o.bookingCode) } } };
  }
  const list = passesOf(o);
  let html = '<h1 class="screen">' + list.length + " " + plural(list.length,"pass","passes") + "</h1>";
  html += '<p class="lede" style="margin-top:var(--s3)">One per player. Send each player their own. Each pass refreshes every minute and works once.</p>';
  html += '<div class="section"><ul class="rows">' + list.map(function(p){
    const state = passState(o, p);
    return '<li><button class="row" data-action="nav" data-to="/booking/' + esc(encodeURIComponent(o.bookingCode)) + "/pass/" + p.n + '">' +
      icon("ticket") + '<span class="row__main"><span class="row__title">Pass ' + p.n + " of " + list.length + "</span>" +
      '<span class="row__sub">' + esc(p.name || "No name yet") + "</span></span>" + passChip(state) + icon("chev-r") + "</button></li>";
  }).join("") + "</ul></div>";

  html += '<div class="section"><h2 class="sec">If a scan fails</h2><div class="card">' +
    '<p class="code" style="margin-top:var(--s2)">' + esc(o.bookingCode) + "</p>" +
    '<p class="legal" style="margin-top:var(--s3)">Read out this booking code and the organizer name. Your details are not inside the pass.</p></div></div>';
  html += arrivalToggle();
  return { id:"pub-passes", shell:"task", title:"Passes", html:html,
    back:{ label:"Back to booking", to:"/booking/" + encodeURIComponent(o.bookingCode) },
    dock:null };
}

/* ---------- SCR pub-pass ---------- */
function scrPass(params){
  const code = params.code;
  let o = null;
  Object.keys(S.orders).forEach(function(k){ if (S.orders[k].bookingCode === code) o = S.orders[k]; });
  if (!o) return scrLink({});
  const list = passesOf(o);
  const p = list[parseInt(params.n,10) - 1];
  if (!p) return scrLink({});
  const state = passState(o, p);
  if (state === "none") return scrPasses({ code:code });

  let html = '<h1 class="screen">Pass ' + p.n + " of " + list.length + "</h1>";
  html += '<p class="lede" style="margin-top:var(--s3)">' + esc(o.meta.when) + "</p>";

  html += '<div class="section"><div class="passcard">' +
    '<div class="passcard__top">' + icon(o.product === "court" ? "court" : "users") +
    '<span class="passcard__n">' + esc(p.name || ("Player " + p.n)) + "</span>" +
    '<span style="flex:1"></span>' + passChip(state) + "</div>";

  if (state === "used"){
    html += '<div class="stamp">' + icon("check-double") +
      '<p class="display" style="margin-top:var(--s3)">Checked in</p>' +
      '<p class="legal" style="margin-top:var(--s3);color:var(--text-inverse-secondary)">' +
      esc(clockTime(p.usedAt)) + " by " + esc(p.usedBy || "Front Desk") + ". This pass cannot be used again.</p></div>";
  } else if (state === "dormant"){
    html += '<div class="qrbox"><div class="qrdead">' + icon("clock") +
      "<span>Opens 30 minutes before your time. There is nothing to scan yet.</span></div>" +
      '<p class="legal" style="text-align:center">Arrival window: To be confirmed.</p></div>';
  } else {
    html += '<div class="qrbox">' +
      '<div class="qrlive" id="qrlive">' + qrMatrix(p.token) + "</div>" +
      '<p class="ring"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="rbg" cx="18" cy="18" r="15"/>' +
      '<circle class="rfg" id="ringfg" cx="18" cy="18" r="15" stroke-dasharray="94.2" stroke-dashoffset="0"/></svg>' +
      '<span id="ringtxt" aria-live="polite">Refreshes in ' + PASS_TTL + " seconds</span></p>" +
      '<p class="legal" style="text-align:center;max-width:32ch">Sample pattern. Not scannable in this prototype. A screenshot stops working within a minute.</p></div>';
  }
  html += "</div></div>";

  html += '<div class="section"><ul class="rows">' +
    '<li><button class="row" data-action="passname" data-id="' + esc(o.id) + '" data-n="' + p.n + '">' + icon("person") +
      '<span class="row__main"><span class="row__title">' + (p.name ? "Change the name" : "Add a name") + "</span>" +
      '<span class="row__sub">Helps the front desk find this player</span></span>' + icon("chev-r") + "</button></li>" +
    '<li><button class="row" data-action="passshare">' + icon("share") +
      '<span class="row__main"><span class="row__title">Send to this player</span>' +
      '<span class="row__sub">They get their own pass link</span></span>' + icon("chev-r") + "</button></li>" +
    "</ul></div>";

  html += '<div class="section"><div class="card card--sunken"><h2 class="sec">If the scan fails</h2>' +
    '<p class="code" style="margin-top:var(--s3)">' + esc(o.bookingCode) + "</p>" +
    '<p class="legal" style="margin-top:var(--s3)">Read out this code and the organizer name. Your name and number are not inside the pass.</p></div></div>';

  if (state === "live"){
    html += '<div class="card card--sunken hatch" style="margin-top:var(--s6);border:2px dashed var(--border-default)">' +
      '<p class="legal"><strong>Staging control.</strong></p>' +
      '<p style="margin-top:var(--s3)"><button class="btn btn--secondary btn--sm" data-action="passscan" data-id="' + esc(o.id) + '" data-n="' + p.n + '">Simulate a door scan</button></p></div>';
  } else {
    html += arrivalToggle();
  }

  return { id:"pub-pass", shell:"task", title:"Pass " + p.n, html:html,
    back:{ label:"All passes", to:"/booking/" + encodeURIComponent(o.bookingCode) + "/passes" },
    mount: state === "live" ? function(){ mountPassTimer(o, p); } : null,
    dock:null };
}
var passTimer = null;
function mountPassTimer(o, p){
  if (passTimer) clearInterval(passTimer);
  let left = PASS_TTL;
  const C = 94.2;
  passTimer = setInterval(function(){
    const txt = document.getElementById("ringtxt");
    const fg = document.getElementById("ringfg");
    const box = document.getElementById("qrlive");
    if (!txt || !box){ clearInterval(passTimer); passTimer = null; return; }
    left -= 1;
    if (left <= 0){
      p.token = passToken(); left = PASS_TTL;
      box.innerHTML = qrMatrix(p.token);
      if (fg){ fg.style.transition = "none"; fg.setAttribute("stroke-dashoffset","0"); void fg.getBoundingClientRect(); fg.style.transition = ""; }
    } else if (fg){
      fg.setAttribute("stroke-dashoffset", String(C * (1 - left / PASS_TTL)));
    }
    txt.textContent = "Refreshes in " + left + " seconds";
  }, 1000);
}
"""
rep("/* ---------- SCR pub-checkin ---------- */", PASS_LIB + "\n/* ---------- SCR pub-checkin ---------- */", 1, "pass lib anchor")

# ============================================== 3. retire the single check-in code screen
cut_fn("scrCheckin")
rep('route("/booking/:code/checkin", scrCheckin);',
    'route("/booking/:code/passes", scrPasses);\nroute("/booking/:code/pass/:n", scrPass);', 1, "routes")
s = s.replace('/booking/" + esc(encodeURIComponent(o.bookingCode)) + "/checkin"',
              '/booking/" + esc(encodeURIComponent(o.bookingCode)) + "/passes"')
s = s.replace('"/booking/" + encodeURIComponent(o.bookingCode) + "/checkin"',
              '"/booking/" + encodeURIComponent(o.bookingCode) + "/passes"')
s = s.replace("Show check-in code", "Show my passes")
s = s.replace("There is no check-in code, because there is no confirmed booking on this order.",
              "There are no passes, because there is no confirmed booking on this order.")
s = s.replace('["/booking/FC-SAMPLE/checkin","pub-checkin, Check-in code"],', '["/booking/FC-SAMPLE/passes","pub-passes, Passes"],')
s = s.replace('"pub-checkin, Check-in code"', '"pub-passes, Passes"')

# ============================================== 4. court orders carry a pass per player
rep("""    lineItems:[{ label:"Court time", unitPrice:RATE_COURT, qty:d.duration, unitNoun:"hour", unitNounPlural:"hours" }],""",
    """    lineItems:[{ label:"Court time", unitPrice:RATE_COURT, qty:d.duration, unitNoun:"hour", unitNounPlural:"hours" }],
    passCount: d.pax,""", 1, "court passCount")

# ============================================== 5. actions
rep("""  pax: function(el){""",
    """  arrival: function(){ S.arrivalOpen = !S.arrivalOpen; S.inPlace = true; render(); },
  passscan: function(el){
    const o = S.orders[el.getAttribute("data-id")];
    const p = passesOf(o)[parseInt(el.getAttribute("data-n"),10) - 1];
    p.usedAt = now(); p.usedBy = "Front Desk";
    if (!o.checkinAt){ o.checkinAt = now(); o.checkinBy = "Front Desk"; o.orderStatus = "checked_in"; }
    announce("Pass " + p.n + " checked in.");
    S.inPlace = true; render();
  },
  passname: function(el){
    const o = S.orders[el.getAttribute("data-id")];
    const p = passesOf(o)[parseInt(el.getAttribute("data-n"),10) - 1];
    const v = window.prompt("Name for this pass", p.name || "");
    if (v !== null){ p.name = v.trim(); S.inPlace = true; render(); }
  },
  passshare: function(){
    window.alert("In the real build this sends a single pass link to that player. Nothing is sent from this prototype.");
  },
  pax: function(el){""", 1, "pass actions")

open(F, "w", encoding="utf-8").write(s)
print("port4 written", len(s))
if fails:
    print("FAILURES:")
    for f in fails: print("  ", f)
    sys.exit(1)
print("port4 ok")
