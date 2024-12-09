'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X, Loader2 } from 'lucide-react'
import { Recipe } from '@/types/recipe'
import { supabase } from '@/lib/supabase'
import { RECIPE_TAGS } from './RecipeFilters'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'

interface GenerateRecipeModalProps {
  onClose: () => void
  onRecipesGenerated: (recipes: Recipe[]) => void
}

interface Preferences {
  vegetarien: boolean
  sansGluten: boolean
  sansLactose: boolean
}

export default function GenerateRecipeModal({
  onClose,
  onRecipesGenerated,
}: GenerateRecipeModalProps) {
  const [ingredients, setIngredients] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [preferences, setPreferences] = useState<Preferences>({
    vegetarien: false,
    sansGluten: false,
    sansLactose: false,
  })
  const [expertiseLevel, setExpertiseLevel] = useState(50)
  const [healthLevel, setHealthLevel] = useState(50)

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('Utilisateur non connecté')
        return
      }

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          preferences,
          expertiseLevel,
          healthLevel,
          tags: selectedTags,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la recette')
      }

      const recipe: Recipe = await response.json()
      
      // Sauvegarder la recette dans Supabase
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert([
          {
            user_id: session.user.id,
            recipe_name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.steps,
            prep_time: recipe.prepTime,
            difficulty: recipe.difficulty,
            image: recipe.image,
            tags: selectedTags,
            nutrition: recipe.nutrition,
          },
        ])
        .select()

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        throw error
      }

      onRecipesGenerated([recipe])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsGenerating(false)
      onClose()
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>

          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
            Générer une nouvelle recette
          </Dialog.Title>

          <div className="space-y-6">
            {/* Ingrédients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingrédients disponibles
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Entrez vos ingrédients séparés par des virgules..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de cuisine
              </label>
              <div className="flex flex-wrap gap-2">
                {RECIPE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Préférences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préférences alimentaires
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Végétarien</span>
                  <Switch
                    checked={preferences.vegetarien}
                    onCheckedChange={(checked: boolean) =>
                      setPreferences((prev) => ({ ...prev, vegetarien: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sans gluten</span>
                  <Switch
                    checked={preferences.sansGluten}
                    onCheckedChange={(checked: boolean) =>
                      setPreferences((prev) => ({ ...prev, sansGluten: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sans lactose</span>
                  <Switch
                    checked={preferences.sansLactose}
                    onCheckedChange={(checked: boolean) =>
                      setPreferences((prev) => ({ ...prev, sansLactose: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Niveaux */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'expertise
                </label>
                <Slider
                  value={[expertiseLevel]}
                  onValueChange={([value]) => setExpertiseLevel(value)}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Débutant</span>
                  <span>Expert</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau santé
                </label>
                <Slider
                  value={[healthLevel]}
                  onValueChange={([value]) => setHealthLevel(value)}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Gourmand</span>
                  <span>Healthy</span>
                </div>
              </div>
            </div>

            {/* Bouton de génération */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !ingredients.trim()}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                'Générer la recette'
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 