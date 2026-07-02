import React, { useState } from 'react'
import styles from './CreateBook.module.css'
import { genId, EMOJI_ICONS } from '../utils/bookUtils'

export default function EditBook({ book, onSave, onCancel }) {
  const [bookName, setBookName] = useState(book.name)
  const [bookSubtitle, setBookSubtitle] = useState(book.subtitle || '')
  const [recipes, setRecipes] = useState(book.recipes.map(r => ({ ...r })))
  const [activeIdx, setActiveIdx] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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

  function moveRecipe(from, to) {
    if (to < 0 || to >= recipes.length) return
    const next = [...recipes]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setRecipes(next)
    setActiveIdx(to)
  }

  function addRecipe() {
    const r = {
      id: genId(),
      title: '', subtitle: '', category: 'Horneada', extra: '',
      emoji: '🍪', svgPaths: '',
      yield: '16 galletas',
      ingredients: [{ name: '', amount: '' }],
      steps: [''],
      duration: { line1: 'Refri: 7 días', line2: 'Freezer: 2–3 meses' },
      note: '',
    }
    const next = [...recipes, r]
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
    if (!bookName.trim()) { alert('El recetario necesita un nombre.'); return }
    const validRecipes = recipes.filter(r => r.title.trim())
    if (!validRecipes.length) { alert('Agregá al menos una receta con título.'); return }
    onSave({
      ...book,
      name: bookName.trim(),
      subtitle: bookSubtitle.trim(),
      recipes: validRecipes,
    })
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button className={styles.cancelBtn} onClick={onCancel}>✕</button>
        <h2 className={styles.title}>Editar recetario</h2>
        <button className={styles.saveBtn} onClick={handleSave}>Guardar</button>
      </header>

      <div className={styles.body}>
        <section className={styles.bookSection}>
          <label className={styles.fieldLabel}>Nombre del recetario *</label>
          <input className={styles.input} value={bookName}
            onChange={e => setBookName(e.target.value)} />
          <label className={styles.fieldLabel}>Descripción (opcional)</label>
          <input className={styles.input} value={bookSubtitle}
            onChange={e => setBookSubtitle(e.target.value)} />
        </section>

        <div className={styles.recipeTabs}>
          {recipes.map((r, i) => (
            <button
              key={r.id}
              className={`${styles.recipeTab} ${i === activeIdx ? styles.recipeTabActive : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              {r.emoji} {r.title || `Receta ${i + 1}`}
              {recipes.length > 1 && (
                <span className={styles.removeTab}
                  onClick={e => { e.stopPropagation(); removeRecipe(i) }}>✕</span>
              )}
            </button>
          ))}
          <button className={styles.addRecipeTab} onClick={addRecipe}>+ Agregar</button>
        </div>

        <section className={styles.recipeEditor}>
          {/* Reordenar */}
          <div className={styles.reorderRow}>
            <span className={styles.fieldLabel} style={{ margin: 0 }}>Receta {activeIdx + 1} de {recipes.length}</span>
            <button className={styles.orderBtn} onClick={() => moveRecipe(activeIdx, activeIdx - 1)}
              disabled={activeIdx === 0} title="Mover arriba">↑</button>
            <button className={styles.orderBtn} onClick={() => moveRecipe(activeIdx, activeIdx + 1)}
              disabled={activeIdx === recipes.length - 1} title="Mover abajo">↓</button>
          </div>

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
          <input className={styles.input} value={recipe.title}
            onChange={e => updateRecipe({ title: e.target.value })} />

          <label className={styles.fieldLabel}>Subtítulo</label>
          <input className={styles.input} value={recipe.subtitle}
            onChange={e => updateRecipe({ subtitle: e.target.value })} />

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
              <input className={styles.input} value={recipe.yield}
                onChange={e => updateRecipe({ yield: e.target.value })} />
            </div>
          </div>

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

          <label className={styles.fieldLabel}>Duración (línea 1)</label>
          <input className={styles.input} value={recipe.duration?.line1 || ''}
            onChange={e => updateRecipe({ duration: { ...recipe.duration, line1: e.target.value } })} />
          <label className={styles.fieldLabel}>Duración (línea 2)</label>
          <input className={styles.input} value={recipe.duration?.line2 || ''}
            onChange={e => updateRecipe({ duration: { ...recipe.duration, line2: e.target.value } })} />

          <label className={styles.fieldLabel}>Nota (opcional)</label>
          <textarea className={styles.textarea} rows={2}
            value={recipe.note} onChange={e => updateRecipe({ note: e.target.value })} />
        </section>
      </div>
    </div>
  )
}
