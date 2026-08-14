# mobile-staging

A no-backend, mobile-first staging build of The Fit Club Courts webapp, built from the approved
specification in the source material and redesigned to the plan in `v2/REDESIGN-PLAN.md`. It exists
to be walked through, argued with, and signed off before anything is implemented for real.

## Files

| File | What it is |
|---|---|
| `index.html` | The entire application. Inline CSS, inline vanilla JavaScript, inline SVG, and the hero photography and wordmark embedded as data URIs. No framework and no build step. |
| `carousel/` | The 18 frames of the community film strip on the landing page. These are the one exception to the inlining rule: at 3.4MB they would push `index.html` past 5MB as base64, so they are fetched over the network. They are the only request this build makes. |
| `preview.html` | Device-frame preview. Runs `index.html` at 360, 390, 430, and 768 pixel viewports. |
| `v2/REDESIGN-PLAN.md` | The plan this build was made from: The visual system, the accessibility rules, and the eight product changes. |
| `v2/assets/` | The source photography, wordmark, and concrete texture, before they were inlined. |
| `v2/build/` | The porting scripts that produced the redesign from the previous build. Kept as a record; they carry absolute paths from the machine that ran them and are not runnable here. |
| `v2/index.html` | The build at the moment it was promoted, before the pass-system fixes below. Safe to delete. |
| `v2/app.html` | The redesign exactly as the porting scripts produced it, before any fix. Kept as the before-and-after reference. |

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

1. **A QR pass per participant, issued at payment.** A reservation issues a pass per person, not one
   code per booking. A four-player court reservation issues four passes, numbered 1 of 4 to 4 of 4.
   The full workflow is in **Entry passes** below. The booking code survives in large type as the
   fallback for a dead phone or a failed scan.

   Each pass also has its own shareable link at `#/t/pass/<token>`, so four people arriving
   separately do not need the organizer physically present. Every pass carries two tokens and they
   are not interchangeable: The scan token is what the door reads; the share token is what a link
   resolves. Neither encodes anything personal. A shared pass link opens that one pass and nothing
   else: No pass list, no other players, no organizer name or number, no booking code, and no route
   to the booking. A player can set their own display name from it, and that name appears on the
   organizer's pass list and on the staff roster.
2. **Time selection is a drag.** The start-time radio list and the separate duration control are
   replaced by one vertical hour rail. Press and hold an open hour, then drag to extend. Unavailable
   hours are hatched and the drag refuses to cross them. Tapping still works: One tap selects an
   hour, tapping the hour below extends, and both handles are focusable with arrow key support, so
   the rail is fully operable without any drag.
3. **Buttons stop being edge to edge.** Actions sit in a 22rem container with a 20 pixel gutter.
   Primary actions are 56 pixels tall. Nothing paints a solid plate: a call to action is a thin, high
   contrast edge with a light wash behind the primary one, and the corners are close to square.
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

## The community film strip

The Open Play section on the landing page is a marquee: The 18 frames in `carousel/`
run side by side at a single height with their aspect ratios intact, nothing cropped
or stretched, moving right to left.

- Every frame is square cornered and butted straight against its neighbours, with no
  gap, margin, or radius, so the eighteen pictures read as one strip of film. The
  strip itself is square cornered too.
- The sequence is printed twice and the track translates by exactly -50%, so the
  restart lands on a pixel-identical frame and there is no seam.
- Speed is measured, not fixed. The mount reads the width of one sequence after the
  images load and sets the duration for a constant 70 pixels per second, so the strip
  moves at the same rate whatever the frames add up to.
- The frames are grayscale, because the palette rule allows no third hue.
- A flat gray veil subdues the whole strip, and a band scrim rides with the words, so
  the film stays readable as film at the ends while the text clears 6:1 over the
  brightest frame. On a phone the band is symmetrical under centred copy. From 1024px
  the copy moves into a left column and the band goes with it, which leaves the right
  half of a much wider strip as clear film.
- Under `prefers-reduced-motion` the strip stops. Under `prefers-contrast: more` both
  the veil and the scrim go heavier and the text shadow is dropped.

The frames are not lazy loaded. The loop needs the whole strip measured to know where
the seam is, and a lazy frame below the fold never loads, so the track would collapse
to zero width.

