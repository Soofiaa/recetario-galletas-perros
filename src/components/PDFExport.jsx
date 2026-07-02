import React from 'react'
import styles from './PDFExport.module.css'
import Cover from './Cover'

export const PDFExport = React.forwardRef(({ book }, ref) => {
  return (
    <div ref={ref} className={styles.pdfContainer}>
      {/* Portada */}
      <div className={styles.page}>
        <div className={styles.coverContainer}>
          <Cover book={book} coverStyle={book.coverStyle} />
        </div>
      </div>

      {/* Índice */}
      <div className={styles.page}>
        <h1 className={styles.indexTitle}>Índice</h1>
        <ol className={styles.indexList}>
          {book.recipes.map((recipe, i) => (
            <li key={recipe.id}>
              {i + 1}. {recipe.title}
            </li>
          ))}
        </ol>
      </div>

      {/* Recetas */}
      {book.recipes.map((recipe, idx) => (
        <div key={recipe.id} className={styles.page}>
          <div className={styles.recipePage}>
            <div className={styles.recipeHeader}>
              <span className={styles.recipeNum}>
                {idx + 1}. {recipe.title}
              </span>
              {recipe.subtitle && (
                <span className={styles.recipeSubtitle}>{recipe.subtitle}</span>
              )}
            </div>

            <div className={styles.recipeContent}>
              {recipe.image && (
                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} crossOrigin="anonymous" />
              )}

              {/* Rinde y categoría */}
              <div className={styles.recipeInfo}>
                {recipe.yield && <span className={styles.yield}>{recipe.yield}</span>}
                {recipe.category && <span className={styles.category}>{recipe.category}</span>}
              </div>

              {/* Ingredientes */}
              {recipe.ingredients.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Ingredientes</h3>
                  <ul className={styles.ingredientsList}>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>
                        <span className={styles.ingName}>{ing.name}</span>
                        <span className={styles.ingAmount}>{ing.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pasos */}
              {recipe.steps.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Preparación</h3>
                  <ol className={styles.stepsList}>
                    {recipe.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Duración */}
              {(recipe.duration?.line1 || recipe.duration?.line2) && (
                <div className={styles.durationBox}>
                  {recipe.duration.line1 && <div>{recipe.duration.line1}</div>}
                  {recipe.duration.line2 && <div>{recipe.duration.line2}</div>}
                </div>
              )}

              {/* Nota */}
              {recipe.note && (
                <div className={styles.note}>
                  <strong>Nota:</strong> {recipe.note}
                </div>
              )}

              {/* Tags */}
              {recipe.tags?.length > 0 && (
                <div className={styles.tagsContainer}>
                  {recipe.tags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

PDFExport.displayName = 'PDFExport'
