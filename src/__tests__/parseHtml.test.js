import { describe, it, expect } from 'vitest'
import { parseHtmlBook } from '../utils/parseHtml'

// HTML mínimo válido con una receta completa
const VALID_HTML = `
<html><body>
  <div class="cover">
    <h1 class="cover-title">Galletas para <em>Olivia</em></h1>
    <span class="eyebrow">Edición especial</span>
  </div>
  <div class="page card">
    <div class="card-tab">• Horneada</div>
    <h2 class="card-title">Galleta de Avena <small>Con manzana</small></h2>
    <div class="card-icon"><svg><path d="M1 1"/></svg></div>
    <div class="section-label">Rinde 12 unidades</div>
    <ul class="ingredients">
      <li>Avena <span class="amt">1 taza</span></li>
      <li>Manzana <span class="amt">½ unidad</span></li>
    </ul>
    <ol class="steps">
      <li>Mezclar todos los ingredientes.</li>
      <li>Hornear 20 min a 180°C.</li>
    </ol>
    <div class="dval">Refri: 7 días<br>Freezer: 2 meses</div>
    <div class="card-note">Sin azúcar agregada.</div>
  </div>
</body></html>
`

// HTML con una receta sin título (debe omitirse)
const HTML_WITH_MISSING_TITLE = `
<html><body>
  <div class="cover"><h1 class="cover-title">Mi libro</h1></div>
  <div class="page card">
    <div class="card-title"></div>
    <ul class="ingredients"><li>Avena <span class="amt">1 taza</span></li></ul>
  </div>
  <div class="page card">
    <h2 class="card-title">Galleta buena</h2>
    <ul class="ingredients"><li>Miel <span class="amt">1 cdta</span></li></ul>
  </div>
</body></html>
`

// HTML sin clases esperadas
const HTML_NO_STRUCTURE = `
<html><body><p>Esto no es un recetario.</p></body></html>
`

// Receta con título pero sin ingredientes ni pasos
const HTML_INCOMPLETE_RECIPE = `
<html><body>
  <div class="cover"><h1 class="cover-title">Libro incompleto</h1></div>
  <div class="page card">
    <h2 class="card-title">Galleta sin detalle</h2>
  </div>
</body></html>
`

describe('parseHtmlBook', () => {
  // ── Casos de error (fatales) ─────────────────────────────────────────────

  it('lanza error con string vacío', () => {
    expect(() => parseHtmlBook('')).toThrow('El archivo está vacío')
  })

  it('lanza error con string solo espacios', () => {
    expect(() => parseHtmlBook('   ')).toThrow('El archivo está vacío')
  })

  it('lanza error si el valor no es string', () => {
    expect(() => parseHtmlBook(null)).toThrow('El archivo está vacío')
    expect(() => parseHtmlBook(undefined)).toThrow('El archivo está vacío')
  })

  it('lanza error cuando el HTML no tiene las clases esperadas', () => {
    expect(() => parseHtmlBook(HTML_NO_STRUCTURE)).toThrow('formato esperado')
  })

  it('lanza error cuando todas las recetas son omitidas (solo recetas sin título)', () => {
    const htmlOnlyTitleless = `
      <html><body>
        <div class="cover"><h1 class="cover-title">Libro</h1></div>
        <div class="page card"><div class="card-title"></div></div>
      </body></html>
    `
    expect(() => parseHtmlBook(htmlOnlyTitleless)).toThrow('No se encontraron recetas válidas')
  })

  // ── Caso feliz ───────────────────────────────────────────────────────────

  it('parsea un HTML válido correctamente', () => {
    const { book, skipped } = parseHtmlBook(VALID_HTML)

    expect(skipped).toHaveLength(0)
    expect(book.recipes).toHaveLength(1)

    const r = book.recipes[0]
    expect(r.title).toBe('Galleta de Avena')
    expect(r.subtitle).toBe('Con manzana')
    expect(r.category).toBe('Horneada')
    expect(r.ingredients).toHaveLength(2)
    expect(r.ingredients[0]).toEqual({ name: 'Avena', amount: '1 taza' })
    expect(r.steps).toHaveLength(2)
    expect(r.duration.line1).toBe('Refri: 7 días')
    expect(r.duration.line2).toBe('Freezer: 2 meses')
    expect(r.note).toBe('Sin azúcar agregada.')
    expect(r.yield).toBe('12 unidades')
  })

  it('extrae el nombre del libro desde .cover-title', () => {
    const { book } = parseHtmlBook(VALID_HTML)
    // El em "Olivia" se incluye en el texto
    expect(book.name).toContain('Galletas para')
    expect(book.name).toContain('Olivia')
  })

  it('extrae el subtítulo del libro desde .cover .eyebrow', () => {
    const { book } = parseHtmlBook(VALID_HTML)
    expect(book.subtitle).toBe('Edición especial')
  })

  it('genera un id único para el libro', () => {
    const { book: b1 } = parseHtmlBook(VALID_HTML)
    const { book: b2 } = parseHtmlBook(VALID_HTML)
    expect(b1.id).not.toBe(b2.id)
  })

  // ── Recetas incompletas / parciales ──────────────────────────────────────

  it('omite recetas sin título y las reporta en skipped', () => {
    const { book, skipped } = parseHtmlBook(HTML_WITH_MISSING_TITLE)
    expect(book.recipes).toHaveLength(1)
    expect(book.recipes[0].title).toBe('Galleta buena')
    expect(skipped).toHaveLength(1)
    expect(skipped[0]).toMatch(/posición 1/)
  })

  it('importa receta con título pero sin ingredientes ni pasos (con arrays vacíos)', () => {
    const { book, skipped } = parseHtmlBook(HTML_INCOMPLETE_RECIPE)
    expect(skipped).toHaveLength(0)
    expect(book.recipes).toHaveLength(1)
    expect(book.recipes[0].title).toBe('Galleta sin detalle')
    expect(book.recipes[0].ingredients).toEqual([])
    expect(book.recipes[0].steps).toEqual([])
  })

  it('usa nombre por defecto si no hay .cover-title', () => {
    const html = `
      <html><body>
        <div class="page card"><h2 class="card-title">Galleta</h2></div>
      </body></html>
    `
    const { book } = parseHtmlBook(html)
    expect(book.name).toBe('Recetario importado')
  })
})
