'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/signin/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = '/api/auth/signin/facebook';
  };

  const handleLinkedInLogin = () => {
    window.location.href = '/api/auth/signin/linkedin';
  };

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

          <h1 className="text-3xl font-light mb-2">Connexion</h1>
          <p className="text-slate-600 mb-8">Connectez-vous à votre compte</p>
            
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
              Se connecter
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-transparent rounded-lg shadow-sm bg-[#1877F2] text-white hover:bg-[#166FE0] transition-colors"
              onClick={handleFacebookLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22 12.07C22 6.49 17.52 2 11.94 2 6.36 2 1.88 6.49 1.88 12.07c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.9h2.42V9.79c0-2.4 1.43-3.73 3.62-3.73 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.2 0-1.57.74-1.57 1.49v1.79h2.67l-.43 2.9h-2.24v7.03c4.78-.81 8.44-4.94 8.44-9.94Z"
                />
              </svg>
              Continuer avec Facebook
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-transparent rounded-lg shadow-sm bg-[#0A66C2] text-white hover:bg-[#0957A5] transition-colors"
              onClick={handleLinkedInLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.33V9h3.42v1.56h.05c.48-.9 1.66-1.85 3.41-1.85 3.64 0 4.31 2.39 4.31 5.5v6.24ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.56V9h3.56v11.45Z"
                />
              </svg>
              Continuer avec LinkedIn
            </button>
          </div>

          <p className="mt-6 text-center text-sm">
            Pas de compte ?{' '}
            <Link href="/auth/signup" className="text-violet-600 font-medium">
              S'inscrire
            </Link>
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href="/app/dashboard"
              className="block text-center text-sm text-slate-600 border rounded-lg py-2 hover:bg-slate-50 transition-colors"
            >
              Accès direct dashboard
            </Link>

            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span>←</span>
              Retour au site principal
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-violet-950 via-indigo-950 to-violet-900 overflow-hidden rounded-l-[32px]">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1800&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-blue-900/80" />
        <div className="relative h-full flex flex-col justify-center text-white px-12 py-14">
          <div className="text-center text-white max-w-xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Gérez votre immobilier en toute simplicité
            </h1>
            <p className="text-xl opacity-90">
              La plateforme tout-en-un pour digitaliser votre gestion immobilière.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-24 mb-auto max-w-xl mx-auto justify-items-center">
            <div className="flex flex-col items-center text-white/90">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xs">Gestion des biens</span>
            </div>

            <div className="flex flex-col items-center text-white/90">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs">Tableaux de bord</span>
            </div>

            <div className="flex flex-col items-center text-white/90">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs">Documents</span>
            </div>

            <div className="flex flex-col items-center text-white/90">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs">Agenda</span>
            </div>

            <div className="flex flex-col items-center text-white/90">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-xs">Mandats</span>
            </div>

            <div className="flex flex-col items-center text-white/90">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-2">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs">Copilote IA</span>
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-between text-white px-8 max-w-2xl mx-auto">
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg px-5 py-3 shadow-lg shadow-black/20">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-90">Agents accompagnés</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg px-5 py-3 shadow-lg shadow-black/20">
              <div className="text-3xl font-bold">12k</div>
              <div className="text-sm opacity-90">Annonces suivies</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg px-5 py-3 shadow-lg shadow-black/20">
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm opacity-90">Satisfaction client</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
