import React from 'react'
import styles from './RecipeImagePage.module.css'

const RecipeImagePage = React.forwardRef(({ recipe, recipeNumber }, ref) => {
  return (
    <div ref={ref} className={styles.page}>
      <div className={styles.tab}>
        Foto · Receta {String(recipeNumber).padStart(2, '0')}
      </div>
      <div className={styles.caption}>
        <span className={styles.title}>{recipe.title}</span>
        {recipe.subtitle && <span className={styles.subtitle}>{recipe.subtitle}</span>}
      </div>
      <figure className={styles.photoFrame}>
        <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
      </figure>
    </div>
  )
})

RecipeImagePage.displayName = 'RecipeImagePage'
export default RecipeImagePage
