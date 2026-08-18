# Decision log: Admin console integration

Append-only. Newest last. One row per decision, and a decision is anything that
removed, merged, renamed, reassigned, or overrode something that existed before.

The test this log has to pass: Someone reading only this file can find anything
that disappeared, and can tell a deliberate call from an accident.

Where the prompt was silent and judgement was exercised, the row says so and
names the alternative that was rejected.

| # | Phase | Decision | What changed | Why | Reversible? |
|---|---|---|---|---|---|
| 1 | 0 | Baseline is commit `f46784e`, not `60399fb` | Branch `admin-console-integration` cut from `main` at `60399fb`. The `admin/` folder was untracked on `main`, so it was committed verbatim as `f46784e` before any edits. | A 27-file folder that git has never seen produces no diff. Every later change to `admin/` would have arrived as an undifferentiated block of new files, which makes the branch unreviewable. `f46784e` contains zero edits, so it is a true baseline. | Yes. `git diff f46784e -- admin/` is the whole of this branch's admin work. |
| 2 | 0 | Visual baselines are gitignored, not committed | Added `.baseline/` to `.gitignore`. 104 PNGs live on disk at `.baseline/{mobile,desktop}/` for the run. | The prompt allowed either. 104 binaries, regenerated at every checkpoint, would dominate the history of a branch whose readable diff is the deliverable. Rejected alternative: Commit them and accept the noise. | Yes. Delete the ignore line and `git add .baseline`. |
| 3 | 0 | Screenshot runner lives outside the repo | `shoot.mjs` plus its `playwright` install sit in the session scratchpad, not in the working tree. | The prototype's stated identity is no npm, no build step, no dependencies. Putting a `package.json` and a `node_modules` at the repo root to verify that claim would falsify it. The runner is verification tooling for this branch, not part of the prototype. Rejected alternative: A `tools/` folder in the repo with its own `package.json`. | Yes, and the script is reproduced in `ADMIN-INTEGRATION.md` so the run can be repeated. |
| 4 | 0 | Unreferenced carousel images left untracked | `carousel/c19.jpg` through `c37.jpg` remain untracked and uncommitted. | Nothing in `index.html`, `admin/`, or `preview.html` references them. They are out of this branch's scope and committing them would be an unrelated change riding along. Rejected alternative: Commit them for tidiness. | Yes. They are still on disk. |
| 5 | 0 | Prompt fact corrected: The staff shell does have desktop navigation | No code change. Recorded so Phase 2 is not built on a wrong premise. | The prompt states the staff shell has no desktop navigation above 1024 and that a Front Desk user gets the customer header as their only nav. Neither is true. `render()` populates `#bar-nav` and `#tabhost` from the same `STAFF_TABS` array on the staff branch, so the header carries Today, Scan, Walk-in, Open Play, and Exceptions with `aria-current` on the live one, and the 1280 baseline of `/staff/today` shows it. The comment above that branch is an explicit prior decision: "Staff keep theirs ... It is a different application wearing the same chrome." The Phase 2 sidebar therefore replaces a working, deliberately chosen desktop nav rather than filling a hole, which is a stronger claim than the prompt assumed and is settled in row 6. | n/a |
