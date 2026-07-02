import { describe, it, expect } from 'vitest'
import { buildFlipPages, getRecipePageNumber } from '../utils/flipPages'

const withImage = (id, image) => ({ id, title: `Receta ${id}`, image })
const noImage = (id) => ({ id, title: `Receta ${id}`, image: '' })

describe('buildFlipPages', () => {
  it('una página por receta sin foto', () => {
    const pages = buildFlipPages([noImage('a'), noImage('b')])
    expect(pages).toHaveLength(2)
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe'])
  })

  it('agrega una página extra de foto justo después de la receta que la tiene', () => {
    const pages = buildFlipPages([noImage('a'), withImage('b', 'foto.jpg'), noImage('c')])
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe', 'photo', 'recipe'])
    expect(pages[2].recipe.id).toBe('b')
  })

  it('recipeNumber es el ordinal de la receta, no el índice de página', () => {
    const pages = buildFlipPages([withImage('a', 'x.jpg'), noImage('b')])
    // recipe a (con foto) -> páginas 0 y 1, ambas recipeNumber 1
    expect(pages[0].recipeNumber).toBe(1)
    expect(pages[1].recipeNumber).toBe(1)
    // recipe b -> página 2, recipeNumber 2
    expect(pages[2].recipeNumber).toBe(2)
  })

  it('lista vacía da lista de páginas vacía', () => {
    expect(buildFlipPages([])).toEqual([])
  })
})

describe('getRecipePageNumber', () => {
  it('devuelve la página absoluta 1-based correcta sin fotos intercaladas', () => {
    const recipes = [noImage('a'), noImage('b'), noImage('c')]
    expect(getRecipePageNumber(recipes, 'a')).toBe(1)
    expect(getRecipePageNumber(recipes, 'b')).toBe(2)
    expect(getRecipePageNumber(recipes, 'c')).toBe(3)
  })

  it('salta correctamente las páginas de foto intercaladas', () => {
    const recipes = [withImage('a', 'x.jpg'), withImage('b', 'y.jpg'), noImage('c')]
    // a: página 1 (receta) + página 2 (foto)
    // b: página 3 (receta) + página 4 (foto)
    // c: página 5 (receta)
    expect(getRecipePageNumber(recipes, 'a')).toBe(1)
    expect(getRecipePageNumber(recipes, 'b')).toBe(3)
    expect(getRecipePageNumber(recipes, 'c')).toBe(5)
  })

  it('devuelve 1 si la receta no existe (no revienta)', () => {
    expect(getRecipePageNumber([noImage('a')], 'inexistente')).toBe(1)
  })
})
