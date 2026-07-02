import { useState, useEffect, useCallback, useRef } from 'react'
import { recipes as defaultRecipes } from '../data/recipes'
import { supabase, logAction } from '../lib/supabaseClient'

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

// Convierte una fila de Supabase a un objeto book de la app
function rowToBook(row) {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle || '',
    category: row.category || 'otros',
    createdAt: row.created_at,
    coverStyle: row.cover_style || undefined,
    recipes: row.recipes || [],
  }
}

// Convierte un book de la app a una fila de Supabase
function bookToRow(book, accessCode) {
  return {
    id: book.id,
    access_code: accessCode,
    name: book.name,
    subtitle: book.subtitle || '',
    category: book.category || 'otros',
    created_at: book.createdAt,
    cover_style: book.coverStyle || null,
    recipes: book.recipes || [],
    updated_at: new Date().toISOString(),
  }
}

export function useLibrary(accessCode) {
  const [books, setBooks] = useState(() => load('recetario_books', [DEFAULT_BOOK]))
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const hasSeeded = useRef(false)
  const [trash, setTrash] = useState(() => {
    const saved = load('recetario_trash', [])
    return saved.filter(b => !isExpired(b.deletedAt))
  })
  const [customCategories, setCustomCategories] = useState(() => load('recetario_custom_categories', []))
  const [favorites, setFavorites] = useState(() => new Set(load('recetario_favorites', [])))
  const [notes, setNotes]   = useState(() => load('recetario_notes', {}))
  const [views, setViews]   = useState(() => load('recetario_views', {}))

  // ── Sincronización con la nube (por código de acceso) ──────────────────────
  useEffect(() => {
    if (!accessCode) return
    let cancelled = false

    async function sync() {
      setSyncing(true)
      setSyncError(null)
      try {
        const { data, error } = await supabase
          .from('recetario_books')
          .select('*')
          .eq('access_code', accessCode)
          .order('updated_at', { ascending: true })

        if (error) throw error
        if (cancelled) return

        if (data.length === 0 && !hasSeeded.current) {
          // Primera vez con este código: subir los libros locales como semilla
          hasSeeded.current = true
          const localBooks = load('recetario_books', [DEFAULT_BOOK])
          const rows = localBooks.map(b => bookToRow(b, accessCode))
          const { error: seedError } = await supabase.from('recetario_books').insert(rows)
          if (seedError) throw seedError
          setBooks(localBooks)
          await logAction(accessCode, 'seed', `${localBooks.length} recetario(s)`)
        } else {
          setBooks(data.map(rowToBook))
        }
      } catch (err) {
        if (!cancelled) setSyncError(err.message)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    sync()
    return () => { cancelled = true }
  }, [accessCode])

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

  useEffect(() => {
    safeSetItem('recetario_custom_categories', JSON.stringify(customCategories))
  }, [customCategories])

  // ── Categorías personalizadas ──────────────────────────────────────────────
  const addCustomCategory = useCallback((label, emoji = '📚') => {
    const value = label.toLowerCase().replace(/\s+/g, '_')
    setCustomCategories(prev => {
      if (prev.some(c => c.value === value)) return prev
      return [...prev, { value, label: `${emoji} ${label}` }]
    })
  }, [])

  const removeCustomCategory = useCallback((value) => {
    setCustomCategories(prev => prev.filter(c => c.value !== value))
  }, [])

  const getAllCategories = useCallback(() => {
    return [...CATEGORIES, ...customCategories]
  }, [customCategories])

  // ── Libros ────────────────────────────────────────────────────────────────
  const addBook = useCallback((book) => {
    setBooks(prev => [...prev, book])
    if (accessCode) {
      supabase.from('recetario_books').insert(bookToRow(book, accessCode))
        .then(({ error }) => { if (error) setSyncError(error.message) })
      logAction(accessCode, 'add_book', book.name)
    }
  }, [accessCode])

  const updateBook = useCallback((id, data) => {
    setBooks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...data } : b)
      if (accessCode) {
        const updated = next.find(b => b.id === id)
        supabase.from('recetario_books')
          .update(bookToRow(updated, accessCode))
          .eq('id', id).eq('access_code', accessCode)
          .then(({ error }) => { if (error) setSyncError(error.message) })
      }
      return next
    })
  }, [accessCode])

  // Soft-delete: mueve a la papelera con fecha
  const deleteBook = useCallback((id) => {
    setBooks(prev => {
      const book = prev.find(b => b.id === id)
      if (book) setTrash(t => [...t, { ...book, deletedAt: new Date().toISOString() }])
      return prev.filter(b => b.id !== id)
    })
    if (accessCode) {
      supabase.from('recetario_books').delete().eq('id', id).eq('access_code', accessCode)
        .then(({ error }) => { if (error) setSyncError(error.message) })
      logAction(accessCode, 'delete_book', id)
    }
  }, [accessCode])

  // Restaurar desde papelera
  const restoreBook = useCallback((id) => {
    setTrash(prev => {
      const book = prev.find(b => b.id === id)
      if (book) {
        const { deletedAt: _, ...restored } = book
        setBooks(b => [...b, restored])
        if (accessCode) {
          supabase.from('recetario_books').insert(bookToRow(restored, accessCode))
            .then(({ error }) => { if (error) setSyncError(error.message) })
        }
      }
      return prev.filter(b => b.id !== id)
    })
  }, [accessCode])

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
    customCategories, addCustomCategory, removeCustomCategory, getAllCategories,
    syncing, syncError,
  }
}
