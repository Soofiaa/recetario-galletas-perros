import React, { useRef } from 'react'
import styles from './Library.module.css'
import BookCard from '../components/BookCard'
import TrashSection from '../components/TrashSection'
import { parseHtmlBook } from '../utils/parseHtml'
import { parseJsonBook } from '../utils/bookUtils'

export default function Library({
  books, onOpen, onAdd, onDelete, onSearch,
  onDesign, onEdit, onRename, onShowFavs,
  darkMode, onToggleDark, getFavCount,
  trash, onRestore, onPurge, onEmptyTrash,
}) {
  const htmlInputRef = useRef(null)
  const jsonInputRef = useRef(null)

  function handleHtmlImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const { book, skipped } = parseHtmlBook(ev.target.result)
        onAdd(book)
        if (skipped.length) {
          alert(
            `✅ Recetario importado con ${book.recipes.length} receta(s).\n\n` +
            `⚠️ Se omitieron ${skipped.length} receta(s) sin título:\n` +
            skipped.map(s => `• ${s}`).join('\n')
          )
        }
      } catch (err) {
        alert(`❌ No se pudo importar el archivo HTML.\n\n${err.message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleJsonImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        onAdd(parseJsonBook(ev.target.result))
      } catch (err) {
        alert(`❌ No se pudo importar el archivo JSON.\n\n${err.message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🐾</span>
          <div>
            <h1 className={styles.title}>Mis Recetarios</h1>
            <p className={styles.sub}>{books.length} libro{books.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={styles.headerBtns}>
          <button className={styles.headerIconBtn} onClick={onShowFavs} aria-label="Favoritas" title="Mis favoritas">★</button>
          <button className={styles.searchBtn} onClick={onSearch} aria-label="Buscar">🔍</button>
          <button className={styles.headerIconBtn} onClick={onToggleDark} aria-label="Modo oscuro" title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className={styles.grid}>
        {books.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onOpen={() => onOpen(book)}
            onDelete={() => onDelete(book.id)}
            onDesign={() => onDesign(book)}
            onEdit={() => onEdit(book)}
            onRename={name => onRename(book.id, name)}
            favCount={getFavCount(book)}
          />
        ))}
        <button className={styles.newCard} onClick={() => onAdd(null)}>
          <span className={styles.newPlus}>+</span>
          <span className={styles.newLabel}>Nuevo recetario</span>
        </button>
      </main>

      <TrashSection
        trash={trash || []}
        onRestore={onRestore}
        onPurge={onPurge}
        onEmptyTrash={onEmptyTrash}
      />

      <footer className={styles.footer}>
        <button className={styles.importBtn} onClick={() => htmlInputRef.current.click()}>
          📄 Importar HTML
        </button>
        <button className={styles.importBtn} onClick={() => jsonInputRef.current.click()}>
          📦 Importar JSON
        </button>
      </footer>

      <input ref={htmlInputRef} type="file" accept=".html,.htm" style={{ display: 'none' }} onChange={handleHtmlImport} />
      <input ref={jsonInputRef} type="file" accept=".json"      style={{ display: 'none' }} onChange={handleJsonImport} />
    </div>
  )
}