One defect was fixed here. The scrim was a centred `radial-gradient(ellipse 78% 64%)`,
and the two lengths in that function are radii rather than diameters, so the horizontal
radius reached well past the edge of the strip. The fade never finished inside the box,
the outermost frame still sat under roughly half strength scrim, and the film rendered
black end to end at every width. It is a band gradient now, which has no radius to get
wrong and holds full height instead of drawing a visible oval on a short box.

## Entry passes

Every paid participant gets their own QR pass, and every pass belongs to one shared booking.

### The booking sequence

1. Choose **Reserve a Court** or **Join Open Play**.
2. Choose the date, the time, the session, and how many are playing.
3. Give the organizer's details.
4. Name every participant. A booking for one carries the organizer's name; a booking for more than
   one requires a name for each, and the list can be added to, edited, and shortened right up to
   payment. After payment a name change stops being an edit and becomes a reissue, below.
5. Check the summary: schedule, venue, participant list, price breakdown, total.
6. Pay through Maya Checkout.
7. While payment is incomplete the booking reads **Payment pending** and no usable pass exists. This
   is not a hidden control: `buildPasses()` creates every pass with a null token, and `issuePasses()`
   is called from exactly one place, inside `verifyPayment()`, which is the only function in the file
   that may promote an order. There is no code path from a browser return to a scannable pass.
8. On confirmation the booking reads **Confirmed**, one unique code is minted per participant, and
   the screen says: *You're booked. Your entry passes are ready in My Bookings.* The primary action
   is **View QR passes**; the secondary is **Go to My Bookings**.

### What a pass carries

A unique QR, the participant's full name, the shared booking number, the date and time, the booking
type, the venue and court or session, its position in the set as "Pass 2 of 4", and its status. The
four statuses are **Valid**, **Checked in**, **Cancelled**, and **Expired**, with a fifth, *Payment
pending*, for the state before a pass exists at all.

The code is an opaque reference. It carries no name, no booking number, and nothing derivable from
either, and it is the server that resolves it and records the check-in.

### The scan token no longer rotates

The previous build regenerated the scan token every 60 seconds behind a countdown ring, so a
screenshot died within a minute. **That property has been removed**, deliberately and with a cost:
a pass the organizer downloads as a PNG, sends to a player, and presents at the door has to still
work an hour later, so a code that expires in 60 seconds is a broken download rather than a security
feature. The defence moved to where it can hold with a stable code:

- **Single use.** The first scan admits that participant. A second scan of the same code is refused
  and shown as "Already checked in at [time]", so a copied screenshot buys nothing.
- **Revocable.** Reissuing or cancelling a pass mints a new code and retires the old one. A retired
  code stops admitting anyone the instant it is retired.
- **Opaque.** As above.

This is worth an owner decision. If rotation matters more than downloadable passes, the two cannot
both be had, and the download has to go.

### The modal

**View QR passes** opens a modal over the page: a bottom sheet on a phone, a centred modal with a
dimmed backdrop on a desktop, with a short entrance animation that `prefers-reduced-motion` removes.
It is a native `<dialog>` opened with `showModal()`, so focus is trapped, Escape closes it, and focus
returns to the control that opened it. There is a visible close button and every control is labelled.

One participant shows one pass and one **Download QR** button: no arrows, no pagination, no
"Download all". More than one participant becomes a carousel: previous and next buttons, horizontal
swipe, left and right arrow keys, a "2 of 4" count, and position dots. The pager sits in the footer
rather than in the scrolling body, because a previous button you have to scroll to find is not a
previous button.

### Downloads

**Download QR** saves the participant on screen. **Download all** saves every valid pass on the
booking. There is no ZIP: this build carries no archiver and fetches nothing, so Download all is one
clearly named PNG per participant, saved in sequence:

```
TFC-BOOKING-XK3M-PX9J-Maria-Santos-QR.png
```

Browsers gate the second and later files behind an allow-multiple-downloads permission. The modal
says so, and if the prompt is declined every pass can still be saved one at a time.

A download is not a bare code. It is a 1080 by 1640 pass drawn on a canvas carrying the wordmark, the
QR with a real quiet zone around it, the participant, the booking number, the date and time, the
venue, the booking type, the status, and one instruction: *Present this pass at the entrance.* Module
edges are snapped to whole pixels, because a fractional module is what makes a downloaded code look
soft, and a soft code is a code that does not scan. The screen and the file are drawn from the same
`qrModules()` grid, so they can never be two different patterns.

### The organizer owns the set

Every pass under a booking is viewed and downloaded from My Bookings by the organizer.

