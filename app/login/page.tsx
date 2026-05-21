'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (!data.session) {
        setInfo('Controleer je e-mail om je account te bevestigen.')
        setTab('login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F7F6F3] flex items-start justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs tracking-widest text-gray-400 mb-8">TAKENLIJST</p>
        <h1 className="text-2xl font-medium text-gray-900 mb-1">
          {tab === 'login' ? 'Welkom terug' : 'Account aanmaken'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {tab === 'login' ? 'Log in om je taken te bekijken.' : 'Maak een account aan en begin direct.'}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 border border-black/5">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setInfo('') }}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                tab === t
                  ? 'bg-white text-gray-900 font-medium shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'login' ? 'Inloggen' : 'Registreren'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {info && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3 mb-4">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@voorbeeld.nl"
              required
              className="w-full px-3.5 py-2.5 border border-black/10 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 border border-black/10 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all mt-1"
          >
            {loading ? 'Even geduld...' : tab === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </button>
        </form>
      </div>
    </main>
  )
}
