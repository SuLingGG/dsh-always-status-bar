# Changelog

## 0.1.2 — 2026-10-15

Make `dsh plugin add github:SuLingGG/dsh-always-status-bar` work with no build
approval.

- **Fixed**: pnpm ≥ 10 refused the git install with
  `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` — a git-hosted dependency that declares
  `prepare` must be allowlisted in the consuming profile's `pnpm-workspace.yaml`
  (`allowBuilds`). Dropped the `prepare` hook: `lib/` is committed, so nothing
  needs building at install time. `prepack` still rebuilds on
  `npm pack`/`publish`, and `pnpm test`/`pnpm run build` still build locally.
- The gate turns out to be skippable by design: pnpm only builds a fetched tree
  when `prepare` is set, or when a prepublish-family hook is set *and* the
  manifest's `main` entry is missing from the tarball — and `lib/index.js` is
  committed. So the allowlist entry is no longer part of the install story.
- README: install instructions no longer mention `allowBuilds` for `v0.1.2`+,
  and keep the one-line allowlist note for older refs (including `v0.1.1`).
- Tests: the manifest suite now fails if a `prepare` script reappears, so the
  approval-free install cannot regress silently.

## 0.1.1 — 2026-10-15

Re-anchor the override on DSH ≥ 0.1.7-alpha.1, where DSH fades the whole action
row instead of the clock span.

- **Fixed**: 0.1.0 was a silent no-op on DSH 0.1.2-alpha.2 and later.
  `data-time-hover-root`, the rule's anchor, no longer exists, and the row is now
  faded as one unit — so a child `opacity: 1` could never override the parent's.
  The rule now targets the row itself via `[data-clock]`, the semantic attribute
  DSH's own stylesheet keys on.
- Both selector arms mirror the native hide rules exactly, so the plugin reveals
  precisely the rows DSH hides. No `>` child combinator: slot entries
  (like/dislike) hang off a `display: contents` wrapper that a depth-sensitive
  selector would silently miss.
- Kept the row visible means everything the row carries is visible, action
  buttons included — the same rendering DSH gives a row marked
  `data-actions-reveal="always"`.
- Declared the verified runtime range in `peerDependencies`
  (`@deepseek-ai/dsh >= 0.1.7-alpha.1`); DSH denies this row — and only this row —
  on anything older instead of silently doing nothing.
- Docs and the CSS contract test updated: the tests now guard the new anchor, the
  absence of `>` (the slot-wrapper trap), and the no-hashed-class rule.

Verified against every published release of the web chat UI: applies to
`0.1.7-alpha.1` … `0.2.1-alpha.3` (incl. `latest` = `0.2.0-rc.2`); not applicable
to `0.1.2-alpha.2` … `0.1.6-alpha.2` (no `data-*` anchor on the row) or
`0.1.1-rc.2` and earlier (different mechanism and package).

## 0.1.0 — 2026-08-27

First public release.

- Always-visible native per-message status line: date | time on every message; run duration, TTFT, and tokens/s on assistant messages.
- Installable from npm (`dsh plugin add dsh-always-status-bar`) or GitHub.
- One scoped CSS override; zero configuration, no persistence, no backend.
