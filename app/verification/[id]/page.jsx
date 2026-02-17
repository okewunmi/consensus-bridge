// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { useUser } from '@/lib/hooks/useUser'
// import { Card } from '@/components/ui/Card'
// import { Tag } from '@/components/ui/Tag'
// import { Button } from '@/components/ui/Button'
// import { Spinner } from '@/components/ui/Spinner'

// export default function SynthesisVerificationPage() {
//   const params = useParams()
//   const synthesisId = params.id as string
//   const { user, profile, loading: userLoading } = useUser()
//   const [synthesis, setSynthesis] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const router = useRouter()
//   const supabase = createClient()

//   useEffect(() => {
//     if (!userLoading && !user) {
//       router.push('/auth')
//     }
//   }, [user, userLoading, router])

//   useEffect(() => {
//     if (user) {
//       loadSynthesis()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user])

//   const loadSynthesis = async () => {
//     const { data } = await supabase
//       .from('syntheses')
//       .select(`
//         *,
//         dialogues (
//           topic,
//           dialogue_participants (
//             user_id,
//             users (
//               id,
//               name,
//               political_lean
//             )
//           )
//         ),
//         verifications (
//           user_id,
//           decision,
//           created_at
//         )
//       `)
//       .eq('id', synthesisId)
//       .single()

//     if (data) {
//       setSynthesis(data)
//     }
//     setLoading(false)
//   }

//   const handleVerify = async (decision: 'approve' | 'reject') => {
//     setSubmitting(true)

//     const { error } = await supabase
//       .from('verifications')
//       .insert([{
//         synthesis_id: synthesisId,
//         user_id: user?.id,
//         decision
//       }])

//     if (error) {
//       alert(error.message)
//       setSubmitting(false)
//       return
//     }

//     // Reload to show updated status
//     await loadSynthesis()
//     setSubmitting(false)
//   }

//   if (userLoading || loading) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <Spinner size={32} />
//       </div>
//     )
//   }

//   if (!user || !profile || !synthesis) return null

//   const participants = synthesis.dialogues?.dialogue_participants?.map((p: any) => p.users) || []
//   const verifications = synthesis.verifications || []
//   const totalParticipants = participants.length
//   const totalVerified = verifications.length
//   const userVerification = verifications.find((v: any) => v.user_id === user.id)
//   const isParticipant = participants.some((p: any) => p.id === user.id)

//   return (
//     <div className="min-h-screen bg-slate-950">
//       <nav className="border-b border-slate-800 p-4">
//         <button
//           onClick={() => router.push('/verification')}
//           className="text-sm text-slate-400 hover:text-slate-300"
//         >
//           ← Back to Verification
//         </button>
//       </nav>

//       <div className="max-w-5xl mx-auto px-4 py-8">
//         <div className="mb-6 animate-fadeUp">
//           <Tag color="blue">Synthesis Review</Tag>
//           <h2 className="font-display text-3xl font-bold mt-4 mb-2">
//             {synthesis.dialogues?.topic || synthesis.topic}
//           </h2>
//           <p className="text-slate-400">
//             {totalVerified}/{totalParticipants} participants verified
//           </p>
//         </div>

//         {/* Policy Recommendation */}
//         <Card className="mb-6 border-amber-400/20 bg-amber-400/5 animate-fadeUp" style={{ animationDelay: '100ms' }}>
//           <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
//             Policy Recommendation
//           </div>
//           <p className="text-slate-100 leading-relaxed text-base">
//             {synthesis.synthesis?.policyRecommendation}
//           </p>
//         </Card>

//         {/* Key Agreements & Implementation */}
//         <div className="grid md:grid-cols-2 gap-6 mb-6">
//           <Card className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
//             <div className="text-xs text-green-400 font-mono uppercase tracking-wider mb-3">
//               Key Agreements
//             </div>
//             <div className="space-y-2">
//               {synthesis.synthesis?.keyAgreements?.map((agreement: string, i: number) => (
//                 <div key={i} className="flex gap-2 text-sm text-slate-300">
//                   <span className="text-green-400 mt-0.5">✓</span>
//                   {agreement}
//                 </div>
//               ))}
//             </div>
//           </Card>

