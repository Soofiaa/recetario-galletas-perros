// Sanitiza fragmentos SVG antes de inyectarlos con dangerouslySetInnerHTML.
// Solo permite formas geométricas simples (sin <script>, <image>, <use>,
// atributos de evento, href, style, etc.) para prevenir XSS en recetas
// importadas desde HTML/JSON de origen no confiable.

const ALLOWED_TAGS = new Set(['path', 'circle', 'ellipse', 'line', 'rect', 'polygon', 'polyline', 'g'])
const ALLOWED_ATTRS = new Set([
  'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y',
  'x1', 'y1', 'x2', 'y2', 'points', 'width', 'height', 'transform',
])
// Solo letras (comandos de path/transform), dígitos, espacios y puntuación de coordenadas
const SAFE_ATTR_VALUE = /^[a-zA-Z0-9\s.,\-()%]*$/
const MAX_LENGTH = 5000

export function sanitizeSvgPaths(input) {
  if (typeof input !== 'string' || !input.trim()) return ''
  const trimmed = input.slice(0, MAX_LENGTH)

  try {
    const doc = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg">${trimmed}</svg>`,
      'image/svg+xml'
    )
    if (doc.querySelector('parsererror')) return ''

    const out = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    cleanInto(doc.documentElement, out)
    return out.innerHTML
  } catch {
    return ''
  }
}

function cleanInto(sourceParent, targetParent) {
  for (const child of Array.from(sourceParent.children)) {
    const tag = child.tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) continue

    const clean = document.createElementNS('http://www.w3.org/2000/svg', tag)
    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase()
      if (!ALLOWED_ATTRS.has(name)) continue
      if (!SAFE_ATTR_VALUE.test(attr.value)) continue
      clean.setAttribute(name, attr.value)
    }
    cleanInto(child, clean)
    targetParent.appendChild(clean)
  }
}
