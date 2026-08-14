# The Fit Club Courts, mobile redesign v2

Scope: The staging webapp in `mobile-staging/index.html`. This plan replaces the visual system and
changes eight product behaviours. Everything here is mobile first, drawn at 360 pixels and grown
upward. A working prototype ships alongside this document at `mobile-staging/v2/index.html`.

---

## 1. Why the current build looks off

The palette rule is right. The execution is not. Three things are doing the damage.

- Nothing is ever full bleed except buttons, which is exactly backwards. Photography, texture, and
  the brand mark are absent, so every screen is a stack of grey boxes on grey.
- The brand is missing from the product. The venue owns a strong script wordmark and a set of real
  court photographs, and neither appears anywhere in the app.
- Weight is spread evenly. Every card has the same border, the same radius, the same 17 pixel body
  text, so the eye has nowhere to land. Minimalism without hierarchy reads as unfinished.

The fix is not a new hue. It is contrast of a different kind: Scale, texture, photography, and
negative space.

---

## 2. Visual system

### 2.1 Surfaces

| Token | Light | Dark |
|---|---|---|
| Paper | `#F4F2ED` | `#141517` |
| Paper raised | `#FBFAF7` | `#1D1F22` |
| Ink | `#141517` | `#F4F2ED` |
| Ink muted | `#5A5E64` | `#A9A69F` |
| Hairline | `#D6D2CA` | `#33363B` |

No third hue, still. Status stays carried by fill inversion, border weight, pattern, icon, and
words.

### 2.2 Concrete texture

The venue's own wall photograph, desaturated and tiled at 6 to 9 percent opacity, sits under paper
surfaces. It is the single change that removes the flatness without breaking the palette rule. It is
decorative only: `aria-hidden`, no information carried, and it disappears under
`prefers-contrast: more`.

### 2.3 Photography

Grayscale only, so the palette rule survives.

- Hero: The two-player rally shot, full bleed, ink scrim at 55 percent, wordmark and headline on
  top.
- Open Play: The full group photograph. It is the best asset the venue has and it sells the product
  better than any sentence.
- Reserve a Court: The paddle still life, cropped square, used small.

### 2.4 The court-line motif

Lifted from the sport, not invented.

- Section dividers are a 2 pixel line with a 14 pixel gap in the middle, the way a court centre line
  breaks at the net.
- The selected time block carries a dashed inner line, the kitchen line.
- The active tab indicator is the swoosh from under the wordmark, not a rectangle.

### 2.5 Type

Bigger, and far fewer sizes.

| Role | Size | Notes |
|---|---|---|
| Hero | 40 to 52px | Clamped, tight tracking, two lines maximum |
| Screen title | 30px | One per screen |
| Number, price, time, code | 34 to 56px | Tabular, weight 800, the loudest thing on the screen |
| Body | 18px | Up from 17, never smaller |
| Minimum anywhere | 15px | Legal lines included, up from 14 |

Small uppercase kicker lines are removed from the whole product. Nothing sits above a heading.

### 2.6 Motion

Restrained: 140ms fades and 8 pixel rises on screen entry, a 900ms sweep on the hold countdown ring,
nothing else. All of it disabled under `prefers-reduced-motion`.

---

## 3. Accessibility first, for elders and low vision

The current build reads like a contract. That is a real problem for the venue's actual walk-in
demographic. The rewrite rule: Every screen answers what, when, how much, and what to press, in that
order, with a picture attached to each.

- **Icon plus number plus verb.** Every decision row leads with a 28 pixel stroke icon, then a large
  number, then a two or three word verb. Prose is demoted below it.
- **Word budget.** Landing above the fold: 25 words. Any decision screen: 40 words before the
  action. Everything longer goes behind a "More detail" disclosure that is closed by default.
- **Text size control.** An A and A+ control in the app bar scales the root font to 112 percent and
  128 percent, and the choice is remembered. Layout is tested at 128 percent with no clipping.
- **Targets.** 56 pixels for anything that advances a flow, 48 for a row, 44 absolute floor. The
  drag rail carries 56 pixel handles.
- **Contrast.** Ink on paper is 15.6:1. No text below 6:1 anywhere, including the legal lines.
- **Never colour, never shape alone.** Every state has an icon, a word, and a fill or border change.
- **Reading order.** One `h1`, landmarks on every region, live regions for the hold countdown and
  for pass rotation.

---

## 4. Process changes

### 4.1 Expiring QR passes, one per player

The change: A reservation issues a pass per person, not a single code per booking. This holds for
Open Play, where every admission is already a person, and for court reservations, where the group
size is now collected.

**Rules**

- One pass per paid admission. A 4 player court reservation issues 4 passes, numbered 1 of 4 to
  4 of 4. The organizer holds all of them and can hand any one out.
- A pass carries a rotating token rendered as a QR. The token is valid for 60 seconds, then
  regenerates. The screen shows a countdown ring and the words "Refreshes in 42 seconds", so a
  screenshot passed to a stranger is worthless within a minute.
- A pass is dormant until the arrival window opens, and it says so: "Opens 30 minutes before your
  time." Nothing scannable is drawn before then.
- A pass is single use. Once scanned it flips to a full-bleed inverse "Checked in" plate with the
  time and the name, stops rotating, and cannot be reused.
- Each pass can be sent to its own player as a link, so four people arriving separately do not need
  the organizer physically present.
