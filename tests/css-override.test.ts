/**
 * Static conformance test for the override sheet.
 *
 * SPEC §7/§13: the plugin may change exactly one thing — the visibility of the
 * native per-message status row. This test guards that contract mechanically:
 * the sheet contains a single rule, its subject is the row's stable semantic
 * `data-clock` attribute (mirroring the two native hide rules arms-for-arm),
 * and its only declaration is `opacity: 1 !important`.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../src/client/always-status-bar.css', import.meta.url), 'utf8')

/** Comment-free, trimmed sheet body. */
const body = css.replace(/\/\*[\s\S]*?\*\//g, '').trim()

function parseRules(sheet: string): Array<{ selector: string; declarations: string[] }> {
  return sheet
    .split('}')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map((part) => {
      const [selector, block] = part.split('{')
      return {
        selector: selector.trim(),
        declarations: block
          .split(';')
          .map(decl => decl.trim())
          .filter(decl => decl.length > 0),
      }
    })
}

/** Split a selector list on top-level commas only; `:is(a,b)` keeps its commas. */
function selectorArms(selector: string): string[] {
  const arms: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i]
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === ',' && depth === 0) {
      arms.push(selector.slice(start, i).trim())
      start = i + 1
    }
  }
  arms.push(selector.slice(start).trim())
  return arms
}

describe('always-status-bar.css override contract', () => {
  const rules = parseRules(body)

  it('is exactly one rule', () => {
    expect(rules).toHaveLength(1)
  })

  it('mirrors the two native hide rules with the status row as the subject', () => {
    const arms = selectorArms(rules[0]!.selector)
    // `data-actions-reveal=hover` (any non-final assistant tail) and the
    // consecutive user/steering message — the only two cases DSH hides.
    expect(arms).toHaveLength(2)
    expect(arms[0]).toContain('[data-actions-reveal=hover]')
    expect(arms[1]).toContain(':has(~:is([data-chat-flow-kind=user],[data-chat-flow-kind=steering]))')
    for (const arm of arms) {
      // The row itself carries data-clock; that is the subject of the rule.
      expect(arm.endsWith('[data-clock]')).toBe(true)
    }
  })

  it('keys on a semantic attribute, not on the removed anchor or hashed classes', () => {
    const { selector } = rules[0]!
    // `data-time-hover-root` is gone from DSH >= 0.1.2-alpha.2.
    expect(selector).not.toContain('data-time-hover-root')
    // CSS-module classes are build-hashed (`[hash]_[local]`); keying on one
    // would silently stop matching after a rebuild.
    expect(selector).not.toMatch(/\[class[*^$~|]?=/)
  })

  it('uses no child combinator, which would miss slot entries', () => {
    // Slot entries (like/dislike) render inside a `display: contents`
    // wrapper — a real DOM node, so `>` before the anchored row's descendants
    // would silently skip them.
    expect(rules[0]!.selector).not.toContain('>')
  })

  it('changes only opacity, and only to fully visible', () => {
    const { declarations } = rules[0]!
    expect(declarations).toHaveLength(1)
    const [property, value] = declarations[0]!.split(':')
    expect(property!.trim()).toBe('opacity')
    expect(value!.trim()).toBe('1 !important')
  })

  it('touches no layout, typography, or color properties anywhere in the sheet', () => {
    const forbidden = ['display', 'visibility', 'position', 'font', 'color', 'margin', 'padding', 'width', 'height', 'content', 'transform', 'transition']
    for (const property of forbidden) {
      expect(body).not.toMatch(new RegExp(`(^|[;{])${property}\\s*:`))
    }
  })
})
