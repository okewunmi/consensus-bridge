'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Spinner } from '@/components/ui/Spinner'

const supabase = createClient()

export default function AnalyticsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user) return
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadStats = async () => {
    setLoading(true)

    // Personal stats
    const { data: myDialogues } = await supabase
      .from('dialogue_participants')
      .select('dialogue_id, dialogues(created_at, topic)')
      .eq('user_id', user.id)

    const { data: myMessages } = await supabase
      .from('messages')
      .select('created_at, content')
      .eq('user_id', user.id)
      .eq('is_ai', false)

    const { data: myVerifications } = await supabase
      .from('verifications')
      .select('decision, created_at')
      .eq('user_id', user.id)

    // Platform stats
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: totalDialogues } = await supabase
      .from('dialogues')
      .select('*', { count: 'exact', head: true })

    const { count: totalSyntheses } = await supabase
      .from('syntheses')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true)

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_ai', false)

    // Calculate additional metrics
    const joinedDays = user.created_at
      ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      : 0

    const avgMessagesPerDay = joinedDays > 0
      ? Math.round((myMessages?.length || 0) / joinedDays * 10) / 10
      : 0

    setStats({
      personal: {
        dialogues: myDialogues?.length || 0,
        messages: myMessages?.length || 0,
        verifications: myVerifications?.length || 0,
        endorsed: myVerifications?.filter(v => v.decision === 'endorse').length || 0,
        refined: myVerifications?.filter(v => v.decision === 'refine').length || 0,
        rejected: myVerifications?.filter(v => v.decision === 'reject').length || 0,
        joinedDays,
        avgMessagesPerDay,
        totalWords: myMessages?.reduce((sum, m) => sum + (m.content?.split(' ').length || 0), 0) || 0
      },
      platform: {
        users: totalUsers || 0,
        dialogues: totalDialogues || 0,
        syntheses: totalSyntheses || 0,
        messages: totalMessages || 0
      }
    })

    setLoading(false)
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile || !stats) return null

  const endorsementRate = stats.personal.verifications > 0
    ? Math.round((stats.personal.endorsed / stats.personal.verifications) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 p-3 sm:p-4">
        <button
          onClick={() => {
            router.push('/dashboard')
            router.refresh()
          }}
          className="text-xs sm:text-sm text-slate-400 hover:text-slate-300"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fadeUp">
          <Tag color="blue">Analytics</Tag>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 sm:mt-4 mb-2">
            Your Impact
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Track your contribution to democratic dialogue
          </p>
        </div>

        {/* Personal Stats - Mobile 2x2, Tablet/Desktop 4 across */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-300">
            Your Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: stats.personal.dialogues, label: 'Dialogues Joined', color: 'text-blue-400', icon: '⚖' },
              { value: stats.personal.messages, label: 'Messages Sent', color: 'text-green-400', icon: '💬' },
              { value: stats.personal.verifications, label: 'Syntheses Verified', color: 'text-amber-400', icon: '✦' },
              { value: stats.personal.endorsed, label: 'Endorsed', color: 'text-purple-400', icon: '✓' }
            ].map((stat, i) => (
              <Card
                key={stat.label}
                className="text-center py-4 sm:py-6 animate-fadeUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{stat.icon}</div>
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-display font-bold ${stat.color} mb-1 sm:mb-2`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 px-2">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Metrics - Mobile stacked, Desktop 3 across */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-300">
            Detailed Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-6">
              <div className="text-xs text-slate-500 mb-2">Endorsement Rate</div>
              <div className={`text-3xl sm:text-4xl font-display font-bold mb-1 ${
                endorsementRate >= 70 ? 'text-green-400' :
                endorsementRate >= 40 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {endorsementRate}%
              </div>
              <div className="text-xs text-slate-400">
                {stats.personal.endorsed} / {stats.personal.verifications} endorsed
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="text-xs text-slate-500 mb-2">Avg Messages / Day</div>
              <div className="text-3xl sm:text-4xl font-display font-bold text-blue-400 mb-1">
                {stats.personal.avgMessagesPerDay}
              </div>
              <div className="text-xs text-slate-400">
                Over {stats.personal.joinedDays} days
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="text-xs text-slate-500 mb-2">Total Words Written</div>
              <div className="text-3xl sm:text-4xl font-display font-bold text-green-400 mb-1">
                {stats.personal.totalWords.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                ~{Math.round(stats.personal.totalWords / 250)} pages
              </div>
            </Card>
          </div>
        </div>

        {/* Verification Breakdown */}
        {stats.personal.verifications > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-300">
              Verification Breakdown
            </h3>
            <Card className="p-4 sm:p-6">
              {/* Progress bar */}
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex gap-0.5 mb-4">
                <div
                  className="bg-green-400 transition-all"
                  style={{ width: `${(stats.personal.endorsed / stats.personal.verifications) * 100}%` }}
                />
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${(stats.personal.refined / stats.personal.verifications) * 100}%` }}
                />
                <div
                  className="bg-red-400 transition-all"
                  style={{ width: `${(stats.personal.rejected / stats.personal.verifications) * 100}%` }}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-300">Endorsed: {stats.personal.endorsed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-300">Need Refinement: {stats.personal.refined}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-300">Rejected: {stats.personal.rejected}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Platform Stats */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-300">
            Platform Growth
          </h3>
          <Card className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { value: stats.platform.users, label: 'Total Users', icon: '👥' },
                { value: stats.platform.dialogues, label: 'Dialogues Created', icon: '⚖' },
                { value: stats.platform.messages, label: 'Messages Sent', icon: '💬' },
                { value: stats.platform.syntheses, label: 'Consensus Reached', icon: '✓' }
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-slate-200 mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Encouragement Message */}
        {stats.personal.dialogues === 0 && (
          <Card className="mt-6 sm:mt-8 p-4 sm:p-6 bg-amber-400/5 border-amber-400/20">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🚀</div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">
                Start Your Journey!
              </h3>
              <p className="text-sm sm:text-base text-slate-400 mb-4">
                Join your first dialogue to start making an impact
              </p>
              <button
                onClick={() => router.push('/dialogues')}
                className="px-6 py-2 bg-amber-400 text-slate-950 rounded font-semibold hover:bg-amber-300 transition-colors"
              >
                Browse Dialogues →
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}