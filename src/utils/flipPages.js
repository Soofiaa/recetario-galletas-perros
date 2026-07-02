export function photoFitsOnCover(recipes) {
  if (recipes.length !== 1) return false
  const recipe = recipes[0]
  if (!recipe.image) return false

  const textLength = [
    recipe.title,
    recipe.subtitle,
  ].join(' ').length

  return textLength <= 120
}

// Construye la lista plana de páginas del flipbook a partir de las recetas.
// La página de ingredientes/pasos no recibe fotos. Si la foto no va en portada,
// se agrega una hoja extra justo después de la receta.
export function buildFlipPages(recipes, options = {}) {
  const coverPhotoRecipeId = options.coverPhotoRecipeId ?? null
  const pages = []
  recipes.forEach((recipe, i) => {
    pages.push({ type: 'recipe', recipe, recipeNumber: i + 1 })
    if (recipe.image && recipe.id !== coverPhotoRecipeId) {
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
