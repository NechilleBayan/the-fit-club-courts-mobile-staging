# Admin console integration

How the customer build and the admin console became one prototype, what they
share, what they deliberately do not, and what to click to see any of it.

Companion document: `DECISIONS.md` is the append-only log of every removal,
merge, and judgement call. This file explains the shape. That one explains the
choices, one row at a time, including the ones that went the other way.

---

## The architecture decision: A bridge, not a port

The obvious move was to port the 26 admin screens into `index.html`'s hash
router, giving one document, one state object, one navigation. It was rejected,
and the reason is not effort.

`index.html` is a single-page app with a hash router, a live order graph, and one
mutable `S`. `admin/` is 26 static documents that reload from scratch on every
click. Those are not two halves of one thing that drifted apart; they are two
correct answers to two different problems. A booking funnel needs continuity,
because an order is held across five screens and losing it means losing the
booking. A console does not: A manager clicking from Bookings to Payments has no
in-flight anything, and a full reload is a feature there, because every screen
arrives with the truth rather than with whatever the last screen left in memory.

Porting would have meant one 900 KB document, one router owning 77 routes, and 26
screens of reviewed sample markup rewritten as template functions. The thing that
makes the console reviewable is that each screen is readable HTML you can open
and check. That is what a port would have spent.

So the two builds stay two builds, and what they share is shared explicitly:

| File | What it carries | Read by |
|---|---|---|
| `staging-state.js` | The harness dials, persisted | Both |
| `console-nav.js` | The destination list and the sidebar renderer | Both |
| `console-nav.css` | The sidebar's own styles, in tokens | Both |
| `scenarios.js` | The twelve scenarios, their seeds, their console consequences | Both |
| `club.js` | The club's address, contact, and hours | Both |

Five files, each with one job, each loaded by both documents. Nothing else
crosses.

---

## The `STAGING` contract

`window.STAGING`, defined in `staging-state.js`, is the only channel between the
two builds. One key, `tfc-staging`, holding seven scalars:

```json
{
  "surface": "visitor | player | frontdesk | opsmanager",
  "scenario": "<scenario key> | null",
  "connectivity": "online | availability_down | payments_down | maintenance",
  "capacity": "available | almost | full",
  "clockOffset": 0,
  "theme": "system | light | dark | null",
  "navCollapsed": false
}
```

Six are harness dials. `navCollapsed` is not: It is a preference about chrome, in
the same category as `theme`, and it is in the same key for the same reason.

### The API

```
STAGING.get()                  the whole snapshot
STAGING.getSurface()           / setSurface(v)
STAGING.getScenario()          / setScenario(v)
STAGING.getConnectivity()      / setConnectivity(v)
STAGING.getCapacity()          / setCapacity(v)
STAGING.getClockOffset()       / setClockOffset(ms)
STAGING.getTheme()             / setTheme(v)
STAGING.getNavCollapsed()      / setNavCollapsed(bool)
STAGING.applyTheme(fallback)   settle data-theme, using fallback when unset
STAGING.reset()                remove the key, return everything to default
STAGING.subscribe(fn)          returns its own unsubscribe
STAGING.registerScenarios(ks)  hand over the valid scenario keys
```

`subscribe` calls back with `(state, changed, origin)`. `origin` is `"local"` for
a change made in this document and `"remote"` for one that arrived by storage
event from another. Without that distinction a control that has already updated
its own runtime gets told to do it again on its own echo, and every tap renders
twice.

### What crosses, and what does not

**Dials cross. Orders do not.** `S.orders` is a live object graph with absolute
hold deadlines, generated identifiers, and a share token per pass, mutated by
around thirty functions. Serialising it would mean freezing every one of those
invariants into a wire format and keeping two renderers honest about it forever,
which is a larger project than the console it would serve. The console receives a
scenario **key** and draws its own sample for it. Same scenario, two independent
renderings, nothing to drift.

The consequence is stated in the harness copy in those words: A dial survives a
refresh and a jump between builds. A booking does not.

### Three behaviours worth knowing

- **Validated on read.** Every value is checked against an allow-list.
  `localStorage` is a text field anyone can edit, and a value the code has no
  branch for is discarded rather than passed through to a screen.
- **`theme` defaults to `null`, not to a colour.** `null` means nobody has
  chosen, so each build keeps the default it ships with: The customer build is
  pinned dark in its markup, the console follows the operating system. An
  explicit choice, made anywhere, applies everywhere. Defaulting to a colour
  would have repainted one of the two builds for a reader who never asked.
- **The armed scenario is remembered but not replayed.** A reload restores the
  dials, not the seeded order. Replaying would mint a fresh order with a new
  identifier and a new deadline while the address bar still pointed at the one
  the previous run created.

---

## The 1024 breakpoint, and two desktop chromes in one document

1024 is the customer build's existing breakpoint, adopted rather than invented.
`admin.css` had no `min-width` query at all before this branch, only three
`max-width` ones, so there was no competing value to reconcile.

Below 1024 nothing changed anywhere. Bottom tab bar, hamburger, drawer dialog,
exactly as before, on both builds.

