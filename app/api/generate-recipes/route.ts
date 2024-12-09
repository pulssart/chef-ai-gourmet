import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { ingredients, preferences, strictIngredients, expertiseLevel, healthyLevel } = await req.json()

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Les ingrédients sont requis' },
        { status: 400 }
      )
    }

    // Construction du prompt
    const dietaryRestrictions = preferences?.length > 0
      ? `La recette doit être ${preferences.join(' et ')}.`
      : ''

    const ingredientsConstraint = strictIngredients
      ? 'Utilise UNIQUEMENT les ingrédients fournis.'
      : 'Tu peux suggérer des ingrédients supplémentaires courants si nécessaire.'

    const expertiseLevelText = expertiseLevel <= 3 ? 'simple et facile à réaliser'
      : expertiseLevel <= 6 ? 'de niveau intermédiaire'
      : 'complexe et sophistiquée'

    const healthyLevelText = healthyLevel <= 3 ? 'très saine et légère'
      : healthyLevel <= 6 ? 'équilibrée'
      : 'gourmande et généreuse'

    const prompt = `Génère exactement 3 recettes de cuisine uniques et créatives en utilisant ces ingrédients : ${ingredients.join(', ')}.
${dietaryRestrictions}
${ingredientsConstraint}
Les recettes doivent être ${expertiseLevelText} et ${healthyLevelText}.

Pour chaque recette, fournis :
1. Un nom créatif et appétissant
2. Une liste d'ingrédients avec quantités précises
3. Des étapes détaillées
4. Le temps de préparation
5. Le niveau de difficulté
6. Une description courte et alléchante pour générer une image

Format JSON attendu pour chaque recette :
{
  "name": "Nom de la recette",
  "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"],
  "steps": ["étape 1", "étape 2"],
  "prepTime": "XX minutes",
  "difficulty": "Facile/Moyen/Difficile",
  "imagePrompt": "Description pour DALL-E"
}

Réponds uniquement avec un tableau JSON de 3 recettes.`

    // Génération des recettes avec GPT-4
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      temperature: 1,
      response_format: { type: "json_object" }
    })

    const recipesData = JSON.parse(completion.choices[0].message.content || '{}')
    const recipes = recipesData.recipes || []

    // Génération des images pour chaque recette
    const recipesWithImages = await Promise.all(recipes.map(async (recipe: any) => {
      try {
        const image = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Photo de cuisine professionnelle et appétissante de : ${recipe.name}. ${recipe.imagePrompt}. Style photographique moderne, éclairage naturel, mise en scène élégante.`,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        })

        return {
          ...recipe,
          image: image.data[0]?.url
        }
      } catch (error) {
        console.error('Erreur lors de la génération de l\'image:', error)
        return recipe
      }
    }))

    return NextResponse.json({ recipes: recipesWithImages })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recettes' },
      { status: 500 }
    )
  }
} 