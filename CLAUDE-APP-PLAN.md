# The Fit Club Courts, Claude build plan (v3)

Scope: A Claude version of the demo app in `mobile-staging/index.html`, carrying the full
existing setup forward: The single-file no-backend build, the staging harness, the pass
system, the drag time rail, and the truthfulness rules. This document is the plan only.
It replans information architecture, behavior, and interaction logic for two surfaces,
players and staff, mobile first, and then improves screens around those workflows.

Ground rules, restated from the brief:

- Preserve the current design direction. Improve what exists; do not redesign working
  parts without a clear UX reason.
- Do not modify the hero section or the filmstrip marquee. Preserve the palette and fonts.
- Monochrome stays the rule. The only additional color is red, reserved for critical
  states, plus gray for disabled. Nothing else gains a hue.
- No em dashes anywhere in copy. No eyebrow text anywhere in the UI.
- Minimal word count. The existing word budget survives: 25 words above the landing fold,
  40 words before the action on any decision screen.
- Mobile first, with layouts that use desktop width instead of stretching a phone.
- Waitlist management is deferred to a later revision.
- This app is booking management. It does not manage Open Play sessions, and it names
  no tool that does; it only improves how players discover, understand, and book the
  sessions that exist.

---

## 1. What is preserved unchanged

These parts work and are kept as they are, because the brief says to improve rather than
rebuild:

1. **The landing hero.** Full-bleed grayscale photograph, wordmark, headline, dual CTA
   cards with prices. Untouched.
2. **The filmstrip marquee.** The 18-frame community strip, its measured speed, its seam
   handling, its scrims, and its reduced-motion stop. Untouched.
3. **The visual system.** Charcoal and off-white, concrete texture, court-line motif,
   grayscale photography, the type scale with 18px body and 15px floor, near-square
   corners, and the two rationed signatures: Inverse fill means confirmed or checked in,
   a 3px double border means a hold.
4. **The pass system.** One QR pass per participant, issued only by `verifyPayment()`,
   stable single-use tokens, reissue and revocation, the shared pass link at
   `#/t/pass/<token>`, the download canvas, and the door table of specific refusals.
5. **The drag time rail** with its tap and keyboard paths.
6. **The truthfulness rules.** No path from a browser return to a confirmed booking or a
   scannable pass, holds always show absolute expiry, provisional states say what is not
   true, removed rather than disabled payment controls, SAMPLE marks on fabricated
   values, to-be-confirmed marks on unapproved policy.
7. **The staging harness** as the driving mechanism, extended in section 9.
8. **The theme control**, day and night, pinned and persisted.
9. **The responsive frame.** The breakpoint table, the two navigations built from one
   tab array, the reading column on task routes, hover gated to fine pointers.

---

## 2. Design system deltas

Three additions, no removals.

### 2.1 A critical red, rationed like the other signatures

One red token pair, tuned per theme so text on it and text in it both clear 4.5:1:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--critical` | `#B3261E` | `#F2857D` | Critical text and icon |
| `--critical-surface` | `#B3261E` at 8% | `#F2857D` at 12% | Wash behind critical rows |

Red appears in exactly these places and nowhere else:

- Destructive confirmation buttons: Cancel and refund, revoke a pass, suspend an account,
  close a court. The first-step button stays monochrome; only the confirming button is red.
- Failure states that need action: Payment failed, refund failed, scan refused on a
  cancelled pass.
- Overdue or blocking items on the staff dashboard: Unpaid past its window, court blocked.

Red never carries a state alone. Every red element also has an icon, a word, and a border
or fill change, so the existing never-color-alone rule holds. Selected, success, warning,
links, and focus all stay monochrome exactly as they are today.

### 2.2 Disabled gray, made explicit

The build currently removes dead controls from the DOM, and that rule stands for payment.
But an operations surface has controls that are temporarily unavailable rather than
untruthful, for example Check in before the arrival window. Those render disabled:
`--text-secondary` ink, no fill, `aria-disabled="true"`, and one sentence beside the
control saying why and when it becomes available. A disabled control with no stated
reason is a defect.

### 2.3 Motion spec, additive only

