# Theme: The token system

This is the palette, written down before it was spent. Everything in the build
resolves to one of the names below. If a screen needs a colour that is not here,
the answer is not a literal in a rule: it is a row added to this file first.

## How to read this

**Two documents, one vocabulary.** `index.html` is the customer build and
`admin/admin.css` is the staff console. They declare the **same token names**
and their **own values**. That is the point: A card in the customer build sits
on photography and a card in the console sits on a work surface, and the same
name can carry both readings. A third file, `console-nav.css`, names no colour
at all and is rendered under both, so a name that exists on one side and not the
other is a rule that silently resolves to nothing wherever it is missing.

**Two themes per document.** Light and dark, each declared twice: Once under
`@media (prefers-color-scheme: dark)` guarded with `:root:not([data-theme="light"])`,
and once under `:root[data-theme="dark"]`. Both copies are needed because the
in-product toggle has to be able to win in **both** directions, not only toward
dark.

**Colour is never the only signal.** Every state carries a word, an icon, and a
drawn treatment (hatch, dash, dot, double rule, solid bar) on top of whatever
colour it takes. Remove all colour from any screen in this build and it still
reads correctly. That rule predates this file and survives it.

---

## 1. Neutrals

The build is ink and paper. Ink is `#171717`, paper is a warm cream, and every
surface is one of the two with a little of the other mixed in.

### What each token is for

| Token | What it is for |
|---|---|
| `--surface` | The page. The thing everything else is drawn on top of. |
| `--surface-raised` | A plane that sits **above** the page: A card, a panel, the sidebar. Redeclared locally inside a console card so a nested panel keeps rising. |
| `--surface-sunken` | A plane that sits **below** the page: A meter track, an inert row, the ground under a hatch. |
| `--surface-inverse` | The ink plate. Used when a thing is settled or selected and needs to be the heaviest object in view. |
| `--text-primary` | Body and headings. The default reading colour. |
| `--text-secondary` | Supporting type: subtitles, metadata, notes. Never below 4.5:1. |
| `--text-inverse` | Type drawn **on** `--surface-inverse` or on chrome. |
| `--text-inverse-secondary` | Supporting type on the same. |
| `--border-strong` | The edge of something deliberate: a pressed control, a selected row, a card that is asking to be read first. |
| `--border-default` | The edge that **identifies a control**. Owes 3:1 against every surface it is drawn on, because a reader has to be able to find it. |
| `--hairline` | A rule. Separates a card from the page and a row from its neighbour. Allowed to be soft, because nothing depends on finding it. |
| `--focus-ring` | The keyboard focus outline. |
| `--focus-halo` | The gap drawn between the control and its focus ring, so the ring is legible on any surface. |
| `--ghost-fill` | RGB triple. The tint washed **inside** a translucent surface; opacity is chosen at each use. |
| `--ghost-edge` | RGB triple. The tint of the hairline **around** a translucent surface. |
| `--hatch` / `--hatch-strong` | The two weights of diagonal hatching, which is how this build says *inert*. |
| `--overlay` | The scrim behind a modal. |
| `--shadow-*` | Print, dock, card, lift, press. Distances, not colours: Same ink at five depths. |

### Customer build (`index.html`)

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#F5F3DC` | `#171717` |
| `--surface-raised` | `#FAF9EA` | `#1F1F1F` |
| `--surface-sunken` | `#E9E6CB` | `#101010` |
| `--surface-inverse` | `#171717` | `#F5F3DC` |
| `--text-primary` | `#171717` | `#F5F3DC` |
| `--text-secondary` | `#57574E` | `#A9A794` |
| `--text-inverse` | `#F5F3DC` | `#171717` |
| `--text-inverse-secondary` | `#B0AE97` | `#4A4A42` |
| `--border-strong` | `#171717` | `#F5F3DC` |
| `--border-default` | `#9A9887` | `#6F6F63` |
| `--hairline` | `#DCD9BE` | `#2F2F2C` |
| `--focus-ring` | `#171717` | `#F5F3DC` |
| `--focus-halo` | `#F5F3DC` | `#171717` |
| `--ghost-fill` | `23,23,23` | `8,8,8` |
| `--ghost-edge` | `23,23,23` | `246,244,221` |
| `--hatch` | `rgba(23,23,23,0.14)` | `rgba(245,243,220,0.18)` |
| `--hatch-strong` | `rgba(23,23,23,0.22)` | `rgba(245,243,220,0.28)` |
| `--overlay` | `rgba(15,15,15,0.66)` | `rgba(8,8,8,0.80)` |

The customer light theme is unchanged by this task. It is cream cards on cream
paper, it is signed off, and the only tokens that moved under it are the two
semantic families in section 2.

