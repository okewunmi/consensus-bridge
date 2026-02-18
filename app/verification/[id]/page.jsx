'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const supabase = createClient()

export default function SynthesisDetailPage() {
  const params = useParams()
  const synthesisId = params.id
  const { user, profile, loading: userLoading } = useUser()
  const [synthesis, setSynthesis] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) router.push('/auth')
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user) return
    loadSynthesis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadSynthesis = async () => {
    const { data, error } = await supabase
      .from('syntheses')
      .select(`
        *,
        dialogues (
          topic,
          dialogue_participants ( user_id, users ( name, political_lean ) )
        ),
        verifications ( user_id, decision, created_at )
      `)
      .eq('id', synthesisId)
      .single()

    if (error) console.error('Load synthesis error:', error)
    if (data) setSynthesis(data)
    setLoading(false)
  }

  const vote = async (decision) => {
    const { error } = await supabase
      .from('verifications')
      .insert({
        synthesis_id: synthesisId,
        user_id: user.id,
        decision
      })

    if (error) {
      console.error('Vote error:', error)
      alert(error.message)
      return
    }

    loadSynthesis()
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile || !synthesis) return null

  const participants = synthesis.dialogues?.dialogue_participants || []
  const verifications = synthesis.verifications || []
  const isParticipant = participants.some(p => p.user_id === user.id)
  const userVote = verifications.find(v => v.user_id === user.id)

  const votes = {
    endorse: verifications.filter(v => v.decision === 'endorse').length,
    refine: verifications.filter(v => v.decision === 'refine').length,
    reject: verifications.filter(v => v.decision === 'reject').length
  }
  const total = votes.endorse + votes.refine + votes.reject
  const endorsePct = total > 0 ? Math.round((votes.endorse / total) * 100) : 0

  // Parse synthesis content
  const synthesisText = synthesis.synthesis?.policyRecommendation || synthesis.synthesis || 'No synthesis content available.'

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 p-4">
        <button
          onClick={() => {
            router.push('/verification')
            router.refresh()
          }}
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          ← Back to Verification
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 animate-fadeUp">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {isParticipant && !userVote && <Tag color="amber">Needs Your Review</Tag>}
            {synthesis.approved && <Tag color="green">✓ Approved</Tag>}
            {userVote && (
              <Tag color={
                userVote.decision === 'endorse' ? 'green' :
                userVote.decision === 'refine' ? 'amber' : 'red'
              }>
                You {userVote.decision === 'endorse' ? 'Endorsed' :
                     userVote.decision === 'refine' ? 'Flagged' : 'Rejected'}
              </Tag>
            )}
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">
            {synthesis.dialogues?.topic || synthesis.topic || 'Untitled Synthesis'}
          </h1>
          <p className="text-slate-400">
            Generated {new Date(synthesis.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Vote Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className={`text-3xl font-display font-bold mb-2 ${
              endorsePct >= 70 ? 'text-green-400' :
              endorsePct >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {endorsePct}%
            </div>
            <div className="text-xs text-slate-400">Endorsed</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-display font-bold text-green-400 mb-2">
              {votes.endorse}
            </div>
            <div className="text-xs text-slate-400">Endorsements</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-display font-bold text-amber-400 mb-2">
              {votes.refine}
            </div>
            <div className="text-xs text-slate-400">Need Refinement</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-display font-bold text-red-400 mb-2">
              {votes.reject}
            </div>
            <div className="text-xs text-slate-400">Rejections</div>
          </Card>
        </div>

        {/* Vote Progress Bar */}
        {total > 0 && (
          <div className="mb-8">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex gap-1 mb-3">
              <div
                className="bg-green-400 transition-all"
                style={{ width: `${(votes.endorse / total) * 100}%` }}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(votes.refine / total) * 100}%` }}
              />
              <div
                className="bg-red-400 transition-all"
                style={{ width: `${(votes.reject / total) * 100}%` }}
              />
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-green-400">✓ {votes.endorse} endorsed</span>
              <span className="text-amber-400">~ {votes.refine} needs refinement</span>
              <span className="text-red-400">✗ {votes.reject} rejected</span>
            </div>
          </div>
        )}

        {/* Voting Buttons */}
        {isParticipant && !userVote && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => vote('endorse')}
              className="px-6 py-3 rounded-lg bg-green-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20 transition-colors font-semibold"
            >
              ✓ Endorse This Synthesis
            </button>
            <button
              onClick={() => vote('refine')}
              className="px-6 py-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-colors font-semibold"
            >
              ~ Needs Refinement
            </button>
            <button
              onClick={() => vote('reject')}
              className="px-6 py-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20 transition-colors font-semibold"
            >
              ✗ Reject
            </button>
          </div>
        )}

        {/* Synthesis Content */}
        <Card className="mb-8">
          <div className="mb-4 pb-4 border-b border-slate-800">
            <div className="text-xs text-amber-400 font-mono uppercase tracking-wider">
              AI-Generated Policy Synthesis
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {new Date(synthesis.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {synthesisText}
            </div>
          </div>
        </Card>

        {/* Participants */}
        <Card>
          <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-4">
            Dialogue Participants
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map(p => p.users && (
              <div key={p.user_id} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {p.users.name?.[0] || '?'}
                </div>
                <span className="text-sm text-slate-300">{p.users.name}</span>
                {p.users.political_lean && (
                  <span className="text-xs text-slate-500">({p.users.political_lean})</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}