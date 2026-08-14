"""Port 2: Icons, landing hero, footer, waitlist removal, dark default."""
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

# ------------------------------------------------------------------ 1. new icons
NEW_ICONS = """
<symbol viewBox="0 0 24 24" id="i-court" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 12h18M8 4v16M16 4v16"/></symbol>
<symbol viewBox="0 0 24 24" id="i-ticket" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5V6.5h18v2a2.6 2.6 0 0 0 0 7v2H3v-2a2.6 2.6 0 0 0 0-7Z"/><path d="M14 7v2M14 14v3"/></symbol>
<symbol viewBox="0 0 24 24" id="i-refresh" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 4v4.5H16"/></symbol>
<symbol viewBox="0 0 24 24" id="i-share" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15.5V4M8.5 7.2 12 3.7l3.5 3.5"/><path d="M5.5 13v6.5h13V13"/></symbol>
<symbol viewBox="0 0 24 24" id="i-scan" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5V5.5A1.5 1.5 0 0 1 5.5 4h3M20 8.5V5.5A1.5 1.5 0 0 0 18.5 4h-3M4 15.5v3A1.5 1.5 0 0 0 5.5 20h3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3"/><path d="M3.5 12h17"/></symbol>
<symbol viewBox="0 0 24 24" id="i-phone" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h4l1.5 4-2.3 1.6a12 12 0 0 0 5.2 5.2l1.6-2.3 4 1.5v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/></symbol>
<symbol viewBox="0 0 24 24" id="i-mail" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 6.8 8.4 6 8.4-6"/></symbol>
<symbol viewBox="0 0 24 24" id="i-home" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/></symbol>
"""
rep('<svg id="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>',
    '<svg id="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>' + NEW_ICONS,
    1, "sprite")

# ------------------------------------------------------------------ 2. dark by default
rep("""function boot(){""",
    """function boot(){
  /* Dark is the default surface. An explicit light choice still wins. */
  if (!document.documentElement.getAttribute("data-theme")) document.documentElement.setAttribute("data-theme","dark");""",
    1, "dark default") if "function boot(){" in s else None

# ------------------------------------------------------------------ 3. shared blocks
SHARED = r"""
/* ---------- v2 shared blocks ---------- */
var MAPS_URL = "https://www.google.com/maps/search/?api=1&query=The+Fit+Club+Courts+Silway-8+Polomolok+South+Cotabato";

function duoCTA(){
  return '<div class="duo">' +
    '<button class="duocard" data-action="startcourt" aria-label="Reserve a court, 350 pesos per hour">' +
      icon("court") + '<b>Reserve<br>a court</b>' +
      '<span class="num">₱350</span><span class="per">per hour</span></button>' +
    '<button class="duocard" data-action="nav" data-to="/openplay" aria-label="Join Open Play, 150 pesos per player">' +
      icon("users") + '<b>Join<br>Open Play</b>' +
      '<span class="num">₱150</span><span class="per">per player</span></button>' +
  '</div>';
}
function footerBlock(){
  return '<footer class="pagefoot">' +
    '<div class="footgrid">' +
      '<div class="footcol">' +
        '<div class="footmark" role="img" aria-label="The Fit Club Courts"></div>' +
        '<p class="dim">Premium pickleball courts,<br>booking and check in.</p>' +
      "</div>" +
      '<div class="footcol"><h3>Go to</h3>' +
        '<a href="#/court">Reserve a court</a>' +
        '<a href="#/openplay">Join Open Play</a>' +
        '<a href="#/rates">Rates and how it works</a>' +
        '<a href="#/find">Find my booking</a>' +
      "</div>" +
      '<div class="footcol"><h3>Visit</h3>' +
        '<a href="' + MAPS_URL + '" target="_blank" rel="noopener">' + icon("pin") + esc(VENUE.area) + "</a>" +
        '<a href="tel:+639991953170">' + icon("phone") + esc(VENUE.phone) + "</a>" +
        '<a href="mailto:' + esc(VENUE.email) + '">' + icon("mail") + esc(VENUE.email) + "</a>" +
        '<p>' + icon("clock") + " Open daily, 6AM to 11PM</p>" +
      "</div>" +
    "</div>" +
    '<p class="footnote">Staging prototype. Every booking, hold, payment, and message on this build is simulated in memory and is lost on refresh.</p>' +
    "</footer>";
}
"""

