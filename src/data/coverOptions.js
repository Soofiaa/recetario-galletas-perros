export const PALETTES = [
  { id: 'clasico',   label: 'Clásico',   bgColor: '#FAF6EC', titleColor: '#2B342A', accentColor: '#C1443B' },
  { id: 'rosa',      label: 'Rosa',      bgColor: '#FFF0F5', titleColor: '#4A1A2A', accentColor: '#D4609A' },
  { id: 'cielo',     label: 'Cielo',     bgColor: '#EFF6FF', titleColor: '#1A2A4A', accentColor: '#3B7DD4' },
  { id: 'menta',     label: 'Menta',     bgColor: '#F0FFF4', titleColor: '#1A3A2C', accentColor: '#2DB48A' },
  { id: 'atardecer', label: 'Atardecer', bgColor: '#FFF4E8', titleColor: '#3A1A10', accentColor: '#D4873B' },
  { id: 'lavanda',   label: 'Lavanda',   bgColor: '#F5F0FF', titleColor: '#2A1A4A', accentColor: '#7B5CD4' },
  { id: 'noche',     label: 'Noche',     bgColor: '#1A1F1A', titleColor: '#FAF6EC', accentColor: '#E0982F' },
  { id: 'miel',      label: 'Miel',      bgColor: '#FEF3C7', titleColor: '#451A03', accentColor: '#D97706' },
]

export const PATTERNS = [
  { id: null,     label: 'Ninguno', preview: '—'   },
  { id: 'dots',   label: 'Puntos',  preview: '···' },
  { id: 'lines',  label: 'Rayas',   preview: '///' },
  { id: 'grid',   label: 'Cuadríc.', preview: '⊞'  },
]

// emoji + posiciones absolutas (% del ancho/alto de la portada)
export const STICKERS = [
  { id: null,      label: 'Ninguno',   emoji: null  },
  { id: 'flowers', label: 'Flores',    emoji: '🌸'  },
  { id: 'stars',   label: 'Estrellas', emoji: '✨'  },
  { id: 'hearts',  label: 'Corazones', emoji: '❤️'  },
  { id: 'bones',   label: 'Huesos',    emoji: '🦴'  },
  { id: 'leaves',  label: 'Hojas',     emoji: '🌿'  },
  { id: 'extra',   label: '+ Patitas', emoji: '🐾'  },
]

export const DEFAULT_COVER_STYLE = {
  bgColor:        '#FAF6EC',
  titleColor:     '#2B342A',
  accentColor:    '#C1443B',
  patternId:      null,
  patternOpacity: 0.10,
  showPaw:        true,
  showDog:        true,
  sticker:        null,
}
