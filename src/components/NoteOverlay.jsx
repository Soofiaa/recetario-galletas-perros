import React, { useState } from 'react'
import styles from './NoteOverlay.module.css'

export default function NoteOverlay({ recipeName, initialNote, onSave, onClose }) {
  const [text, setText] = useState(initialNote)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.icon}>📝</span>
          <div>
            <p className={styles.label}>Mis notas</p>
            <p className={styles.recipeName}>{recipeName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <textarea
          className={styles.textarea}
          placeholder="Ej: Olivia prefiere sin canela. Usar molde de hueso."
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          rows={5}
        />
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancelar</button>
          <button className={styles.save} onClick={() => { onSave(text); onClose() }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