# ------------------------------------------------------------------ 4. landing rebuild
old_landing = re.search(r"/\* ---------- SCR pub-landing ---------- \*/\nfunction scrLanding\(\)\{.*?\n\}\n", s, re.S).group(0)
NEW_LANDING = r"""/* ---------- SCR pub-landing ---------- */
function scrLanding(){
  const bookingOff = S.connectivity === "maintenance";
  const availOff = S.connectivity === "availability_down";
  let html = "";

  html += '<section class="hero">' +
    '<span class="hero__mark" role="img" aria-label="The Fit Club Courts"></span>' +
    '<h1><span>Get on court</span><span>tonight.</span></h1>' +
    '<p class="sub">Pick a time, pay, walk straight in.</p>' +
    '<a class="maplink" href="' + MAPS_URL + '" target="_blank" rel="noopener">' + icon("pin") +
      '<span>Silway 8, Polomolok, South Cotabato</span></a>';
  if (!bookingOff) html += duoCTA();
  html += "</section>";

  html += '<p class="sampleband" style="margin-top:var(--s5)">' + icon("flask") +
    "<span>Staging build. Sample times and availability. Nothing here is a real reservation.</span></p>";

  if (bookingOff){
    html += '<div class="section"><div class="banner">' + icon("alert") +
      "<div><p><strong>Online booking is temporarily unavailable.</strong></p>" +
      '<p class="legal">Nothing is being held or reserved. Call the venue on ' + esc(VENUE.phone) + " to ask about court time.</p></div></div></div>";
  }

  html += '<div class="section"><h2 class="sec">Open right now</h2>';
  if (availOff){
    html += '<div class="banner">' + icon("alert") + "<div><p><strong>Live availability could not be loaded.</strong></p>" +
      '<p class="legal">Prices and contact details below are still correct.</p>' +
      '<p style="margin-top:var(--s2)"><button class="btn btn--secondary btn--sm" data-action="retry">Retry</button></p></div></div>';
  } else if (S.injected === "No Open Play scheduled"){
    html += '<div class="card"><p><strong>No Open Play is scheduled yet.</strong></p>' +
      '<p class="legal" style="margin-top:var(--s2)">This is normal between published schedules. Reserve a private court instead.</p></div>';
  } else {
    html += '<ul class="rows">' +
      '<li class="row">' + icon("court") + '<span class="row__main"><span class="row__title">Courts today</span>' +
        '<span class="row__sub">Venue time, Asia/Manila</span></span>' + chip("available") + "</li>" +
      '<li><button class="row" data-action="nav" data-to="/openplay">' + icon("users") +
        '<span class="row__main"><span class="row__title">' + esc(windowTitle(OP_WINDOWS.w1)) + '</span>' +
        '<span class="row__sub">' + esc(OP_WINDOWS.w1.start + " to " + OP_WINDOWS.w1.end) + "</span></span>" +
        chip(S.capacityDial === "full" ? "full" : S.capacityDial === "almost" ? "almost" : "places") + "</button></li>" +
      "</ul>";
  }
  html += "</div>";

  html += '<div class="section"><div class="proof">' +
    "<div><b>4</b><span>Courts</span></div>" +
    "<div><b>7</b><span>Days a week</span></div>" +
    "<div><b>Indoor</b><span>Rain or shine</span></div>" +
    "</div></div>";

  html += '<div class="section"><div class="photo"><div class="photo__img photo__img--op" role="img" aria-label="Players gathered on court at The Fit Club Courts"></div>' +
    '<span class="photo__cap">Show up alone. Leave with a game.</span></div>' +
    '<p class="lede" style="margin-top:var(--s4)">Open Play is one admission. You rotate in with everyone else. No group needed.</p>' +
    '<p style="margin-top:var(--s4)"><button class="btn btn--secondary btn--sm" data-action="nav" data-to="/openplay">See Open Play times' + icon("chev-r") + "</button></p></div>";

  html += '<div class="section"><div class="card card--sunken"><h2 class="sec">Rent the whole place</h2>' +
    '<p class="legal" style="margin-top:var(--s2)">All 4 courts for a club day, tournament, or company event.</p>' +
    '<p style="margin-top:var(--s3)"><button class="btn btn--secondary btn--sm" data-action="nav" data-to="/event">Plan a private event</button></p></div></div>';

  if (!bookingOff){
    html += '<div class="section"><h2 class="sec">Pick your way in</h2>' + duoCTA() + "</div>";
  }

  html += '<div class="section"><h2 class="sec">Other things you can do</h2><div class="btn-stack">' +
    navBtn("/rates","Rates &amp; How It Works") +
    navBtn("/find","Find My Booking") +
    navBtn("/visit","Visit / Contact") +
    navBtn("/signin","Sign in") +
    "</div></div>";

  html += footerBlock();
  return { id:"pub-landing", shell:"browse", title:"Fit Club Courts", html:html, dock:null };
}
"""
rep(old_landing, SHARED + NEW_LANDING, 1, "landing")

