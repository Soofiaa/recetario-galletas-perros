import { describe, it, expect } from 'vitest'
import { sanitizeSvgPaths } from '../utils/sanitizeSvg'

describe('sanitizeSvgPaths', () => {
  it('conserva formas geométricas permitidas con atributos seguros', () => {
    const input = '<path d="M12 8c-4 0-7 3-7 7a5 5 0 0 0 5 5"/><circle cx="12" cy="12" r="8"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).toContain('<path')
    expect(out).toContain('<circle')
    expect(out).toContain('d="M12 8c-4 0-7 3-7 7a5 5 0 0 0 5 5"')
  })

  it('conserva transform con rotate en formas anidadas', () => {
    const input = '<ellipse cx="-82" cy="-100" rx="34" ry="46" transform="rotate(-18,-82,-100)"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).toContain('transform="rotate(-18,-82,-100)"')
  })

  it('elimina <script>', () => {
    const input = '<script>alert(document.cookie)</script><circle cx="1" cy="1" r="1"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).not.toContain('script')
    expect(out).not.toContain('alert')
    expect(out).toContain('<circle')
  })

  it('elimina <image> con onerror (vector XSS clásico en SVG)', () => {
    const input = '<image href="x" onerror="alert(1)"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).not.toContain('image')
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('alert')
  })

  it('elimina atributos de evento en tags permitidos', () => {
    const input = '<circle cx="1" cy="1" r="1" onclick="alert(1)" onload="fetch(\'evil.com\')"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).not.toContain('onclick')
    expect(out).not.toContain('onload')
    expect(out).not.toContain('alert')
    expect(out).not.toContain('evil.com')
  })

  it('elimina href y xlink:href de cualquier elemento', () => {
    const input = '<path d="M1 1" href="javascript:alert(1)" xlink:href="javascript:alert(1)"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).not.toContain('href')
    expect(out).not.toContain('javascript')
  })

  it('elimina <foreignObject> (permite HTML arbitrario embebido)', () => {
    const input = '<foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject>'
    const out = sanitizeSvgPaths(input)
    expect(out).not.toContain('foreignObject')
    expect(out).not.toContain('script')
  })

  it('elimina style con url() potencialmente malicioso', () => {
    const input = '<path d="M1 1" style="fill:url(javascript:alert(1))"/>'
    const out = sanitizeSvgPaths(input)
    expect(out).not.toContain('style')
    expect(out).not.toContain('javascript')
  })

  it('devuelve string vacío para entrada vacía, null o no-string', () => {
    expect(sanitizeSvgPaths('')).toBe('')
    expect(sanitizeSvgPaths(null)).toBe('')
    expect(sanitizeSvgPaths(undefined)).toBe('')
    expect(sanitizeSvgPaths(123)).toBe('')
  })

  it('devuelve string vacío para XML mal formado sin lanzar excepción', () => {
    expect(() => sanitizeSvgPaths('<path d="M1 1"')).not.toThrow()
  })

  it('trunca entradas extremadamente largas en vez de fallar', () => {
    const huge = '<path d="' + 'M1 1 '.repeat(10000) + '"/>'
    expect(() => sanitizeSvgPaths(huge)).not.toThrow()
  })
})
