'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHatIcon, SparklesIcon, BookOpenIcon, Search, Clock, Star, Filter, Sparkles, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'
import RecipeModal from '@/components/RecipeModal'

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRandomRecipes()
  }, [])

  const loadRandomRecipes = async () => {
    try {
      setLoading(true)
      console.log('Chargement des recettes...')
      
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')

      console.log('Résultat de la requête:', { data, error })

      if (error) {
        console.error('Erreur lors du chargement des recettes:', error)
        return
      }

      if (!data || data.length === 0) {
        console.log('Aucune recette trouvée')
        return
      }

      const shuffledRecipes = data
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)

      const formattedRecipes: Recipe[] = shuffledRecipes.map(recipe => ({
        id: recipe.id,
        name: recipe.recipe_name,
        ingredients: recipe.ingredients,
        steps: recipe.instructions,
        prepTime: recipe.prep_time,
        difficulty: recipe.difficulty,
        image: recipe.image,
        created_at: recipe.created_at,
        user_id: recipe.user_id
      }))

      setRecipes(formattedRecipes)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { icon: '🥗', name: 'Healthy' },
    { icon: '🍝', name: 'Italien' },
    { icon: '🥘', name: 'Français' },
    { icon: '🌮', name: 'Mexicain' },
    { icon: '🍣', name: 'Japonais' },
    { icon: '🥪', name: 'Rapide' },
    { icon: '🥬', name: 'Végétarien' },
    { icon: '🍰', name: 'Desserts' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section avec recherche */}
      <div className="relative h-[70vh] bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070")' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-8">
            ChefAI Gourmet
          </h1>
          <p className="text-xl text-white/90 text-center mb-12 max-w-2xl">
            Vous avez des restes ? On s'occupe du reste...
          </p>
          
          {/* Barre de recherche stylisée */}
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-full shadow-lg p-2 flex items-center">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Quels ingrédients avez-vous ?"
                  className="w-full bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <Link
                href="/recipes"
                className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-700 transition-colors"
              >
                Générer une recette
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-8">
          {categories.map((category, index) => (
            <button
              key={index}
              className="flex flex-col items-center space-y-2 min-w-fit hover:opacity-80 transition-opacity"
            >
              <div className="text-3xl">{category.icon}</div>
              <span className="text-sm font-medium text-gray-600">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section des recettes populaires */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recettes Populaires</h2>
            <p className="text-gray-600 mt-1">Découvrez les créations préférées de notre communauté</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-72"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {recipe.image && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
                      <Star className="h-5 w-5 text-primary-600" />
                    </div>
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
                      <ChefHatIcon className="h-4 w-4 text-primary-600" />
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Recette en vedette */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Recette en vedette</h2>
        </div>
        
        {loading ? (
          <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-2xl" />
        ) : recipes.length > 0 && (
          <div 
            className="relative w-full h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => setSelectedRecipe(recipes[0])}
          >
            {/* Image de fond */}
            {recipes[0].image && (
              <img
                src={recipes[0].image}
                alt={recipes[0].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            
            {/* Overlay dégradé */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Contenu */}
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <div className="max-w-3xl">
                <h3 className="text-4xl font-bold mb-4 group-hover:text-primary-400 transition-colors">
                  {recipes[0].name}
                </h3>
                <div className="flex flex-wrap items-center gap-6 text-white/80 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{recipes[0].prepTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHatIcon className="h-5 w-5" />
                    <span>{recipes[0].difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    <span>Générée par IA</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRecipe(recipes[0])
                  }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl text-white transition-all duration-200 group-hover:translate-y-0 translate-y-2"
                >
                  <Eye className="h-5 w-5" />
                  Voir la recette
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section d'inspiration */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Laissez-vous Inspirer par l'IA
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Notre intelligence artificielle analyse vos ingrédients et préférences pour créer des recettes uniques et personnalisées. Découvrez de nouvelles saveurs et techniques culinaires.
              </p>
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <SparklesIcon className="h-5 w-5" />
                Commencer l'aventure
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554"
                  alt="Cuisine 1"
                  className="rounded-lg h-48 w-full object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1551218372-8a8d768c9dff"
                  alt="Cuisine 2"
                  className="rounded-lg h-32 w-full object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2"
                  alt="Cuisine 3"
                  className="rounded-lg h-32 w-full object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1495521821757-a1efb6729352"
                  alt="Cuisine 4"
                  className="rounded-lg h-48 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recette */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Styles spécifiques */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
} 