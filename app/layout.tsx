import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ChefAI Gourmet - Recettes personnalisées par IA',
  description: 'Générez des recettes personnalisées en fonction de vos ingrédients et préférences alimentaires grâce à l\'intelligence artificielle.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
