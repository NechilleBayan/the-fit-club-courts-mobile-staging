# The eleven UI findings: What each one turned out to be

Branch `ui-findings-sweep`, cut from `main` at `07ec7cc`. Every judgement call
below has a numbered row in `DECISIONS.md`; this file is the shorter read.

Findings are numbered in the order the brief raised them, so 1 to 3 are the
correctness set, 4 to 8 the medium set, and 9 to 11 the low set. That numbering
agrees with four of the five findings the brief referred to by number in its own
prose (2 the filter chips, 3 the staff timeline, 5 the meters, 7 the two
selected states). The fifth does not: the brief calls the sandbox note "finding
11", and in this ordering it is finding 8. Nothing turns on it, but a reader
holding both documents should know which way the numbers run here.

**Two were mis-stated in the brief, and the brief said so.** Two more dissolved
the same way once the code was open, and one turned out to be worse than
written. Those five are marked below.

---

## Summary

| # | Finding | What it turned out to be | Shipped |
|---|---|---|---|
| 1 | `alert()` in the console | As described | A toast, with the two defects testing found |
| 2 | Filter chips paint but do not filter | As described, and the segmented control above them had the same fault | Both now filter; every count derived |
| 3 | Staff timeline contradicts its own empty state | As described. The data for option (A) does not exist | Option (B): True copy, grid marked as sample |
| 4 | Native `<select>` draws grey on grey | **Half already fixed.** `color-scheme` had tracked the theme since an earlier pass | The `<option>` colours, which was the actual mechanism |
| 5 | Workload meters need a visible number | **Not an alt-text bug**, as the brief said. Worse than written: The figures derive from nothing | A derived number, one wording, three renderings |
| 6 | View toggle should be a segmented control | As described. `.seg` was already in `index.html` | A real segmented control, nothing forked |
| 7 | Two idioms, one selected state | As described, byte for byte | The chip goes quiet, the switch keeps the ink |
| 8 | Sandbox note reads as a card | **Not a missing pattern**, as the brief said. A shape problem inside an existing one | Outline out, rule on the leading edge |
| 9 | `18 bk` | As described | A count pill, so no noun is needed at all |
| 10 | The hatch means two things | **It means one thing, in about thirty places, with a written rule** | No change. Reason below |
| 11 | `.appbar__title` case | **Already consistent**, because it is one CSS rule | No change. Reason below |

---

## 1. The native `alert()`

As described, and it was the highest-traffic interaction in the build because
every stub button routed through it.

**Shipped:** One reused `<div class="toast" role="status" aria-live="polite">` on
`document.body`, entering from the bottom at both widths, dismissible at the
44px minimum, auto-dismissing at 5s with the timer paused on hover and on
focus-within, and honouring both `prefers-reduced-motion` and
`prefers-contrast:more`.

**Two defects testing found that the brief did not anticipate:**

- Clicking Dismiss left focus on a button about to become `visibility:hidden`,
  which drops focus to `<body>`. Focus now returns to whatever had it, and only
  when the reader moved focus into the toast: A message timing out under someone
  who is typing must not move their cursor.
- At both widths the toast covered the dock, which is the one action a screen
  exists to perform. It is now lifted by the dock's measured height through a new
  `--toast-lift`. `--dock-h` was the obvious variable and was left alone
  deliberately: It already sits in two `main` padding calculations that resolve
  with it at `0px`, so filling it would move the foot of every docked screen.

**Interpretation logged:** The brief's reduced-motion sentence reads two ways.
The dwell doubles to 10s rather than auto-dismiss being suppressed, because the
stated reason was the slow reader and more time is what a slow reader needs.
Verified: Still up at 6.6s, gone by 11.2s.

## 2. The filter chips

As described. `bookings.html` shipped with `Unpaid` pressed above two rows
reading `PAID / CHECKED IN`, under a heading saying `18 Bookings`.

**Larger than written.** The segmented control directly above the chips had
exactly the same fault, with louder styling and a bigger claim. Closing the
chips and leaving it would have fixed half the finding on the page the finding
is about, so it filters too.

