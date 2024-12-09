'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthComponent() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      console.log('Tentative d\'authentification avec:', { email, password, isSignUp })
      
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/recipes`,
          },
        })
        console.log('Résultat inscription:', { data, error })
        if (error) throw error
        setMessage('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log('Résultat connexion:', { data, error })
        if (error) throw error
        setMessage('Connexion réussie !')
        setTimeout(() => {
          router.push('/recipes')
        }, 1000)
      }
    } catch (error) {
      const authError = error as AuthError
      console.error('Erreur détaillée:', authError)
      setMessage(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-soft">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {isSignUp ? 'Créer un compte' : 'Connexion'}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {isSignUp ? 'Inscrivez-vous pour commencer' : 'Connectez-vous à votre compte'}
      </p>

      <form onSubmit={handleAuth} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isSignUp ? 'Création du compte...' : 'Connexion...'}
            </span>
          ) : (
            isSignUp ? 'Créer un compte' : 'Se connecter'
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage(null)
          }}
          className="w-full text-sm text-primary-600 hover:text-primary-700"
        >
          {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Créez-en un'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm ${
            message.includes('succès') || message.includes('réussie')
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
} 