# ------------------------------------------------------------------ 5. old footerBlock removed
old_foot = re.search(r"function footerBlock\(\)\{\n  return '<div class=\"pagefoot\">'.*?\n\}\n", s, re.S)
if old_foot:
    s = s.replace(old_foot.group(0), "")
else:
    fails.append("old footerBlock not found")

# ------------------------------------------------------------------ 6. waitlist removal
rep("""      (full
        ? '<button class="btn btn--secondary btn--sm" data-action="nav" data-to="/waitlist/' + id + '" aria-label="Join waitlist for ' + esc(windowTitle(w)) + ', Full">Join waitlist</button>'
        : '<button class="btn btn--primary btn--sm" data-action="pickwindow" data-id="' + id + '" aria-label="Choose this window, ' + esc(windowTitle(w) + ", " + w.start + " to " + w.end + ", " + CHIPS[cap === "almost" ? "almost" : "places"].phrase) + '">Choose this window</button>') +""",
    """      (full
        ? '<p class="legal">This window is full. Nothing is being kept for you.</p>'
        : '<button class="btn btn--primary btn--sm" data-action="pickwindow" data-id="' + id + '" aria-label="Choose this window, ' + esc(windowTitle(w) + ", " + w.start + " to " + w.end + ", " + CHIPS[cap === "almost" ? "almost" : "places"].phrase) + '">Choose this window</button>') +""",
    1, "openplay list waitlist button")

rep("""  if (full){
    html += '<div class="section"><div class="banner">' + icon("alert") +
      "<div><p><strong>This window is full.</strong></p>" +
      '<p class="legal">There is nothing to buy on this screen. You can join the waitlist instead.</p></div></div></div>';
    return { id:"pub-op-window", shell:"task", title:"Open Play window", html:html,
      back:{ label:"Change window", to:"/openplay" },
      dock:{ action:{ label:"Join waitlist", action:"nav", to:"/waitlist/" + w.id },
             note:"Joining the waitlist is free and it is not a place." } };
  }""",
    """  if (full){
    html += '<div class="section"><div class="banner">' + icon("alert") +
      "<div><p><strong>This window is full.</strong></p>" +
      '<p class="legal">There is nothing to buy on this screen and no place is being kept for you. Two things are open right now.</p></div></div>' +
      '<div style="margin-top:var(--s4)">' + duoCTA() + "</div></div>";
    html += footerBlock();
    return { id:"pub-op-window", shell:"task", title:"Open Play window", html:html,
      back:{ label:"Change window", to:"/openplay" }, dock:null };
  }""",
    1, "op window full")

# routes and screens
rep('route("/waitlist/:windowId", scrWaitlist);\n', "", 1, "route waitlist")
rep('route("/t/offer/:token", scrTokOffer);\n', "", 1, "route offer")
for fn in ["scrWaitlist", "scrTokOffer"]:
    m = re.search(r"/\* ---------- SCR [a-z-]+ ---------- \*/\nfunction " + fn + r"\(params\)\{.*?\n\}\n", s, re.S)
    if m: s = s.replace(m.group(0), "")
    else: fails.append("could not cut " + fn)

open(F, "w", encoding="utf-8").write(s)
print("port2 written", len(s))
if fails:
    print("FAILURES:")
    for f in fails: print("  ", f)
    sys.exit(1)
print("port2 ok")