Animations exist to confirm an interaction, never to decorate. Everything runs on the
existing duration tokens and collapses under `prefers-reduced-motion`.

| Interaction | Motion | Duration |
|---|---|---|
| Screen entry | Existing 8px rise and fade, kept | 140ms |
| Sheet and modal open | Translate up 12px with fade, backdrop fade | 180ms |
| Sheet and modal close | Reverse of open, then focus return | 140ms |
| Menu open | Same as sheet on phone, scale 0.98 to 1 as popover on desktop | 160ms |
| Calendar view switch | Cross-fade only, no slide | 120ms |
| Calendar previous and next | 16px horizontal slide in the travel direction | 160ms |
| Row expand or disclosure | Height auto-animate with fade of revealed content | 180ms |
| Status flip (Paid, Checked in) | Existing inverse plate, plus one 200ms fill sweep | 200ms |
| Drag rail growth | Live, no easing, the block tracks the finger 1:1 | 0 |
| Toast or status region update | Fade in, hold, fade out, also written to the live region | 140ms in |

Nothing bounces, nothing loops, nothing exceeds 200ms, and no animation delays the
availability of the control it decorates.

---

## 3. Landing page, targeted improvements only

Structure and visual direction stay. The changes are surgical:

1. **The dual CTA cards state their outcome.** Each keeps icon, price, and two-word
   label. The one supporting sentence per card survives from the current build; nothing
   new is added, and the fold stays inside the 25-word budget.
2. **"Open right now" becomes tappable.** The strip already shows today's status; each
   row now links straight into the matching booking flow with the date preselected.
   One tap from the fold to a time rail.
3. **Open Play discovery.** The section under the filmstrip
   gains a "Next sessions" list: Date, time, skill level if known, price, and places in
   words (Places available, Almost full, Full). Each row leads to the existing window
   screen. Copy explains the model in one line: Court time is blocked for the session;
   one admission gets you into the rotation.
4. **Footer link order** puts Visit and Contact before Policies, because directions are
   asked for more often than terms.

Nothing else on the landing page moves. Hero and filmstrip are frozen.

---

## 4. The menu button and the menu, fixed

The brief calls both out. Current behavior: The bar menu button opens the generic bottom
sheet dialog on all widths where it exists, and the button itself disappears at 1024px
while some of its destinations have no desktop home except the footer.

Target behavior:

1. **The button.** Visible on every width. Below 1024px it is the phone overflow menu as
   today. From 1024px it stays in the app bar and carries the destinations that are not
   in the header strip (Visit, Policies, the theme control on narrow desktop bars), so no
   destination is ever reachable on one width and not another. Minimum 44px target,
   `aria-expanded`, `aria-haspopup="menu"`, and an accessible name that never changes
   with state ("Menu", not "Close menu").
2. **The surface adapts to width.** Below 1024px: The existing bottom sheet, full width,
   rounded top, drag-free (a visible Close button and Escape, no swipe-to-dismiss
   requirement). From 1024px: An anchored popover under the button, 20rem wide, same row
   components, so a desktop pointer does not travel to the bottom of the screen for a
   list of five links.
3. **Behavior contract, both forms.** Native `<dialog>` or popover with focus trapped
   inside, Escape closes, backdrop tap closes, focus returns to the menu button, body
   scroll locked while open, and route change closes it. Selecting a row closes the menu
   first, then navigates, so the sheet never lingers over the next screen.
4. **Resize while open.** Crossing 1024px with the menu open closes it. The two forms
   are different components and a live morph between them is not worth the code.
5. **Content.** Rows keep the current icon-plus-label form, one hairline between rows,
   48px row height. The staff surface stays absent from the menu; it remains reachable
   only through the harness or by typed route.

---

## 5. Information architecture

### 5.1 Player surface

Bottom bar below 1024px, header strip above, both from one array as today:

| Tab | Route | Purpose |
|---|---|---|
| Home | `/` | Landing |
| Book | `/book` | The shared calendar, courts and Open Play in one place |
| My Bookings | `/me` | Upcoming, Past, Cancelled, passes |
| Rates | `/rates` | Prices and how it works |
| Menu | overflow | Visit, Policies, theme, text size |

