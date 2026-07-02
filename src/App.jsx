import React, { useState, useEffect } from 'react'
import { useLibrary } from './hooks/useLibrary'
import Library from './screens/Library'
import FlipBookScreen from './screens/FlipBookScreen'
import CreateBook from './screens/CreateBook'
import EditBook from './screens/EditBook'
import CoverDesigner from './screens/CoverDesigner'
import AccessCodeScreen from './screens/AccessCodeScreen'
import SearchOverlay from './components/SearchOverlay'
import FavoritesOverlay from './components/FavoritesOverlay'
import QuotaToast from './components/QuotaToast'

export default function App() {
  const [accessCode, setAccessCode] = useState(
    () => localStorage.getItem('recetario_access_code') || null
  )

  const {
    books, addBook, deleteBook, updateBook, markOpened,
    trash, restoreBook, purgeBook, emptyTrash,
    favorites, toggleFavorite, isFavorite,
    setNote, getNote,
    incrementView, getViews, getMostViewed, getMostFavorited,
    customCategories, addCustomCategory, removeCustomCategory,
    syncing, syncError,
  } = useLibrary(accessCode)

  const [screen, setScreen]               = useState('library')
  const [currentBook, setCurrentBook]     = useState(null)
  const [startPage, setStartPage]         = useState(0)
  const [searching, setSearching]         = useState(false)
  const [showFavs, setShowFavs]           = useState(false)
  const [designingBook, setDesigningBook] = useState(null)
  const [editingBook, setEditingBook]     = useState(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('recetario_dark') === '1'
  )

  useEffect(() => {
    document.documentElement.dataset.dark = darkMode ? '1' : ''
    localStorage.setItem('recetario_dark', darkMode ? '1' : '0')
  }, [darkMode])

  // Escuchar evento de cuota de localStorage excedida
  useEffect(() => {
    function handleQuota() { setQuotaExceeded(true) }
    window.addEventListener('recetario:quotaExceeded', handleQuota)
    return () => window.removeEventListener('recetario:quotaExceeded', handleQuota)
  }, [])

  function openBook(book, page = 0) {
    const latest = books.find(b => b.id === book.id) || book
    setCurrentBook(latest)
    setStartPage(page)
    setScreen('flipbook')
    markOpened(latest.id)
  }

  function handleAddBook(book) {
    if (book === null) {
      setScreen('create')
    } else {
      addBook(book)
    }
  }

  function handleCreateSave(book) {
    addBook(book)
    setCurrentBook(book)
    setScreen('flipbook')
  }

  function handleEditSave(updatedBook) {
    updateBook(updatedBook.id, updatedBook)
    setCurrentBook(updatedBook)
    setEditingBook(null)
    setScreen('flipbook')
  }

  function handleGoTo(book, pageIndex) {
    openBook(book, pageIndex)
  }

  function getFavCount(book) {
    return book.recipes.filter(r => isFavorite(`${book.id}:${r.id}`)).length
  }

  const liveBook = currentBook
    ? (books.find(b => b.id === currentBook.id) || currentBook)
    : null

  function handleAccessCode(code) {
    localStorage.setItem('recetario_access_code', code)
    setAccessCode(code)
  }

  if (!accessCode) {
    return <AccessCodeScreen onSubmit={handleAccessCode} />
  }

  return (
    <>
      {syncError && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          background: '#c1443b', color: 'white', padding: '8px 16px',
          fontSize: '0.8rem', textAlign: 'center', fontFamily: 'monospace',
        }}>
          ⚠️ Error de sincronización: {syncError}
        </div>
      )}

      {screen === 'library' && (
        <Library
          books={books}
          onOpen={openBook}
          onAdd={handleAddBook}
          onDelete={deleteBook}
          onSearch={() => setSearching(true)}
          onDesign={setDesigningBook}
          onEdit={book => { setEditingBook(book); setScreen('edit') }}
          onRename={(id, name) => updateBook(id, { name })}
          onShowFavs={() => setShowFavs(true)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(v => !v)}
          getFavCount={getFavCount}
          trash={trash}
          onRestore={restoreBook}
          onPurge={purgeBook}
          onEmptyTrash={emptyTrash}
          getMostViewed={getMostViewed}
          getMostFavorited={getMostFavorited}
          customCategories={customCategories}
          onAddCategory={addCustomCategory}
          onRemoveCategory={removeCustomCategory}
        />
      )}

      {screen === 'flipbook' && liveBook && (
        <FlipBookScreen
          book={liveBook}
          allBooks={books}
          onBack={() => setScreen('library')}
          onEdit={() => { setEditingBook(liveBook); setScreen('edit') }}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          getNote={getNote}
          onSaveNote={setNote}
          onGoTo={handleGoTo}
          onPageView={key => incrementView(key)}
          getViews={getViews}
          getMostViewed={getMostViewed}
          getMostFavorited={getMostFavorited}
        />
      )}

      {screen === 'create' && (
        <CreateBook
          onSave={handleCreateSave}
          onCancel={() => setScreen('library')}
          customCategories={customCategories}
          accessCode={accessCode}
        />
      )}

      {screen === 'edit' && editingBook && (
        <EditBook
          book={editingBook}
          onSave={handleEditSave}
          onCancel={() => {
            setEditingBook(null)
            setScreen(currentBook ? 'flipbook' : 'library')
          }}
          accessCode={accessCode}
        />
      )}

      {designingBook && (
        <CoverDesigner
          book={designingBook}
          onSave={(bookId, cs) => { updateBook(bookId, { coverStyle: cs }); setDesigningBook(null) }}
          onClose={() => setDesigningBook(null)}
        />
      )}

      {showFavs && (
        <FavoritesOverlay
          books={books}
          favorites={favorites}
          onGoTo={handleGoTo}
          onClose={() => setShowFavs(false)}
        />
      )}

      {searching && (
        <SearchOverlay
          books={books}
          onGoTo={handleGoTo}
          onClose={() => setSearching(false)}
        />
      )}

      {quotaExceeded && (
        <QuotaToast onClose={() => setQuotaExceeded(false)} />
      )}
    </>
  )
}
