'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Spinner } from '@/components/ui/Spinner'

export default function Dashboard() {
  const { user, profile, loading } = useUser()
  const [stats, setStats] = useState({ dialogues: 0, syntheses: 0, verifications: 0 })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    const { data: dialogues } = await supabase
      .from('dialogue_participants')
      .select('dialogue_id')
      .eq('user_id', user?.id)

    const { data: verifications } = await supabase
      .from('verifications')
      .select('id')
      .eq('user_id', user?.id)

    const { data: syntheses } = await supabase
      .from('syntheses')
      .select('id')
      .eq('approved', true)

    setStats({
      dialogues: dialogues?.length || 0,
      syntheses: syntheses?.length || 0,
      verifications: verifications?.length || 0
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile) return null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-lg">
              ⬡
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Consensus Bridge</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Democratic Dialogue Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Welcome, {profile.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeUp">
          <h2 className="font-display text-3xl font-bold mb-2">
            Welcome back, {profile.name}
          </h2>
          <p className="text-slate-400">Your contribution to democratic dialogue</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fadeUp">
          {[
            { label: 'Dialogues', value: stats.dialogues, icon: '⚖', color: 'text-blue-400' },
            { label: 'Syntheses', value: stats.syntheses, icon: '⬡', color: 'text-green-400' },
            { label: 'Verifications', value: stats.verifications, icon: '✦', color: 'text-amber-400' },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <div className={`text-3xl mb-2 ${stat.color}`}>{stat.icon}</div>
              <div className="font-display text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Belief Profile */}
          <Card className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
            <h3 className="font-display text-xl font-bold mb-4">
              {profile.belief_profile ? 'Your Belief Profile' : 'Get Started'}
            </h3>
            {profile.belief_profile ? (
              <div>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  {profile.belief_profile.worldview}
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.belief_profile.coreValues?.map((value: string) => (
                    <Tag key={value} color="blue">{value}</Tag>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-400 mb-4">
                  Complete your belief mapping to participate in dialogues
                </p>
                <Link
                  href="/belief-mapping"
                  className="inline-block px-5 py-2.5 bg-amber-400 text-slate-950 rounded font-semibold text-sm hover:bg-amber-300 transition-colors"
                >
                  Start Belief Mapping →
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
            <h3 className="font-display text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { href: '/dialogues', icon: '⚖', label: 'Join Dialogue', desc: 'Participate in cross-partisan conversation' },
                { href: '/verification', icon: '✦', label: 'Verify Consensus', desc: 'Review and approve syntheses' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded hover:border-amber-400/30 transition-all group"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <div className="font-semibold text-sm group-hover:text-amber-300 transition-colors">
                      {action.label}
                    </div>
                    <div className="text-xs text-slate-500">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          {[
            { href: '/belief-mapping', icon: '◎', label: 'Belief Mapping' },
            { href: '/dialogues', icon: '⚖', label: 'Dialogues' },
            { href: '/verification', icon: '✦', label: 'Verification' },
            { href: '/dashboard', icon: '⌂', label: 'Dashboard' },
          ].map((nav, i) => (
            <Link
              key={nav.href}
              href={nav.href}
              className="p-4 bg-slate-900 border border-slate-800 rounded hover:border-amber-400/30 transition-all text-center group animate-fadeUp"
              style={{ animationDelay: `${300 + i * 50}ms` }}
            >
              <div className="text-2xl mb-2">{nav.icon}</div>
              <div className="text-sm font-medium group-hover:text-amber-300 transition-colors">
                {nav.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
