'use client'

import { useState } from 'react'
import { Recipe } from '@/types/recipe'
import { Slider } from '@/components/ui/Slider'
import { X, Users, Clock, ChefHat, Flame, Apple, Wheat, Droplets, Heart, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

// Composant pour le graphique circulaire
function MacronutrientChart({ percentage, color, icon: Icon, label }: { 
  percentage: number; 
  color: string; 
  icon: any;
  label: string;
}) {
  const circumference = 2 * Math.PI * 40
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-6 w-6 mb-1" style={{ color }} />
          <span className="text-sm font-semibold" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-600 mt-2">{label}</span>
    </div>
  )
}

interface RecipeModalProps {
  recipe: Recipe
  onClose: () => void
  onSave?: () => void
}

export default function RecipeModal({ recipe, onClose, onSave }: RecipeModalProps) {
  const [servings, setServings] = useState(4)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nutritionData = {
    calories: 650,
    proteines: 30,
    glucides: 45,
    lipides: 25,
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const { data: { session }, error: userError } = await supabase.auth.getSession()
      if (userError) {
        setError(`Erreur d'authentification: ${userError.message}`)
        return
      }
      if (!session) {
        setError('Vous devez être connecté pour sauvegarder une recette')
        return
      }

      const recipeData = {
        recipe_name: recipe.name,
        ingredients: recipe.ingredients,
        instructions: recipe.steps,
        prep_time: recipe.prepTime,
        difficulty: recipe.difficulty,
        image: recipe.image,
        user_id: session.user.id
      }

      const { error: saveError } = await supabase
        .from('saved_recipes')
        .insert([recipeData])

      if (saveError) {
        const pgError = saveError as PostgrestError
        setError(`Erreur de sauvegarde: ${pgError.message}`)
        return
      }

      setSaved(true)
      if (onSave) onSave()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue est survenue'
      setError(`Erreur: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const adjustIngredientQuantities = (ingredient: string) => {
    const originalServings = 4
    const ratio = servings / originalServings
    
    const regex = /^([\d.,]+)\s*(g|kg|ml|cl|l|cuillère[s]? à (?:soupe|café)|c\.à\.s|c\.à\.c|pincée[s]?|unité[s]?|)\s*(.+)$/i
    const match = ingredient.match(regex)

    if (match) {
      const [, quantity, unit, rest] = match
      const numericQuantity = parseFloat(quantity.replace(',', '.'))
      let adjustedQuantity = (numericQuantity * ratio)

      if (unit.toLowerCase().startsWith('pincée')) {
        adjustedQuantity = Math.ceil(adjustedQuantity)
      } else if (unit.toLowerCase().includes('cuillère') || unit.toLowerCase().includes('c.à')) {
        adjustedQuantity = Math.round(adjustedQuantity * 2) / 2
      } else {
        if (adjustedQuantity >= 1) {
          adjustedQuantity = Math.round(adjustedQuantity * 10) / 10
        } else {
          adjustedQuantity = Math.round(adjustedQuantity * 100) / 100
        }
      }

      let formattedQuantity = adjustedQuantity.toString().replace('.', ',')
      if (formattedQuantity.endsWith(',0')) {
        formattedQuantity = formattedQuantity.slice(0, -2)
      }

      let formattedUnit = unit
      if (adjustedQuantity > 1) {
        if (unit.toLowerCase() === 'pincée') formattedUnit = 'pincées'
        if (unit.toLowerCase() === 'unité') formattedUnit = 'unités'
      }

      return `${formattedQuantity} ${formattedUnit} ${rest}`.trim()
    }
    return ingredient
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Image de couverture */}
        {recipe.image && (
          <div className="relative h-[40vh] w-full flex-shrink-0">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h2 className="text-4xl font-bold mb-4">{recipe.name}</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{recipe.prepTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  <span>{recipe.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{servings} portions</span>
                </div>
              </div>
            </div>
            {/* Boutons d'action */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={onClose}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                disabled={saving || saved}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
                  saved 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/90 hover:bg-white text-gray-700'
                }`}
              >
                <Heart className={`h-6 w-6 ${saved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Share2 className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                {error}
              </div>
            )}

            {/* Contrôle des portions */}
            <div className="mb-8 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de portions
              </label>
              <Slider
                value={servings}
                onChange={setServings}
                min={1}
                max={12}
                className="mb-2"
              />
              <span className="text-sm text-gray-500">
                Ajustez le curseur pour modifier les quantités
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne de gauche : Ingrédients et Nutrition */}
              <div className="lg:col-span-1">
                {/* Ingrédients */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Ingrédients</h3>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700">
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                        <span>{adjustIngredientQuantities(ingredient)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Informations nutritionnelles */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-900 font-medium">{nutritionData.calories} kcal/portion</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <MacronutrientChart
                      percentage={nutritionData.proteines}
                      color="#ef4444"
                      icon={Apple}
                      label="Protéines"
                    />
                    <MacronutrientChart
                      percentage={nutritionData.glucides}
                      color="#eab308"
                      icon={Wheat}
                      label="Glucides"
                    />
                    <MacronutrientChart
                      percentage={nutritionData.lipides}
                      color="#3b82f6"
                      icon={Droplets}
                      label="Lipides"
                    />
                  </div>
                </div>
              </div>

              {/* Colonne de droite : Instructions */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-6">Instructions</h3>
                <ol className="space-y-6">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 