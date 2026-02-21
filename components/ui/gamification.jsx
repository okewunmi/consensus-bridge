
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'

const supabase = createClient()

// ============================================================================
// 1. BADGE DISPLAY COMPONENT
// ============================================================================

export function BadgeDisplay({ badge, size = 'md', showName = true }) {
  const sizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  }

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${sizes[size]}
          rounded-full
          bg-gradient-to-br ${tierColors[badge.tier]}
          flex items-center justify-center
          shadow-lg
          border-2 border-slate-700
        `}
      >
        <span>{badge.icon}</span>
      </div>
      {showName && (
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-200">{badge.name}</div>
          {badge.description && (
            <div className="text-xs text-slate-500">{badge.description}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 2. USER BADGES SHOWCASE
// ============================================================================

export function UserBadges({ userId }) {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadges()
  }, [userId])

  const loadBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (data) {
      setBadges(data.map(d => ({ ...d.badges, earned_at: d.earned_at })))
    }
    setLoading(false)
  }

  if (loading) return <div className="text-slate-400">Loading badges...</div>
  if (badges.length === 0) return <div className="text-slate-500 text-sm">No badges earned yet</div>

  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-4">Badges Earned ({badges.length})</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {badges.map(badge => (
          <div
            key={badge.id}
            className="relative group"
            title={`Earned ${new Date(badge.earned_at).toLocaleDateString()}`}
          >
            <BadgeDisplay badge={badge} size="md" showName={false} />
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 border border-slate-700 rounded text-xs z-10">
              <div className="font-semibold">{badge.name}</div>
              <div className="text-slate-400 text-[10px]">
                {new Date(badge.earned_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 3. BADGE PROGRESS TRACKER
// ============================================================================

export function BadgeProgress({ userId }) {
  const [progress, setProgress] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [userId])

  const loadProgress = async () => {
    // Get all badges
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('requirement_value', { ascending: true })

    // Get user's earned badges
    const { data: earned } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)

    const earnedIds = new Set(earned?.map(e => e.badge_id) || [])

    // Get user stats
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    setStats(userStats || {})

    // Calculate progress for unearneded badges
    const unearnedBadges = allBadges
      ?.filter(b => !earnedIds.has(b.id))
      .map(badge => {
        const current = getCurrentValue(badge.requirement_type, userStats)
        const percentage = Math.min((current / badge.requirement_value) * 100, 100)
        return { ...badge, current, percentage }
      })
      .filter(b => b.percentage > 0) // Only show badges with some progress
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5) // Top 5 closest to earning

    setProgress(unearnedBadges || [])
    setLoading(false)
  }

  const getCurrentValue = (type, stats) => {
    if (!stats) return 0
    const mapping = {
      'dialogues_joined': stats.dialogues_joined || 0,
      'messages_sent': stats.messages_sent || 0,
      'syntheses_endorsed': stats.syntheses_endorsed || 0,
      'verifications_total': stats.verifications_total || 0,
      'diverse_engagement': stats.diverse_engagement || 0,
      'streak_days': stats.current_streak || 0,
    }
    return mapping[type] || 0
  }

  if (loading) return <div className="text-slate-400">Loading...</div>
  if (progress.length === 0) return null

  return (
    <div>
      <h3 className="font-display text-lg font-bold mb-4">Next Badges 🎯</h3>
      <div className="space-y-3">
        {progress.map(badge => (
          <div key={badge.id} className="p-4 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{badge.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-200">{badge.name}</div>
                <div className="text-xs text-slate-500">
                  {badge.current} / {badge.requirement_value} {badge.requirement_type.replace(/_/g, ' ')}
                </div>
              </div>
              <div className="text-amber-400 font-bold">{Math.round(badge.percentage)}%</div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${badge.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 4. LEADERBOARD
// ============================================================================

export function Leaderboard({ type = 'points', limit = 10 }) {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [type])

  const loadLeaderboard = async () => {
    let orderBy = 'total_points'
    
    if (type === 'dialogues') orderBy = 'dialogues_joined'
    if (type === 'messages') orderBy = 'messages_sent'
    if (type === 'consensus') orderBy = 'syntheses_endorsed'

    const { data } = await supabase
      .from('user_stats')
      .select(`
        *,
        users (
          id,
          name,
          political_lean
        )
      `)
      .order(orderBy, { ascending: false })
      .limit(limit)

    if (data) setLeaders(data)
    setLoading(false)
  }

  if (loading) return <div className="text-slate-400">Loading leaderboard...</div>

  const getValue = (stat) => {
    if (type === 'dialogues') return stat.dialogues_joined
    if (type === 'messages') return stat.messages_sent
    if (type === 'consensus') return stat.syntheses_endorsed
    return stat.total_points
  }

  const getLabel = () => {
    if (type === 'dialogues') return 'Dialogues'
    if (type === 'messages') return 'Messages'
    if (type === 'consensus') return 'Endorsed'
    return 'Points'
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <h3 className="font-display text-lg font-bold">Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {leaders.map((stat, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`
          return (
            <div
              key={stat.user_id}
              className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="text-lg font-bold w-8">{medal}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">
                  {stat.users.name}
                </div>
                <div className="text-xs text-slate-500">
                  {stat.users.political_lean}
                </div>
              </div>
              <div className="text-lg font-bold text-amber-400">
                {getValue(stat).toLocaleString()}
                <span className="text-xs text-slate-500 ml-1">{getLabel()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ============================================================================
// 5. STREAK TRACKER
// ============================================================================

export function StreakTracker({ userId }) {
  const [streak, setStreak] = useState(0)
  const [longest, setLongest] = useState(0)

  useEffect(() => {
    loadStreak()
  }, [userId])

  const loadStreak = async () => {
    const { data } = await supabase
      .from('user_stats')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single()

    if (data) {
      setStreak(data.current_streak || 0)
      setLongest(data.longest_streak || 0)
    }
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
      <div className="text-center">
        <div className="text-4xl mb-2">🔥</div>
        <div className="text-3xl font-bold text-orange-400 mb-1">
          {streak} Day{streak !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-slate-400 mb-3">Current Streak</div>
        {longest > 0 && (
          <div className="text-xs text-slate-500">
            Best: {longest} day{longest !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Card>
  )
}

// ============================================================================
// 6. BADGE NOTIFICATION (Toast)
// ============================================================================

export function BadgeNotification({ badge, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideInRight">
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-lg p-4 shadow-2xl max-w-sm">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{badge.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-lg">Badge Earned! 🎉</div>
            <div className="text-sm">{badge.name}</div>
          </div>
          <button onClick={onClose} className="text-slate-700 hover:text-slate-900">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 7. AUTOMATIC BADGE CHECKING & AWARDING
// ============================================================================

// Call this after user actions (dialogue join, message send, etc.)
export async function checkAndAwardBadges(userId) {
  const { data, error } = await supabase
    .rpc('check_and_award_badges', { p_user_id: userId })

  if (error) {
    console.error('Badge check failed:', error)
    return
  }

  // Check if new badges were awarded
  const { data: newBadges } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badges (*)
    `)
    .eq('user_id', userId)
    .gte('earned_at', new Date(Date.now() - 5000).toISOString()) // Last 5 seconds

  return newBadges?.map(b => b.badges) || []
}