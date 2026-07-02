// Construye la lista plana de páginas del flipbook a partir de las recetas.
// Cada receta ocupa una página; la foto, si existe, vive dentro de esa ficha.
export function buildFlipPages(recipes) {
  const pages = []
  recipes.forEach((recipe, i) => {
    pages.push({ type: 'recipe', recipe, recipeNumber: i + 1 })
  })
  return pages
}

// Número de página absoluto (1-based, la portada es la página 0) donde
// vive la página de una receta puntual — usado por búsqueda/favoritos.
export function getRecipePageNumber(recipes, recipeId) {
  const pages = buildFlipPages(recipes)
  const idx = pages.findIndex(p => p.type === 'recipe' && p.recipe.id === recipeId)
  return idx === -1 ? 1 : idx + 1
}
