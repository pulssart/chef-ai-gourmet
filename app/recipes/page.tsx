'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/types/recipe'
import RecipeModal from '@/components/RecipeModal'
import { Trash2, Plus, Loader2, Star, ChefHat, Clock, Sparkles } from 'lucide-react'
import GenerateRecipeModal from '@/components/GenerateRecipeModal'
import RecipeFilters, { RECIPE_TAGS } from '@/components/RecipeFilters'

export default function RecipesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
    loadSavedRecipes()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('Utilisateur non connecté, redirection vers la page de connexion')
        router.push('/login')
        return
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      router.push('/login')
    }
  }

  const loadSavedRecipes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement des recettes:', error)
        return
      }

      const formattedRecipes: Recipe[] = data.map(recipe => ({
        id: recipe.id,
        name: recipe.recipe_name,
        ingredients: recipe.ingredients,
        steps: recipe.instructions,
        prepTime: recipe.prep_time,
        difficulty: recipe.difficulty,
        image: recipe.image,
        created_at: recipe.created_at,
        user_id: recipe.user_id,
        tags: recipe.tags || [],
        nutrition: recipe.nutrition
      }))

      setSavedRecipes(formattedRecipes)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteRecipe = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!window.confirm('Voulez-vous vraiment supprimer cette recette ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', recipeId)

      if (error) throw error

      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredRecipes = selectedTags.length > 0
    ? savedRecipes.filter(recipe => 
        selectedTags.some(tag => recipe.tags?.includes(tag))
      )
    : savedRecipes

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Recettes</h1>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Générer une recette
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-8">
          <RecipeFilters
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
          />
        </div>

        {/* Section des recettes */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Recettes Favorites</h2>
            {selectedTags.length > 0 && (
              <span className="text-sm text-gray-500">
                ({filteredRecipes.length} résultat{filteredRecipes.length > 1 ? 's' : ''})
              </span>
            )}
          </div>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">
                {selectedTags.length > 0 
                  ? 'Aucune recette ne correspond aux filtres sélectionnés'
                  : 'Aucune recette sauvegardée'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedTags.length > 0 
                  ? 'Essayez de modifier vos filtres'
                  : 'Générez des recettes et sauvegardez vos favorites !'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  {recipe.image && (
                    <div className="relative h-48">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => recipe.id && handleDeleteRecipe(recipe.id, e)}
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary-600" />
                        <span>{recipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-4 w-4 text-primary-600" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {recipe.tags.map(tag => {
                          const tagInfo = RECIPE_TAGS.find(t => t.id === tag)
                          if (!tagInfo) return null
                          return (
                            <div 
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              <span>{tagInfo.icon}</span>
                              <span>{tagInfo.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showGenerateModal && (
          <GenerateRecipeModal
            onClose={() => setShowGenerateModal(false)}
            onRecipesGenerated={(recipes: Recipe[]) => {
              loadSavedRecipes()
              setShowGenerateModal(false)
            }}
          />
        )}

        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onSave={() => {
              loadSavedRecipes()
            }}
          />
        )}
      </div>
    </div>
  )
} 