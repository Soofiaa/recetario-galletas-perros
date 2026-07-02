import { useState, useEffect, useCallback } from 'react'
import { recipes as defaultRecipes } from '../data/recipes'

export const CATEGORIES = [
  { value: 'mascotas', label: '🐾 Mascotas' },
  { value: 'almuerzos', label: '🍽️ Almuerzos' },
  { value: 'onces', label: '☕ Onces' },
  { value: 'dulces', label: '🍰 Dulces' },
  { value: 'bebidas', label: '🥤 Bebidas' },
  { value: 'otros', label: '📝 Otros' },
]

const DEFAULT_BOOK = {
  id: 'olivia-default',
  name: 'Galletas para Olivia',
  subtitle: 'Edición completa',
  category: 'mascotas',
  createdAt: '2026-06-30',
  recipes: defaultRecipes,
}

const TRASH_DAYS = 7
const MS_PER_DAY = 86_400_000

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function isExpired(deletedAt) {
  return Date.now() - new Date(deletedAt).getTime() > TRASH_DAYS * MS_PER_DAY
}

// Wrapper seguro para localStorage que captura QuotaExceededError
export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err) {
    if (err instanceof DOMException && (
      err.code === 22 ||
      err.code === 1014 ||
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      // Emitir evento global para que la UI lo capture
      window.dispatchEvent(new CustomEvent('recetario:quotaExceeded', {
        detail: { key }
      }))
      return false
    }
    return false
  }
}

export function useLibrary() {
  const [books, setBooks] = useState(() => load('recetario_books', [DEFAULT_BOOK]))
  const [trash, setTrash] = useState(() => {
    const saved = load('recetario_trash', [])
    return saved.filter(b => !isExpired(b.deletedAt))
  })
  const [favorites, setFavorites] = useState(() => new Set(load('recetario_favorites', [])))
  const [notes, setNotes]   = useState(() => load('recetario_notes', {}))
  const [views, setViews]   = useState(() => load('recetario_views', {}))

  useEffect(() => {
    safeSetItem('recetario_books', JSON.stringify(books))
  }, [books])

  useEffect(() => {
    safeSetItem('recetario_trash', JSON.stringify(trash))
  }, [trash])

  useEffect(() => {
    safeSetItem('recetario_favorites', JSON.stringify([...favorites]))
  }, [favorites])

  useEffect(() => {
    safeSetItem('recetario_notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    safeSetItem('recetario_views', JSON.stringify(views))
  }, [views])

  // ── Libros ────────────────────────────────────────────────────────────────
  const addBook    = useCallback((book) => setBooks(prev => [...prev, book]), [])
  const updateBook = useCallback((id, data) =>
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...data } : b)), [])

  // Soft-delete: mueve a la papelera con fecha
  const deleteBook = useCallback((id) => {
    setBooks(prev => {
      const book = prev.find(b => b.id === id)
      if (book) setTrash(t => [...t, { ...book, deletedAt: new Date().toISOString() }])
      return prev.filter(b => b.id !== id)
    })
  }, [])

  // Restaurar desde papelera
  const restoreBook = useCallback((id) => {
    setTrash(prev => {
      const book = prev.find(b => b.id === id)
      if (book) {
        const { deletedAt: _, ...restored } = book
        setBooks(b => [...b, restored])
      }
      return prev.filter(b => b.id !== id)
    })
  }, [])

  const purgeBook  = useCallback((id) => setTrash(prev => prev.filter(b => b.id !== id)), [])
  const emptyTrash = useCallback(() => setTrash([]), [])

  // Registrar última apertura del libro
  const markOpened = useCallback((bookId) => {
    updateBook(bookId, { lastOpenedAt: new Date().toISOString() })
  }, [updateBook])

  // ── Estadísticas de vistas ─────────────────────────────────────────────────
  // key = "bookId:recipeId"
  const incrementView = useCallback((key) => {
    setViews(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
  }, [])

  const getViews = useCallback((key) => views[key] || 0, [views])

  // Receta más vista de un libro
  const getMostViewed = useCallback((book) => {
    if (!book?.recipes?.length) return null
    return book.recipes.reduce((best, r) => {
      const k = `${book.id}:${r.id}`
      return (views[k] || 0) > (views[`${book.id}:${best?.id}`] || 0) ? r : best
    }, book.recipes[0])
  }, [views])

  // Receta más favorita (simplificado: si está en favorites)
  const getMostFavorited = useCallback((book) => {
    if (!book?.recipes?.length) return null
    return book.recipes.find(r => favorites.has(`${book.id}:${r.id}`)) || null
  }, [favorites])

  // ── Favoritos ──────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((key) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])
  const isFavorite = useCallback((key) => favorites.has(key), [favorites])

  // ── Notas ──────────────────────────────────────────────────────────────────
  const setNote  = useCallback((key, text) => {
    setNotes(prev => text
      ? { ...prev, [key]: text }
      : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
    )
  }, [])
  const getNote  = useCallback((key) => notes[key] || '', [notes])

  return {
    books, addBook, deleteBook, updateBook, markOpened,
    trash, restoreBook, purgeBook, emptyTrash,
    favorites, toggleFavorite, isFavorite,
    setNote, getNote,
    incrementView, getViews, getMostViewed, getMostFavorited,
  }
}
