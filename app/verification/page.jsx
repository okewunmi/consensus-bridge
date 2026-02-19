'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Spinner } from '@/components/ui/Spinner'

export default function VerificationPage() {
  const { user, profile, loading: userLoading } = useUser()
  const [syntheses, setSyntheses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (user) {
      loadSyntheses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadSyntheses = async () => {
    console.log('🔍 Loading syntheses...')
    
    const { data, error } = await supabase
      .from('syntheses')
      .select(`
        *,
        dialogues (
          topic,
          dialogue_participants ( user_id )
        ),
        verifications ( user_id, decision )
      `)
      .order('created_at', { ascending: false })

    console.log('📊 Syntheses query result:', { data, error })
    
    if (error) {
      console.error('❌ Error loading syntheses:', error)
      alert(`Database error: ${error.message}\n\nCheck console for details.`)
    }
    
    if (data) {
      console.log(`✅ Loaded ${data.length} syntheses`)
      setSyntheses(data)
    }
    
    setLoading(false)
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile) return null

  const stats = {
    total: syntheses.length,
    awaitingReview: syntheses.filter(s => {
      const isParticipant = s.dialogues?.dialogue_participants?.some(p => p.user_id === user.id)
      const hasVerified = s.verifications?.some(v => v.user_id === user.id)
      return isParticipant && !hasVerified
    }).length,
    approved: syntheses.filter(s => s.approved).length
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation - Mobile optimized */}
      <nav className="border-b border-slate-800 p-3 sm:p-4">
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => {
              router.push('/dashboard')
              router.refresh()
            }}
            className="text-xs sm:text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Dashboard
          </button>
          
          {/* Debug Toggle - Hidden on very small screens */}
          {/* <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs px-2 sm:px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30 transition-colors"
          >
            {showDebug ? '🐛' : '🐛 Debug'}
          </button> */}
        </div>
      </nav>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Debug Panel - Mobile responsive */}
        {showDebug && (
          <Card className="mb-4 sm:mb-6 bg-red-500/5 border-red-500/30 p-3 sm:p-4">
            <div className="text-xs text-red-400 font-mono uppercase tracking-wider mb-3">
              🐛 Debug Info
            </div>
            <div className="space-y-2 text-xs sm:text-sm font-mono break-all">
              <div className="text-slate-300">
                <strong>User:</strong> {user?.email || 'N/A'}
              </div>
              <div className="text-slate-300">
                <strong>Syntheses:</strong> {syntheses.length}
              </div>
              {syntheses.length > 0 && (
                <div className="mt-3 p-2 sm:p-3 bg-slate-900 rounded text-xs">
                  {syntheses.map((s, i) => (
                    <div key={i} className="text-slate-400 truncate">
                      {i + 1}. {s.dialogues?.topic || s.topic || 'Untitled'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Header - Mobile optimized */}
        <div className="mb-6 sm:mb-8 animate-fadeUp">
          <Tag color="blue">Module 4</Tag>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 sm:mt-4 mb-2">
            Community Verification
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Review and validate AI-generated consensus syntheses
          </p>
        </div>

        {/* Stats - Mobile first grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Syntheses', value: stats.total, color: 'text-blue-400' },
            { label: 'Awaiting Review', value: stats.awaitingReview, color: 'text-amber-400' },
            { label: 'Approved', value: stats.approved, color: 'text-green-400' }
          ].map((stat, i) => (
            <Card 
              key={stat.label} 
              className="text-center py-4 sm:py-6 animate-fadeUp" 
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2 px-2">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Syntheses List */}
        {syntheses.length === 0 ? (
          <Card className="text-center py-8 sm:py-12 px-4">
            <div className="text-4xl sm:text-6xl mb-4">📝</div>
            <p className="text-sm sm:text-base text-slate-400 mb-4">
              No syntheses to review yet.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
              Generate a synthesis by:
            </p>
            <ol className="text-xs sm:text-sm text-slate-400 text-left max-w-md mx-auto space-y-2 mb-4 sm:mb-6">
              <li>1. Join or create a dialogue</li>
              <li>2. Exchange at least 4 messages</li>
              <li>3. Click &quot;Generate Synthesis&quot;</li>
              <li>4. Return here to verify</li>
            </ol>
            <button
              onClick={() => {
                router.push('/dialogues')
                router.refresh()
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-amber-400 text-slate-950 rounded text-sm sm:text-base font-semibold hover:bg-amber-300 transition-colors"
            >
              Go to Dialogues →
            </button>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {syntheses.map((synthesis, i) => {
              const participants = synthesis.dialogues?.dialogue_participants || []
              const verifications = synthesis.verifications || []
              const totalParticipants = participants.length
              const totalVerified = verifications.length
              const approvalRate = totalVerified > 0
                ? Math.round((verifications.filter(v => v.decision === 'endorse').length / totalVerified) * 100)
                : 0
              
              const isParticipant = participants.some(p => p.user_id === user.id)
              const hasVerified = verifications.some(v => v.user_id === user.id)
              const needsReview = isParticipant && !hasVerified

              return (
                <div 
                  key={synthesis.id}
                  className="cursor-pointer animate-fadeUp"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={(e) => {
                    e.preventDefault()
                    console.log('🖱️ Clicked:', synthesis.id)
                    router.push(`/verification/${synthesis.id}`)
                    router.refresh()
                  }}
                >
                  <Card
                    className={`
                      hover:border-amber-400/30 transition-all p-4 sm:p-6
                      ${needsReview ? 'border-amber-400/20 bg-amber-400/5' : ''}
                    `}
                  >
                    {/* Header - Mobile stacked, desktop side-by-side */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {needsReview && <Tag color="amber">Needs Review</Tag>}
                          {synthesis.approved && <Tag color="green">✓ Approved</Tag>}
                        </div>
                        
                        {/* Title - Truncate on mobile */}
                        <h3 className="font-display text-lg sm:text-xl font-bold mb-1 break-words">
                          {synthesis.dialogues?.topic || synthesis.topic || 'Untitled'}
                        </h3>
                        
                        {/* Meta info - Smaller on mobile */}
                        <p className="text-xs sm:text-sm text-slate-400">
                          {totalVerified}/{totalParticipants} verified · {' '}
                          <span className="hidden sm:inline">
                            {new Date(synthesis.created_at).toLocaleDateString()}
                          </span>
                          <span className="sm:hidden">
                            {new Date(synthesis.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </p>
                      </div>
                      
                      {/* Approval % - Mobile inline, desktop side */}
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className={`
                          text-xl sm:text-2xl font-display font-bold inline-block sm:block
                          ${approvalRate >= 70 ? 'text-green-400' : 
                            approvalRate >= 40 ? 'text-amber-400' : 'text-red-400'}
                        `}>
                          {approvalRate}%
                        </div>
                        <span className="text-xs text-slate-500 ml-2 sm:ml-0 sm:block">
                          Approval
                        </span>
                      </div>
                    </div>

                    {/* Content - Show less on mobile */}
                    <p className="text-xs sm:text-sm text-slate-300 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {synthesis.synthesis?.policyRecommendation || 'No content available'}
                    </p>

                    {/* Progress Bar - Slightly thicker on mobile for touch */}
                    <div className="h-1.5 sm:h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${synthesis.approved ? 'bg-green-400' : 'bg-amber-400'}`}
                        style={{ width: `${totalParticipants > 0 ? (totalVerified / totalParticipants) * 100 : 0}%` }}
                      />
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
