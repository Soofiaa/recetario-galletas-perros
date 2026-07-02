import React, { useState, useRef, useEffect } from 'react'
import styles from './CoverDesigner.module.css'
import Cover from '../components/Cover'
import { PALETTES, PATTERNS, STICKERS, DEFAULT_COVER_STYLE } from '../data/coverOptions'

const TABS = ['Fondo', 'Patrón', 'Decoración', 'Texto']

export default function CoverDesigner({ book, onSave, onClose }) {
  const [cs, setCs] = useState({ ...DEFAULT_COVER_STYLE, ...(book.coverStyle || {}) })
  const [activeTab, setActiveTab] = useState(0)
  const previewRef = useRef(null)
  const [scale, setScale] = useState(0.52)

  // Calcular escala del preview según el ancho disponible
  useEffect(() => {
    function calc() {
      const vw = window.innerWidth
      // La portada diseñada mide 500px de ancho — la escalamos al 88% del viewport
      setScale(Math.min(0.6, (vw * 0.88) / 500))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const set = (patch) => setCs(prev => ({ ...prev, ...patch }))

  const activePaletteId = PALETTES.find(p =>
    p.bgColor === cs.bgColor &&
    p.titleColor === cs.titleColor &&
    p.accentColor === cs.accentColor
  )?.id

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.headerTitle}>Diseñar portada</h2>
        <button className={styles.saveBtn} onClick={() => onSave(book.id, cs)}>
          Guardar
        </button>
      </header>

      {/* Preview de la portada */}
      <div
        className={styles.previewArea}
        style={{ height: Math.round(708 * scale) + 8 }}
      >
        <div
          ref={previewRef}
          className={styles.previewInner}
          style={{
            width: 500,
            height: 708,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <Cover book={book} coverStyle={cs} />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Paneles */}
      <div className={styles.panel}>

        {/* ── Fondo ── */}
        {activeTab === 0 && (
          <div className={styles.panelContent}>
            <p className={styles.sectionLabel}>Paleta de colores</p>
            <div className={styles.paletteGrid}>
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  className={`${styles.paletteChip} ${activePaletteId === p.id ? styles.paletteChipActive : ''}`}
                  style={{ backgroundColor: p.bgColor }}
                  onClick={() => set({ bgColor: p.bgColor, titleColor: p.titleColor, accentColor: p.accentColor })}
                >
                  <span className={styles.paletteSwatch} style={{ background: p.accentColor }} />
                  <span className={styles.paletteName} style={{ color: p.titleColor }}>{p.label}</span>
                  {activePaletteId === p.id && <span className={styles.paletteCheck} style={{ color: p.titleColor }}>✓</span>}
                </button>
              ))}
            </div>

            <p className={styles.sectionLabel}>Personalizar</p>
            <div className={styles.colorRow}>
              <label className={styles.colorLabel}>Fondo</label>
              <input type="color" className={styles.colorPicker} value={cs.bgColor}
                onChange={e => set({ bgColor: e.target.value })} />

              <label className={styles.colorLabel}>Título</label>
              <input type="color" className={styles.colorPicker} value={cs.titleColor}
                onChange={e => set({ titleColor: e.target.value })} />

              <label className={styles.colorLabel}>Acento</label>
              <input type="color" className={styles.colorPicker} value={cs.accentColor}
                onChange={e => set({ accentColor: e.target.value })} />
            </div>
          </div>
        )}

        {/* ── Patrón ── */}
        {activeTab === 1 && (
          <div className={styles.panelContent}>
            <p className={styles.sectionLabel}>Patrón de fondo</p>
            <div className={styles.patternGrid}>
              {PATTERNS.map(p => (
                <button
                  key={String(p.id)}
                  className={`${styles.patternChip} ${cs.patternId === p.id ? styles.patternChipActive : ''}`}
                  onClick={() => set({ patternId: p.id })}
                >
                  <span className={styles.patternIcon}>{p.preview}</span>
                  <span className={styles.patternLabel}>{p.label}</span>
                </button>
              ))}
            </div>

            {cs.patternId && (
              <>
                <p className={styles.sectionLabel}>Opacidad</p>
                <div className={styles.sliderRow}>
                  <span className={styles.sliderVal}>{Math.round(cs.patternOpacity * 100)}%</span>
                  <input
                    type="range" min="3" max="30" step="1"
                    value={Math.round(cs.patternOpacity * 100)}
                    className={styles.slider}
                    onChange={e => set({ patternOpacity: Number(e.target.value) / 100 })}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Decoración ── */}
        {activeTab === 2 && (
          <div className={styles.panelContent}>
            <p className={styles.sectionLabel}>Elementos fijos</p>
            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggleBtn} ${cs.showPaw ? styles.toggleBtnOn : ''}`}
                onClick={() => set({ showPaw: !cs.showPaw })}
              >
                🐾 Patita
              </button>
              <button
                className={`${styles.toggleBtn} ${cs.showDog ? styles.toggleBtnOn : ''}`}
                onClick={() => set({ showDog: !cs.showDog })}
              >
                🐕 Perrito
              </button>
            </div>

            <p className={styles.sectionLabel}>Stickers decorativos</p>
            <div className={styles.stickerGrid}>
              {STICKERS.map(st => (
                <button
                  key={String(st.id)}
                  className={`${styles.stickerChip} ${cs.sticker === st.id ? styles.stickerChipActive : ''}`}
                  onClick={() => set({ sticker: st.id })}
                >
                  <span className={styles.stickerEmoji}>{st.emoji || '✕'}</span>
                  <span className={styles.stickerLabel}>{st.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Texto ── */}
        {activeTab === 3 && (
          <div className={styles.panelContent}>
            <p className={styles.sectionLabel}>Color del texto principal</p>
            <div className={styles.colorRow}>
              <label className={styles.colorLabel}>Título</label>
              <input type="color" className={styles.colorPicker} value={cs.titleColor}
                onChange={e => set({ titleColor: e.target.value })} />
              <label className={styles.colorLabel}>Nombre en cursiva</label>
              <input type="color" className={styles.colorPicker} value={cs.accentColor}
                onChange={e => set({ accentColor: e.target.value })} />
            </div>

            <p className={styles.sectionLabel}>Vista previa del título</p>
            <div className={styles.titlePreview} style={{ backgroundColor: cs.bgColor }}>
              <span className={styles.titlePreviewText} style={{ color: cs.titleColor }}>
                {book.name.includes(' para ')
                  ? <>{book.name.split(' para ')[0]} para <em style={{ color: cs.accentColor }}>{book.name.split(' para ')[1]}</em></>
                  : <em style={{ color: cs.accentColor }}>{book.name}</em>
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
