import React, { useState, useMemo } from 'react'
import styles from './RecipePage.module.css'
import NoteOverlay from './NoteOverlay'
import { sanitizeSvgPaths } from '../utils/sanitizeSvg'

const RecipePage = React.forwardRef(({
  recipe, recipeNumber,
  isFavorite, onToggleFavorite,
  note, onSaveNote,
}, ref) => {
  const [showNote, setShowNote] = useState(false)
  const tabLabel = `Receta ${String(recipeNumber).padStart(2, '0')} · ${recipe.category}${recipe.extra ? ` · ${recipe.extra}` : ''}`
  // Defensa en profundidad: sanitizar de nuevo antes de inyectar al DOM,
  // por si el dato ya estaba guardado de antes de validarse en el import.
  const safeSvgPaths = useMemo(() => sanitizeSvgPaths(recipe.svgPaths), [recipe.svgPaths])

  return (
    <div ref={ref} className={styles.page}>
      {/* Pestaña */}
      <div className={styles.tab}>
        <svg
          viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor"
          className={styles.tabIcon}
          dangerouslySetInnerHTML={{ __html: safeSvgPaths }}
        />
        {tabLabel}
      </div>

      {/* Acciones flotantes — favorito y nota */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${isFavorite ? styles.favActive : ''}`}
          onClick={onToggleFavorite}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        <button
          className={`${styles.actionBtn} ${note ? styles.noteActive : ''}`}
          onClick={() => setShowNote(true)}
          title="Mis notas"
        >
          📝
        </button>
      </div>

      {/* Cabecera */}
      <div className={styles.head}>
        <div className={styles.iconCircle}>
          {recipe.emoji ? (
            <span className={styles.emojiIcon}>{recipe.emoji}</span>
          ) : (
            <svg
              viewBox="0 0 24 24" fill="none"
              stroke="var(--color-pine-dark)" strokeWidth="1.6"
              className={styles.icon}
              dangerouslySetInnerHTML={{ __html: safeSvgPaths }}
            />
          )}
        </div>
        <div className={styles.titleBlock}>
          <span className={styles.title}>{recipe.title}</span>
          {recipe.subtitle && <small className={styles.subtitle}>{recipe.subtitle}</small>}
        </div>
      </div>

      {/* Cuerpo */}
      <div className={styles.body}>
        <div className={styles.sectionLabel}>
          Ingredientes · rinde {recipe.yield}
        </div>
        <ul className={styles.ingredients}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className={styles.ingredient}>
              <span className={styles.ingName}>{ing.name}</span>
              <span className={styles.ingAmount}>{ing.amount}</span>
            </li>
          ))}
        </ul>

        <div className={styles.sectionLabel}>Preparación</div>
        <ol className={styles.steps}>
          {recipe.steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {/* Nota personal si existe */}
        {note && (
          <div className={styles.notePreview} onClick={() => setShowNote(true)}>
            <span className={styles.noteIcon}>📝</span>
            <span className={styles.noteText}>{note}</span>
          </div>
        )}

      </div>

      {/* Etiquetas */}
      {recipe.tags?.length > 0 && (
        <div className={styles.tags}>
          {recipe.tags.map((tag, i) => (
            <span key={i} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      {/* Pie */}
      <div className={styles.foot}>
        <div className={styles.stamp}>
          <div className={styles.stampTitle}>Duración</div>
          <div className={styles.stampValue}>
            {recipe.duration.line1}<br />{recipe.duration.line2}
          </div>
        </div>
        <p className={styles.note}>{recipe.note}</p>
      </div>

      {/* Modal de nota */}
      {showNote && (
        <NoteOverlay
          recipeName={recipe.title}
          initialNote={note}
          onSave={onSaveNote}
          onClose={() => setShowNote(false)}
        />
      )}
    </div>
  )
})

RecipePage.displayName = 'RecipePage'
export default RecipePage
