// Construye la lista plana de páginas del flipbook a partir de las recetas.
// Cada receta ocupa una página; si tiene foto, se agrega una página extra
// justo después con la imagen a tamaño completo.
export function buildFlipPages(recipes) {
  const pages = []
  recipes.forEach((recipe, i) => {
    pages.push({ type: 'recipe', recipe, recipeNumber: i + 1 })
    if (recipe.image) {
      pages.push({ type: 'photo', recipe, recipeNumber: i + 1 })
    }
  })
  return pages
}

// Número de página absoluto (1-based, la portada es la página 0) donde
// vive la página "recipe" de una receta puntual — usado por búsqueda/favoritos
// para navegar directo a la receta aunque haya páginas de foto intercaladas.
export function getRecipePageNumber(recipes, recipeId) {
  const pages = buildFlipPages(recipes)
  const idx = pages.findIndex(p => p.type === 'recipe' && p.recipe.id === recipeId)
  return idx === -1 ? 1 : idx + 1
}
