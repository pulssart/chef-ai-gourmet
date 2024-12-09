interface RecipeFiltersProps {
  selectedTags: string[]
  onTagSelect: (tag: string) => void
}

export const RECIPE_TAGS = [
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'italien', name: 'Italien', icon: '🍝' },
  { id: 'francais', name: 'Français', icon: '🥘' },
  { id: 'mexicain', name: 'Mexicain', icon: '🌮' },
  { id: 'japonais', name: 'Japonais', icon: '🍣' },
  { id: 'rapide', name: 'Rapide', icon: '🥪' },
  { id: 'vegetarien', name: 'Végétarien', icon: '🥬' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
]

export default function RecipeFilters({ selectedTags, onTagSelect }: RecipeFiltersProps) {
  return (
    <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-2">
      {RECIPE_TAGS.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagSelect(tag.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            selectedTags.includes(tag.id)
              ? 'bg-primary-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
        >
          <span className="text-xl">{tag.icon}</span>
          <span className="text-sm font-medium">{tag.name}</span>
        </button>
      ))}
    </div>
  )
} 