import React, { useState } from 'react'
import styles from './PrintSelectOverlay.module.css'

export default function PrintSelectOverlay({ book, onPrint, onClose }) {
  const [selected, setSelected] = useState(() =>
    new Set(book.recipes.map(r => r.id))
  )

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allSelected = selected.size === book.recipes.length
  function toggleAll() {
    setSelected(allSelected
      ? new Set()
      : new Set(book.recipes.map(r => r.id))
    )
  }

  const selectedRecipes = book.recipes.filter(r => selected.has(r.id))

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Seleccionar recetas para imprimir</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </header>

        <div className={styles.toggleAll}>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className={styles.check}
            />
            <span className={styles.checkLabel}>
              {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </span>
          </label>
          <span className={styles.count}>{selected.size} de {book.recipes.length}</span>
        </div>

        <ul className={styles.list}>
          {book.recipes.map((r, i) => (
            <li key={r.id}>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                  className={styles.check}
                />
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.checkLabel}>{r.title}</span>
                <span className={styles.cat}>{r.category?.toLowerCase()}</span>
              </label>
            </li>
          ))}
        </ul>

        <footer className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button
            className={styles.printBtn}
            disabled={selected.size === 0}
            onClick={() => onPrint(selectedRecipes)}
          >
            🖨️ Imprimir {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </footer>
      </div>
    </div>
  )
}
