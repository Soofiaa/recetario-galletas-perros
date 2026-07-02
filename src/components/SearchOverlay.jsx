import React, { useState, useMemo, useRef, useEffect } from 'react'
import styles from './SearchOverlay.module.css'

const CATS = ['Todas', 'Horneada', 'Deshidratada', 'Congelada']

export default function SearchOverlay({ books, onGoTo, onClose }) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('Todas')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    const out = []
    books.forEach(book => {
      book.recipes.forEach((recipe, i) => {
        if (cat !== 'Todas' && recipe.category !== cat) return
        const haystack = [
          recipe.title, recipe.subtitle,
          ...(recipe.ingredients?.map(ing => ing.name) || []),
          ...(recipe.steps || []),
          ...(recipe.tags || []),
        ].join(' ').toLowerCase()
        if (!q || haystack.includes(q)) {
          out.push({ book, recipe, pageIndex: i + 1 })
        }
      })
    })
    return out.slice(0, 40)
  }, [query, cat, books])

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Buscar receta o ingrediente…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.filters}>
          {CATS.map(c => (
            <button
              key={c}
              className={`${styles.filterChip} ${cat === c ? styles.filterChipActive : ''}`}
              onClick={() => setCat(c)}
            >{c}</button>
          ))}
        </div>

        <div className={styles.results}>
          {results.length === 0 && (
            <p className={styles.empty}>
              {query ? `Sin resultados para "${query}"` : 'Escribí para buscar'}
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              className={styles.result}
              onClick={() => { onGoTo(r.book, r.pageIndex); onClose() }}
            >
              <div className={styles.resultTitle}>{r.recipe.title}</div>
              <div className={styles.resultMeta}>
                {r.book.name} · {r.recipe.category}
                {r.recipe.tags?.length ? ` · ${r.recipe.tags.join(', ')}` : ''}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
