'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-2xl font-bold text-violet-600">SACIMO</span>
          </Link>

          <h1 className="text-3xl font-light mb-2">Créer votre compte</h1>
          <p className="text-slate-600 mb-8">Commencez gratuitement dès aujourd'hui</p>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="vous@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-semibold"
            >
              Créer mon compte
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Déjà un compte ?{' '}
            <Link href="/auth/signin" className="text-violet-600 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-violet-950 to-indigo-950">
        <div className="h-full flex items-center justify-center text-white p-12">
          <div className="text-center">
            <h2 className="text-4xl font-light mb-4">Rejoignez SACIMO</h2>
            <p className="text-xl opacity-80">Découvrez la nouvelle génération d'outils immobiliers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