`/book` is new as a route name and absorbs the entry into both `/court` and `/openplay`.
The existing flows behind those routes survive; `/book` is the availability-first front
door described in section 6. Old routes keep working and forward.

### 5.2 Staff surface

Reached as today: Through the harness or a typed route, never from public navigation.
Bottom bar on phone, sidebar from 1024px, one array:

| Tab | Route | Purpose |
|---|---|---|
| Today | `/staff/today` | Check-in, arrivals, live court board |
| Bookings | `/staff/bookings` | The admin calendar, all reservations |
| + | action sheet | New booking, walk-in, block court, record payment |
| Courts | `/staff/courts` | Court cards, status, maintenance |
| More | `/staff/more` | Customers, Payments, Pricing, Programs, Memberships, Reports, Staff, Hours and closures, Activity log, Settings |

The + button opens a four-action sheet, not a screen. Each action lands in the shortest
possible form.

Roles gate what renders: Owner and Operations Manager see everything; Front Desk sees
Today, Bookings, +, Courts, and inside More only Customers and Payments. A hidden module
is absent from the DOM, not grayed.

### 5.3 Route map, staff additions

```
/staff/today                  check-in and live board
/staff/bookings               admin calendar, day | week | month
/staff/bookings/:id           booking detail with actions
/staff/courts                 court cards
/staff/courts/:id             court detail, hours, blocks, rules
/staff/customers              search
/staff/customers/:id          one profile, whole history
/staff/payments               status lists, record, refund, export
/staff/pricing                rate table
/staff/programs               lessons, clinics, events
/staff/memberships            plans and members
/staff/reports                plain-language summaries first
/staff/staff                  accounts and roles
/staff/hours                  facility hours and closures
/staff/log                    activity log
/staff/scan                   existing scanner, kept
/staff/walkin                 existing walk-in flow, kept and extended
```

Existing staff routes (`/staff/booking/:id`, `/staff/exceptions`, `/staff/openplay/:id`)
forward into the new equivalents.

---

## 6. The shared calendar

One component, two configurations. Both surfaces get Day, Week, and Month views,
previous and next arrows, a Today jump, and date selection. The difference is what a
cell answers.

### 6.1 Common frame

- **Header row:** Left arrow, current label (date, week range, or month), right arrow,
  then a Today button and a Day | Week | Month segmented control. On phone the segmented
  control sits on its own line below; targets stay 44px minimum.
- **Keyboard:** Arrow keys move the focused day or slot, PageUp and PageDown move one
  period, Home jumps to Today, Enter opens. The grid is a real `role="grid"` with
  labelled cells ("Saturday August 22, 2 courts open at 3 PM").
- **States, never color alone:** Open is plain, booked is filled with a label, a hold
  carries the 3px double border, maintenance and closed are hatched with a word, Open
  Play blocks carry their own label. Red appears only on items needing action on the
  staff side.
- **Month view** is a density map, not a workspace: Each day shows a count in words or a
  short figure (Open, Busy, Full, Closed). Tapping a day drops into Day view. This holds
  for both surfaces, because a month of slots is unreadable on any screen.

### 6.2 Player configuration: Find a time fast

`/book` opens on Day view for today.

1. **Product first, one toggle:** Court rental | Open Play, restating the one-line
   difference under the toggle. This is the same `duoCTA(detail)` content, so prices
   cannot drift.
2. **Court rental day view** is the existing drag rail, now fed by the calendar header.
   Week view shows seven columns of open and closed hours at a glance; tapping any open
   hour drops into the day rail with that hour preselected. The rail, not the week grid,
   is where selection happens, so the interaction that already works is the one that
   commits.
3. **Open Play day view** lists the day's sessions as the existing window cards. Week
   and Month show which days have sessions and how full they are, in words.
4. **The next-available shortcut.** Above the grid, one row: "Next open court: Today
   3 PM" and "Next Open Play: Tomorrow 7 PM", each one tap from selection. Elderly and
   low-vision players get a route to a booking that never touches the grid at all.
