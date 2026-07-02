import React, { useState } from 'react'
import styles from './BookCard.module.css'
import Cover from './Cover'
import { exportBookAsJson } from '../utils/bookUtils'
import { CATEGORIES } from '../hooks/useLibrary'

function formatRelative(isoString) {
  if (!isoString) return null
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'hace un momento'
  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours} h`
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

function getCategoryLabel(categoryValue) {
  const cat = CATEGORIES.find(c => c.value === categoryValue)
  return cat ? cat.label.split(' ').slice(1).join(' ') : categoryValue
}

export default function BookCard({ book, onOpen, onDelete, onDesign, onEdit, onRename, favCount, allCategories = CATEGORIES, onChangeCategory }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  return (
    <div className={styles.card}>
      <button className={styles.main} onClick={onOpen}>
        {/* Miniatura real de la portada */}
        <div className={styles.coverWrap}>
          <div className={styles.coverScaled}>
            <Cover book={book} coverStyle={book.coverStyle} />
          </div>
          {favCount > 0 && (
            <span className={styles.favBadge}>★ {favCount}</span>
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{book.name}</span>
          {book.category && (
            <span className={styles.category}>
              {getCategoryLabel(book.category)}
            </span>
          )}
          <span className={styles.meta}>
            {book.recipes.length} receta{book.recipes.length !== 1 ? 's' : ''} · {book.createdAt}
          </span>
          {book.lastOpenedAt && (
            <span className={styles.lastOpened}>
              Abierto {formatRelative(book.lastOpenedAt)}
            </span>
          )}
        </div>
      </button>

      <div className={styles.menuWrap}>
        <button
          className={styles.menuBtn}
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); setShowCategoryPicker(false) }}
          aria-label="Opciones"
        >⋯</button>
        {menuOpen && !showCategoryPicker && (
          <>
            <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
            <div className={styles.menu}>
              <button onClick={() => { onDesign?.(); setMenuOpen(false) }}>
                🎨 Decorar portada
              </button>
              <button onClick={() => { onEdit?.(); setMenuOpen(false) }}>
                ✏️ Editar recetas
              </button>
              <button onClick={() => setShowCategoryPicker(true)}>
                🏷️ Cambiar categoría
              </button>
              <button onClick={() => {
                const name = window.prompt('Nuevo nombre:', book.name)
                if (name?.trim()) { onRename?.(name.trim()); setMenuOpen(false) }
              }}>
                📝 Renombrar
              </button>
              <button onClick={() => { exportBookAsJson(book); setMenuOpen(false) }}>
                📤 Exportar JSON
              </button>
              <button
                className={styles.menuDelete}
                onClick={() => { if (window.confirm(`¿Eliminar "${book.name}"?`)) onDelete() }}
              >🗑️ Eliminar</button>
            </div>
          </>
        )}

        {menuOpen && showCategoryPicker && (
          <>
            <div className={styles.menuOverlay} onClick={() => { setShowCategoryPicker(false); setMenuOpen(false) }} />
            <div className={styles.menu}>
              <button onClick={() => setShowCategoryPicker(false)} className={styles.menuBack}>
                ← Volver
              </button>
              {allCategories.map(cat => (
                <button
                  key={cat.value}
                  className={cat.value === book.category ? styles.menuCategoryActive : ''}
                  onClick={() => {
                    onChangeCategory?.(cat.value)
                    setShowCategoryPicker(false)
                    setMenuOpen(false)
                  }}
                >
                  {cat.label}{cat.value === book.category ? ' ✓' : ''}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
