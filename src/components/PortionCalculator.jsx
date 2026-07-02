import React, { useState } from 'react'
import styles from './PortionCalculator.module.css'

// Extrae el número al principio de un string de cantidad.
// "1 taza" → { num: 1, rest: " taza", numeric: true }
// "½ unidad" → { num: 0.5, rest: " unidad", numeric: true }
// "una pizca" → { num: null, rest: "una pizca", numeric: false }
function parseAmount(str) {
  if (!str) return { num: null, rest: str || '', numeric: false }
  const s = str.trim()
  // Fracciones unicode
  const fracMap = { '½': 0.5, '⅓': 1/3, '⅔': 2/3, '¼': 0.25, '¾': 0.75, '⅛': 0.125 }
  if (fracMap[s[0]]) {
    return { num: fracMap[s[0]], rest: s.slice(1), numeric: true }
  }
  // Fracción escrita: "1/2 taza"
  const fracMatch = s.match(/^(\d+)\/(\d+)(.*)/)
  if (fracMatch) {
    return { num: parseInt(fracMatch[1]) / parseInt(fracMatch[2]), rest: fracMatch[3], numeric: true }
  }
  // Número decimal o entero: "2.5 tazas" o "100 g"
  const numMatch = s.match(/^(\d+(?:[.,]\d+)?)(.*)/)
  if (numMatch) {
    return { num: parseFloat(numMatch[1].replace(',', '.')), rest: numMatch[2], numeric: true }
  }
  return { num: null, rest: s, numeric: false }
}

function formatNum(n) {
  // Mostrar fracciones comunes como texto limpio, sino 2 decimales máximo
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n))
  if (Math.abs(n - 0.5)  < 0.01) return '½'
  if (Math.abs(n - 0.25) < 0.01) return '¼'
  if (Math.abs(n - 0.75) < 0.01) return '¾'
  if (Math.abs(n - 1/3)  < 0.01) return '⅓'
  if (Math.abs(n - 2/3)  < 0.01) return '⅔'
  return parseFloat(n.toFixed(2)).toString()
}

export default function PortionCalculator({ recipe, onClose }) {
  const originalYield = recipe.yield || '16 unidades'
  // Intentar extraer número del yield
  const yieldNum = parseFloat(originalYield.match(/\d+(?:[.,]\d+)?/)?.[0]) || 16
  const [target, setTarget] = useState(yieldNum)

  const factor = yieldNum > 0 ? target / yieldNum : 1

  const nonNumericAmounts = recipe.ingredients
    .filter(ing => !parseAmount(ing.amount).numeric && ing.amount)
    .map(ing => ing.name)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Calculadora de porciones</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </header>

        <div className={styles.yieldRow}>
          <span className={styles.yieldLabel}>Rinde originalmente:</span>
          <span className={styles.yieldValue}>{originalYield}</span>
        </div>

        <div className={styles.scaleRow}>
          <label className={styles.scaleLabel}>Quiero hacer:</label>
          <div className={styles.counter}>
            <button className={styles.countBtn}
              onClick={() => setTarget(t => Math.max(1, t - 1))}>−</button>
            <input
              type="number" min="1" max="999"
              className={styles.countInput}
              value={target}
              onChange={e => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button className={styles.countBtn}
              onClick={() => setTarget(t => t + 1)}>+</button>
          </div>
          <span className={styles.unitHint}>
            {originalYield.replace(/^\d+(?:[.,]\d+)?/, '').trim() || 'unidades'}
          </span>
        </div>

        {factor !== 1 && (
          <p className={styles.factor}>
            Factor: ×{formatNum(factor)}
          </p>
        )}

        <ul className={styles.list}>
          {recipe.ingredients.map((ing, i) => {
            const { num, rest, numeric } = parseAmount(ing.amount)
            const scaledNum = numeric && num !== null ? num * factor : null
            return (
              <li key={i} className={styles.item}>
                <span className={styles.ingName}>{ing.name}</span>
                <span className={`${styles.ingAmt} ${!numeric && ing.amount ? styles.ingAmtAprox : ''}`}>
                  {scaledNum !== null
                    ? formatNum(scaledNum) + rest
                    : ing.amount
                      ? `${ing.amount} †`
                      : '—'
                  }
                </span>
              </li>
            )
          })}
        </ul>

        {nonNumericAmounts.length > 0 && (
          <p className={styles.footnote}>
            † Cantidad a gusto — no se puede escalar automáticamente:{' '}
            {nonNumericAmounts.join(', ')}.
          </p>
        )}
      </div>
    </div>
  )
}
