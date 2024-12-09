import { Clock, ChefHat } from 'lucide-react'
import { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  onClick?: () => void
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      {recipe.image && (
        <div className="relative h-48 w-full">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-serif font-semibold text-lg text-gray-900 mb-2">
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
      </div>
    </div>
  )
} 