//           <Card className="animate-fadeUp" style={{ animationDelay: '250ms' }}>
//             <div className="text-xs text-blue-400 font-mono uppercase tracking-wider mb-3">
//               Implementation Steps
//             </div>
//             <div className="space-y-2">
//               {synthesis.synthesis?.implementationSteps?.map((step: string, i: number) => (
//                 <div key={i} className="flex gap-2 text-sm text-slate-300">
//                   <span className="text-blue-400">{i + 1}.</span>
//                   {step}
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>

//         {/* Participant Contributions */}
//         <Card className="mb-6 animate-fadeUp" style={{ animationDelay: '300ms' }}>
//           <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-4">
//             How Each Voice Was Heard
//           </div>
//           <div className="space-y-4">
//             {synthesis.synthesis?.participantContributions?.map((contrib: any, i: number) => (
//               <div key={i} className="pb-4 border-b border-slate-800 last:border-0 last:pb-0">
//                 <div className="font-semibold text-slate-200 mb-1">{contrib.name}</div>
//                 <div className="text-sm text-slate-400 mb-1">
//                   <span className="text-slate-500">Contribution:</span> {contrib.contribution}
//                 </div>
//                 <div className="text-sm text-slate-400">
//                   <span className="text-slate-500">Addressed:</span> {contrib.concernsAddressed}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Verification Status */}
//         <Card className="mb-6 animate-fadeUp" style={{ animationDelay: '350ms' }}>
//           <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-3">
//             Verification Status
//           </div>
//           <div className="space-y-2">
//             {participants.map((p: any) => {
//               const verification = verifications.find((v: any) => v.user_id === p.id)
//               return (
//                 <div key={p.id} className="flex justify-between items-center p-3 bg-slate-800 rounded">
//                   <span className="text-sm text-slate-300">{p.name}</span>
//                   {verification ? (
//                     <Tag color={verification.decision === 'approve' ? 'green' : 'red'}>
//                       {verification.decision === 'approve' ? '✓ Approved' : '✗ Rejected'}
//                     </Tag>
//                   ) : (
//                     <span className="text-xs text-slate-500">Pending...</span>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         </Card>

//         {/* Actions */}
//         {isParticipant && !userVerification && (
//           <div className="flex gap-4 animate-fadeUp" style={{ animationDelay: '400ms' }}>
//             <Button
//               onClick={() => handleVerify('approve')}
//               loading={submitting}
//               className="flex-1 bg-green-400 hover:bg-green-300"
//             >
//               ✓ Approve Synthesis
//             </Button>
//             <Button
//               onClick={() => handleVerify('reject')}
//               loading={submitting}
//               variant="secondary"
//               className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10"
//             >
//               ✗ Request Revision
//             </Button>
//           </div>
//         )}

//         {userVerification && (
//           <Card className={`
//             text-center animate-fadeUp
//             ${userVerification.decision === 'approve' ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}
//           `}>
//             <p className={`font-semibold ${userVerification.decision === 'approve' ? 'text-green-400' : 'text-red-400'}`}>
//               You {userVerification.decision === 'approve' ? 'approved' : 'rejected'} this synthesis
//             </p>
//           </Card>
//         )}

