'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ChefHat, ArrowLeft, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Rediriger vers une page de confirmation
      router.push('/login?message=Vérifiez votre email pour confirmer votre inscription')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24">
      <div className="max-w-md mx-auto px-4">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à la connexion
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
              <ChefHat className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-600">
              Rejoignez ChefAI et découvrez des recettes uniques générées par IA
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              En vous inscrivant, vous acceptez nos{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                Conditions d'utilisation
              </Link>
              {' '}et notre{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                Politique de confidentialité
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
} 