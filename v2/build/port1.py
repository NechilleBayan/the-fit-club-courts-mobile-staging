"""Port 1: Shell, tokens, override stylesheet, assets, global copy sweeps."""
import re, base64, io, sys

SRC = "/sessions/nice-intelligent-allen/mnt/the-fit-club-courts/mobile-staging/index.html"
DST = "/sessions/nice-intelligent-allen/mnt/outputs/v1-merged.html"
A = "/sessions/nice-intelligent-allen/mnt/outputs/assets/"

def du(f, m):
    return "data:%s;base64,%s" % (m, base64.b64encode(open(A + f, "rb").read()).decode())

LOGO = du("logo.png", "image/png")
HERO = du("hero.jpg", "image/jpeg")
OPIMG = du("op-color.jpg", "image/jpeg")
PADDLE = du("paddle-color.jpg", "image/jpeg")
TEX = du("tex.jpg", "image/jpeg")

s = open(SRC, encoding="utf-8").read()
n_fail = []

def rep(old, new, count=1, label=""):
    global s
    c = s.count(old)
    if c != count:
        n_fail.append("%s: expected %d got %d" % (label or old[:48], count, c))
        return
    s = s.replace(old, new)

# ------------------------------------------------------------------ 1. tokens
OLD_LIGHT = re.search(r"/\* ---------- LIGHT: bare :root, never inside a media query ---------- \*/\n:root\{.*?\n\}\n", s, re.S).group(0)
NEW_LIGHT = """/* ---------- LIGHT tokens. Dark gray and off white only. ---------- */
:root{
  --ink-900:#22262B;
  --ink-700:#3A3F45;
  --ink-600:#565C63;
  --ink-400:#8A8F96;
  --ink-200:#CFCBC3;
  --paper-000:#FBFAF7;
  --paper-100:#F4F2ED;
  --paper-200:#E7E4DC;

  --surface:#F4F2ED;
  --surface-raised:#FBFAF7;
  --surface-sunken:#E7E4DC;
  --surface-inverse:#22262B;
  --text-primary:#22262B;
  --text-secondary:#565C63;
  --text-inverse:#F4F2ED;
  --text-inverse-secondary:#B9B5AD;
  --border-default:#9A968E;
  --border-strong:#22262B;
  --hairline:#D6D2CA;
  --focus-ring:#22262B;
  --focus-halo:#F4F2ED;

  --overlay:rgba(20,22,25,0.64);
  --hatch:rgba(34,38,43,0.14);
  --hatch-strong:rgba(34,38,43,0.22);
  --shadow-print:rgba(34,38,43,0.16);
  --shadow-dock:rgba(34,38,43,0.10);
  --shadow-card:rgba(34,38,43,0.06);
}
"""
rep(OLD_LIGHT, NEW_LIGHT, 1, "light tokens")

OLD_DARK = """    --surface:#17181A; --surface-raised:#202226; --surface-sunken:#101113;
    --surface-inverse:#F2F0EB; --text-primary:#F2F0EB; --text-secondary:#B6B2AA;
    --text-inverse:#17181A; --text-inverse-secondary:#3A3D42;
    --border-default:#6E6A63; --border-strong:#F2F0EB; --hairline:#3A3D42;
    --focus-ring:#F2F0EB; --focus-halo:#17181A;
    --overlay:rgba(9,10,11,0.72); --hatch:rgba(242,240,235,0.18);
    --hatch-strong:rgba(242,240,235,0.28); --shadow-print:rgba(0,0,0,0.55);
    --shadow-dock:rgba(0,0,0,0.45); --shadow-card:rgba(0,0,0,0.35);"""