From 1024 up, both builds draw the same sidebar, from the same array, through the
same renderer and the same stylesheet.

### The collision, and how it was settled

The prompt for this work stated that the staff shell had no desktop navigation.
It does. `render()` populates `#bar-nav` and `#tabhost` from the same
`STAFF_TABS` array, so the header has always carried Today, Scan, Walk-in, Open
Play, and Exceptions above 1024, with `aria-current` on the live one. The comment
above that branch is an explicit prior decision, not an oversight:

> Staff keep theirs. [...] It is a different application wearing the same chrome.

So the sidebar does not fill a hole. It replaces a working, deliberately chosen
navigation, which is a stronger claim and was settled deliberately.

**The staff shell gives up its header destinations.** The split that matters is
product, not width. A visitor arrives at a hero, reads down a page, and is offered
one conversion action. A Front Desk staffer spends a shift moving between five
destinations with no hero, no scroll, and nothing to convert. The second is a
console, and it is the same console `admin/` is, so it wears the same rail. The
prior comment's own premise is what argues for this: Staff being a different
application was right, and the conclusion has moved from same chrome to its own.

**Rejected alternative:** Leave the header navigation alone and give the rail only
to `admin/`. Cheaper, regresses nothing, and turned down because it leaves two
staff-facing desktop chromes in one product. Customer differing from staff is a
distinction a reader learns once. Front Desk differing from Ops Manager is one
nobody can.

The customer path is untouched at every width. `index.html` keeps its two strip
header for `browse`, `task`, and `token` shells.

### Two implementation details that look inconsistent and are not

- **The console uses a grid column; the customer build uses a fixed rail with a
  padding offset.** The console owns a plain `#shell` it can turn into two
  columns. The customer `#shell` is a flex column carrying a sticky header group,
  a full bleed hero container, and a fixed dock, and it clips its overflow.
  Re-parenting all of that into grid tracks to move a navigation is a far larger
  change for no more result.
- **The rail follows the path, not the shell.** `body.has-sidenav` is set when
  `view.shell === "staff"` OR the path starts with `/staff/`. Two of the five
  staff routes (`/staff/walkin`, `/staff/openplay/:id`) return the TASK shell and
  have never had the mobile tab bar. Keying on the shell would have jumped the
  page 264 pixels sideways every time a staffer started a walk-in. A phone
  withholds navigation on a task screen because it has no vertical budget; a
  1280 pixel window does not have that problem.

---

## Admin is `opsmanager`'s console view, not a fifth surface

Rea Salvador is the Club Manager, and `opsmanager` already exists. A fifth surface
would mean inventing a fifth set of permissions for the same person and keeping
the two in step forever.

So the harness's Surface row gained a control, not a role. Pressing **Admin /
Club Manager** sets `S.surface = "opsmanager"`, writes the dials, and navigates to
`admin/dashboard.html`. `ALLOWED.surface` in the bridge still has four values.

The control carries no `aria-pressed`, deliberately: The four above it are states
this document can be in, and this one is a door. A toggle that can never read as
pressed is a control lying about itself. The harness copy says the same thing in a
sentence, and so does the `/demo` screen.

The permission boundary is real and visible. `CONSOLE_NAV.groupsFor(surface)`
returns the Money group only for `opsmanager`, so a Front Desk rail has no
Payments, Reports, or Rates, and it says why rather than silently dropping three
rows. The test is an allow-list, not a deny-list: The first version listed the
surfaces refused, which admitted the harness's own `visitor` by default and showed
revenue reports to nobody in particular on a cold start.

As everywhere in this prototype, hiding a row is not the security boundary, and
every screen that hides one says so.

---

## The cast is two people

| | | |
|---|---|---|
| **Rea Salvador** | Club Manager | The signed-in identity in `admin.js`. Maps to `opsmanager`. Two open tasks. |
| **Joy Mendoza** | Front Desk | On duty, two open tasks, one of them overdue. Maps to `frontdesk`. |

There were eight, across sixteen files. Six are gone: Paolo Reyes, Carlo Santos,
Mika Dizon, Bea Lorenzo, Aldrin Torres, Nico Garcia. Every one of their roughly
thirty references is accounted for in `DECISIONS.md` rows 31 to 35, per site.

**What two people demonstrate that eight did not.** Eight names is a cast list. Two
is the smallest number that still shows the permission boundary between Club
Manager and Front Desk, which is the distinction this product turns on, and it is
small enough that a reviewer holds both in their head. Everything else the six
were carrying became one of three things:

- **Unassigned**, where the club genuinely has nobody: Maintenance work, the
  evening desk shift, the Open Play coach slot. `scrExceptions` already used the
  word, so it is established vocabulary, and an unfilled shift is better demo
  material than a name nobody meets twice.
- **Reattributed**, for log entries and completed tasks. "Unassigned did this" is
  a lie about the past.
- **Deleted**, where the row was only padding a roster.

The counts derive rather than being typed. `DATA.staff` is a real array and
`DATA.pendingTasks` and `DATA.onDuty` are computed from it, so the bell, the
drawer, and the dashboard cannot disagree. Reconciling them surfaced a
pre-existing bug: The queue showed five Pending rows plus an Overdue one while
every count said five pending including the late one, so "All 16" excluded a task
the page was displaying. Overdue is a Pending task that is late, not a fourth
stage. That is fixed.

