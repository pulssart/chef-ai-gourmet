'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ChefHat, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setMessage(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
              <ChefHat className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à vos recettes personnalisées
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
              {message}
            </div>
          )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link 
                href="/register" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 