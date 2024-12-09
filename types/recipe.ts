export interface Recipe {
  id?: string
  name: string
  ingredients: string[]
  steps: string[]
  prepTime: string
  difficulty: string
  image?: string | null
  servings?: number
  created_at?: string
  user_id?: string
  tags: string[]
  nutrition?: {
    calories: number
    macronutrients: {
      proteines: number  // pourcentage
      glucides: number   // pourcentage
      lipides: number    // pourcentage
    }
    details?: {
      sucres?: number        // grammes
      fibres?: number        // grammes
      graissesSaturees?: number  // grammes
      sodium?: number        // milligrammes
    }
  }
} 