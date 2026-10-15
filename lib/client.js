window.__ModuleLoader__.load({
  id: "dsh-always-status-bar",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";

// src/client/always-status-bar.css
var always_status_bar_default = "/*\n * dsh-always-status-bar override \u2014 DSH >= 0.1.7-alpha.1.\n *\n * DSH renders each message's native status line inside that message's action\n * row (ui-chat `MessageIconActions`) and fades the WHOLE ROW \u2014 not the clock\n * span \u2014 inside `@media (hover:hover)`:\n *\n *   [data-actions-reveal=hover] .[hash]_actions,\n *   :is([data-chat-flow-kind=user],[data-chat-flow-kind=steering])\n *     :has(~:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering])) .[hash]_actions\n *     { opacity: 0; transition: opacity 80ms }\n *\n * revealed on `:hover` / `:focus-within`. Up to 0.1.x that sheet hid only the\n * clock span and scoped it under `data-time-hover-root`; the attribute no\n * longer exists (zero occurrences across the 0.2.0-rc.2 install), and because\n * the row now animates as one unit a child `opacity: 1` cannot escape a parent\n * `opacity: 0` \u2014 child opacity multiplies into the parent's. The row itself is\n * therefore the only lever, so the row is what this sheet targets.\n *\n * `data-clock` (`\"start\"` | `\"end\"`) is the attribute DSH's own CSS already\n * keys on, so it is a semantic hook rather than a build-hashed CSS-module class\n * (`[hash]_[local]` renaming would invalidate the latter). Both arms below\n * mirror the two native hide rules exactly with the row as the subject, so the\n * plugin reveals precisely the rows DSH hides \u2014 and nothing else.\n *\n * One rule, one declaration:\n * - `!important` keeps the override above the native normal declaration\n *   regardless of stylesheet order (plugin bundles materialize concurrently,\n *   so order is not under this plugin's control).\n * - No `>` child combinator: slot entries such as the like/dislike pair hang\n *   off a `display: contents` wrapper \u2014 invisible to layout, still a DOM node \u2014\n *   so any depth-sensitive selector would silently miss them.\n * - Deliberately not wrapped in `@media (hover:hover)`: the native hide rules\n *   are themselves hover-scoped, so where nothing is ever hidden this\n *   declaration sets `opacity: 1` on a row that already is 1 (a no-op), and the\n *   sheet stays a single rule.\n * - Keeping the row visible keeps everything the row carries visible, action\n *   buttons included (copy / branch / like / dislike). That is this plugin's\n *   intent: one always-visible status row per message \u2014 the rendering DSH\n *   already gives a row marked `data-actions-reveal=\"always\"`.\n * - No other property changes: font, color, date/time format, spacing and\n *   alignment stay native.\n */\n[data-actions-reveal=hover] [data-clock],\n:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering]):has(~:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering])) [data-clock] {\n  opacity: 1 !important;\n}\n";

// src/client/index.ts
var name = "dsh-always-status-bar";
var STYLE_TAG_ID = "dsh-always-status-bar/always-status-bar.css";
function apply(ctx) {
  const existing = document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG_ID)}]`);
  const style = existing != null ? existing : document.createElement("style");
  if (existing === null) {
    style.dataset.plugin = name;
    style.dataset.pluginCss = STYLE_TAG_ID;
    style.textContent = always_status_bar_default;
    document.head.appendChild(style);
  }
  ctx.effect(() => () => {
    style.remove();
  }, `${name}: always-visible status bar style`);
}
module.exports = { name, apply };
    return module.exports;
  },
});
