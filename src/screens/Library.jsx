import React, { useRef, useState } from 'react'
import styles from './Library.module.css'
import BookCard from '../components/BookCard'
import TrashSection from '../components/TrashSection'
import { parseHtmlBook } from '../utils/parseHtml'
import { parseJsonBook } from '../utils/bookUtils'
import { CATEGORIES } from '../hooks/useLibrary'

export default function Library({
  books, onOpen, onAdd, onDelete, onSearch,
  onDesign, onEdit, onRename, onShowFavs,
  darkMode, onToggleDark, getFavCount,
  trash, onRestore, onPurge, onEmptyTrash,
  customCategories = [], onAddCategory, onRemoveCategory,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📚')
  const htmlInputRef = useRef(null)
  const jsonInputRef = useRef(null)
  const allCategories = [...CATEGORIES, ...customCategories]

  const filteredBooks = selectedCategory
    ? books.filter(b => b.category === selectedCategory)
    : books

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

  function handleAddCategory() {
    if (!newCategoryLabel.trim()) {
      alert('La categoría necesita un nombre')
      return
    }
    onAddCategory(newCategoryLabel.trim(), newCategoryEmoji)
    setNewCategoryLabel('')
    setNewCategoryEmoji('📚')
    setShowNewCategory(false)
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

      <div className={styles.categoryFilter}>
        <button
          className={`${styles.categoryBtn} ${selectedCategory === null ? styles.categoryBtnActive : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          📚 Todos
        </button>
        {allCategories.map(cat => (
          <div key={cat.value} className={styles.categoryBtnContainer}>
            <button
              className={`${styles.categoryBtn} ${selectedCategory === cat.value ? styles.categoryBtnActive : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
            {customCategories.some(c => c.value === cat.value) && (
              <button
                className={styles.removeCategoryBtn}
                onClick={() => onRemoveCategory?.(cat.value)}
                title="Eliminar categoría"
              >✕</button>
            )}
          </div>
        ))}
        <button
          className={styles.addCategoryBtn}
          onClick={() => setShowNewCategory(true)}
          title="Crear nueva categoría"
        >+ Categoría</button>
      </div>

      {showNewCategory && (
        <div className={styles.newCategoryPanel}>
          <div className={styles.newCategoryForm}>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej: Galletas, Queques, Comidas"
              value={newCategoryLabel}
              onChange={e => setNewCategoryLabel(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddCategory()}
              autoFocus
            />
            <select
              className={styles.select}
              value={newCategoryEmoji}
              onChange={e => setNewCategoryEmoji(e.target.value)}
            >
              <option value="📚">📚 Libro</option>
              <option value="🍪">🍪 Galleta</option>
              <option value="🎂">🎂 Queque</option>
              <option value="🍲">🍲 Comida</option>
              <option value="🍰">🍰 Postre</option>
              <option value="🥗">🥗 Ensalada</option>
              <option value="🍞">🍞 Pan</option>
              <option value="🍝">🍝 Pasta</option>
              <option value="🍕">🍕 Pizza</option>
              <option value="🥘">🥘 Estofado</option>
            </select>
            <button className={styles.saveCategoryBtn} onClick={handleAddCategory}>✓ Crear</button>
            <button className={styles.cancelCategoryBtn} onClick={() => setShowNewCategory(false)}>✕ Cancelar</button>
          </div>
        </div>
      )}

      <main className={styles.grid}>
        {filteredBooks.map(book => (
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