5. **Completion is unchanged:** Rail, review, hold, pay, verify, passes. No step is
   added; the calendar only shortens the way in.

### 6.3 Staff configuration: The operations view

`/staff/bookings` opens on Day view for today, courts as columns, hours as rows.

1. **Day view is the workspace.** Every booking is a block carrying time, court, name,
   player count, and payment status word. Source (Website, Admin, Walk-in) is an icon
   plus tooltip word. Past hours are visible and dimmed, not hidden.
2. **Move by drag, and by button.** A block drags to another court or time with a
   confirmation before commit. The same block's Edit button offers Move with pickers,
   because drag is never the only path.
3. **Block actions:** Edit, Move, Extend, Cancel, Record payment, Add note, Check in.
   Extend refuses to cross the next booking and says so.
4. **Week view** shows utilization per court per day, for planning. Month view is the
   density map with closures marked.
5. **Filters:** Court, status (Confirmed, Payment pending, Cancelled), product, and
   source. Filters persist per session, are stated in a removable chip row, and never
   hide the fact that they are on.
6. **Create anywhere:** Tapping an open slot starts a manual booking with court and time
   prefilled. Double booking is prevented at selection, not at save.
7. **Availability answer built in.** A "Free at" control asks for a time and lists open
   courts for it, so nobody visually compares columns to answer a phone call.

---

## 7. Player experience beyond the calendar

1. **My Bookings** keeps its grouping and pass actions. Additions: Each upcoming entry
   shows a countdown in words ("In 3 days"), and a Rebook action on past entries that
   reopens `/book` with the same product, duration, and party size.
2. **Open Play windows** gain the explanation inline: What a session includes and the
   rotation model in one line. No queueing tool is named anywhere on the page. Full
   windows keep offering the two real alternatives.
3. **Text size control.** The A and A+ control from the v2 plan ships: Root font at
   100, 112, and 128 percent, persisted alongside the theme, layouts verified at 128.
4. **Forms stay short.** Organizer details remain three fields. Participant names keep
   the book-first, name-later order; names are only demanded when passes require them.
5. **Errors sit beside their field**, entered data survives validation, and every flow
   can be completed with keyboard alone. All existing behavior, restated as binding.

---

## 8. Staff experience, module by module

Each module below states only what the demo simulates. Everything stays in the one
in-memory object, seeded by the harness, lost on refresh, SAMPLE-marked.

### 8.1 Today (check-in and live board)

The first screen answers the five questions: Now, next, open courts, who needs
attention, and what to press.

- **Needs attention** on top, only when nonempty: Unpaid bookings, blocked courts,
  arrivals overdue. Red only here, and only on the item, not the section.
- **Arriving now:** Time, court, organizer, party size, payment word, one large Check in
  button. Check-in accepts a scan (existing `/staff/scan`), a booking code, or a name.
  A no-show action appears only after the grace period, which stays to-be-confirmed.
- **Live court board:** One card per court: In use with minutes remaining, Available,
  Reserved at time, Blocked with reason. Actions per card: Start, End, Extend, Block.
  Type is sized to read from several feet away; the board is usable as a wall display
  via `/staff/today?board`, which strips actions and enlarges type.

### 8.2 Bookings

The calendar of section 6.3, plus a booking detail screen carrying the full record:
Schedule, court, organizer, participants and their pass states, payment lines, source,
internal notes, and the action row. Cancellation always previews the money before the
red confirm: Refund amount, fee, what the customer receives, then Keep booking or
Cancel and refund. Policy numbers stay to-be-confirmed placeholders.

### 8.3 Courts

Cards, one per court: Name, indoor or outdoor, status word, next booking, and two
actions visible without opening anything (Block or Reopen, Edit). Blocking asks for a
reason and an until time and immediately removes the court from every availability
answer. Court detail holds operating hours, court-specific rules, description, and a
photo slot. Add and disable court live here for the Owner and OM roles.

### 8.4 Customers

One search field over name, phone, and email. One profile per customer: Membership
status with expiry and a Renew action, booking count, last visit, upcoming, balance,
history, cancellations, payments, notes, and flags. Suspend sits behind a red two-step
confirm and states its effect: No new bookings, existing ones untouched. No separate
pages per data type; the profile is the page.

