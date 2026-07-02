import React, { useState } from 'react'
import styles from './CreateBook.module.css'
import { genId, EMOJI_ICONS } from '../utils/bookUtils'
import { CATEGORIES } from '../hooks/useLibrary'
import ImageUpload from '../components/ImageUpload'

const EMPTY_RECIPE = () => ({
  id: genId(),
  title: '', subtitle: '', category: 'Horneada', extra: '',
  emoji: '🍪', svgPaths: '', image: '',
  yield: '16 galletas',
  ingredients: [{ name: '', amount: '' }],
  steps: [''],
  duration: { line1: 'Refri: 7 días', line2: 'Freezer: 2–3 meses' },
  note: '',
  tags: [],
})

export default function CreateBook({ onSave, onCancel, customCategories = [], accessCode }) {
  const [bookName, setBookName] = useState('')
  const [bookSubtitle, setBookSubtitle] = useState('')
  const [bookCategory, setBookCategory] = useState('otros')
  const [recipes, setRecipes] = useState([EMPTY_RECIPE()])
  const [activeIdx, setActiveIdx] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const allCategories = [...CATEGORIES, ...customCategories]

  const recipe = recipes[activeIdx]

  function updateRecipe(patch) {
    setRecipes(prev => prev.map((r, i) => i === activeIdx ? { ...r, ...patch } : r))
  }

  function updateIngredient(i, field, val) {
    const next = recipe.ingredients.map((ing, j) => j === i ? { ...ing, [field]: val } : ing)
    updateRecipe({ ingredients: next })
  }

  function updateStep(i, val) {
    updateRecipe({ steps: recipe.steps.map((s, j) => j === i ? val : s) })
  }

  function addIngredient() { updateRecipe({ ingredients: [...recipe.ingredients, { name: '', amount: '' }] }) }
  function removeIngredient(i) { updateRecipe({ ingredients: recipe.ingredients.filter((_, j) => j !== i) }) }
  function addStep() { updateRecipe({ steps: [...recipe.steps, ''] }) }
  function removeStep(i) { updateRecipe({ steps: recipe.steps.filter((_, j) => j !== i) }) }

  function addRecipe() {
    const next = [...recipes, EMPTY_RECIPE()]
    setRecipes(next)
    setActiveIdx(next.length - 1)
  }

  function removeRecipe(i) {
    if (recipes.length === 1) return
    const next = recipes.filter((_, j) => j !== i)
    setRecipes(next)
    setActiveIdx(Math.min(activeIdx, next.length - 1))
  }

  function handleSave() {
    if (!bookName.trim()) {
      alert('El recetario necesita un nombre.')
      return
    }

    // Recetas con título (las sin título se ignoran silenciosamente)
    const validRecipes = recipes
      .filter(r => r.title.trim())
      .map(r => ({
        ...r,
        title: r.title.trim(),
        // Deduplicar tags: lowercase, sin espacios duplicados, sin repetidos
        tags: [...new Set((r.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean))],
        // Ingredientes: omitir filas donde nombre Y cantidad están vacíos
        ingredients: r.ingredients.filter(ing => ing.name.trim() || ing.amount.trim()),
        // Pasos: omitir strings vacíos
        steps: r.steps.filter(s => s.trim()),
      }))

    if (!validRecipes.length) {
      alert('Agregá al menos una receta con título antes de guardar.')
      return
    }

    // Aviso si alguna receta quedó sin ingredientes o sin pasos (no bloquea)
    const incomplete = validRecipes.filter(r => !r.ingredients.length || !r.steps.length)
    if (incomplete.length) {
      const names = incomplete.map(r => `• ${r.title}`).join('\n')
      const ok = window.confirm(
        `Las siguientes recetas están incompletas (sin ingredientes o sin pasos):\n${names}\n\n` +
        `¿Guardar igual? Podés completarlas después.`
      )
      if (!ok) return
    }

    onSave({
      id: genId(),
      name: bookName.trim(),
      subtitle: bookSubtitle.trim(),
      category: bookCategory,
      createdAt: new Date().toISOString().slice(0, 10),
      recipes: validRecipes,
    })
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button className={styles.cancelBtn} onClick={onCancel}>✕</button>
        <h2 className={styles.title}>Nuevo recetario</h2>
        <button className={styles.saveBtn} onClick={handleSave}>Guardar</button>
      </header>

      <div className={styles.body}>
        {/* Datos del libro */}
        <section className={styles.bookSection}>
          <label className={styles.fieldLabel}>Nombre del recetario *</label>
          <input
            className={styles.input}
            placeholder="Ej: Galletas para Max"
            value={bookName}
            onChange={e => setBookName(e.target.value)}
          />
          <label className={styles.fieldLabel}>Descripción (opcional)</label>
          <input
            className={styles.input}
            placeholder="Ej: Edición verano 2026"
            value={bookSubtitle}
            onChange={e => setBookSubtitle(e.target.value)}
          />
          <label className={styles.fieldLabel}>Categoría</label>
          <select
            className={styles.select}
            value={bookCategory}
            onChange={e => setBookCategory(e.target.value)}
          >
            {allCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </section>

        {/* Tabs de recetas */}
        <div className={styles.recipeTabs}>
          {recipes.map((r, i) => (
            <button
              key={r.id}
              className={`${styles.recipeTab} ${i === activeIdx ? styles.recipeTabActive : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              {r.emoji} {r.title || `Receta ${i + 1}`}
              {recipes.length > 1 && (
                <span
                  className={styles.removeTab}
                  onClick={e => { e.stopPropagation(); removeRecipe(i) }}
                >✕</span>
              )}
            </button>
          ))}
          <button className={styles.addRecipeTab} onClick={addRecipe}>+ Agregar</button>
        </div>

        {/* Editor de receta activa */}
        <section className={styles.recipeEditor}>
          {/* Ícono */}
          <div className={styles.emojiRow}>
            <button className={styles.emojiBtn} onClick={() => setShowEmojiPicker(v => !v)}>
              <span className={styles.emojiPreview}>{recipe.emoji}</span>
              <span className={styles.emojiHint}>Cambiar ícono</span>
            </button>
            {showEmojiPicker && (
              <div className={styles.emojiGrid}>
                {EMOJI_ICONS.map(em => (
                  <button key={em} className={styles.emojiOption}
                    onClick={() => { updateRecipe({ emoji: em }); setShowEmojiPicker(false) }}
                  >{em}</button>
                ))}
              </div>
            )}
          </div>

          <label className={styles.fieldLabel}>Nombre de la receta *</label>
          <input className={styles.input} placeholder="Ej: Galletas de zanahoria"
            value={recipe.title} onChange={e => updateRecipe({ title: e.target.value })} />

          <label className={styles.fieldLabel}>Subtítulo</label>
          <input className={styles.input} placeholder="Ej: La favorita del verano"
            value={recipe.subtitle} onChange={e => updateRecipe({ subtitle: e.target.value })} />

          <label className={styles.fieldLabel}>Foto (opcional)</label>
          <ImageUpload
            image={recipe.image}
            onChange={url => updateRecipe({ image: url })}
            accessCode={accessCode}
          />

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.fieldLabel}>Categoría</label>
              <select className={styles.select} value={recipe.category}
                onChange={e => updateRecipe({ category: e.target.value })}>
                <option>Horneada</option>
                <option>Deshidratada</option>
                <option>Congelada</option>
              </select>
            </div>
            <div className={styles.col}>
              <label className={styles.fieldLabel}>Rinde</label>
              <input className={styles.input} placeholder="16 galletas"
                value={recipe.yield} onChange={e => updateRecipe({ yield: e.target.value })} />
            </div>
          </div>

          {/* Ingredientes */}
          <label className={styles.fieldLabel}>Ingredientes</label>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className={styles.ingRow}>
              <input className={styles.inputFlex} placeholder="Nombre"
                value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
              <input className={styles.inputAmt} placeholder="Cantidad"
                value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} />
              <button className={styles.removeBtn} onClick={() => removeIngredient(i)}>✕</button>
            </div>
          ))}
          <button className={styles.addBtn} onClick={addIngredient}>+ Ingrediente</button>

          {/* Pasos */}
          <label className={styles.fieldLabel}>Pasos</label>
          {recipe.steps.map((step, i) => (
            <div key={i} className={styles.stepRow}>
              <span className={styles.stepNum}>{i + 1}</span>
              <input className={styles.inputFlex} placeholder={`Paso ${i + 1}…`}
                value={step} onChange={e => updateStep(i, e.target.value)} />
              <button className={styles.removeBtn} onClick={() => removeStep(i)}>✕</button>
            </div>
          ))}
          <button className={styles.addBtn} onClick={addStep}>+ Paso</button>

          {/* Duración */}
          <label className={styles.fieldLabel}>Duración (línea 1)</label>
          <input className={styles.input} placeholder="Refri: 7 días"
            value={recipe.duration.line1}
            onChange={e => updateRecipe({ duration: { ...recipe.duration, line1: e.target.value } })} />
          <label className={styles.fieldLabel}>Duración (línea 2)</label>
          <input className={styles.input} placeholder="Freezer: 2–3 meses"
            value={recipe.duration.line2}
            onChange={e => updateRecipe({ duration: { ...recipe.duration, line2: e.target.value } })} />

          {/* Nota */}
          <label className={styles.fieldLabel}>Nota (opcional)</label>
          <textarea className={styles.textarea} rows={2}
            placeholder="Ej: No usar si tiene alergia a la avena."
            value={recipe.note} onChange={e => updateRecipe({ note: e.target.value })} />

          {/* Tags */}
          <label className={styles.fieldLabel}>Etiquetas</label>
          <input
            className={styles.tagsInput}
            placeholder="sin gluten, rápida, verano…"
            value={(recipe.tags || []).join(', ')}
            onChange={e => updateRecipe({
              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            })}
          />
          <span className={styles.tagsHint}>Separalas con comas</span>
        </section>
      </div>
    </div>
  )
}
