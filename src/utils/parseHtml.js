import { genId } from './bookUtils'
import { sanitizeSvgPaths } from './sanitizeSvg'

// Convierte el HTML del formato original (recetario_olivia_completo.html) en un objeto Book.
//
// Comportamiento para recetas incompletas:
//   - Sin título → se omiten (se registran en result.skipped)
//   - Con título pero sin ingredientes/pasos → se importan con arrays vacíos (dato incompleto
//     pero válido; la usuaria puede editarlos manualmente)
//
// Lanza un Error con mensaje legible en casos fatales:
//   - htmlString vacío o nulo
//   - No es HTML real (sin <body>)
//   - Sin recetas reconocibles (.page.card) ni portada (.cover-title)

export function parseHtmlBook(htmlString) {
  // ── Guardia 1: entrada vacía ──────────────────────────────────────────────
  if (!htmlString || typeof htmlString !== 'string' || !htmlString.trim()) {
    throw new Error('El archivo está vacío. Elegí un archivo HTML con contenido.')
  }

  // ── Guardia 2: no es HTML ─────────────────────────────────────────────────
  // DOMParser siempre devuelve un documento, pero si no es HTML real la raíz
  // estará vacía o mostrará un parseerror.
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('El archivo no es un HTML válido. Verificá que no esté dañado.')
  }

  const bodyText = doc.body?.textContent?.trim() || ''
  if (!bodyText) {
    throw new Error('El archivo HTML no tiene contenido reconocible.')
  }

  // ── Guardia 3: estructura esperada ausente ────────────────────────────────
  const hasCoverTitle = !!doc.querySelector('.cover-title')
  const hasCards      = doc.querySelectorAll('.page.card').length > 0

  if (!hasCoverTitle && !hasCards) {
    throw new Error(
      'El archivo no tiene el formato esperado del Recetario de Olivia.\n' +
      'Asegurate de importar un HTML exportado desde esta misma app o generado con el formato correcto (.cover-title y .page.card).'
    )
  }

  // ── Nombre del libro ──────────────────────────────────────────────────────
  const coverTitleEl = doc.querySelector('.cover-title')
  let name = 'Recetario importado'
  if (coverTitleEl) {
    name = [...coverTitleEl.childNodes]
      .map(n => n.textContent.trim())
      .join(' ')
      .trim() || 'Recetario importado'
  }
  const subtitle = doc.querySelector('.cover .eyebrow')?.textContent?.trim() || ''

  // ── Parsear recetas ───────────────────────────────────────────────────────
  const cards   = doc.querySelectorAll('.page.card')
  const recipes = []
  const skipped = []

  Array.from(cards).forEach((card, i) => {
    // Pestaña → categoría y extra
    const tabText  = card.querySelector('.card-tab')?.textContent?.trim() || ''
    const tabParts = tabText.split('·').map(s => s.trim())
    const category = tabParts[1] || 'Horneada'
    const extra    = tabParts[2] || null

    // Título y subtítulo
    const titleEl  = card.querySelector('.card-title')
    const recSub   = titleEl?.querySelector('small')?.textContent?.trim() || ''
    titleEl?.querySelector('small')?.remove()
    const title = titleEl?.textContent?.trim() || ''

    // Receta sin título → omitir con aviso
    if (!title) {
      skipped.push(`Receta en posición ${i + 1} (sin título) — omitida`)
      return
    }

    // SVG del ícono (sanitizado: solo formas geométricas, sin scripts/eventos)
    const iconSvgEl = card.querySelector('.card-icon svg')
    const svgPaths  = sanitizeSvgPaths(iconSvgEl?.innerHTML?.trim() || '')

    // Rendimiento
    const firstLabel = card.querySelector('.section-label')?.textContent || ''
    const yieldMatch = firstLabel.match(/rinde\s+(.+)/i)
    const yieldText  = yieldMatch ? yieldMatch[1].trim() : '16 unidades'

    // Ingredientes
    const ingEls      = card.querySelectorAll('.ingredients li')
    const ingredients = Array.from(ingEls).map(li => {
      const clone = li.cloneNode(true)
      const amtEl = clone.querySelector('.amt')
      const amount = amtEl?.textContent?.trim() || ''
      amtEl?.remove()
      return { name: clone.textContent.trim(), amount }
    }).filter(ing => ing.name) // omitir filas completamente vacías

    // Pasos
    const steps = Array.from(card.querySelectorAll('.steps li'))
      .map(li => li.textContent.trim())
      .filter(Boolean)

    // Duración
    const dvalEl  = card.querySelector('.dval')
    const dvalHtml = dvalEl?.innerHTML || ''
    const dparts  = dvalHtml.split(/<br\s*\/?>/i)
    const duration = {
      line1: dparts[0]?.replace(/<[^>]+>/g, '').trim() || '',
      line2: dparts[1]?.replace(/<[^>]+>/g, '').trim() || '',
    }

    // Nota
    const note = card.querySelector('.card-note')?.textContent?.trim() || ''

    recipes.push({
      id: genId(),
      title,
      subtitle: recSub,
      category,
      extra: extra || null,
      svgPaths,
      yield: yieldText,
      ingredients,
      steps,
      duration,
      note,
    })
  })

  // ── Guardia 4: sin ninguna receta válida ──────────────────────────────────
  if (recipes.length === 0) {
    throw new Error(
      'No se encontraron recetas válidas en el archivo.\n' +
      (skipped.length
        ? `Se omitieron ${skipped.length} receta(s) sin título.`
        : 'Verificá que el HTML tenga elementos .page.card con título.')
    )
  }

  return {
    book: {
      id: `book-${genId()}`,
      name,
      subtitle,
      createdAt: new Date().toISOString().slice(0, 10),
      recipes,
    },
    skipped, // Array de strings descriptivos; vacío si todo importó OK
  }
}