NEW_DARK_IN = """    --surface:#212428; --surface-raised:#2A2E33; --surface-sunken:#191C20;
    --surface-inverse:#F4F2ED; --text-primary:#F4F2ED; --text-secondary:#B4B0A8;
    --text-inverse:#212428; --text-inverse-secondary:#4A4F55;
    --border-default:#767B82; --border-strong:#F4F2ED; --hairline:#3D4247;
    --focus-ring:#F4F2ED; --focus-halo:#212428;
    --overlay:rgba(10,11,13,0.74); --hatch:rgba(244,242,237,0.18);
    --hatch-strong:rgba(244,242,237,0.28); --shadow-print:rgba(0,0,0,0.55);
    --shadow-dock:rgba(0,0,0,0.45); --shadow-card:rgba(0,0,0,0.35);"""
rep(OLD_DARK, NEW_DARK_IN, 1, "dark tokens A")

OLD_DARK2 = """  --surface:#17181A; --surface-raised:#202226; --surface-sunken:#101113;
  --surface-inverse:#F2F0EB; --text-primary:#F2F0EB; --text-secondary:#B6B2AA;
  --text-inverse:#17181A; --text-inverse-secondary:#3A3D42;
  --border-default:#6E6A63; --border-strong:#F2F0EB; --hairline:#3A3D42;
  --focus-ring:#F2F0EB; --focus-halo:#17181A;
  --overlay:rgba(9,10,11,0.72); --hatch:rgba(242,240,235,0.18);
  --hatch-strong:rgba(242,240,235,0.28); --shadow-print:rgba(0,0,0,0.55);
  --shadow-dock:rgba(0,0,0,0.45); --shadow-card:rgba(0,0,0,0.35);"""
rep(OLD_DARK2, NEW_DARK_IN.replace("\n    ", "\n  "), 1, "dark tokens B")

# type scale, bigger everywhere
OLD_TYPE = """  --fs-display:30px; --lh-display:34px;
  --fs-h1:26px;  --lh-h1:32px;
  --fs-h2:20px;  --lh-h2:26px;
  --fs-h3:17px;  --lh-h3:24px;
  --fs-body:17px;--lh-body:26px;
  --fs-txn:20px; --lh-txn:26px;
  --fs-amount:26px; --lh-amount:30px;
  --fs-code:22px; --lh-code:28px;
  --fs-label:15px; --lh-label:20px;
  --fs-legal:14px; --lh-legal:22px;
  --fs-eyebrow:12px; --lh-eyebrow:16px;
  --fs-tab:12px; --lh-tab:14px;"""
NEW_TYPE = """  --fs-display:34px; --lh-display:38px;
  --fs-h1:30px;  --lh-h1:34px;
  --fs-h2:22px;  --lh-h2:28px;
  --fs-h3:18px;  --lh-h3:25px;
  --fs-body:18px;--lh-body:27px;
  --fs-txn:22px; --lh-txn:28px;
  --fs-amount:34px; --lh-amount:38px;
  --fs-code:26px; --lh-code:32px;
  --fs-label:16px; --lh-label:22px;
  --fs-legal:15px; --lh-legal:23px;
  --fs-eyebrow:13px; --lh-eyebrow:17px;
  --fs-tab:12px; --lh-tab:14px;"""
rep(OLD_TYPE, NEW_TYPE, 1, "type scale")

rep("--r-chip:4px; --r-input:6px; --r-card:10px; --r-btn:10px; --r-plate:12px; --r-sheet:16px; --r-pill:999px;",
    "--r-chip:999px; --r-input:10px; --r-card:14px; --r-btn:12px; --r-plate:14px; --r-sheet:18px; --r-pill:999px;",
    1, "radii")
rep("--tap-min:44px; --tap-row:48px; --tap-decision:56px;",
    "--tap-min:48px; --tap-row:52px; --tap-decision:58px;", 1, "taps")
rep("--font:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif;",
    "--font:\"Helvetica Neue\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Arial,sans-serif;\n  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,\"Liberation Mono\",monospace;",
    1, "font")

