import { sanitizeSvgPaths } from './sanitizeSvg'

export function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function exportBookAsJson(book) {
  const blob = new Blob([JSON.stringify(book, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${book.name.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Campos mínimos esperados en un objeto Recipe para que la app no explote
const RECIPE_DEFAULTS = {
  id:          () => genId(),
  title:       'Sin título',
  subtitle:    '',
  category:    'Horneada',
  extra:       null,
  svgPaths:    '',
  emoji:       '🍪',
  yield:       '',
  ingredients: [],
  steps:       [],
  duration:    { line1: '', line2: '' },
  note:        '',
  tags:        [],
  image:       '',
}

function normalizeRecipe(raw, index) {
  const out = {}
  for (const [key, def] of Object.entries(RECIPE_DEFAULTS)) {
    const val = raw[key]
    if (val === undefined || val === null) {
      out[key] = typeof def === 'function' ? def() : def
    } else {
      out[key] = val
    }
  }
  // duration puede existir como objeto parcial
  if (typeof raw.duration === 'object' && raw.duration !== null) {
    out.duration = {
      line1: raw.duration.line1 ?? '',
      line2: raw.duration.line2 ?? '',
    }
  }
  // ingredients: cada elemento necesita name y amount
  if (Array.isArray(raw.ingredients)) {
    out.ingredients = raw.ingredients.map(ing =>
      typeof ing === 'object' && ing !== null
        ? { name: ing.name ?? '', amount: ing.amount ?? '' }
        : { name: String(ing), amount: '' }
    )
  }
  // steps: normalizar a array de strings
  if (Array.isArray(raw.steps)) {
    out.steps = raw.steps.map(s => (typeof s === 'string' ? s : String(s)))
  }
  // Fallback de id
  if (!out.id) out.id = `r${index + 1}-${Date.now()}`
  // Sanitizar svgPaths: bloquea XSS en recetas importadas desde JSON no confiable
  out.svgPaths = sanitizeSvgPaths(out.svgPaths)
  return out
}

export function parseJsonBook(jsonString) {
  // ── Guardia 1: JSON inválido ──────────────────────────────────────────────
  let raw
  try {
    raw = JSON.parse(jsonString)
  } catch {
    throw new Error('El archivo no es un JSON válido. Puede estar incompleto o dañado.')
  }

  // ── Guardia 2: no es un objeto ────────────────────────────────────────────
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('El archivo JSON no tiene la estructura esperada de un recetario.')
  }

  // ── Guardia 3: campo "recipes" ausente o no array ─────────────────────────
  if (!Array.isArray(raw.recipes)) {
    throw new Error(
      'El archivo JSON no contiene el campo "recipes". ' +
      'Asegurate de importar un JSON exportado desde esta misma app.'
    )
  }

  // ── Guardia 4: nombre del libro ───────────────────────────────────────────
  const name = typeof raw.name === 'string' && raw.name.trim()
    ? raw.name.trim()
    : 'Recetario importado'

  // ── Normalizar recetas (compatibilidad con versiones anteriores) ───────────
  const recipes = raw.recipes.map((r, i) =>
    typeof r === 'object' && r !== null ? normalizeRecipe(r, i) : normalizeRecipe({}, i)
  )

  return {
    // Campos del libro con defaults para versiones antiguas
    id:         `book-${genId()}`,  // siempre nuevo id para evitar colisiones
    name,
    subtitle:   typeof raw.subtitle   === 'string' ? raw.subtitle   : '',
    createdAt:  typeof raw.createdAt  === 'string' ? raw.createdAt  : new Date().toISOString().slice(0, 10),
    coverStyle: typeof raw.coverStyle === 'object' && raw.coverStyle !== null ? raw.coverStyle : undefined,
    recipes,
  }
}

export const EMOJI_ICONS = [
  '🍎','🍊','🍋','🍌','🍇','🍓','🫐','🍑','🥭','🍍',
  '🥕','🥦','🌽','🥑','🥔','🎃','🍠','🧅','🫛','🌿',
  '🥜','🧀','🥚','🍗','🐟','🫀','🥩','🦴','🐄','🐔',
  '🧊','🍦','🥛','🧁','🍪','🎂','🥣','🍚','🌾','🫙',
]

export async function exportBookAsPDF(book, pdfElement) {
  try {
    const html2pdf = (await import('html2pdf.js')).default
    const filename = `${book.name.replace(/\s+/g, '_')}.pdf`

    const options = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    await html2pdf().set(options).from(pdfElement).save()
  } catch (err) {
    console.error('Error exporting PDF:', err)
    throw new Error(`No se pudo generar el PDF: ${err.message}`)
  }
}
