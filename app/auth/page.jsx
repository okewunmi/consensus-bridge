'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    politicalLean: 'moderate'
  })
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              political_lean: formData.politicalLean
            }
          }
        })

        if (error) throw error

        // Create user profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email: formData.email,
              name: formData.name,
              political_lean: formData.politicalLean
            }])

          if (profileError) throw profileError
        }

        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) throw error
        router.push('/dashboard')
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-2xl mx-auto mb-4">
            ⬡
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join Consensus Bridge'}
          </h1>
          <p className="text-slate-400 text-sm">
            AI-Facilitated Cross-Partisan Dialogue
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                flex-1 py-2 px-4 rounded text-sm font-medium transition-all
                ${mode === m
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                  : 'bg-transparent text-slate-400 border border-slate-700 hover:border-slate-600'
                }
              `}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Political Orientation
              </label>
              <select
                value={formData.politicalLean}
                onChange={(e) => setFormData({ ...formData, politicalLean: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
              >
                <option value="progressive">Progressive</option>
                <option value="liberal">Liberal</option>
                <option value="moderate">Moderate</option>
                <option value="conservative">Conservative</option>
                <option value="libertarian">Libertarian</option>
              </select>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'} →
          </Button>
        </form>

        <button
          onClick={() => router.push('/')}
          className="w-full text-center text-sm text-slate-500 hover:text-slate-400 mt-4 transition-colors"
        >
          ← Back to Home
        </button>
      </Card>
    </div>
  )
}