---

## What to click

Serve the folder first. There is no build step:

```
python -m http.server 8123
```

### The scenarios, on the customer surface

Open `http://127.0.0.1:8123/index.html`, press **Demo** in the header (top right;
inside the overflow menu below 1024), and pick a scenario. Each one lands you
where its consequence is:

| Scenario | Lands on | What to look at |
|---|---|---|
| Happy court booking | `/booking/:code` | Confirmed booking, passes issued. The only scenario with no hatched marker, because it is not a forced state. |
| Hold about to expire | `/hold/:id` | Ninety seconds on the clock. Use **Simulated clock** to expire it without waiting. |
| Payment failure | `/status/:id` | Declined. Nothing charged, no booking. |
| Late payment after release | `/status/:id` | Money arrived after the hold was given back. |
| Amount mismatch, needs review | `/status/:id` | 50 short of the total. Paid, and deliberately not confirmed. |
| Open Play window full | `/openplay` | The checkout control is absent from the DOM, not disabled. |
| Names outstanding | `/booking/:code` | Four admissions, one name. |
| Private event lifecycle | `/event/EV 4210` | Quoted, awaiting reply. |
| Inventory conflict | `/court/review` | The time was taken between choosing and holding. This branch was unreachable before this branch revived it. |
| Offline and stale | `/court` | Availability down. Prices and contact still stand. |
| No Open Play scheduled | `/openplay` | Empty state, with the private court path still offered. |
| Loading availability | `/court` | The skeleton state. |

### The same scenarios, on the console

With a scenario armed, press **Admin / Club Manager** in the Surface row, or open
`admin/dashboard.html` directly. Every console screen wears a hatched marker
naming the armed scenario and saying what it means **on that screen**, including
when the answer is that it means nothing there.

Highest-yield screens per scenario:

| Scenario | Go to |
|---|---|
| failure, late, mismatch | `dashboard` (Alerts), `payments`, `notifications`, and `tasks` for the last two |
| full | `open-play`, `check-in`, and the sessions count on `dashboard` |
| names | `open-play`, `check-in`, `notifications` |
| event | `messages`, `notifications`, `dashboard` |
| offline, loading | `dashboard` and `bookings`, both of which gain a second stale band |
| empty | `open-play`, and the sessions count on `dashboard` |
| happy | Nothing, and nothing is missing. A confirmed booking and a clean queue is the console's resting state. |

### The bridge

1. Arm a scenario and flip the theme in the customer harness.
2. Open `admin/dashboard.html`. Both survived, and the marker names the scenario.
3. Change the theme on `admin/settings.html`, then click any other console
   screen. It sticks, which before this branch it did not.
4. Go back to `index.html`. It is wearing the console's theme, and the harness
   still shows which scenario is armed.
5. Press **Reset all state**. The key is removed, and both builds return to their
   own defaults, theme included.

### The desktop rail

Any console screen or any `/staff/*` route at 1024 or wider. The collapse
persists across the boundary: Collapse it in the console, then open
`/staff/today`, and it is still collapsed. Labels are clipped rather than removed
when collapsed, so every row keeps its accessible name.

### Both at once

`preview.html`. Default is 390 x 844, Customer. The **Target** row switches the
frame between the customer build and the console; the sizes now include 1280 and
1440. Those are scaled to fit and say so with the percentage: The frame still lays
out at the labelled width, so every breakpoint fires correctly and only the
picture is smaller. 768 x 1024 is labelled on the button as sitting below the
breakpoint, because it shows phone chrome and that is correct rather than a bug.

The preview and its frame share an origin, so the harness dials carry across both
targets.

---

## How this was verified

Screenshot comparison against the branch point, `f46784e`, which is the admin
folder committed verbatim before any edit. A clean worktree at that commit is
served alongside the working tree and both are shot by the same runner.

The runner freezes the clock, force-loads every declared font face, decodes every
image, and disables animation before capture. All three were necessary. Byte
equality gave 11 false positives out of 104 against an unchanged tree: The 18
grayscale film-strip frames carry `decoding="async"`, so an image can report
`complete` and still be undecoded at capture, and the split latin / latin-ext
fonts mean the peso sign at U+20B1 starts a **second** font fetch after
`document.fonts.ready` has already resolved, worth 22 pixels of reflow. After
those fixes, 103 of 104 shots are pixel-identical across two runs of one tree.

Residual noise floor, confirmed to flake on the baseline tree with no changes
applied: `desktop/app__court` by 1 pixel of height, `desktop/app__event` by 23.

Final state: Mobile drift is content only and every changed file maps to a logged
edit. Desktop sweep is 64 page-width pairs at 1280 and 1440 with no overflow, rail
present, tab bar gone, content clear of the rail, and no console errors. The
order-scoped screens, which need a live order and so were never in the static
index, are 20 of 22 pixel-identical to the baseline; the two that differ are
`/staff/booking/:id` at desktop, which now carries the rail by design.
