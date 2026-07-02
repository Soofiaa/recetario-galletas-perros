import React from 'react'
import RecipePage from './RecipePage'
import styles from './PrintView.module.css'

export default function PrintView({ book, onClose }) {
  const TOTAL = (book?.recipes?.length || 0) + 1

  return (
    <div className={styles.overlay}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarText}>Vista de impresión — Formato A5 · {book?.name}</span>
        <div className={styles.toolbarActions}>
          <button className={styles.printBtn} onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
          <button className={styles.closeBtn} onClick={onClose}>✕ Cerrar</button>
        </div>
      </div>

      <div className={styles.pages} id="print-area">
        {(book?.recipes || []).map((recipe, i) => (
          <div key={recipe.id} className={styles.pageWrapper}>
            <RecipePage
              recipe={recipe}
              recipeNumber={i + 1}
              isFavorite={false}
              onToggleFavorite={() => {}}
              note=""
              onSaveNote={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