**Shipped:** Every row states in attributes what it already states in words. The
chips and the switch both re-query. `18 Bookings`, the three switch counts,
`18 bk`, and `11 more bookings later today` are all gone: The first four are
derived on load, the last was deleted because it could not be made true. An
empty combination gets the `.empty` pattern and a Clear filters button. Both
pages ship with no filter pre-pressed. The comment in `admin.js` that said the
toggles only paint has been rewritten, because it stopped being true.

**The catch of the whole sweep:** The first working version set `hidden` on rows
and *all seven stayed painted* under a heading saying zero. `.row` sets its own
`display`, and an author `display` rule beats the browser's `[hidden]` rule. That
is a worse lie than the pre-pressed chip. `[hidden]{ display:none !important }`
is now in the console reset.

**Two departures from the brief.** Rows carry `data-pay` with the word on their
own pill rather than a `data-paid` boolean, because no boolean can honestly
describe a row whose pill says "Overdue" or "Refunded". And the count
announcement goes to a separate visually hidden live region rather than through
the visible toast: The count is already in the heading at the same instant, so
the plate would state it twice and cover the list on every chip press.

**Left standing, honestly:** `All Courts` is a picker trigger, not a toggle. It
lost `aria-pressed` and gained `data-stub`. The six days other than the one on
screen keep their sample counts, because there is no list behind them, and the
sandbox note on the page now says which controls re-query and which only paint.

## 3. The staff timeline

As described: `No bookings today` rendered directly above a grid showing a held
court and four courts of Open Play.

**Option (A) was refused for lack of a source, not for effort.** The check is on
the record. `index.html` has no per-court maintenance state anywhere: The
customer flow's `closedDay` is a day index, and `COURT_TIMES` is one venue-wide
strip with no court dimension. Its only Open Play window is `OP_WINDOWS.w1` at
`dayOffset:1`, which is tomorrow. `S.orders` does carry `assignedCourt` and
`startsAt`, so bookings alone could have been placed, but the contradiction
appears exactly when `S.orders` is empty. The card view beneath is equally
hardcoded, so there was no half-done derivation to finish. Deriving the grid
would have meant inventing two models and calling the result live.

**Shipped, option (B):** The empty state now reads *"No customer bookings today.
Open Play still runs, see the courts below."* and the Courts section carries the
existing hatched `.injected` marker. The Held cell, the Blocked cell, the venue
operation window note, and the timeline region's `tabindex`, `role`, and
`aria-label` are all verified intact in both views.

## 4. The native `<select>`

**Half of this was already fixed.** `color-scheme` has tracked the active theme
since an earlier pass, at `index.html:295-298`, with a comment naming "white
select menus" as the reason. The brief called this the one-line fix for the
majority of the finding and asked for it first; it was already there.

**The actual mechanism was underneath it.** On Windows and Android the popup
inherits the select's background, and this select's background is a ten percent
ghost fill, so the list composited to grey type on a grey plate. That is what
made the options read as disabled.

**Shipped:** Opaque `color` and `background-color` on the `<option>`s. The closed
control keeps its ghost fill, because making it opaque leaves the one select on
the event form looking unlike the eight inputs stacked around it: That trades a
fault nobody sees until they open the menu for one everybody sees on arrival.
`Choose one` is now a disabled placeholder with an empty value. Label
association verified wired.

## 5. The workload meters

Not an alt-text bug, exactly as the brief said. It is not a missing pattern
either: `.meter__top` already exists and both `courts.html` and `open-play.html`
use it. These two rows were the only meters in the console without one.

**Worse than written.** The brief asked which number the meter is a picture of.
The answer is none. Joy carries 2 pending and 0 in progress; Rea carries 1 and 1.
Both are two open tasks. Nothing in the roster produces 85 and 45, and the only
thing separating the two people is Joy's overdue item, which is already a pill on
her row.

**Shipped:** `Share of today's tasks · 2 of 7`, bar at 29%, `aria-label="Share of
today's tasks, 2 of 7"`. One string, painted three ways by `admin.js` from
`STAFF` and `UNASSIGNED`, the same way `pendingTasks` already works.

**Deliberately not added:** A `capacity` figure on the roster. It would have
preserved the old reading at the price of putting the one uncheckable number in
the console back in, in the middle of a sweep about uncheckable numbers. The crit
fill came off for the same reason: The meter was trying to say "overdue" as well
as "loaded", and one fact in two idioms is how the pair drifted apart.

## 6. The view toggle

