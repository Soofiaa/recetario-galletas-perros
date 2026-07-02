import React, { useState, useRef } from 'react'
import styles from './ImageUpload.module.css'
import { supabase } from '../lib/supabaseClient'

// Solo formatos rasterizados: excluye SVG (puede contener <script> embebido)
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif)$/i

export default function ImageUpload({ image, onChange, accessCode }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    if (!ALLOWED_TYPES.has(file.type) || !ALLOWED_EXT.test(file.name)) {
      setError('Formato no soportado. Usá JPG, PNG, WEBP o GIF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB')
      return
    }

    setUploading(true)
    setError('')
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${accessCode || 'sin-codigo'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err) {
      setError(`No se pudo subir la imagen: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {image ? (
        <div className={styles.preview}>
          <img src={image} alt="Vista previa de la receta" className={styles.previewImg} />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onChange('')}
          >✕ Quitar imagen</button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ Subiendo...' : '📷 Agregar foto de la receta'}
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
