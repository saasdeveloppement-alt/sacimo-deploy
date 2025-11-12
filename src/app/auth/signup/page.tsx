'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Clock,
  Home,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

const objectiveOptions = [
  'Automatiser ma veille immobilière',
  'Identifier les opportunités plus vite',
  'Centraliser mes piges et rapports',
  'Suivre la concurrence en temps réel',
  'Accélérer mes rendez-vous vendeurs',
]

type DemoForm = {
  fullName: string
  email: string
  phone: string
  company: string
  companySize: string
  role: string
  objectives: string[]
  message: string
}

const initialForm: DemoForm = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  companySize: '',
  role: '',
  objectives: [],
  message: '',
}

export default function DemoRequestPage() {
  const [form, setForm] = useState<DemoForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const objectivesDisplay = useMemo(
    () => [
      {
        title: 'Démonstration personnalisée',
        description: 'Indiquez vos objectifs, nous adaptons la session à votre activité.',
        icon: Sparkles,
      },
      {
        title: 'Analyse de votre portefeuille',
        description: 'Projection concrète sur vos secteurs et vos mandats actuels.',
        icon: LineChart,
      },
      {
        title: 'Plan d’action immédiat',
        description: 'Recevez un plan pour industrialiser votre veille et vos piges.',
        icon: ShieldCheck,
      },
    ],
    [],
  )

  const handleChange = (field: keyof DemoForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const toggleObjective = (objective: string) => {
    setForm((prev) => {
      const alreadySelected = prev.objectives.includes(objective)
      return {
        ...prev,
        objectives: alreadySelected
          ? prev.objectives.filter((item) => item !== objective)
          : [...prev.objectives, objective],
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          objectives: form.objectives,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible d’enregistrer votre demande pour le moment.')
      }

      setSuccess(true)
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-900 text-white">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,rgba(91,33,182,0.35),transparent_60%),radial-gradient(circle_at_bottom,rgba(49,46,129,0.45),transparent_65%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center">
        <section className="flex w-full flex-1 flex-col justify-between space-y-16 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-md lg:space-y-24">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
              <Home className="h-4 w-4" />
              Retour au site
            </Link>

            <div className="mt-10 max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Demande de démo
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Découvrez comment SACIMO transforme votre prospection immobilière.
              </h1>
              <p className="text-lg text-white/70">
                En 30 minutes, identifiez comment automatiser vos piges, suivre la concurrence et générer des mandats qualifiés. Notre équipe vous propose une session adaptée à votre organisation.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <Users className="mt-1 h-5 w-5 text-violet-200" />
                  <div>
                    <p className="text-sm font-semibold text-white">+500 agences accompagnées</p>
                    <p className="text-sm text-white/70">Adopté par des réseaux indépendants, franchises et promoteurs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <Clock className="mt-1 h-5 w-5 text-violet-200" />
                  <div>
                    <p className="text-sm font-semibold text-white">Disponible sous 24h</p>
                    <p className="text-sm text-white/70">Choisissez votre créneau, un expert vous recontacte rapidement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {objectivesDisplay.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10">
                <Icon className="h-6 w-6 text-violet-200" />
                <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/70">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white p-10 shadow-2xl">
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
              <Building2 className="h-3.5 w-3.5" />
              Formulaire de contact
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Parlons de votre projet</h2>
            <p className="text-sm text-slate-600">
              Laissez-nous vos coordonnées : notre équipe reviendra vers vous sous 24 heures pour planifier une démonstration.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Demande envoyée !</p>
                <p>Un membre de l’équipe SACIMO vous contactera très vite pour fixer votre démonstration.</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Nom & prénom *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  type="text"
                  required
                  placeholder="Alexandre Dupont"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email professionnel *
                </label>
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  type="email"
                  required
                  placeholder="prenom@agence.fr"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label htmlFor="company" className="text-sm font-medium text-slate-700">
                  Agence / structure *
                </label>
                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange('company')}
                  type="text"
                  required
                  placeholder="Agence Horizon Immobilier"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Poste / rôle
                </label>
                <input
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange('role')}
                  type="text"
                  placeholder="Directeur commercial, agent, etc."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label htmlFor="companySize" className="text-sm font-medium text-slate-700">
                  Taille de l’équipe
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange('companySize')}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                >
                  <option value="">Sélectionner</option>
                  <option value="1-3">1-3 collaborateurs</option>
                  <option value="4-10">4-10 collaborateurs</option>
                  <option value="11-30">11-30 collaborateurs</option>
                  <option value="31+">31 et +</option>
                </select>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Vos objectifs</p>
              <p className="text-xs text-slate-500">
                Selectionnez les sujets qui vous intéressent le plus (plusieurs choix possibles).
              </p>
              <div className="mt-3 grid gap-2">
                {objectiveOptions.map((objective) => {
                  const selected = form.objectives.includes(objective)
                  return (
                    <button
                      key={objective}
                      type="button"
                      onClick={() => toggleObjective(objective)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        selected
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600'
                      }`}
                    >
                      <span>{objective}</span>
                      {selected && <CheckCircle2 className="h-5 w-5 text-violet-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-medium text-slate-700">
                Précisions supplémentaires
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange('message')}
                rows={4}
                placeholder="Partagez-nous vos attentes, vos outils actuels ou un besoin spécifique…"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Envoi en cours…' : 'Planifier une démonstration'}
            </button>

            <p className="text-center text-xs text-slate-500">
              En soumettant ce formulaire, vous acceptez d’être recontacté(e) par l’équipe SACIMO. Vos données ne seront jamais partagées avec des tiers.
            </p>
          </form>

          <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <Link href="/auth/signin" className="font-medium text-violet-600 hover:text-violet-500">
              Déjà client ? Connectez-vous
            </Link>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-500" />
              Sécurité & RGPD by design
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