As described. `Switch to card view` states where pressing it goes and nothing
about where the reader is.

**Nothing was ported and nothing forked:** `.seg` has been in `index.html` since
line 824, and five screens already use it.

**Shipped:** Two options, `Timeline` and `Cards`, `aria-pressed` on both.
`toggletimeline` now *sets* from `data-view` instead of flipping, because
pressing the already-selected option must be a no-op; a flip would have made the
control contradict its own pressed state on every second press. One focus key per
segment, following the My Bookings tabs in the same file. `data-action` is
unchanged and the `.timeline` region's attributes are verified intact.

## 7. Two idioms, one selected state

As described, byte for byte.

**Direction chosen:** The segmented control keeps the inverse fill; the chip goes
quiet. The justifying sentence is the page's own, at `bookings.html:54-58`: A
switch changes what kind of thing you are looking at, a chip narrows the set. A
mode switch renames the list, so it takes the list's ink and wears it; a modifier
does not change what the list is, so it does not. The other way round would put
the loudest treatment in the console on the smallest claim.

Selected is still carried by fill, border weight, and type weight, so none of it
rests on colour. Both pass `prefers-contrast:more`, verified on computed values.

**A latent bug this uncovered, and a family of them left standing.** Writing
`background:` on the pressed chip *replaced* the ink plate that the surface
inversion block gives `.filter`, because a state rule near the top of the file
carries more specificity than the one-class selector at the bottom. The wash then
composited against the page, which on the day theme was cream type on cream. It
is now a `background-image` layered over `background-color:var(--card-surface)`.
`.filter:active` had the same bug before this sweep and was fixed with it.

**Still present, not fixed:** the same trap is set for `.seg button:active`,
`.daybtn` (fixed only for the count pill added in finding 9), and `a.row:active`.
Sweeping them is a change across a dozen components that no finding asked for, so
they are named here instead.

**And one the Phase 4 sweep caught:** the `prefers-contrast:more` block was first
written above the `.seg` rules. A media query adds no specificity, so the later
base rule won at equal weight and the segmented control silently kept its 1.5px
border. It is now placed after both idioms. This is the argument for asserting on
computed values rather than on the stylesheet reading correctly.

## 8. The sandbox note

Not a missing pattern, exactly as the brief said. The pattern, the placement, and
the rationale were all already right. The problem was the shape: A rounded
outline at the card radius, sitting eight levels off the page on the night theme,
reads as one more content card, which is the one thing its own comment says it
must not do.

**Shipped:** The outline and the radius are gone; a 2px rule on the leading edge
replaces them, with a `prefers-contrast:more` strengthening. This is the brief's
lightest option, extended, because dropping the border alone left the note
looking like a plain `.legal` paragraph.

**Rejected:** A fill instead of an outline, which is a quieter card and still a
card. And keeping the dash but taking it to `--hatch`, which would make this
rhyme with `.injected`. Hatching in this build means the harness has forced a
state; "this whole screen is a prototype" is a different claim, and borrowing the
marker would blur both.

## 9. `18 bk`

As described: The only abbreviation in the build.

**Neither of the two options offered was taken**, because of the constraint the
brief itself named: `Closed` has to live in that slot too. Widening to fit "18"
plus an icon widens seven buttons to hold one word on one of them. Dropping the
noun to leave a bare number puts `14` directly under `13`, which reads as two
dates.

**Shipped:** A count pill, which is a shape that already means "how many"
everywhere else in this console, so it needs no noun and leaves the closed day
its whole word. Every day button also gained an `aria-label`, because three
stacked fragments read aloud in order are not a sentence.

## 10. The hatch. NO CHANGE

The two cases named cannot share a view: `.daybtn[data-state="closed"]` exists
only in `admin/bookings.html` and `.tl-blocked` only in `index.html`.

The broader question is the better one, and the answer holds. The 45 degree hatch
has about fifteen consumers in each file, and `admin.css:1172` states the single
rule behind all of them: Ink is for what is live and actionable, and anything
finished, blocked, or absent drops back to hatched paper. Instances *do* co-occur
(`bookings.html` shows a closed day, an Open Play bar, a maintenance row, and a
cancelled row at once) but that is one claim about four different objects, and
the object carrying the texture is what distinguishes them.

