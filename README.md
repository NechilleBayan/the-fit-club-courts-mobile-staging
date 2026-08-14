# mobile-staging

A no-backend, mobile-first staging build of The Fit Club Courts webapp, built from the approved
specification in the source material and redesigned to the plan in `v2/REDESIGN-PLAN.md`. It exists
to be walked through, argued with, and signed off before anything is implemented for real.

## Files

| File | What it is |
|---|---|
| `index.html` | The entire application. One self-contained document: inline CSS, inline vanilla JavaScript, inline SVG, and the photography and wordmark embedded as data URIs. No framework, no build step, no network request of any kind. |
| `preview.html` | Device-frame preview. Runs `index.html` at 360, 390, 430, and 768 pixel viewports. |
| `v2/REDESIGN-PLAN.md` | The plan this build was made from: The visual system, the accessibility rules, and the eight product changes. |
| `v2/assets/` | The source photography, wordmark, and concrete texture, before they were inlined. |
| `v2/build/` | The porting scripts that produced the redesign from the previous build. Kept as a record; they carry absolute paths from the machine that ran them and are not runnable here. |
| `v2/index.html` | Byte-identical copy of what is now `index.html`. Safe to delete once you are happy with the promotion. |
| `v2/app.html` | The redesign exactly as the porting scripts produced it, before the three defects listed under Verification were fixed. Kept as the before-and-after reference. |

## Running it

Double-click `index.html`. It is a complete document, so it renders correctly straight off the file
system. For the device-frame preview, serve the folder over HTTP:

```
cd mobile-staging
python -m http.server 8231
```

Then open `http://127.0.0.1:8231/preview.html`.

## What changed in this design

Eight product behaviours changed alongside the visual system. The full argument is in
`v2/REDESIGN-PLAN.md`; the short version:

1. **Expiring QR passes, one per player.** A reservation issues a pass per person, not one code per
   booking. A four-player court reservation issues four passes, numbered 1 of 4 to 4 of 4. Each pass
   carries a token that regenerates every 60 seconds behind a countdown ring, stays dormant until the
   arrival window opens, is single use, and can be sent to its own player as a link. The booking code
   survives in large type as the fallback for a dead phone or a failed scan.
2. **Time selection is a drag.** The start-time radio list and the separate duration control are
   replaced by one vertical hour rail. Press and hold an open hour, then drag to extend. Unavailable
   hours are hatched and the drag refuses to cross them. Tapping still works: One tap selects an
   hour, tapping the hour below extends, and both handles are focusable with arrow key support, so
   the rail is fully operable without any drag.
3. **Buttons stop being edge to edge.** Actions sit in a 22rem container with a 20 pixel gutter.
   Primary actions are 56 pixels tall with a 12 pixel radius; secondary actions are pills that shrink
   to their content.
4. **Reserve a Court and Join Open Play sit side by side** on the landing hero, each a card with an
   icon, the price as a large number, and a two word label.
5. **"Current rate" is gone**, in copy, in `aria-label` text, and in the dock summary. The price shown
   is the price.
6. **The Open Play waitlist is gone entirely**: The route, the offer token route, both screens, the
   promotion scenario, and every mention in copy. A full window now says "Full" and offers the two
   things that actually exist: Another window, or a court.
7. **The landing page sells before it explains.** Full-bleed grayscale hero, wordmark, one headline,
   the two CTAs with prices, then the open-right-now strip, the proof row, and the group photograph.
   The sample-data band stays, because a staging build must not pass as production, but it moves
   below the hero and shrinks.
8. **Group size is collected** on a court reservation, because every player now needs their own pass.

## Visual system

- Charcoal and off-white only, plus opacity variations. No accent hue anywhere, including for
  success, error, warning, selected, disabled, and links. Status is carried by text, icon, fill
  inversion, border weight and style, pattern, and typography.
- The venue's own wall photograph, desaturated and tiled at low opacity, sits under paper surfaces.
  It is decorative only: `aria-hidden`, and it disappears under `prefers-contrast: more`.
- Photography is grayscale, so the palette rule survives: the rally shot on the hero, the group
  photograph on Open Play, the paddle still life on Reserve a Court.
- The court-line motif is lifted from the sport: Section dividers break in the middle the way a
  centre line breaks at the net, the selected time block carries a dashed kitchen line, and the
  active tab indicator is the swoosh from under the wordmark.
- Two visual signatures are rationed and never reused: Full-bleed inverse fill means Confirmed or
  Checked in and nothing else; a 3 pixel double border means a hold and nothing else.
- Type is bigger and there are fewer sizes. Body is 18px, nothing anywhere is under 15px, and
  numbers, prices, times, and codes are the loudest thing on the screen at 34 to 56px.
- Motion is restrained: 140ms fades and 8 pixel rises on entry, a sweep on the pass countdown ring,
  nothing else. All of it disabled under `prefers-reduced-motion`.

## Theme

The document is pinned to dark with `data-theme="dark"` on the `<html>` element, because that is the
look the redesign was reviewed in. Light is fully built and tested. Delete that one attribute and the
page follows the viewer's system theme instead.

## What is simulated

Everything. There is no server, no database, no payment provider, and no message ever leaves the
page. Holds, availability, capacity, payments, verification codes, passes, and booking codes all live
in one in-memory object and are lost on refresh.