### Console (`admin/admin.css`)

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#F8F7F2` | `#171717` |
| `--surface-raised` | `#F2EEDD` | `#1F1F1F` |
| `--surface-sunken` | `#E4E0CE` | `#101010` |
| `--surface-inverse` | `#171717` | `#F5F3DC` |
| `--text-primary` | `#171717` | `#F5F3DC` |
| `--text-secondary` | `#605B52` | `#A9A794` |
| `--text-inverse` | `#F5F3DC` | `#171717` |
| `--text-inverse-secondary` | `#B0AE97` | `#4A4A42` |
| `--border-strong` | `#171717` | `#F5F3DC` |
| `--border-default` | `#8E8878` | `#6F6F63` |
| `--hairline` | `#C9C2AE` | `#2F2F2C` |
| `--focus-ring` | `#171717` | `#F5F3DC` |
| `--focus-halo` | `#F8F7F2` | `#171717` |
| `--ghost-fill` | `23,23,23` | `8,8,8` |
| `--ghost-edge` | `23,23,23` | `246,244,221` |
| `--hatch` | `rgba(23,23,23,0.14)` | `rgba(245,243,220,0.18)` |
| `--hatch-strong` | `rgba(23,23,23,0.22)` | `rgba(245,243,220,0.28)` |
| `--overlay` | `rgba(15,15,15,0.66)` | `rgba(8,8,8,0.80)` |

### The two outlines, and why the review's one value became two

The review asked for a single warm soft gray, `#C9C2AE`, in `--border-default`.
That value is right for one of the two jobs the console's outlines do and wrong
for the other, so it went where it is right and the other token was tuned
separately.

- `--hairline` took `#C9C2AE`. A card edge is a rule. It is decoration, it is
  there to stop a cream card melting into an off-white page, and nothing breaks
  if a reader never consciously finds it.
- `--border-default` did not. It identifies **controls** (a day button, a field
  at rest, a secondary button), which owe 3:1 under WCAG 1.4.11. `#C9C2AE`
  manages **1.53:1** on the new cream card. It was warmed at its own weight
  instead: `#8E8878`, which reaches **3.04:1** on the card and **3.29:1** on the
  page. The value it replaced, `#A8A695`, reached 2.33:1 and had been failing
  since before this task.

The **card outline** uses neither. It needed no new rule at all: every card
already draws `border:1px solid rgba(var(--ghost-edge),.22)`, and the only
reason that edge was invisible in the light console is that the old ink-card
block set `--ghost-edge` to cream *on the card*, so each card outlined itself in
its own fill. With that override gone the same rule resolves to ink at 22% over
cream, which lands within a shade of the warm gray the review asked for. At
`prefers-contrast:more` the card family switches to `--border-default`.

---

## 2. Semantic families

There are exactly two, and one sentence separates them. It is enforceable and it
was applied to every existing usage in the build, not only to the new ones.

> **`--critical` means something is wrong or lost.**
> **`--caution` means something needs attention.**

The test is whether the club has already lost something. If it has not, it is
caution. A booking that cannot stand is critical; an evening shift with nobody
on it is caution. Money not collected is critical; four payments still to
collect is caution.

Both families have the identical five-token shape:

| Token | What it is for |
|---|---|
| `--critical` / `--caution` | The hue itself. Used as type, as a bar, and as a solid fill. |
| `--critical-on` / `--caution-on` | Type drawn **on** a solid fill of the hue. |
| `--critical-surface` / `--caution-surface` | A translucent wash of the hue, for the background of a row or plate. Translucent rather than solid so it tints whatever it lands on and does not need a value per surface. |
| `--critical-edge` / `--caution-edge` | The border of such a row or plate. |
| `--critical-glow` / `--caution-glow` | The outer halo on an invalid field or a pressed danger button. |

### Values

| Token | Light (both documents) | Dark (both documents) |
|---|---|---|
| `--critical` | `#AC3227` | `#F2857D` |
| `--critical-on` | `#FFFFFF` | `#171717` |
| `--critical-surface` | `rgba(172,50,39,0.10)` | `rgba(242,133,125,0.12)` |
| `--critical-edge` | `rgba(172,50,39,0.55)` | `rgba(242,133,125,0.60)` |
| `--critical-glow` | `rgba(172,50,39,0.28)` | `rgba(242,133,125,0.30)` |
| `--caution` | `#7B5A12` | `#E0A94A` |
| `--caution-on` | `#FFFFFF` | `#171717` |
| `--caution-surface` | `rgba(123,90,18,0.10)` | `rgba(224,169,74,0.14)` |
| `--caution-edge` | `rgba(123,90,18,0.55)` | `rgba(224,169,74,0.60)` |
| `--caution-glow` | `rgba(123,90,18,0.28)` | `rgba(224,169,74,0.30)` |

### Both light values are solved, not chosen

Each is **the lightest value that still clears 4.5:1 against the darkest ground
its own family ever paints under it**, which is the 13% wash on `.row--crit` and
`.plate--crit`. Lighter than this and the 12px status pills stop meeting AA on
exactly the rows that need them most.