Both cases the finding named also already carry two further signals: A dashed
border, and the word itself, `Closed` and `Blocked`. A second signal was asked
for only if one was missing. None was missing.

## 11. `.appbar__title` case. NO CHANGE

The "apply consistently across all 26 pages" half needed no work:
`text-transform:uppercase` is one rule in `admin.css`, so all twenty seven pages
have always agreed. That leaves only keep or drop.

Kept. The app bar is chrome and the H1 is content, and this console's entire
visual argument is that its chrome wears the inverse surface to say it is not the
customer app. There is also nothing duplicated to remove: The bar says `STAFF`
and the heading says `2 Staff Members`, which are a label and a count rather than
the same words twice. Dropping the caps would be a taste change with no defect
behind it, and would spend the chrome versus content distinction to buy nothing.
The longest title in the folder, `Staff Management` at sixteen characters, fits
the centre slot at 390px with the existing ellipsis untouched.

---

## Found while working, deliberately not fixed

These are outside all eleven findings. They are recorded rather than swept up,
because each is a change no finding asked for.

1. **"Open Play tonight" shows tomorrow.** On the staff Today screen the card is
   headed "Open Play tonight" and renders `Sun, Aug 16`, because `OP_WINDOWS.w1`
   is `dayOffset:1`. It is the same species as finding 3 and it is more visible
   now that finding 3 has drawn the sample versus live line. Changing `dayOffset`
   ripples into the customer schedule screens, so it wants its own change.
2. **The inversion trap in other `:active` rules**, listed under finding 7.
3. **The screenshot harness is not fully deterministic on two customer routes.**
   `app__find` at 1280 and `app__openplay_w1_players` at 390 each changed height
   by 22 or 23 pixels between two captures of *identical* code, and a third
   capture moved one of them back. `shoot.mjs`'s own comment predicts this by
   name and by pixel count: The peso sign is U+20B1, which sits in latin-ext, so
   a page with a price on it can start a second font fetch after
   `document.fonts.ready` has already resolved. The explicit `FontFace.load()`
   pass in `settle()` reduces it but has not eliminated it. Every other file was
   pixel-identical across all three runs, so this is a harness limitation and not
   a product regression, but a reader diffing this branch should expect those two
   files to flap.

## Verification

- **Mobile regression, 390x844:** 26 routes and 27 admin pages diffed against
  `.baseline`. 48 files pixel-identical, 0 files with any pixel drift, 64 files
  changed height. Every height change maps to a finding: 24 admin pages at -22px
  and 2 at -41px (finding 8, the -41s being pages where the wider text box also
  reflowed a line away), `bookings` at -246 and -273 (finding 2), `staff` at +74
  (findings 5 and 2), and the staff Today screens at +163 and +127 (findings 3
  and 6). The only unexplained movers are the two harness-flake files above.
- **Desktop, 1280 and 1440, rail open and collapsed:** 52 documents each, so 208
  document-states. No horizontal overflow, no content under the rail, no console
  errors, no failed requests.
- **Toast versus rail and dock:** Clears both at both widths in both rail states,
  and stays inside the viewport.
- **Themes:** Every changed surface checked in light and dark. `.filter` and
  `.seg button` are inside the console's always-ink component scope, so their
  values are theme-independent by design; that was confirmed rather than assumed.
- **`prefers-reduced-motion:reduce`:** Toast has no transform, and the dwell
  genuinely doubles (up at 6.6s, gone by 11.2s).
- **`prefers-contrast:more`:** Toast border 2px with no shadow, pressed chip 2px,
  pressed segment 2px, sandbox rule 3px. All asserted on computed values.
- **Keyboard:** Filter chip, segmented control, and toast dismiss are each
  reachable by Tab with a visible 3px focus ring. Enter on a chip filters and
  announces. Focus inside the toast pauses the timer. Dismissing returns focus to
  the opener and never to `<body>`.
- **Live regions:** Exactly two, both `role="status" aria-live="polite"`, both on
  `<body>`, both empty on load. A toast writes to exactly one; a filter writes to
  the other and does not raise the visible toast.
- **Assets:** `v2/assets/logo.png` serves 200 from `/` and from `/admin/`. The
  console fetches it and paints its mark; `index.html` correctly makes no request
  because it inlines the same mark as a data URI in `--img-logo`.
