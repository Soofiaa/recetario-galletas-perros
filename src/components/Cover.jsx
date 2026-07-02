import React from 'react'
import styles from './Cover.module.css'
import { DEFAULT_COVER_STYLE } from '../data/coverOptions'

// SVG de patrones de fondo
function PatternOverlay({ patternId, opacity, color }) {
  if (!patternId) return null
  const uid = `cp-${patternId}`
  const patterns = {
    dots: (
      <pattern id={uid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.8" fill={color} />
      </pattern>
    ),
    lines: (
      <pattern id={uid} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <line x1="0" y1="14" x2="14" y2="0" stroke={color} strokeWidth="1.2" />
      </pattern>
    ),
    grid: (
      <pattern id={uid} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M22 0 L0 0 0 22" fill="none" stroke={color} strokeWidth="0.8" />
      </pattern>
    ),
  }
  if (!patterns[patternId]) return null

  return (
    <svg
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'hidden' }}
      aria-hidden="true"
    >
      <defs>{patterns[patternId]}</defs>
      <rect width="100%" height="100%" fill={`url(#${uid})`} opacity={opacity} />
    </svg>
  )
}

const Cover = React.forwardRef(({ book, coverStyle: cs }, ref) => {
  const s      = { ...DEFAULT_COVER_STYLE, ...cs }
  const recipes = book?.recipes || []
  const name    = book?.name || 'Recetario'

  // Dividir nombre en "X para Y" para poner Y en cursiva acento
  const [namePre, nameEm] = name.includes(' para ')
    ? [name.split(' para ')[0] + ' para', name.split(' para ')[1]]
    : [null, name]

  return (
    <div
      ref={ref}
      className={styles.page}
      style={{ backgroundColor: s.bgColor }}
    >
      {/* Patrón de fondo */}
      <PatternOverlay
        patternId={s.patternId}
        opacity={s.patternOpacity}
        color={s.titleColor}
      />

      {/* Sticker decorativo (esquina superior izquierda) */}
      {s.sticker && (
        <div className={styles.sticker} aria-hidden="true">
          {s.sticker === 'flowers'  && <><span style={{position:'absolute',top:'8%', left:'2%',  fontSize:'1rem',opacity:.6}}>🌸</span><span style={{position:'absolute',top:'18%',right:'30%',fontSize:'.7rem',opacity:.4}}>🌸</span><span style={{position:'absolute',bottom:'30%',left:'5%',fontSize:'.8rem',opacity:.5}}>🌸</span></>}
          {s.sticker === 'stars'    && <><span style={{position:'absolute',top:'6%', left:'5%',  fontSize:'1rem',opacity:.7}}>✨</span><span style={{position:'absolute',top:'22%',right:'6%', fontSize:'.7rem',opacity:.4}}>✨</span><span style={{position:'absolute',bottom:'28%',left:'4%',fontSize:'.8rem',opacity:.5}}>✨</span></>}
          {s.sticker === 'hearts'   && <><span style={{position:'absolute',top:'7%', left:'3%',  fontSize:'1rem',opacity:.6}}>❤️</span><span style={{position:'absolute',top:'20%',right:'8%', fontSize:'.7rem',opacity:.4}}>❤️</span><span style={{position:'absolute',bottom:'32%',left:'6%',fontSize:'.8rem',opacity:.5}}>❤️</span></>}
          {s.sticker === 'bones'    && <><span style={{position:'absolute',top:'7%', left:'4%',  fontSize:'1rem',opacity:.6}}>🦴</span><span style={{position:'absolute',top:'20%',right:'6%', fontSize:'.7rem',opacity:.4}}>🦴</span><span style={{position:'absolute',bottom:'30%',left:'3%',fontSize:'.8rem',opacity:.5}}>🦴</span></>}
          {s.sticker === 'leaves'   && <><span style={{position:'absolute',top:'6%', left:'2%',  fontSize:'1rem',opacity:.6}}>🌿</span><span style={{position:'absolute',top:'22%',right:'7%', fontSize:'.7rem',opacity:.4}}>🌿</span><span style={{position:'absolute',bottom:'28%',left:'5%',fontSize:'.8rem',opacity:.5}}>🌿</span></>}
          {s.sticker === 'extra'    && <><span style={{position:'absolute',top:'7%', left:'3%',  fontSize:'1rem',opacity:.5}}>🐾</span><span style={{position:'absolute',top:'22%',right:'7%', fontSize:'.7rem',opacity:.3}}>🐾</span><span style={{position:'absolute',bottom:'28%',left:'4%',fontSize:'.8rem',opacity:.4}}>🐾</span></>}
        </div>
      )}

      {/* Sello de patita */}
      {s.showPaw && (
        <svg className={styles.pawStamp} viewBox="0 0 100 100" fill="none" stroke={s.titleColor} strokeWidth="2.4" aria-hidden="true">
          <ellipse cx="50" cy="62" rx="24" ry="19"/>
          <ellipse cx="27" cy="34" rx="9"  ry="12" transform="rotate(-18 27 34)"/>
          <ellipse cx="48" cy="24" rx="9"  ry="12"/>
          <ellipse cx="70" cy="34" rx="9"  ry="12" transform="rotate(18 70 34)"/>
          <ellipse cx="15" cy="55" rx="7"  ry="9"  transform="rotate(-30 15 55)"/>
        </svg>
      )}

      {/* Parte superior */}
      <div className={styles.top}>
        <span className={styles.eyebrow} style={{ color: s.titleColor, borderColor: `${s.titleColor}30` }}>
          {book?.subtitle || 'Recetario casero'}
        </span>
        <div className={styles.title} style={{ color: s.titleColor }}>
          {namePre ? <>{namePre}<br /></> : null}
          <em className={styles.titleEm} style={{ color: s.accentColor }}>{nameEm}</em>
        </div>
        {recipes.length > 0 && (
          <div className={styles.sub} style={{ color: s.titleColor }}>
            {recipes.length} receta{recipes.length !== 1 ? 's' : ''} casera{recipes.length !== 1 ? 's' : ''}, fáciles y con ingredientes naturales.
          </div>
        )}
      </div>

      {/* Índice */}
      {recipes.length > 0 && (
        <div className={styles.index} style={{ borderColor: `${s.titleColor}20` }}>
          <div className={styles.indexTitle} style={{ color: s.titleColor }}>Índice</div>
          {recipes.map((r, i) => (
            <div key={r.id} className={styles.indexRow} style={{ borderColor: `${s.titleColor}18` }}>
              <span className={styles.indexNum}  style={{ color: s.accentColor }}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.indexName} style={{ color: s.titleColor }}>{r.title}</span>
              <span className={styles.indexTag}  style={{ color: s.titleColor }}>
                {r.category?.toLowerCase()}{r.extra ? ` · ${r.extra}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pie */}
      <div className={styles.bottom}>
        {book?.category === 'mascotas' && (
          <div className={styles.footnote} style={{ color: s.titleColor }}>
            Nunca ofrecer: xilitol, chocolate, uvas/pasas, cebolla, ajo ni nuez de macadamia.
          </div>
        )}
        {s.showDog && (
          <svg className={styles.dogLine} viewBox="0 0 140 70" fill="none" stroke={s.accentColor} strokeWidth="2" aria-hidden="true">
            <path d="M12 55 Q10 30 30 22 Q28 12 40 10 Q46 4 54 10 Q64 6 68 16 Q80 14 82 26 Q98 26 100 40 Q112 40 116 50 Q118 58 108 60 L20 60 Q10 60 12 55 Z"/>
            <circle cx="96" cy="30" r="2.4" fill={s.accentColor}/>
          </svg>
        )}
      </div>
    </div>
  )
})

Cover.displayName = 'Cover'
export default Cover