//         {synthesis.approved && (
//           <Card className="text-center bg-green-400/10 border-green-400/30 mt-6 animate-fadeUp">
//             <div className="text-4xl mb-3">✓</div>
//             <h3 className="font-display text-xl font-bold text-green-400 mb-2">
//               Consensus Reached
//             </h3>
//             <p className="text-slate-300 text-sm">
//               All participants have approved this synthesis. Ready for implementation.
//             </p>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function SynthesisVerificationPage() {
  const params = useParams()
  const synthesisId = params.id
  const { user, profile, loading: userLoading } = useUser()
  const [synthesis, setSynthesis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (user) {
      loadSynthesis()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadSynthesis = async () => {
    const { data } = await supabase
      .from('syntheses')
      .select(`
        *,
        dialogues (
          topic,
          dialogue_participants (
            user_id,
            users (
              id,
              name,
              political_lean
            )
          )
        ),
        verifications (
          user_id,
          decision,
          created_at
        )
      `)
      .eq('id', synthesisId)
      .single()

    if (data) {
      setSynthesis(data)
    }
    setLoading(false)
  }

  const handleVerify = async (decision) => {
    setSubmitting(true)

    const { error } = await supabase
      .from('verifications')
      .insert([{
        synthesis_id: synthesisId,
        user_id: user?.id,
        decision
      }])

    if (error) {
      alert(error.message)
      setSubmitting(false)
      return
    }

    // Reload to show updated status
    await loadSynthesis()
    setSubmitting(false)
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile || !synthesis) return null

  const participants = synthesis.dialogues?.dialogue_participants?.map(p => p.users) || []
  const verifications = synthesis.verifications || []
  const totalParticipants = participants.length
  const totalVerified = verifications.length
  const userVerification = verifications.find(v => v.user_id === user.id)
  const isParticipant = participants.some(p => p.id === user.id)

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 p-4">
        <button
          onClick={() => router.push('/verification')}
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          ← Back to Verification
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 animate-fadeUp">
          <Tag color="blue">Synthesis Review</Tag>
          <h2 className="font-display text-3xl font-bold mt-4 mb-2">
            {synthesis.dialogues?.topic || synthesis.topic}
          </h2>
          <p className="text-slate-400">
            {totalVerified}/{totalParticipants} participants verified
          </p>
        </div>

        {/* Policy Recommendation */}
        <Card className="mb-6 border-amber-400/20 bg-amber-400/5 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
            Policy Recommendation
          </div>
          <p className="text-slate-100 leading-relaxed text-base">
            {synthesis.synthesis?.policyRecommendation}
          </p>
        </Card>

        {/* Key Agreements & Implementation */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
            <div className="text-xs text-green-400 font-mono uppercase tracking-wider mb-3">
              Key Agreements
            </div>
            <div className="space-y-2">
              {synthesis.synthesis?.keyAgreements?.map((agreement, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {agreement}
                </div>
              ))}
            </div>
          </Card>

          <Card className="animate-fadeUp" style={{ animationDelay: '250ms' }}>
            <div className="text-xs text-blue-400 font-mono uppercase tracking-wider mb-3">
              Implementation Steps
            </div>
            <div className="space-y-2">
              {synthesis.synthesis?.implementationSteps?.map((step, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-blue-400">{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Participant Contributions */}
        <Card className="mb-6 animate-fadeUp" style={{ animationDelay: '300ms' }}>
          <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-4">
            How Each Voice Was Heard
          </div>
          <div className="space-y-4">
            {synthesis.synthesis?.participantContributions?.map((contrib, i) => (
              <div key={i} className="pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                <div className="font-semibold text-slate-200 mb-1">{contrib.name}</div>
                <div className="text-sm text-slate-400 mb-1">
                  <span className="text-slate-500">Contribution:</span> {contrib.contribution}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-slate-500">Addressed:</span> {contrib.concernsAddressed}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Verification Status */}
        <Card className="mb-6 animate-fadeUp" style={{ animationDelay: '350ms' }}>
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-3">
            Verification Status
          </div>
          <div className="space-y-2">
            {participants.map(p => {
              const verification = verifications.find(v => v.user_id === p.id)
              return (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-800 rounded">
                  <span className="text-sm text-slate-300">{p.name}</span>
                  {verification ? (
                    <Tag color={verification.decision === 'approve' ? 'green' : 'red'}>
                      {verification.decision === 'approve' ? '✓ Approved' : '✗ Rejected'}
                    </Tag>
                  ) : (
                    <span className="text-xs text-slate-500">Pending...</span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Actions */}
        {isParticipant && !userVerification && (
          <div className="flex gap-4 animate-fadeUp" style={{ animationDelay: '400ms' }}>
            <Button
              onClick={() => handleVerify('approve')}
              loading={submitting}
              className="flex-1 bg-green-400 hover:bg-green-300"
            >
              ✓ Approve Synthesis
            </Button>
            <Button
              onClick={() => handleVerify('reject')}
              loading={submitting}
              variant="secondary"
              className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              ✗ Request Revision
            </Button>
          </div>
        )}

        {userVerification && (
          <Card className={`
            text-center animate-fadeUp
            ${userVerification.decision === 'approve' ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}
          `}>
            <p className={`font-semibold ${userVerification.decision === 'approve' ? 'text-green-400' : 'text-red-400'}`}>
              You {userVerification.decision === 'approve' ? 'approved' : 'rejected'} this synthesis
            </p>
          </Card>
        )}

        {synthesis.approved && (
          <Card className="text-center bg-green-400/10 border-green-400/30 mt-6 animate-fadeUp">
            <div className="text-4xl mb-3">✓</div>
            <h3 className="font-display text-xl font-bold text-green-400 mb-2">
              Consensus Reached
            </h3>
            <p className="text-slate-300 text-sm">
              All participants have approved this synthesis. Ready for implementation.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}