The build is nonetheless truthful about product rules. Specifically:

- There is no code path from a browser return to a confirmed booking. Every simulated payment
  outcome lands on **Checking payment** first, and only `verifyPayment()` may promote an order,
  after checking hold validity and amount match.
- A hold never renders without its absolute expiry time.
- Every provisional state carries a sentence saying what is not true: A hold is not a booking, and
  Checking payment is not a confirmation.
- On expiry, and on a full Open Play window, the payment control is removed from the DOM rather
  than rendered disabled. There is no disabled buy button to find.
- Every fabricated value carries a SAMPLE mark. Every unapproved policy carries a
  to-be-confirmed mark.
- Nothing personal is encoded in a pass token. It is an opaque reference.

## What it deliberately does not invent

The specification lists open owner decisions. This build states none of them and shows a visible
placeholder instead: Cancellation, reschedule, refund, no-show and late-arrival policy; booking
horizon and duration limits; the real Open Play schedule; arrival window and grace period; Private
Event pricing, deposit, and lead time; waiver wording; verification channel; notification channels.

It also contains no card fields of any kind, not even disabled ones, and no functioning QR code. The
pass renders a sample pattern that is explicitly labelled as not scannable.

## The staging harness

The hatched **Demo** button in the top right of every screen opens the harness, also reachable at
`#/demo`. It is styled as scaffolding so a screenshot of it can never pass as product UI. It drives:

- **Surface:** Visitor, signed-in player, Front Desk, Operations Manager
- **Scenario:** Seeded states, including hold expiry, payment failure, late payment, amount
  mismatch, full window, names outstanding, and offline
- **Simulated clock:** Advance 1, 5, or 9 minutes, or expire the current hold immediately
- **Connectivity:** Live availability down, payments down, full maintenance
- **Open Play capacity:** Places available, Almost full, Full
- **Token links:** Valid, expired, and revoked variants of each token flow
- **Screen index:** Every route in the build, listed by screen id

The pass screens carry their own staging control: "Open the arrival window" wakes dormant passes, and
"Simulate a door scan" flips a pass to Checked in.

The staff surface is absent from every public navigation surface and from the footer. It is
reachable only through the harness or by typing `#/staff/today`.

## Verification

Driven in Chrome inside a device frame, dark and light:

- Every route renders with no JavaScript errors and exactly one `h1`
- No horizontal scrolling on any route at 345, 355, and 390 pixels
- The full court funnel end to end: rail, review, hold, simulated Maya, Checking payment, Confirmed,
  booking detail, pass list, single pass, simulated scan
- The full Open Play funnel end to end, including the admissions stepper and player names
- The drag rail by synthesized pointer events: A downward drag extends, an upward drag extends
  backwards, a drag refuses to cross a hatched hour, and the run caps at the 4 hour maximum with the
  running total correct at every step
- No path from a provider return to a confirmed booking: every simulated outcome
  passes through Checking payment first

Three defects were found in the redesigned build and fixed:

1. The app bar wordmark hid its text with `text-indent`, which does not indent the line after a
   `<br>`, so the word "Courts" printed over the logo on every screen. The mark is now painted on a
   decorative element with the accessible name in a visually hidden span.
2. "Show my passes" on the booking detail still pointed at `/booking/:code/checkin`, the route the
   redesign replaced, so the primary entry to the whole pass system landed on "This link is not
   valid." It now points at `/booking/:code/passes`.
3. The quantity stepper rendered "1 admission" as one 42 pixel string, which overflowed a 360 pixel
   viewport by 14 pixels. The count stays 42 pixels and the noun is demoted to 17.

## Known deviations from the redesign plan

Worth an owner decision, all inherited from the prototype rather than introduced here:

1. **The drag handles are 112 by 38 pixels, not the 56 the plan specifies.** Expanding them to 56
   would make the two handles on a one-hour block overlap the adjacent hours and steal taps meant for
   the rail, so the wider-but-shorter target was kept. The tap and keyboard paths are unaffected.
2. **On the Rates screen the two price cards stack rather than sitting side by side.** The plan asks
   for a two column grid everywhere both products appear. They do sit side by side on the landing
   hero.
3. **Small uppercase kicker lines survive on the Rates cards**, which the plan removes from the whole
   product.

## Known deviations from the source specification

Two, both deliberate, both worth an owner decision:

1. **Location and contact are real, not placeholders.** The specification told the builder to write
   "Location details to be confirmed", because the spec authors had not seen the current site. The
   venue's own published details are used instead: Silway-8, Polomolok, South Cotabato,
   `thefitclubph@gmail.com`, `+63 999 195 3170`. The Open Play schedule stays marked to-be-confirmed,
   because it genuinely is undecided.
2. **The court rate is ₱350 per hour, not the ₱250 on the current live site.** The specification
   names ₱350 as a non-negotiable invariant and outranks the existing implementation under its own
   authority order. If ₱250 is still the real rate, that invariant needs correcting at the source.

## Open questions for the owner

1. Arrival window length and grace period, needed before passes can state when they open and when
   they die.
2. Group size for a court reservation: Is it required, and is there a maximum per court.
3. Whether a scanned pass may be reversed by the front desk.
4. Whether pass links may be sent by SMS, or only shared by the organizer.
5. Confirmation of the court rate, per the deviation above.
