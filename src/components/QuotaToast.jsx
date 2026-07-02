import React, { useEffect } from 'react'
import styles from './QuotaToast.module.css'

export default function QuotaToast({ onClose }) {
  // Auto-cierre a los 8 segundos
  useEffect(() => {
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={styles.toast} role="alert">
      <span className={styles.icon}>⚠️</span>
      <div className={styles.body}>
        <strong>Almacenamiento lleno</strong>
        <p>
          El navegador no pudo guardar los últimos cambios porque el espacio local está agotado.
          Exportá algunos recetarios como JSON y borrálos de la biblioteca para liberar espacio.
        </p>
      </div>
      <button className={styles.close} onClick={onClose} aria-label="Cerrar">✕</button>
    </div>
  )
}
