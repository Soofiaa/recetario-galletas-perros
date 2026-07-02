import React, { useState, useRef } from 'react'
import styles from './RecipeShareOverlay.module.css'
import { sanitizeSvgPaths } from '../utils/sanitizeSvg'

export default function RecipeShareOverlay({ recipe, bookName, onClose, onImport }) {
  const [copied, setCopied] = useState(false)
  const [importMode, setImportMode] = useState(false)
  const [pastedJson, setPastedJson] = useState('')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)

  function exportAsJson() {
    return JSON.stringify(recipe, null, 2)
  }

  function handleCopy() {
    const json = exportAsJson()
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    const json = exportAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recipe.title || 'receta'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    try {
      const imported = JSON.parse(pastedJson)
      if (!imported.title || !Array.isArray(imported.ingredients) || !Array.isArray(imported.steps)) {
        throw new Error('Formato de receta inválido')
      }
      onImport({ ...imported, svgPaths: sanitizeSvgPaths(imported.svgPaths) })
      onClose()
    } catch (err) {
      setImportError(err.message)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Compartir receta</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </header>

        {!importMode ? (
          <div className={styles.body}>
            <div className={styles.recipeInfo}>
              <span className={styles.recipeName}>{recipe.title}</span>
              <span className={styles.bookName}>de: {bookName}</span>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Copiar receta</p>
              <button className={styles.btn} onClick={handleCopy}>
                {copied ? '✅ Copiado' : '📋 Copiar a portapapeles'}
              </button>
              <p className={styles.hint}>Pegá este JSON en WhatsApp, correo, etc.</p>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Descargar</p>
              <button className={styles.btn} onClick={handleDownload}>
                📥 Descargar JSON
              </button>
              <p className={styles.hint}>Guarda la receta como archivo .json</p>
            </div>

            <button className={styles.toggleBtn} onClick={() => setImportMode(true)}>
              🔄 Tengo una receta para importar
            </button>
          </div>
        ) : (
          <div className={styles.body}>
            <p className={styles.label}>Pegar receta JSON</p>
            <textarea
              className={styles.textarea}
              placeholder='Pegá aquí el JSON de la receta...'
              value={pastedJson}
              onChange={e => { setPastedJson(e.target.value); setImportError('') }}
            />
            {importError && (
              <div className={styles.error}>❌ {importError}</div>
            )}
            <button className={styles.btn} onClick={handleImport}>
              ✅ Importar receta
            </button>
            <button className={styles.toggleBtn} onClick={() => setImportMode(false)}>
              ← Volver a compartir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