- **Renaming after payment** is a reissue, not an edit. It is confirmed by a button that names its
  own consequence, mints a new code for that participant, and retires the previous one, so two live
  passes can never exist for the same place. Nobody else's pass changes.
- **Cancelling one participant** revokes that one code behind a two-step confirmation. The rest of
  the booking stays valid.
- **Cancelling the booking** invalidates every pass under it at once.

Cancellation, refund, and reschedule *policy* is still unstated, because it is still unapproved. What
is implemented is what cancelling has to do to the passes.

### The door

`scanPass()` is the only entry point, so the simulated scan on a pass screen and the staff scanner at
`#/staff/scan` cannot disagree. A valid scan shows the participant and the booking, marks that pass
and only that pass, records the time, and says how many on the booking have not arrived. Every
refusal is specific rather than a generic failure:

| Presented code | Result |
|---|---|
| Valid | Checked in, time recorded |
| Same code again | Already checked in at [time] |
| Cancelled | Cancelled, with the reason |
| Retired by a reissue | Replaced, ask for the current pass |
| Expired | Expired, the session has ended |
| Refunded booking | Refunded |
| Unknown | Not a valid pass |

A revoked code is moved to a retired list rather than dropped. It can never admit anyone, because
only `p.token` is a live reference, but the door can still recognise it well enough to say why it is
being refused. A scanner that answers "not a valid pass" to a code the venue itself revoked sends the
holder to argue with the wrong person.

## My Bookings

Reservations are grouped into **Upcoming**, **Past**, and **Cancelled**, decided by the clock and by
cancellation rather than by whether the reader has something to do about them. Each entry gives its
booking number, booking type, schedule, venue, number of players, and payment status.

A confirmed booking carries a prominent **View QR pass** or **View 4 QR passes**, counted from the
booking. A booking whose payment is unfinished carries **Complete payment** where payment can still
be resumed, and a plain statement of what happened where it cannot. The QR action is never offered
where no usable pass exists.

## What each choice buys you

"Pick your way in" now carries the explanation inside the choice rather than beside it.
Each panel prints its label, its price, and one smaller, lighter sentence:

- **Reserve a court, ₱350 per hour.** Your court, your time. Reserve the full space for a
  private game with your own group.
- **Join Open Play, ₱150 per player.** One admission gets you into the rotation. Come solo,
  play with everyone, and meet a new community, no group needed.

