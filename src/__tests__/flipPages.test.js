import { describe, it, expect } from 'vitest'
import { buildFlipPages, getRecipePageNumber, photoFitsOnRecipePage } from '../utils/flipPages'

const baseRecipe = (id, image = '') => ({
  id,
  title: `Receta ${id}`,
  subtitle: 'Simple',
  image,
  yield: '12 porciones',
  ingredients: [
    { name: 'Avena', amount: '1 taza' },
    { name: 'Huevo', amount: '1 un.' },
  ],
  steps: [
    'Mezclar todo.',
    'Hornear hasta dorar.',
  ],
  note: 'Dejar enfriar.',
})
const withImage = (id, image) => baseRecipe(id, image)
const noImage = (id) => baseRecipe(id)
const longWithImage = (id, image) => ({
  ...baseRecipe(id, image),
  ingredients: [
    { name: 'Avena molida', amount: '1 taza' },
    { name: 'Huevos', amount: '2 un.' },
    { name: 'Miel', amount: '1 cda.' },
    { name: 'Bicarbonato de sodio', amount: '1 cdta.' },
    { name: 'Banana grande', amount: '1 un.' },
    { name: 'Manzana rallada', amount: '1 un.' },
  ],
  steps: [
    'Pisar la banana y agregar los huevos, mezclar con la miel.',
    'Agregar la avena y el bicarbonato, mezclar muy bien.',
    'Aceitar una budinera y precalentar el horno.',
    'Hornear hasta que al pinchar con un cuchillo salga seco.',
  ],
})

describe('photoFitsOnRecipePage', () => {
  it('permite foto inline para recetas cortas', () => {
    expect(photoFitsOnRecipePage(withImage('a', 'foto.jpg'))).toBe(true)
  })

  it('manda la foto a hoja extra cuando la receta es larga', () => {
    expect(photoFitsOnRecipePage(longWithImage('a', 'foto.jpg'))).toBe(false)
  })
})

describe('buildFlipPages', () => {
  it('una página por receta sin foto', () => {
    const pages = buildFlipPages([noImage('a'), noImage('b')])
    expect(pages).toHaveLength(2)
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe'])
  })

  it('mantiene la foto en la receta cuando cabe', () => {
    const pages = buildFlipPages([noImage('a'), withImage('b', 'foto.jpg'), noImage('c')])
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe', 'recipe'])
    expect(pages[1].showImageInline).toBe(true)
  })

  it('agrega una hoja extra cuando la foto no cabe en la receta', () => {
    const pages = buildFlipPages([noImage('a'), longWithImage('b', 'foto.jpg'), noImage('c')])
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe', 'photo', 'recipe'])
    expect(pages[1].showImageInline).toBe(false)
    expect(pages[2].recipe.id).toBe('b')
  })

  it('recipeNumber es el ordinal de la receta, no el índice de página', () => {
    const pages = buildFlipPages([longWithImage('a', 'x.jpg'), noImage('b')])
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
    const recipes = [longWithImage('a', 'x.jpg'), longWithImage('b', 'y.jpg'), noImage('c')]
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