That **bounds** the review's finding rather than granting it. "The red is too
aggressive" cannot be answered by much on a cream page, because a red legible as
12px bold type on cream has to be dark: `#B3261E` became `#AC3227`, which is
warmer and a touch lighter and not much else. The dark value is untouched,
because the finding was only ever about light.

What actually made the staff screen quieter was the **family split**, not the
hue. *Shift Unfilled* moved to ochre, and an ochre plate beside a red one is
unmistakably the calmer of the two in a way no amount of tuning within the red
could have been. If a future change wants a genuinely soft red, the move is to
stop using `--critical` as small type (make `.st--crit` a solid fill with
`--critical-on`), not to lighten the hue.

### Why `--caution` is an ochre and not the terracotta that was asked for

The terracotta was tried first and is worth naming. At the luminance 4.5:1 on
cream demands, a muted terracotta lands within about ten degrees of hue of
`--critical`. That is a second red rather than a second family, and it would
have left *Shift Unfilled* exactly as loud as the thing it needs to be quieter
than, which is the entire reason the family exists.

The ochre costs a third hue in a build whose stated rule is two. What it buys is
a distinction a reader can make before reading the word. That is the only reason
to add a family at all, and a family that does not buy it is worse than none.

### Where each family is spent

Every usage in the build was checked against the sentence. The full audit, one
row per site, is in `DECISIONS.md`. The summary:

**`--critical`.** Payment overdue, payment failed, unpaid at check-in, booking
conflict, task overdue, bookings lost to a closure, a player's payment issues,
the overdue share of a person's workload, form validation errors, and the three
destructive actions (Cancel Booking, Refund, Delete Task).

**`--caution`.** Shift unfilled, unanswered messages, the unread badge on the
bell, every solid count pill that counts a queue rather than a casualty, the two
dashboard tiles whose headline number is a backlog, a heavy workload meter, and
*Almost full* on the capacity scale.

---

## 3. The capacity scale

Open Play states borrowed neutrals and `--critical` ad hoc. They are now a named
progression. It is built from `--caution` and the neutrals and it adds no third
colour family, because it does not need one.

| Step | Means | Customer (`index.html`) | Console (`admin.css`) | Drawn as |
|---|---|---|---|---|
| Available | Seats left | `.chip` | `.st--hold` | Plain pill, filled or dashed edge |
| Almost full | Filling up, nothing lost | `.chip--almost` | `.st--caution` | Ochre edge and wash, half-filled square glyph |
| Full | Every seat sold | `.chip--atcapacity` | `.st--atcapacity` | The ink plate: solid, settled |
| Closed | Not taking anyone | `.chip--closed` | `.st--off` | Sunken paper under a lock, hatched |

**Full used to be drawn as void.** Both documents gave it the hatched dashed
treatment reserved for things that are *gone*: Cancelled, blocked, hold expired,
court out of service. A session that sold every seat has not gone anywhere, and
drawing it that way left Full and Closed reading as one state on the one screen
whose job is telling them apart. It takes the ink plate instead, which is
already how this build says a thing is settled, and which costs no colour.

Each step is separated three ways at once (glyph, border treatment, and
colour), so a reader who cannot tell the ochre from the ink can still put them in
order.

---

## 4. The console's two pinned surfaces

Two console tokens have no counterpart in the customer build, because the
customer build has nothing that does their job. `console-nav.css` references
neither, which is what keeps that file renderable under both documents.

| Token | Light | Dark | What it is for |
|---|---|---|---|
| `--chrome-surface` | `#171717` | `#0D0D0D` | The app bar, the tab bar, the drawer head, the rail's brand block. **Ink in both themes.** In the dark theme it drops *below* the page, because a frame lighter than what it frames stops reading as a frame. |
| `--card-surface` | `#F2EEDD` | `#1F1F1F` | The fill of a card, row, or button, **as the theme declares it**. |

`--card-surface` and `--surface-raised` hold the same value in both themes and
are still two tokens rather than one name and an alias. The difference is not
the colour, it is the scope: A console card **redeclares `--surface-raised`
locally** so that a panel nested inside it keeps rising above it. A card that
painted itself with `var(--surface-raised)` would therefore paint itself with
its own children's value. `--card-surface` is the one that stays put.

---

## 5. Cream type: where it belongs and where it does not

Cream is the type colour **on ink**: The app bar, the tab bar, the drawer head,
the rail's brand row, the whole dark theme, and the selected pill. It is also
right for small accents on those surfaces.

It is **never the primary reading colour on a light page.** If a rule sets a
cream `color` on anything sitting on `--surface`, that is the mistake this
section exists to prevent. Use `--text-primary`; it already resolves to the
right thing in both themes.

---

## 6. Contrast

Body type owes 4.5:1. Large type and the boundary of any control owe 3:1. The
audit for this palette, including the pairs that got *worse*, is in the final
sweep section of `DECISIONS.md`.

The three worst ratios in the new light console are recorded there rather than
here, because they are a fact about a moment and this file is a fact about the
system. What belongs here is the rule they are measured against, and it is the
one above.
