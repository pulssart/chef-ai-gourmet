# ChefAI Gourmet

Application web de génération de recettes personnalisées utilisant l'IA.

## Déploiement sur Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com/) si ce n'est pas déjà fait.

2. Connectez votre compte GitHub à Netlify.

3. Dans Netlify, cliquez sur "New site from Git" et sélectionnez votre dépôt GitHub.

4. Dans les paramètres de build, configurez :
   - Build command: `npm run build`
   - Publish directory: `.next`

5. Dans "Environment variables", ajoutez les variables suivantes :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   OPENAI_API_KEY=votre_clé_api_openai
   ```

6. Cliquez sur "Deploy site"

## Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
OPENAI_API_KEY=votre_clé_api_openai
```

## Développement local

1. Installez les dépendances :
```bash
npm install
```

2. Lancez le serveur de développement :
```bash
npm run dev
```

3. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Technologies utilisées

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI
- Radix UI
- Headless UI
