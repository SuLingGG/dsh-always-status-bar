/**
 * dsh-always-status-bar — Browser half (the `./client` bundle).
 *
 * Classic-script bundle: registers a lazy factory with
 * `window.__ModuleLoader__` (the DSH client module system). The factory
 * returns the Cordis plugin shape the boot Loader imports; `apply` injects
 * one `<style data-plugin>` tag whose single rule keeps the native message
 * status line visible.
 *
 * Facts located in the DSH checkout this plugin targets (verified against
 * 0.1.7-alpha.1 … 0.2.1-alpha.3; see README "Requirements"):
 * - The status line lives in the per-message action row, `MessageIconActions`
 *   in `@deepseek-ai/dsh-client-ui-chat` (the chat UI moved there out of
 *   `dsh-client-ui-conversation` at 0.1.2-alpha.2). That row is
 *   `<div class="[hash]_actions" data-clock="start" | "end">`: user messages
 *   render the clock as a child (`clock="start"`, class `[hash]_timeStart`),
 *   assistant turn tails render copy / extra actions / branch and an
 *   `[hash]_endInfo` span holding the usage pill plus the clock
 *   (`clock="end"`, class `[hash]_timeEnd`).
 * - Hide mechanism: `chat/MessageIconActions.module.css` sets `opacity: 0` on
 *   the WHOLE ROW — not on the clock span — inside `@media (hover: hover)`,
 *   and reveals it on `:hover` / `:focus-within`. The row is always in the
 *   DOM, so a pure CSS visibility override is the whole feature: no DOM
 *   scanning, no observers, no polling.
 * - `data-clock` only exists from 0.1.7-alpha.1 on; before that the row
 *   carried no `data-*` attribute at all.
 * - Because the row fades as one unit, the override targets the row
 *   (see `always-status-bar.css`); a child `opacity: 1` cannot escape a parent
 *   `opacity: 0`, since child opacity multiplies into the parent's.
 */
import css from './always-status-bar.css'

// The bundle is a classic script wrapped by build.mjs in the same handoff
// shape as DSH's own client bundles: `var module = { exports: {} }` is
// declared in the banner before this body runs. Everything is exported via
// `module.exports` at the end — no ES export syntax, so the emitted file is
// a plain classic script with no module semantics.
declare const module: { exports: { name: string; apply: typeof apply } }

/** Cordis plugin name; must equal the package name (the graph row id). */
const name = 'dsh-always-status-bar'

/** Stable style tag id, mirroring the native `data-plugin-css` naming (`<id>/<file>`). */
const STYLE_TAG_ID = 'dsh-always-status-bar/always-status-bar.css'

/** Minimal structural view of the Cordis context this plugin uses. */
interface StatusBarPluginContext {
  effect(execute: () => () => void, label: string): unknown
}

/**
 * Inject the always-visible override, scoped to this plugin's fiber: the
 * effect disposer removes the style tag when the plugin unloads, restoring
 * native hover-only behavior with no page reload and no leftover CSS.
 * Re-application is idempotent (the native pipeline uses the same
 * `data-plugin-css` uniqueness guard).
 * @param ctx - the client plugin context.
 */
function apply(ctx: StatusBarPluginContext): void {
  const existing = document.querySelector<HTMLStyleElement>(`style[data-plugin-css=${JSON.stringify(STYLE_TAG_ID)}]`)
  const style: HTMLStyleElement = existing ?? document.createElement('style')
  if (existing === null) {
    style.dataset.plugin = name
    style.dataset.pluginCss = STYLE_TAG_ID
    style.textContent = css
    document.head.appendChild(style)
  }
  ctx.effect(() => () => {
    style.remove()
  }, `${name}: always-visible status bar style`)
}

module.exports = { name, apply }
