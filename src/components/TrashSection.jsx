import React, { useState } from 'react'
import styles from './TrashSection.module.css'

const TRASH_DAYS = 7

function daysLeft(deletedAt) {
  const elapsed = Date.now() - new Date(deletedAt).getTime()
  return Math.max(0, TRASH_DAYS - Math.floor(elapsed / 86_400_000))
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function TrashSection({ trash, onRestore, onPurge, onEmptyTrash }) {
  const [open, setOpen] = useState(false)

  if (trash.length === 0) return null

  return (
    <section className={styles.section}>
      <button className={styles.toggle} onClick={() => setOpen(v => !v)}>
        <span className={styles.toggleLabel}>
          🗑️ Papelera
          <span className={styles.count}>{trash.length}</span>
        </span>
        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.body}>
          <p className={styles.hint}>
            Los recetarios eliminados se borran definitivamente después de {TRASH_DAYS} días.
          </p>

          <ul className={styles.list}>
            {trash.map(book => {
              const days = daysLeft(book.deletedAt)
              return (
                <li key={book.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{book.name}</span>
                    <span className={styles.itemMeta}>
                      Eliminado el {formatDate(book.deletedAt)} ·{' '}
                      {days === 0
                        ? <span className={styles.expiredSoon}>se elimina hoy</span>
                        : days === 1
                          ? <span className={styles.expiredSoon}>queda 1 día</span>
                          : `quedan ${days} días`
                      }
                    </span>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.restoreBtn} onClick={() => onRestore(book.id)}>
                      Restaurar
                    </button>
                    <button className={styles.purgeBtn} onClick={() => {
                      if (window.confirm(`¿Eliminar "${book.name}" definitivamente? Esta acción no se puede deshacer.`))
                        onPurge(book.id)
                    }}>
                      Eliminar
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {trash.length > 1 && (
            <button className={styles.emptyBtn} onClick={() => {
              if (window.confirm(`¿Vaciar la papelera? Se eliminarán ${trash.length} recetarios definitivamente.`))
                onEmptyTrash()
            }}>
              Vaciar papelera
            </button>
          )}
        </div>
      )}
    </section>
  )
}