### 8.5 Payments

Status words beside every booking everywhere: Paid, Unpaid, Partial, Refunded, Payment
failed. Never Pending when the system knows what is pending; the existing Checking
payment state keeps its name because that is what it is. The module lists Unpaid and
Failed first, supports Record cash, Mark paid, Partial with the remainder computed,
Refund with the same preview as cancellation, and a CSV export produced client-side.

### 8.6 Pricing

The simple rate table from the brief, editable rows: Schedule window, price. Peak,
off-peak, weekday, weekend, member price, and Open Play price are all just rows. A
per-booking override lives on the booking, requires a reason, and lands in the log.
No formula builder.

### 8.7 Programs, Memberships

Programs (lessons, clinics, events) stay out of the court calendar; they occupy court
time as blocks the way maintenance does, and carry their own list screen with capacity
and registration counts. Memberships are plans plus member records; status renders on
the customer profile per 8.4. Both modules are seeded thin in the demo: Enough rows to
walk the flows, no more.

### 8.8 Reports

Plain-language summaries first: Busiest time, court utilization, revenue this month,
booking volume, cancellation rate. Each summary opens one detail table. No chart wall,
and reports are never the landing screen.

### 8.9 Staff, Hours, Log

- **Staff:** Accounts with roles (Owner, Manager, Front Desk, Coach, Scorekeeper),
  disable action, role changes logged. Role gating per 5.2.
- **Hours and closures:** One screen for facility hours, holidays, temporary closures,
  and private event blocks. A facility-wide closure never requires touching courts one
  by one.
- **Activity log:** Readable sentences with time and actor: "4:32 PM. Jamie moved
  Booking #1842 from Court 2 to Court 4." Cancellations, overrides, refunds, blocks,
  suspensions, reissues, and score corrections all land here.

### 8.10 Deliberately out of scope