- The booking code remains, in large type, as the fallback for a dead phone or a failed scan. The
  desk can also check in by name against the pass list.
- Nothing personal is encoded in the token. It is an opaque reference.

**Screens affected:** Booking detail gains a pass list. New pass screen. New shared pass token
route. Staff check-in gains a scan result with pass number and remaining passes.

**Owner decisions this needs:** Arrival window length, grace period after the start time, and
whether a pass can be un-scanned by staff after a mistake.

### 4.2 Time selection becomes a drag

The current screen is a radio list of start times plus a separate duration segmented control. Two
disconnected decisions, both taps.

The replacement: A single vertical hour rail for the chosen day. Press on an open hour and drag to
extend. The block grows with your finger, the end time and the running total update live inside the
block, and two 56 pixel handles let you resize either edge afterwards. Unavailable hours are hatched
and the drag refuses to cross them.

Touch is the primary path but not the only one. Tapping an hour selects one hour, tapping again
extends by one, and each handle is a focusable element with arrow key support, so the whole thing is
operable from a keyboard and from a screen reader without any drag at all.

### 4.3 Buttons stop being edge to edge

- Actions sit in a container with a 20 pixel gutter and a 22rem maximum width, centred.
- The sticky dock keeps its full-width bar but the button inside it is inset and radius matched.
- Primary actions are 56 pixels tall with a 12 pixel radius, not a full-bleed slab.
- Secondary actions are pill shaped and shrink to their content.

### 4.4 Reserve a Court and Join Open Play sit side by side

A two column grid, equal width, everywhere both appear: Landing, rates, the empty states, the
booking-complete screen, and the sticky dock. Each is a tall card with an icon, the price as a large
number, and a two word label. Below 340 pixels they stack, and only there.

### 4.5 "Current rate" is removed

Every occurrence deleted, in copy, in `aria-label` text, and in the dock summary. The price shown is
the price. There were 10 occurrences in the current file.

### 4.6 Open Play waitlist is removed

Deleted entirely: The `/waitlist/:windowId` route, the `/t/offer/:token` offer route, the join and
offer screens, the promotion scenario in the harness, the "a waitlist place is not a reservation"
truth line, and every mention in copy. A full window now says "Full" and offers the two things that
are actually available: Another window, or a court.

### 4.7 The landing page has to sell

Current fold: A sample-data band, a sentence of definition, two grey buttons. It explains before it
invites.

New order:

1. Full bleed grayscale hero with the script wordmark, one headline of six words, and one line of
   support.
2. The two CTAs, side by side, with prices as large numbers, over the bottom of the hero.
3. "Open right now" strip: Today's court status and the next Open Play window, as a live row.
4. Three proof numbers in a row: 4 courts, indoor and covered, open 7 days.
5. The group photograph with one line about the rotation, leading into Open Play.
6. Private event block, one third the weight.
7. Location, hours, contact, and a map link.

The sample-data band stays, because the staging build must not pass as production, but it moves
below the hero and shrinks.

### 4.8 Everything else the redesign inherits unchanged

The state truthfulness rules are the strongest part of the current build and none of them are
touched: No path from a provider return to a confirmed booking, a hold never renders without its
absolute expiry, every provisional state says what is not true, payment controls are removed from
the DOM rather than disabled, and every fabricated value keeps its sample mark.

---

## 5. Screen by screen

| Screen | Change |
|---|---|
| Landing | Rebuilt per 4.7. Dual CTA, hero, proof row, group photo |
| Rates | Two large price cards side by side, four step how-it-works with icons, no kickers |
| Reserve a Court, time | Drag rail per 4.2, live total in the block, group size added |
| Reserve a Court, review | Unchanged logic, new type scale, price as the loudest element |
| Hold and pay | Countdown becomes a ring with absolute expiry beside it, still stated in words |
| Payment status | Unchanged logic, plates get the new inverse treatment |
| Booking detail | Gains the pass list, one row per player, each with its own state |
| Pass | New screen. Rotating QR, countdown ring, pass number, name slot, share control |
| Check-in code | Replaced by the pass screen. Booking code demoted to fallback |
| Open Play schedule | Windows as photo-led cards, capacity in words, no waitlist |
| Open Play window | Admission quantity stepper with 56 pixel controls, passes explained |
| Waitlist, offer token | Deleted |
| Find My Booking | Unchanged logic, larger fields |
| Private event | Unchanged logic, visual pass only |
| Staff Today | Gains scan result and pass counts per booking |

---

## 6. Build order

1. Tokens, texture, photography, icon set, button and card primitives.
2. Landing and navigation. This is the screen that carries the whole argument.
3. Reserve a Court drag rail.
4. Pass system, both surfaces, plus staff scan result.
5. Delete the waitlist. Sweep "current rate".
6. Accessibility pass at 360 pixels and 128 percent text, plus keyboard-only run of the drag rail.

---

## 7. Open questions for the owner

1. Arrival window and grace period, needed before passes can state when they open and when they die.
2. Group size for a court reservation: Is it required, and is there a maximum per court.
3. Whether a scanned pass may be reversed by the front desk.
4. Whether pass links may be sent by SMS, or only shared by the organizer.
5. Confirmation of the court rate. The specification says PHP 350 per court-hour and the live site
   says PHP 250. The prototype uses 350.
