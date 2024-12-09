'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { ChefHatIcon, LogOut, Menu, X } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <nav className={`max-w-7xl mx-auto ${isScrolled ? 'bg-white/80 shadow-lg backdrop-blur-md' : 'bg-white/50 backdrop-blur-sm'} rounded-2xl px-4 py-2 transition-all duration-300`}>
        <div className="flex items-center justify-between">
          {/* Logo et nom */}
          <button onClick={() => handleNavigation('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChefHatIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-800 text-transparent bg-clip-text">
              ChefAI
            </span>
          </button>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavigation('/recipes')}
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Mes Recettes
            </button>
            {user ? (
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('/login')}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
              >
                Connexion
              </button>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('/recipes')}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
              >
                Mes Recettes
              </button>
              {user ? (
                <>
                  <div className="text-sm text-gray-600 py-2">{user.email}</div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
} 