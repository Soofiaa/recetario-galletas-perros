import { describe, it, expect } from 'vitest'
import { buildFlipPages, getRecipePageNumber, photoFitsOnCover } from '../utils/flipPages'

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

describe('photoFitsOnCover', () => {
  it('permite foto en portada cuando hay una sola receta', () => {
    expect(photoFitsOnCover([withImage('a', 'foto.jpg')])).toBe(true)
  })

  it('manda la foto a hoja extra cuando hay varias recetas', () => {
    expect(photoFitsOnCover([withImage('a', 'foto.jpg'), withImage('b', 'otra.jpg')])).toBe(false)
  })
})

describe('buildFlipPages', () => {
  it('una página por receta sin foto', () => {
    const pages = buildFlipPages([noImage('a'), noImage('b')])
    expect(pages).toHaveLength(2)
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe'])
  })

  it('omite la hoja de foto cuando la foto vive en portada', () => {
    const pages = buildFlipPages([withImage('a', 'foto.jpg')], { coverPhotoRecipeId: 'a' })
    expect(pages.map(p => p.type)).toEqual(['recipe'])
  })

  it('agrega una hoja extra cuando la foto no vive en portada', () => {
    const pages = buildFlipPages([noImage('a'), longWithImage('b', 'foto.jpg'), noImage('c')])
    expect(pages.map(p => p.type)).toEqual(['recipe', 'recipe', 'photo', 'recipe'])
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
