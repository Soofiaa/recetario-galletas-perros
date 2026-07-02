import { describe, it, expect } from 'vitest'
import { genId, parseJsonBook, exportBookAsJson } from '../utils/bookUtils'

// Libro completo bien formado (versión actual)
const VALID_BOOK = {
  name: 'Galletas para Olivia',
  subtitle: 'Edición especial',
  createdAt: '2026-01-01',
  coverStyle: { bgColor: '#FAF6EC' },
  recipes: [
    {
      id: 'r1',
      title: 'Galleta de Avena',
      subtitle: 'Con manzana',
      category: 'Horneada',
      extra: null,
      svgPaths: '',
      emoji: '🍎',
      yield: '12 galletas',
      ingredients: [{ name: 'Avena', amount: '1 taza' }],
      steps: ['Mezclar', 'Hornear'],
      duration: { line1: 'Refri: 7 días', line2: 'Freezer: 2 meses' },
      note: 'Sin azúcar',
      tags: ['rapida', 'sin-huevo'],
    },
  ],
}

// Libro de versión antigua: falta emoji, tags, coverStyle, subtitle del libro
const OLD_BOOK = {
  name: 'Libro antiguo',
  createdAt: '2024-06-01',
  recipes: [
    {
      id: 'r1',
      title: 'Galleta vieja',
      // sin emoji, tags, svgPaths, extra, subtitle, duration...
      category: 'Horneada',
      ingredients: [{ name: 'Harina', amount: '2 tazas' }],
      steps: ['Mezclar'],
    },
  ],
}

describe('genId', () => {
  it('genera ids únicos', () => {
    const ids = new Set(Array.from({ length: 100 }, genId))
    expect(ids.size).toBe(100)
  })

  it('devuelve un string no vacío', () => {
    expect(typeof genId()).toBe('string')
    expect(genId().length).toBeGreaterThan(0)
  })
})

describe('parseJsonBook', () => {
  // ── Casos de error ────────────────────────────────────────────────────────

  it('lanza error con JSON corrupto', () => {
    expect(() => parseJsonBook('{ esto no es json')).toThrow('JSON válido')
  })

  it('lanza error con JSON que es un array (no objeto)', () => {
    expect(() => parseJsonBook('[1,2,3]')).toThrow('estructura esperada')
  })

  it('lanza error con JSON que es un número', () => {
    expect(() => parseJsonBook('42')).toThrow('estructura esperada')
  })

  it('lanza error cuando falta el campo recipes', () => {
    expect(() => parseJsonBook(JSON.stringify({ name: 'Sin recetas' }))).toThrow('"recipes"')
  })

  it('lanza error con recipes que no es array', () => {
    expect(() => parseJsonBook(JSON.stringify({ name: 'Libro', recipes: 'no-array' }))).toThrow('"recipes"')
  })

  // ── Round-trip: exportar e importar debe preservar datos clave ─────────────

  it('parsea un libro completo y válido', () => {
    const json = JSON.stringify(VALID_BOOK)
    const result = parseJsonBook(json)

    expect(result.name).toBe('Galletas para Olivia')
    expect(result.subtitle).toBe('Edición especial')
    expect(result.recipes).toHaveLength(1)
    expect(result.recipes[0].title).toBe('Galleta de Avena')
    expect(result.recipes[0].ingredients).toEqual([{ name: 'Avena', amount: '1 taza' }])
    expect(result.recipes[0].steps).toEqual(['Mezclar', 'Hornear'])
    expect(result.recipes[0].tags).toEqual(['rapida', 'sin-huevo'])
    expect(result.coverStyle).toEqual({ bgColor: '#FAF6EC' })
  })

  it('siempre asigna un id nuevo (evita colisiones)', () => {
    const json = JSON.stringify(VALID_BOOK)
    const r1 = parseJsonBook(json)
    const r2 = parseJsonBook(json)
    expect(r1.id).not.toBe(r2.id)
    expect(r1.id).not.toBe(VALID_BOOK.id)
  })

  // ── Compatibilidad con versiones antiguas ──────────────────────────────────

  it('importa libro antiguo aplicando defaults en campos faltantes', () => {
    const json = JSON.stringify(OLD_BOOK)
    const result = parseJsonBook(json)

    expect(result.name).toBe('Libro antiguo')
    expect(result.subtitle).toBe('')        // default para campo faltante
    expect(result.coverStyle).toBeUndefined()

    const r = result.recipes[0]
    expect(r.title).toBe('Galleta vieja')
    expect(r.emoji).toBe('🍪')              // default
    expect(r.tags).toEqual([])              // default
    expect(r.svgPaths).toBe('')             // default
    expect(r.extra).toBeNull()              // default
    expect(r.subtitle).toBe('')             // default
    expect(r.duration).toEqual({ line1: '', line2: '' }) // default
    expect(r.note).toBe('')                 // default
    expect(r.yield).toBe('')                // default
  })

  it('normaliza ingredientes con formato inusual', () => {
    const book = {
      name: 'Test',
      recipes: [{
        id: 'r1', title: 'R',
        ingredients: [
          { name: 'Avena', amount: '1 taza' },  // normal
          { name: 'Miel' },                      // sin amount
          'Canela',                              // string directo (formato muy viejo)
        ],
        steps: [],
      }],
    }
    const result = parseJsonBook(JSON.stringify(book))
    expect(result.recipes[0].ingredients[0]).toEqual({ name: 'Avena', amount: '1 taza' })
    expect(result.recipes[0].ingredients[1]).toEqual({ name: 'Miel', amount: '' })
    expect(result.recipes[0].ingredients[2]).toEqual({ name: 'Canela', amount: '' })
  })

  it('normaliza steps que no son strings', () => {
    const book = {
      name: 'Test',
      recipes: [{
        id: 'r1', title: 'R',
        ingredients: [],
        steps: ['Paso 1', 42, null],
      }],
    }
    const result = parseJsonBook(JSON.stringify(book))
    expect(result.recipes[0].steps).toEqual(['Paso 1', '42', 'null'])
  })

  it('usa nombre por defecto si el campo name está vacío', () => {
    const book = { name: '', recipes: [{ id: 'r1', title: 'R', ingredients: [], steps: [] }] }
    const result = parseJsonBook(JSON.stringify(book))
    expect(result.name).toBe('Recetario importado')
  })

  it('usa createdAt de hoy si falta el campo', () => {
    const book = { name: 'Test', recipes: [] }
    const result = parseJsonBook(JSON.stringify(book))
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