- **Waitlist management:** Deferred. No route, no screen, no harness scenario.
- **Open Play session management:** Out of scope. This app shows sessions read-only on
  the staff side (schedule, capacity, registrations from this app's bookings). Check-in
  for Open Play admissions still happens here, because the passes are ours.
- **Queue, rotation, and match management:** Not built, and not referred to. Player-side
  organising on the night is somebody else's screen and this build does not name it.
- **Notifications:** Simulated only as explicit statements on actions ("Send
  cancellation email to Maria"), written to the log, nothing sent. Channel choice stays
  an owner decision.

---

## 9. The staging harness, extended

The harness keeps its hatched scaffolding style, its Demo button, and everything it
drives today: Surface, scenario, simulated clock, connectivity, capacity, this order's
screens, token links, and the screen index. Additions:

1. **Surface** gains the role dimension: Visitor, Player, Front Desk, Operations
   Manager, Owner. Switching role re-renders the staff surface with that role's gating,
   so the reduced Front Desk view can be walked through.
2. **Seeded operations day.** One scenario seeds a full staff day: A dozen bookings
   across four courts with mixed payment states, one blocked court, two arrivals due,
   one overdue unpaid booking, one walk-in, and two Open Play sessions at different
   fill levels. This is the dataset every staff screen demos against.
3. **Calendar scenarios:** An empty day, a fully booked day, a holiday closure, and a
   double-booking attempt for verifying refusal.
4. **Clock control** gains Advance 1 hour, because court sessions are hourly and the
   existing minute steps make live-board demos slow.
5. **This order's screens** gains the staff-side views of the same order: The booking
   block on the admin calendar, the booking detail, and its check-in row on Today.
6. **Screen index** lists every new route by screen id, as today.

The harness remains the only path to the staff surface, and a screenshot of any harness
control must still never pass as product UI.

---

## 10. Accessibility baseline, binding

Everything in the existing build's baseline holds, and these are added or restated as
acceptance criteria for the new work:

- Every interactive target 44px minimum, 56px for anything that advances a flow or
  checks someone in.
- Body text 18px, nothing under 15px, all layouts verified at 128 percent root size.
- Contrast 4.5:1 minimum everywhere, 6:1 for body over photography, including the red
  tokens in both themes.
- Status is never color alone: Icon plus word plus fill or border, red included.
- The calendar grid, the drag rail, the menu, all modals, and every staff action are
  operable by keyboard alone, with visible 3px focus and the 5px halo.
- One `h1` per route, landmarks on every region, live regions announce calendar
  navigation, check-ins, and clock-driven changes.
- Escape closes every non-critical modal; destructive confirms require an explicit
  button press; visible Close buttons on every sheet.
- Forms keep entered data on validation failure; errors render beside their field.
- No nested scrolling; the calendar scrolls the page, not a box inside a box.
- Zero `window.alert`, `window.confirm`, or `window.prompt`.

---

## 11. Data model additions, in memory

The single state object gains, all seeded by the harness and all SAMPLE-marked:

- `courts[]`: Id, name, indoor flag, hours, rules, status, blocks with reason and until.
- `customers[]`: Profile, membership, flags, notes, derived history from bookings.
- `payments[]`: Lines per booking: Method, amount, state, refunds, overrides with reason.
- `rates[]`: Schedule window rows with price, plus member and Open Play rows.
- `staffAccounts[]` and `role` on the session.
- `log[]`: Actor, time, sentence, booking reference.
- `programs[]` and `memberships[]`, thin.
- `openPlaySessions[]` extended with skill level and a read-only source marker.

`verifyPayment()` remains the only promoter of orders, `scanPass()` the only door, and
every new staff action routes through one named function per action so the log cannot
miss one.

---

## 12. Build order

1. Design system deltas: Red tokens, disabled treatment, motion spec.
2. Menu button and menu, both widths, per section 4.
3. The shared calendar component, player configuration first, on `/book`.
4. Landing page targeted improvements, per section 3.
5. Staff shell: Navigation, roles, the + sheet, and the seeded operations day.
6. Today: Check-in and live board.
7. Bookings: Admin calendar and booking detail with actions.
8. Courts, Customers, Payments.
9. Pricing, Programs, Memberships, Reports, Staff, Hours, Log.
10. Harness extensions, then the verification sweep.

---

## 13. Verification checklist

Driven in a device frame, dark and light, at 345, 375, 415, 753, and 1265 pixels, at 100
and 128 percent text:

- Every route renders with no JavaScript errors, exactly one `h1`, and no horizontal
  scrolling.
- The menu: Opens as a sheet below 1024px and a popover above, traps focus, closes on
  Escape, backdrop, row selection, and route change, and returns focus to the button.
- The calendar, both surfaces: Day, Week, and Month render; arrows, Today, and date
  selection work by pointer and by keyboard; the grid announces cells; view switches
  and period moves animate within spec and not under reduced motion.
- Player path: Landing to next-available shortcut to rail to paid booking to passes,
  with no added step versus the current build.
- Staff path: Seeded day loads; a booking is created on an open slot, moved by drag,
  moved by buttons, extended into a refusal, cancelled with the money preview; the
  refusal and the cancellation both land in the log.
- Check-in by scan, by code, and by name each admit exactly one pass; the live board
  updates; the wall-display variant strips actions.
- Role gating: Front Desk sees no Pricing, Reports, Staff, Hours, or Log, and the
  hidden modules are absent from the DOM.
- Red appears only on destructive confirms, failure states, and attention items, and
  every red element still reads correctly in grayscale.
- Disabled controls all state their reason.
- Zero em dashes and zero eyebrow text in the rendered product.
- The existing verification list for passes, the rail, downloads, the door, and themes
  passes unchanged.

---

## 14. Open questions for the owner

Carried forward, still unstated in the build until answered:

1. Rotating codes or downloadable passes, the standing tradeoff.
2. Arrival window length and grace period.
3. Group size rules for a court reservation.
4. Whether the front desk may reverse a scanned pass.
5. Cancellation, refund, and reschedule policy numbers.
6. Confirmation of the court rate, 350 versus 250.
7. New: Buffer time between sessions, on or off, and its length.
8. New: Whether the wall-display board is wanted at the front desk, which decides how
   hard its large-type variant must be tested.