# ------------------------------------------------------------------ 2. assets as CSS vars
s = s.replace(":root{\n  --ink-900:#22262B;",
  ":root{\n  --img-logo:url(\"%s\");\n  --img-hero:url(\"%s\");\n  --img-op:url(\"%s\");\n  --img-paddle:url(\"%s\");\n  --img-tex:url(\"%s\");\n  --ink-900:#22262B;" % (LOGO, HERO, OPIMG, PADDLE, TEX), 1)

# ------------------------------------------------------------------ 3. override stylesheet
OVERRIDE = r"""
/* ============================================================
   V2 OVERRIDE LAYER
   Brand photography, concrete texture, larger type, inset buttons.
   Palette rule unchanged: dark gray and off white, no third hue.
   ============================================================ */

body{ position:relative; }
body::before{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:var(--img-tex); background-size:320px; opacity:.07; mix-blend-mode:multiply;
}
:root[data-theme="dark"] body::before{ mix-blend-mode:screen; opacity:.045; }
@media (prefers-contrast:more){ body::before{ display:none; } }
#shell{ position:relative; z-index:1; }

/* ---------- app bar carries the real wordmark ---------- */
.wordmark{ gap:0; letter-spacing:0; text-transform:none; }
.wordmark b{ display:none; }
.wordmark span{ display:block; width:118px; height:26px; text-indent:-9999px; overflow:hidden;
  background:var(--img-logo) left center/contain no-repeat; }
:root[data-theme="dark"] .wordmark span{ filter:invert(1); }
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) .wordmark span{ filter:invert(1); } }
body.shell-staff .wordmark span{ filter:invert(1); }

/* ---------- tab bar: swoosh, not a pill ---------- */
.tabbar a .tabpill{ width:auto; height:auto; background:none!important; color:inherit!important; }
.tabbar a{ position:relative; }
.tabbar a[aria-current="page"]::after{
  content:""; position:absolute; top:4px; left:50%; transform:translateX(-50%);
  width:38px; height:9px; background:currentColor;
  -webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 9'><path d='M0 6 C 11 0, 25 0, 36 2 L 36 5 C 25 3.4, 11 7, 0 9 Z'/></svg>") center/contain no-repeat;
  mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 9'><path d='M0 6 C 11 0, 25 0, 36 2 L 36 5 C 25 3.4, 11 7, 0 9 Z'/></svg>") center/contain no-repeat;
}
.tabbar a svg{ width:25px; height:25px; }

/* ---------- buttons stop being edge to edge ---------- */
.btn{ width:auto; max-width:24rem; margin-inline:auto; padding:var(--s3) var(--s6); border-radius:12px; }
.btn--sm{ border-radius:var(--r-pill); border-width:1.5px; padding:0 var(--s5); min-height:var(--tap-min); }
.btn--ghost{ border-radius:var(--r-pill); }
.btn-col{ gap:var(--s3); }
.btn-col .btn, .btn-stack .btn{ width:100%; }
.dock .btn{ width:100%; max-width:22rem; }
.btn:active{ transform:scale(.985); }

/* ---------- the two front doors, side by side ---------- */
.duo{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:339px){ .duo{ grid-template-columns:1fr; } }
.duocard{
  display:flex; flex-direction:column; gap:8px; min-height:138px; padding:16px 14px 14px;
  border-radius:var(--r-card); border:1.5px solid var(--border-default);
  background:color-mix(in srgb, var(--surface-raised) 58%, transparent);
  backdrop-filter:blur(8px); color:var(--text-primary);
  transition:background var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.duocard svg{ width:28px; height:28px; }
.duocard b{ font-size:19px; line-height:23px; font-weight:800; letter-spacing:-.01em; }
.duocard .num{ margin-top:auto; font-size:30px; line-height:32px; font-weight:800; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.duocard .per{ font-size:14px; line-height:18px; color:var(--text-secondary); font-weight:600; }
.duocard:hover, .duocard:focus-visible{ background:color-mix(in srgb, var(--surface-raised) 82%, transparent); }
.duocard:active, .duocard.is-on{
  background:var(--surface-inverse); color:var(--text-inverse); border-color:var(--surface-inverse); transform:scale(.985);
}
.duocard:active .per, .duocard.is-on .per{ color:var(--text-inverse-secondary); }
.hero .duocard{ background:rgba(244,242,237,.34); border-color:rgba(244,242,237,.5); color:#F4F2ED; backdrop-filter:blur(10px); }
.hero .duocard .per{ color:#D6D3CC; }
.hero .duocard:hover, .hero .duocard:focus-visible{ background:rgba(244,242,237,.5); }
.hero .duocard:active, .hero .duocard.is-on{ background:#F4F2ED; color:#22262B; border-color:#F4F2ED; }
.hero .duocard:active .per, .hero .duocard.is-on .per{ color:#565C63; }

/* ---------- hero ---------- */
.hero{
  position:relative; isolation:isolate; margin-inline:calc(-1 * var(--gutter));
  margin-top:calc(-1 * var(--s5)); padding:0 var(--gutter) 24px;
  min-height:70svh; display:flex; flex-direction:column; justify-content:flex-end;
  background:#141618; color:#F4F2ED; border-radius:0 0 var(--r-sheet) var(--r-sheet); overflow:hidden;
}
.hero::before{ content:""; position:absolute; inset:0; z-index:-2; background:var(--img-hero) center 28%/cover no-repeat; filter:grayscale(1) contrast(1.08); }
.hero::after{ content:""; position:absolute; inset:0; z-index:-1;
  background:linear-gradient(180deg, rgba(20,22,24,.78) 0%, rgba(20,22,24,.24) 32%, rgba(20,22,24,.55) 60%, rgba(20,22,24,.95) 100%); }
.hero__mark{ position:absolute; top:20px; left:var(--gutter); width:150px; height:34px;
  background:var(--img-logo) left center/contain no-repeat; filter:invert(1); }
.hero h1{ font-size:clamp(38px,12vw,54px); line-height:1.02; letter-spacing:-.035em; font-weight:800; }
.hero h1 span{ display:block; }
.hero p.sub{ margin-top:12px; font-size:18px; line-height:26px; color:#DAD7D0; max-width:24ch; }
.hero .maplink{
  display:inline-flex; align-items:center; gap:8px; margin-top:14px; min-height:var(--tap-min);
  color:#DAD7D0; font-size:15px; line-height:20px; font-weight:600; text-decoration:underline;
  text-decoration-color:rgba(218,215,208,.45); text-underline-offset:4px;
}
.hero .maplink svg{ width:19px; height:19px; }
.hero .duo{ margin-top:22px; }

/* ---------- photography, colour except the hero ---------- */
.photo{ position:relative; border-radius:var(--r-card); overflow:hidden; border:1.5px solid var(--hairline); }
.photo__img{ width:100%; height:200px; background-size:cover; background-position:center; }
.photo__img--op{ background-image:var(--img-op); }
.photo__img--paddle{ background-image:var(--img-paddle); }
.photo__cap{ position:absolute; left:0; right:0; bottom:0; padding:16px; color:#F4F2ED; font-weight:800; font-size:19px;
  background:linear-gradient(180deg, rgba(20,22,24,0) 0%, rgba(20,22,24,.88) 72%); }

/* ---------- proof row ---------- */
.proof{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; text-align:center; }
.proof div{ padding:16px 6px; border:1.5px solid var(--hairline); border-radius:var(--r-card); background:var(--surface-raised); }
.proof b{ display:block; font-size:26px; line-height:30px; font-weight:800; letter-spacing:-.02em; }
.proof span{ display:block; margin-top:2px; font-size:13px; line-height:17px; color:var(--text-secondary); font-weight:600; }

/* ---------- cards and rows, softer and roomier ---------- */
.card{ border-width:1.5px; }
.row{ border-width:1.5px; min-height:64px; }
.chip{ padding:5px 12px; border-width:1.5px; }
.daybtn{ width:68px; min-height:82px; border-width:1.5px; }
.daybtn small{ letter-spacing:.06em; }
.daybtn strong{ font-size:25px; }
.seg button{ border-radius:var(--r-pill); border-width:1.5px; }
.field input,.field select,.field textarea{ border-width:1.5px; }
.stepper button{ width:60px; height:60px; border-radius:var(--r-pill); }
.stepper button svg{ width:26px; height:26px; }
.stepper output{ min-width:78px; font-size:42px; }

/* ---------- drag rail ---------- */
.railwrap{ position:relative; border:1.5px solid var(--hairline); border-radius:var(--r-card); background:var(--surface-raised); overflow:hidden; }
.railhint{ display:flex; align-items:center; justify-content:center; gap:8px; padding:12px;
  background:var(--surface-sunken); border-bottom:1.5px solid var(--hairline); font-size:15px; font-weight:600; color:var(--text-secondary); }
.railhint svg{ width:19px; height:19px; }
.rail{ position:relative; touch-action:pan-y; user-select:none; -webkit-user-select:none; }
.hr{ position:relative; display:flex; align-items:center; gap:12px; width:100%; height:62px; padding:0 16px; border-bottom:1px solid var(--hairline); }
.hr:last-of-type{ border-bottom:0; }
.hr__t{ font-size:17px; font-weight:700; font-variant-numeric:tabular-nums; width:92px; }
.hr__s{ font-size:14px; color:var(--text-secondary); }
.hr[data-off]{ color:var(--ink-400); }
.hr[data-off]::after{ content:""; position:absolute; inset:0; pointer-events:none;
  background-image:repeating-linear-gradient(45deg,var(--hatch) 0 2px,transparent 2px 8px); }
.sel{ position:absolute; left:6px; right:6px; z-index:2; border-radius:12px; pointer-events:none;
  background:var(--surface-inverse); color:var(--text-inverse); box-shadow:0 6px 20px var(--shadow-print);
  display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:6px 12px;
  transition:top var(--dur-fast) var(--ease), height var(--dur-fast) var(--ease); }
.sel.dragging{ transition:none; }
.sel.armed{ box-shadow:0 0 0 3px var(--surface-raised), 0 0 0 6px var(--border-strong); }
.sel::before{ content:""; position:absolute; inset:7px; border:1.5px dashed color-mix(in srgb, var(--text-inverse) 45%, transparent); border-radius:8px; pointer-events:none; }
.sel__t{ font-size:20px; font-weight:800; font-variant-numeric:tabular-nums; }
.sel__s{ font-size:14px; font-weight:600; color:var(--text-inverse-secondary); }
.hnd{ position:absolute; left:50%; transform:translateX(-50%); width:112px; height:38px;
  display:grid; place-items:center; touch-action:none; pointer-events:auto; }
.hnd::after{ content:""; width:54px; height:5px; border-radius:99px; background:var(--text-inverse); opacity:.9; }
.hnd--t{ top:-4px; } .hnd--b{ bottom:-4px; }

/* ---------- passes ---------- */
.passcard{ border:1.5px solid var(--hairline); border-radius:var(--r-card); background:var(--surface-raised); overflow:hidden; }
.passcard__top{ display:flex; align-items:center; gap:12px; padding:14px 16px; border-bottom:1.5px dashed var(--border-default); }
.passcard__n{ font-size:16px; font-weight:800; }
.qrbox{ display:grid; place-items:center; gap:14px; padding:22px 16px; }
.qrlive{ width:min(258px,72vw); aspect-ratio:1; border-radius:10px; background:#F4F2ED; padding:12px; border:1.5px solid var(--hairline); }
.qrlive svg{ width:100%; height:100%; }
.qrdead{ display:grid; place-items:center; text-align:center; gap:10px; color:var(--text-secondary);
  font-size:15px; line-height:21px; font-weight:600; padding:30px 24px;
  width:min(258px,72vw); aspect-ratio:1; border:1.5px dashed var(--border-default); border-radius:10px; }
.ring{ display:flex; align-items:center; gap:12px; font-size:15px; font-weight:700; color:var(--text-secondary); }
.ring svg{ width:34px; height:34px; }
.ring circle{ fill:none; stroke-width:4; }
.ring .rbg{ stroke:var(--hairline); }
.ring .rfg{ stroke:var(--border-strong); stroke-linecap:round; transform:rotate(-90deg); transform-origin:50% 50%; transition:stroke-dashoffset 1s linear; }
.stamp{ background:var(--surface-inverse); color:var(--text-inverse); padding:26px 18px; text-align:center; }
.stamp svg{ width:34px; height:34px; margin-inline:auto; }

/* ---------- pitch black footer ---------- */
.pagefoot{
  margin-inline:calc(-1 * var(--gutter));
  margin-top:var(--s9); margin-bottom:calc(-1 * (var(--dock-h) + var(--s6)));
  padding:36px var(--gutter) 40px; background:#000; color:#EDEBE6; border:0; border-radius:0;
}
.footgrid{ display:grid; grid-template-columns:1fr; gap:26px; max-width:var(--content-max); margin-inline:auto; }
@media (min-width:600px){ .footgrid{ grid-template-columns:1.2fr 1fr 1.1fr; gap:20px; } }
.footcol h3{ font-family:var(--mono); font-size:15px; line-height:20px; font-weight:700; letter-spacing:.02em; color:#FFF; margin-bottom:14px; }
.footcol a, .footcol p{ display:block; font-family:var(--mono); font-size:14px; line-height:20px; color:#B9B6B0; text-decoration:none; }
.footcol a{ min-height:var(--tap-min); display:flex; align-items:center; gap:8px; }
.footcol a:hover, .footcol a:focus-visible{ color:#FFF; text-decoration:underline; text-underline-offset:4px; }
.footcol a svg{ width:17px; height:17px; }
.footcol p{ padding:6px 0; }
.footcol p.dim{ color:#7E7B76; }
.footmark{ width:170px; height:38px; background:var(--img-logo) left center/contain no-repeat; filter:invert(1); margin-bottom:16px; }
.footnote{ max-width:var(--content-max); margin:26px auto 0; padding-top:18px; border-top:1px solid #26262A;
  font-family:var(--mono); font-size:12px; line-height:19px; color:#6E6B67; }

/* ---------- misc polish ---------- */
.display{ font-size:clamp(30px,9vw,38px); line-height:1.06; letter-spacing:-.028em; font-weight:800; }
h1.screen{ letter-spacing:-.028em; font-weight:800; }
.amount{ letter-spacing:-.03em; }
.sampleband{ border-radius:var(--r-card); }
.plate--fullbleed{ border-radius:0; }
.qr{ border-width:1.5px; }
"""
s = s.replace("</style>", OVERRIDE + "\n</style>", 1)

# ------------------------------------------------------------------ 4. peso sign
rep('function peso(n){ return "PHP " + Number(n).toLocaleString("en-PH"); }',
    'function peso(n){ return "₱" + Number(n).toLocaleString("en-PH"); }', 1, "peso")

# ------------------------------------------------------------------ 5. current rate sweep
s = s.replace(", current rate", "").replace(" Current rate, effective today.", "")
s = s.replace(" current rate.", ".")

# ------------------------------------------------------------------ 6. hours
s = s.replace('"Hours: To be confirmed "', '"Hours: 6AM to 11PM "')

# ------------------------------------------------------------------ 7. mount hook
rep("""  const app = document.getElementById("app");
  app.innerHTML = view.html;""",
    """  const app = document.getElementById("app");
  app.innerHTML = view.html;
  if (view.mount) { try { view.mount(); } catch (e) { console.error("mount", e); } }""",
    1, "mount hook")

open(DST, "w", encoding="utf-8").write(s)
print("WROTE", DST, len(s))
if n_fail:
    print("FAILURES:")
    for f in n_fail: print("  ", f)
    sys.exit(1)
print("port1 ok")
