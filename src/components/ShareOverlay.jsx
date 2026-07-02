import React, { useState } from 'react'
import styles from './ShareOverlay.module.css'

export default function ShareOverlay({ recipe, onClose }) {
  const [copied, setCopied] = useState(false)

  const lines = [
    `🐾 ${recipe.title}`,
    recipe.subtitle ? `— ${recipe.subtitle}` : null,
    '',
    `📋 Ingredientes (rinde ${recipe.yield}):`,
    ...recipe.ingredients.map(i => `• ${i.name}: ${i.amount}`),
    '',
    '👩‍🍳 Preparación:',
    ...recipe.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `⏱ ${recipe.duration.line1} · ${recipe.duration.line2}`,
    recipe.note ? `\n⚠️ ${recipe.note}` : null,
    '\nReceta de El Recetario de Olivia 🐾',
  ].filter(l => l !== null)

  function copy() {
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Compartir receta</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>{recipe.title}</div>
          {recipe.subtitle && <div className={styles.cardSub}>{recipe.subtitle}</div>}

          <div className={styles.section}>Ingredientes · rinde {recipe.yield}</div>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className={styles.ing}>
              <span>{ing.name}</span>
              <span className={styles.amt}>{ing.amount}</span>
            </div>
          ))}

          <div className={styles.section}>Preparación</div>
          {recipe.steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}

          <div className={styles.duration}>
            ⏱ {recipe.duration.line1} · {recipe.duration.line2}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={copy}>
            {copied ? '✓ ¡Copiado!' : '📋 Copiar texto'}
          </button>
        </div>
      </div>
    </div>
  )
}