The loose sentence that used to sit under the film strip ("Open Play is one admission. You
rotate in with everyone else. No group needed.") is gone. A sentence sitting somewhere else
on the page is not part of the decision, and its replacement is inside the Open Play panel.
The hero keeps the compact pair with no supporting copy, because the photograph is doing the
selling there. Both forms come from one `duoCTA(detail)`, so the prices cannot drift.

## Responsive layout

Everything keys off viewport width and input capability. There is no user-agent string,
no device name, and no touch test anywhere in the file: A wide window on a touch laptop
gets the desktop layout and no hover behaviour, a narrow window on a desktop gets the
phone layout, and both are correct.

Three widths are tracked separately, because they answer different questions:
`--shell-max` is the page container, `--measure` is the longest a line of body copy may
get whatever the container does, and `--content-max` is the small-screen reading column
that the bottom sheet and the dock are built around.

| Breakpoint | Gutter | Container | Navigation |
|---|---|---|---|
| Phone | 20px | Full width | Fixed bottom bar, icon and label |
| 600px | 28px | 38rem | Fixed bottom bar |
| 768px | 40px | 44rem | Fixed bottom bar |
| 1024px | 48px | 1280px | Sticky header, bottom bar removed |
| 1440px | 64px | 1400px | Sticky header |

- **Two navigations, one set of destinations.** Both are built from the same `PUBLIC_TABS`
  and `STAFF_TABS` arrays in the same pass of `render()`, so they cannot drift. Below
  1024px the header nav is `display:none`; from 1024px up the bottom bar is. Exactly one
  is in the document, and therefore in the accessibility tree, at any width. On a task
  route both are removed from the DOM entirely, as before.
- **Current page is an accent line plus a weight change.** The brand swoosh under the
  wordmark on the bottom bar, a straight 2px underline that wipes in on the header nav.
  Neither is a filled pill.
- **Content clears both.** The bottom bar is reserved with padding while it exists, and
  `--tabbar-h` drops to zero at 1024px so nothing reserves space for a bar that is gone.
  The header is sticky rather than fixed, so it occupies flow and cannot cover anything.
- **The landing page is the only screen that takes the whole container.** It returns
  `wide:true`, which puts a `wide` class on the body. Every task route keeps a reading
  column, because a form is not improved by being 1280px wide. The hero, the film strip,
  and the footer run to the container edges; body copy never does.
- **Desktop composition, not an enlarged phone.** The hero is a left column over a
  horizontal scrim with the photograph clear to its right, what is open sits beside the
  proof numbers in two columns, the two front doors become wide panels with their
  supporting copy, and the four steps run across in four columns under thin rules.
- **Hover belongs to a fine pointer.** Every lift, wash, and arrow slide is inside
  `@media (hover:hover) and (pointer:fine)`, so a tap on a touch screen cannot leave a
  control latched in its hover state. Focus is separate and always present: 3px outline
  plus a 5px halo. All of it collapses under `prefers-reduced-motion`.
- **The footer runs to both edges of the viewport** at every width, while the footer box itself stays
  on the content column so its text still lines up with the page above it. A spread `box-shadow`
  paints the bleed rather than a `100vw` width, because `100vw` counts the scrollbar and would shift
  the whole column by half of one. `clip-path` lets the shadow out sideways and holds it in
  vertically.

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
- Corners are close to square. A radius is a softening of a control, never a shape in its own right,
  and photography carries none at all. The interface is held together by typography, alignment,
  whitespace, and thin rules instead.
- Motion is restrained: 140ms fades and 8 pixel rises on entry, a 200ms lift and wash on hover where
  there is a fine pointer, a sweep on the pass countdown ring, nothing else. All of it disabled under
  `prefers-reduced-motion`.

## Theme

The document ships pinned to dark with `data-theme="dark"` on the `<html>` element, because that is
the look the redesign was reviewed in. The base surface is a charcoal with a trace of blue in it,
which is what stops a full screen of it reading as flat television grey. It is still one hue plus
opacity: the palette rule is unchanged.

A day and night control sits in the app bar on every screen. It flips the pin rather than removing
it, so the choice is always explicit and never falls back to whatever the operating system happens to
say mid-session. The preference is the one thing in this build that outlives a refresh, stored in
`localStorage` behind a `try`/`catch`, because it is a display setting and not booking data.

Below 420px a fourth control in the app bar no longer fits beside the wordmark, so the harness button
keeps its icon and drops its label. Its accessible name is on the button rather than in the text for
exactly that reason.

## What is simulated

Everything. There is no server, no database, no payment provider, and no message ever leaves the
page. Holds, availability, capacity, payments, verification codes, passes, and booking codes all live
in one in-memory object and are lost on refresh.

The build is nonetheless truthful about product rules. Specifically:

- There is no code path from a browser return to a confirmed booking. Every simulated payment
  outcome lands on **Checking payment** first, and only `verifyPayment()` may promote an order,
  after checking hold validity and amount match.
- There is no code path from a browser return to a scannable pass either. Passes are built with a
  null token and `issuePasses()` is called from exactly one place, inside `verifyPayment()`. An
  unpaid booking has nothing to leak, and the QR action is absent rather than disabled.
- A scan touches one pass. Admitting one participant never admits the rest of their group, and the
  booking is marked checked in without any other pass being marked with it.
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
- **This order's screens:** The hold, the simulated checkout, the payment status, the booking detail,
  the pass list, one pass as the organizer sees it, and the same pass as the player who was sent the
  link sees it. These routes need a live order, so they cannot sit in a static index, and the block
  says which order it is currently pointing at
- **Token links:** Valid, expired, and revoked variants of each token flow, including an expired
  shared pass link
- **Screen index:** Every route that needs no live order, listed by screen id

The pass screens carry their own staging control: "Open the arrival window" wakes dormant passes, and
"Simulate a door scan" flips a pass to Checked in. The scan control appears on both the organizer's
pass and the shared pass link, so either side of the handoff can be walked through.

The staff surface is absent from every public navigation surface and from the footer. It is
reachable only through the harness or by typing `#/staff/today`. It carries a **Scan** screen at
`#/staff/scan`, which stands in for a camera: a field for a pass code, and a list of every issued
code in the build so the accept, the duplicate, and every rejection can be walked through by hand.
The code behind each button is the same opaque token a real scanner would read.

## Verification

Driven in Chrome inside a device frame, dark and light:

- All 36 routes render with no JavaScript errors and exactly one `h1`
- No horizontal scrolling on any route at 345, 375, and 415 pixel viewports, including with both
  pass disclosures open at once
- Every static route swept again at 375, 753, and 1265 pixel viewports: No JavaScript errors, no
  horizontal scrolling, exactly one `h1`, the bottom bar present below 1024px and absent above it,
  and the header nav the other way round
- The pass workflow end to end: A four-participant court booking collects four names, refuses to
  continue while one is blank, creates four passes with null tokens, mints four distinct codes at
  confirmation and not before, and opens them in the modal
- The carousel by arrow button, by left and right arrow keys, and by synthesized pointer swipe in
  both directions. It stops at both ends, and a vertical drag scrolls rather than paging
- A single-participant booking shows one pass, one Download QR, and no arrows, pagination, or
  Download all
- Download writes a real PNG to disk. Download all fires one per valid participant; the second and
  later files are subject to the browser's allow-multiple-downloads permission
- The door: accept, the same code again, a cancelled code, a code retired by a reissue, and an
  unknown code each produce their own result, and scanning one pass leaves the other three unscanned
- Reissue mints a new code, retires the old one, and mirrors the new name onto the admission
- Day and night both render every screen and the modal, and the preference survives a reload
- The full court funnel end to end: rail, review, hold, simulated Maya, Checking payment, Confirmed,
  booking detail, pass list, single pass, simulated scan
- The full Open Play funnel end to end, including the admissions stepper and player names
- The drag rail by synthesized pointer events: A downward drag extends, an upward drag extends
  backwards, a drag refuses to cross a hatched hour, and the run caps at the 4 hour maximum with the
  running total correct at every step
- The shared pass link end to end: Dormant, live with a rotating token and a counting ring, scanned
  once, then refusing reuse. A name set on the shared link appears on the organizer's pass list, and
  a name set through the player-name invite appears on the pass
- A shared pass link carries none of the booking: no booking code, no organizer name, no pass list,
  no link to the booking. Expired, revoked, and unrecognized tokens each render their own plate
- No path from a provider return to a confirmed booking: every simulated outcome
  passes through Checking payment first
- Zero `window.alert`, `window.confirm`, or `window.prompt` calls anywhere in the file

Seven defects were found in the redesigned build and fixed:

1. The app bar wordmark hid its text with `text-indent`, which does not indent the line after a
   `<br>`, so the word "Courts" printed over the logo on every screen. The mark is now painted on a
   decorative element with the accessible name in a visually hidden span.
2. "Show my passes" on the booking detail still pointed at `/booking/:code/checkin`, the route the
   redesign replaced, so the primary entry to the whole pass system landed on "This link is not
   valid." It now points at `/booking/:code/passes`.
3. The quantity stepper rendered "1 admission" as one 42 pixel string, which overflowed a 360 pixel
   viewport by 14 pixels. The count stays 42 pixels and the noun is demoted to 17.
4. The pass screens were unreachable from the staging harness. The screen index lists static routes
   only, and every pass route needs a live order, so the headline feature of the redesign could only
   be found by completing a booking by hand. The harness now carries a "This order's screens" block.
5. "Add a name" on a pass was a `window.prompt` and "Send to this player" was a `window.alert`. A
   modal browser dialog is the one control on the page that cannot be styled, cannot be read by the
   status region, and blocks the whole document. Both are now inline disclosures that open underneath
   the row that triggered them.
6. The plan called for each pass to be sendable to its own player, but no such route existed and the
   share control was a placeholder. `#/t/pass/<token>` now exists, backed by a stable per-pass share
   token that is separate from the rotating scan token.
7. A pass name and its admission name were stored separately and never reconciled, so naming a player
   through the pass and naming them through the player-name invite produced two different answers on
   two screens. They are now mirrored in both directions.

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

1. **Rotating codes or downloadable passes.** Only one of the two is possible. This build chose the
   download, and moved the defence to single use and revocation. See **Entry passes** above.
2. Arrival window length and grace period, needed before passes can state when they open and when
   they die.
3. Group size for a court reservation: Is it required, and is there a maximum per court.
4. Whether a scanned pass may be reversed by the front desk.
5. Whether pass links may be sent by SMS, or only shared by the organizer.
6. Confirmation of the court rate, per the deviation above.
7. Cancellation, refund, and reschedule policy. The pass mechanics for each are built; the rules are
   not, so this build states none.
