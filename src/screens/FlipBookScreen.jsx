import React, { useRef, useState, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import styles from './FlipBookScreen.module.css'
import Cover from '../components/Cover'
import RecipePage from '../components/RecipePage'
import PrintView from '../components/PrintView'
import PrintSelectOverlay from '../components/PrintSelectOverlay'
import PortionCalculator from '../components/PortionCalculator'
import SearchOverlay from '../components/SearchOverlay'
import ShareOverlay from '../components/ShareOverlay'

function useBookSize() {
  const [size, setSize] = useState({ width: 360, height: 510 })
  useEffect(() => {
    function calc() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxW = vw <= 500 ? vw - 8 : Math.min(500, vw * 0.88)
      const maxH = vh - 80
      const ratio = 708 / 500
      const byWidth  = { w: maxW,         h: maxW * ratio }
      const byHeight = { w: maxH / ratio, h: maxH }
      const fit = byWidth.h <= maxH ? byWidth : byHeight
      setSize({ width: Math.floor(fit.w), height: Math.floor(fit.h) })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return size
}

function formatRelative(isoString) {
  if (!isoString) return null
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'hace un momento'
  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours} h`
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

export default function FlipBookScreen({
  book, allBooks, onBack, onEdit,
  isFavorite, onToggleFavorite,
  getNote, onSaveNote, onGoTo,
  onPageView, getViews, getMostViewed, getMostFavorited,
}) {
  const bookRef      = useRef(null)
  const slideshowRef = useRef(null)
  const [page, setPage]             = useState(0)
  const [printRecipes, setPrintRecipes] = useState(null)  // null = no imprimiendo, [] = imprimiendo
  const [showPrintSelect, setShowPrintSelect] = useState(false)
  const [searching, setSearching]   = useState(false)
  const [sharing, setSharing]       = useState(null)
  const [slideshow, setSlideshow]   = useState(false)
  const [calcRecipe, setCalcRecipe] = useState(null)
  const [showStats, setShowStats]   = useState(false)
  const { width, height } = useBookSize()
  const TOTAL = book.recipes.length + 1

  // Registrar vista cuando cambia la página a una receta
  useEffect(() => {
    if (page > 0 && book.recipes[page - 1]) {
      const key = `${book.id}:${book.recipes[page - 1].id}`
      onPageView?.(key)
    }
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e) {
      if (printRecipes !== null || searching || sharing || calcRecipe || showStats) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') bookRef.current?.pageFlip().flipNext()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') bookRef.current?.pageFlip().flipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [printRecipes, searching, sharing, calcRecipe, showStats])

  useEffect(() => {
    if (slideshow) {
      slideshowRef.current = setInterval(() => {
        bookRef.current?.pageFlip().flipNext()
      }, 3500)
    } else {
      clearInterval(slideshowRef.current)
    }
    return () => clearInterval(slideshowRef.current)
  }, [slideshow])

  useEffect(() => {
    if (slideshow && page >= TOTAL - 1) setSlideshow(false)
  }, [page, slideshow, TOTAL])

  function goToPage(targetBook, pageIndex) {
    if (targetBook.id === book.id) {
      bookRef.current?.pageFlip().flip(pageIndex)
    } else {
      onGoTo(targetBook, pageIndex)
    }
  }

  const currentRecipe = page > 0 ? book.recipes[page - 1] : null
  const mostViewed    = getMostViewed?.(book)
  const mostFavorited = getMostFavorited?.(book)

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Volver">‹</button>
        <span className={styles.bookName}>{book.name}</span>
        <div className={styles.topActions}>
          <span className={styles.pageIndicator}>{page + 1} / {TOTAL}</span>
          <button
            className={`${styles.iconBtn} ${slideshow ? styles.iconBtnActive : ''}`}
            onClick={() => setSlideshow(v => !v)}
            title={slideshow ? 'Detener slideshow' : 'Slideshow automático'}
          >{slideshow ? '⏸' : '▶'}</button>
          {currentRecipe && (
            <>
              <button className={styles.iconBtn}
                onClick={() => setCalcRecipe(currentRecipe)} title="Calcular porciones">⚖️</button>
              <button className={styles.iconBtn}
                onClick={() => setSharing(currentRecipe)} title="Compartir receta">↗</button>
            </>
          )}
          <button className={styles.iconBtn}
            onClick={() => setShowStats(v => !v)} title="Estadísticas">📊</button>
          {onEdit && (
            <button className={styles.iconBtn} onClick={onEdit} title="Editar recetario">✏️</button>
          )}
          <button className={styles.iconBtn} onClick={() => setSearching(true)} title="Buscar">🔍</button>
          <button className={styles.iconBtn} onClick={() => setShowPrintSelect(true)} title="Imprimir">🖨️</button>
        </div>
      </header>

      {/* Panel de estadísticas (colapsable bajo el topBar) */}
      {showStats && (
        <div className={styles.statsPanel}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Última apertura</span>
            <span className={styles.statValue}>{formatRelative(book.lastOpenedAt) || '—'}</span>
          </div>
          {mostViewed && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Más vista</span>
              <span className={styles.statValue}>
                {mostViewed.title}
                {getViews?.(`${book.id}:${mostViewed.id}`) > 0 &&
                  <span className={styles.statCount}> ×{getViews(`${book.id}:${mostViewed.id}`)}</span>
                }
              </span>
            </div>
          )}
          {mostFavorited && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Favorita</span>
              <span className={styles.statValue}>⭐ {mostFavorited.title}</span>
            </div>
          )}
          {!mostFavorited && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Favorita</span>
              <span className={styles.statValue}>—</span>
            </div>
          )}
        </div>
      )}

      <main className={styles.stage}>
        <button
          className={`${styles.navBtn} ${styles.navBtnLeft}`}
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          disabled={page === 0}
          aria-label="Página anterior"
        >‹</button>

        <HTMLFlipBook
          ref={bookRef}
          width={width} height={height}
          size="fixed"
          minWidth={260} maxWidth={500}
          minHeight={370} maxHeight={708}
          showCover={true}
          flippingTime={700}
          usePortrait={true}
          drawShadow={true}
          className={styles.book}
          onFlip={e => setPage(e.data)}
        >
          <Cover book={book} coverStyle={book.coverStyle} />
          {book.recipes.map((recipe, i) => {
            const key = `${book.id}:${recipe.id}`
            return (
              <RecipePage
                key={recipe.id}
                recipe={recipe}
                pageNumber={i + 2}
                isFavorite={isFavorite(key)}
                onToggleFavorite={() => onToggleFavorite(key)}
                note={getNote(key)}
                onSaveNote={text => onSaveNote(key, text)}
              />
            )
          })}
        </HTMLFlipBook>

        <button
          className={`${styles.navBtn} ${styles.navBtnRight}`}
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          disabled={page === TOTAL - 1}
          aria-label="Página siguiente"
        >›</button>
      </main>

      <p className={styles.hint}>← → para navegar · toca el borde de la página</p>

      {printRecipes !== null && (
        <PrintView
          book={{ ...book, recipes: printRecipes }}
          onClose={() => setPrintRecipes(null)}
        />
      )}

      {showPrintSelect && (
        <PrintSelectOverlay
          book={book}
          onClose={() => setShowPrintSelect(false)}
          onPrint={recipes => { setShowPrintSelect(false); setPrintRecipes(recipes) }}
        />
      )}

      {calcRecipe && (
        <PortionCalculator
          recipe={calcRecipe}
          onClose={() => setCalcRecipe(null)}
        />
      )}

      {searching && (
        <SearchOverlay books={allBooks} onGoTo={goToPage} onClose={() => setSearching(false)} />
      )}

      {sharing && (
        <ShareOverlay recipe={sharing} onClose={() => setSharing(null)} />
      )}
    </div>
  )
}
