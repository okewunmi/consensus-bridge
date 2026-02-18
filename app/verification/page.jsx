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
  const [showDebug, setShowDebug] = useState(false) // DEBUG MODE
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
      data.forEach((s, i) => {
        console.log(`  ${i + 1}. ID: ${s.id}, Topic: ${s.dialogues?.topic || s.topic}`)
      })
      setSyntheses(data)
    } else {
      console.log('⚠️ No syntheses found')
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
      <nav className="border-b border-slate-800 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            ← Back to Dashboard
          </button>
          
          {/* DEBUG TOGGLE */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30"
          >
            {showDebug ? '🐛 Hide Debug' : '🐛 Show Debug'}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* DEBUG PANEL */}
        {showDebug && (
          <Card className="mb-6 bg-red-500/5 border-red-500/30">
            <div className="text-xs text-red-400 font-mono uppercase tracking-wider mb-3">
              🐛 Debug Information
            </div>
            <div className="space-y-2 text-sm font-mono">
              <div className="text-slate-300">
                <strong>User:</strong> {user?.email || 'Not logged in'}
              </div>
              <div className="text-slate-300">
                <strong>User ID:</strong> {user?.id || 'N/A'}
              </div>
              <div className="text-slate-300">
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div className="text-slate-300">
                <strong>Syntheses count:</strong> {syntheses.length}
              </div>
              {syntheses.length > 0 && (
                <div className="mt-4 p-3 bg-slate-900 rounded">
                  <strong className="text-amber-400">Syntheses IDs:</strong>
                  {syntheses.map((s, i) => (
                    <div key={i} className="text-slate-400 ml-4">
                      {i + 1}. ID: <span className="text-green-400">{s.id}</span>, Topic: {s.dialogues?.topic || s.topic || 'No topic'}
                    </div>
                  ))}
                </div>
              )}
              {syntheses.length === 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300">
                  ⚠️ No syntheses found in database. 
                  <br/>
                  Generate one by completing a dialogue with 4+ messages and clicking "Generate Synthesis"
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="mb-8 animate-fadeUp">
          <Tag color="blue">Module 4</Tag>
          <h2 className="font-display text-3xl font-bold mt-4 mb-2">
            Community Verification
          </h2>
          <p className="text-slate-400">
            Review and validate AI-generated consensus syntheses
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Syntheses', value: stats.total, color: 'text-blue-400' },
            { label: 'Awaiting Your Review', value: stats.awaitingReview, color: 'text-amber-400' },
            { label: 'Approved', value: stats.approved, color: 'text-green-400' }
          ].map((stat, i) => (
            <Card key={stat.label} className="text-center animate-fadeUp" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`text-3xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 mt-2">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Syntheses List */}
        {syntheses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-slate-400 mb-4">
              No syntheses to review yet.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Generate a synthesis by:
            </p>
            <ol className="text-sm text-slate-400 text-left max-w-md mx-auto space-y-2">
              <li>1. Join or create a dialogue</li>
              <li>2. Exchange at least 4 messages with other participants</li>
              <li>3. Click "Generate Synthesis" button</li>
              <li>4. Return here to review and verify</li>
            </ol>
            <button
              onClick={() => router.push('/dialogues')}
              className="mt-6 px-6 py-2 bg-amber-400 text-slate-950 rounded font-semibold hover:bg-amber-300 transition-colors"
            >
              Go to Dialogues →
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {syntheses.map((synthesis, i) => {
              const participants = synthesis.dialogues?.dialogue_participants || []
              const verifications = synthesis.verifications || []
              const totalParticipants = participants.length
              const totalVerified = verifications.length
              const approvalRate = totalVerified > 0
                ? Math.round((verifications.filter(v => v.decision === 'approve').length / totalVerified) * 100)
                : 0
              
              const isParticipant = participants.some(p => p.user_id === user.id)
              const hasVerified = verifications.some(v => v.user_id === user.id)
              const needsReview = isParticipant && !hasVerified

              return (
                <div 
                key={synthesis.id}
  className="cursor-pointer"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🖱️ DIV CLICKED!')
    console.log('ID:', synthesis.id)
    router.push(`/verification/${synthesis.id}`)
    router.refresh()
  }}
                >
                <Card
                  key={synthesis.id}
                  className={`
                    cursor-pointer hover:border-amber-400/30 transition-all animate-fadeUp
                    ${needsReview ? 'border-amber-400/20 bg-amber-400/5' : ''}
                  `}
                  style={{ animationDelay: `${i * 50}ms` }}
                  // onClick={() => {
                  //   console.log('🖱️ CLICK FIRED')
                  //   console.log('Synthesis ID:', synthesis.id)
                  //   console.log('Navigating to:', `/verification/${synthesis.id}`)
                    
                  //   router.push(`/verification/${synthesis.id}`)
                  //   router.refresh()
                    
                  //   console.log('✅ Navigation called')
                  // }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex gap-2 mb-2">
                        {needsReview && <Tag color="amber">Needs Your Review</Tag>}
                        {synthesis.approved && <Tag color="green">✓ Approved</Tag>}
                      </div>
                      <h3 className="font-display text-xl font-bold mb-1">
                        {synthesis.dialogues?.topic || synthesis.topic || 'Untitled'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {totalVerified}/{totalParticipants} verified · {new Date(synthesis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`
                        text-2xl font-display font-bold
                        ${approvalRate >= 70 ? 'text-green-400' : approvalRate >= 40 ? 'text-amber-400' : 'text-red-400'}
                      `}>
                        {approvalRate}%
                      </div>
                      <div className="text-xs text-slate-500">Approval</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {synthesis.synthesis?.policyRecommendation || 'No content'}
                  </p>

                  {/* Progress Bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
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
