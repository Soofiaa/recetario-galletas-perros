import React, { useState } from 'react'
import styles from './BookCard.module.css'
import Cover from './Cover'
import { exportBookAsJson } from '../utils/bookUtils'

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

export default function BookCard({ book, onOpen, onDelete, onDesign, onEdit, onRename, favCount }) {
  const [menuOpen, setMenuOpen] = useState(false)

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
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          aria-label="Opciones"
        >⋯</button>
        {menuOpen && (
          <>
            <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
            <div className={styles.menu}>
              <button onClick={() => { onDesign?.(); setMenuOpen(false) }}>
                🎨 Decorar portada
              </button>
              <button onClick={() => { onEdit?.(); setMenuOpen(false) }}>
                ✏️ Editar recetas
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
      </div>
    </div>
  )
}
