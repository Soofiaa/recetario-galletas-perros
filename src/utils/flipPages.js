// Construye la lista plana de páginas del flipbook a partir de las recetas.
// Cada receta ocupa una página; si la foto no cabe con holgura,
// se agrega una hoja extra justo después con la imagen contenida.
export function photoFitsOnRecipePage(recipe) {
  if (!recipe.image) return false

  const ingredientCount = recipe.ingredients?.length ?? 0
  const stepCount = recipe.steps?.length ?? 0
  const textLength = [
    recipe.title,
    recipe.subtitle,
    recipe.yield,
    ...(recipe.ingredients ?? []).map(ing => `${ing.name} ${ing.amount}`),
    ...(recipe.steps ?? []),
    recipe.note,
  ].join(' ').length

  return ingredientCount <= 4 && stepCount <= 4 && textLength <= 620
}

export function buildFlipPages(recipes) {
  const pages = []
  recipes.forEach((recipe, i) => {
    const showImageInline = photoFitsOnRecipePage(recipe)
    pages.push({ type: 'recipe', recipe, recipeNumber: i + 1, showImageInline })
    if (recipe.image && !showImageInline) {
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
