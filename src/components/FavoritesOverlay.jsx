import React from 'react'
import styles from './FavoritesOverlay.module.css'
import { getRecipePageNumber } from '../utils/flipPages'

export default function FavoritesOverlay({ books, favorites, onGoTo, onClose }) {
  const favs = []
  books.forEach(book => {
    book.recipes.forEach(recipe => {
      if (favorites.has(`${book.id}:${recipe.id}`)) {
        favs.push({ book, recipe, pageIndex: getRecipePageNumber(book.recipes, recipe.id) })
      }
    })
  })

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.star}>★</span>
          <h2 className={styles.title}>Mis favoritas</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.list}>
          {favs.length === 0 ? (
            <p className={styles.empty}>
              Todavía no tenés favoritas.<br />
              Tocá ☆ en cualquier receta del libro.
            </p>
          ) : favs.map((r, i) => (
            <button
              key={i}
              className={styles.item}
              onClick={() => { onGoTo(r.book, r.pageIndex); onClose() }}
            >
              <span className={styles.itemStar}>★</span>
              <div className={styles.itemInfo}>
                <span className={styles.recipeName}>{r.recipe.title}</span>
                <span className={styles.bookName}>{r.book.name}</span>
              </div>
              <span className={styles.cat}>{r.recipe.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
