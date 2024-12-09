'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/types/recipe'
import { BookOpen, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react'

interface SavedRecipesSidebarProps {
  onRecipeClick: (recipe: Recipe) => void
}

export default function SavedRecipesSidebar({ onRecipeClick }: SavedRecipesSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadSavedRecipes()
  }, [])

  const loadSavedRecipes = async () => {
    try {
      const { data: recipes, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedRecipes: Recipe[] = recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.recipe_name,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : JSON.parse(recipe.ingredients || '[]'),
        steps: Array.isArray(recipe.instructions) ? recipe.instructions : JSON.parse(recipe.instructions || '[]'),
        prepTime: recipe.prep_time,
        difficulty: recipe.difficulty,
        image: recipe.image,
        created_at: recipe.created_at,
        user_id: recipe.user_id
      }))

      setSavedRecipes(formattedRecipes)
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Empêche le clic de propager à la recette
    if (!recipeId || deleting) return

    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cette recette ?')
    if (!confirmDelete) return

    setDeleting(recipeId)
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', recipeId)

      if (error) throw error

      // Mettre à jour la liste des recettes localement
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={`fixed top-0 right-0 h-full bg-white shadow-xl transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-white p-2 rounded-l-xl shadow-md"
      >
        {isOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>

      <div className="w-80 h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Recettes sauvegardées</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Aucune recette sauvegardée</p>
              <p className="text-sm mt-2">Les recettes que vous sauvegarderez apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="relative group"
                >
                  <button
                    onClick={() => onRecipeClick(recipe)}
                    className="w-full text-left p-4 rounded-xl border hover:border-primary-600 hover:shadow-md transition-all"
                  >
                    {recipe.image && (
                      <div className="w-full h-32 mb-3">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900">{recipe.name}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{recipe.prepTime}</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => recipe.id && handleDelete(recipe.id, e)}
                    disabled={deleting === recipe.id}
                    className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      hover:bg-red-50 ${deleting === recipe.id ? 'cursor-not-allowed' : 'hover:text-red-500'}`}
                  >
                    <Trash2 className={`h-4 w-4 ${deleting === recipe.id ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 