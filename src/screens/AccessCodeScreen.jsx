import React, { useState } from 'react'
import styles from './AccessCodeScreen.module.css'

export default function AccessCodeScreen({ onSubmit }) {
  const [code, setCode] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const clean = code.trim().toUpperCase().replace(/\s+/g, '')
    if (!clean) return
    onSubmit(clean)
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <span className={styles.logo}>🐾</span>
        <h1 className={styles.title}>El Recetario de Olivia</h1>
        <p className={styles.subtitle}>
          Ingresá tu código de recetario para ver tus recetas en cualquier dispositivo.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            placeholder="Ej: OLIVIA2026"
            value={code}
            onChange={e => setCode(e.target.value)}
            autoFocus
            maxLength={40}
          />
          <button type="submit" className={styles.submitBtn} disabled={!code.trim()}>
            Entrar
          </button>
        </form>
        <p className={styles.hint}>
          Si es la primera vez, elegí un código nuevo — se va a crear automáticamente.
          Usá el mismo código en todos tus dispositivos para ver las mismas recetas.
        </p>
      </div>
    </div>
  )
}
