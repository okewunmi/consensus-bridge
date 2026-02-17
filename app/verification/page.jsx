// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { useUser } from '@/lib/hooks/useUser'
// import { Card } from '@/components/ui/Card'
// import { Tag } from '@/components/ui/Tag'
// import { Spinner } from '@/components/ui/Spinner'

// export default function VerificationPage() {
//   const { user, profile, loading: userLoading } = useUser()
//   const [syntheses, setSyntheses] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()
//   const supabase = createClient()

//   useEffect(() => {
//     if (!userLoading && !user) {
//       router.push('/auth')
//     }
//   }, [user, userLoading, router])

//   useEffect(() => {
//     if (user) {
//       loadSyntheses()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user])

//   const loadSyntheses = async () => {
//     const { data } = await supabase
//       .from('syntheses')
//       .select(`
//         *,
//         dialogues (
//           topic,
//           dialogue_participants (
//             user_id
//           )
//         ),
//         verifications (
//           user_id,
//           decision
//         )
//       `)
//       .order('created_at', { ascending: false })

//     if (data) {
//       setSyntheses(data)
//     }
//     setLoading(false)
//   }

//   if (userLoading || loading) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <Spinner size={32} />
//       </div>
//     )
//   }

//   if (!user || !profile) return null

//   const stats = {
//     total: syntheses.length,
//     awaitingReview: syntheses.filter(s => {
//       const isParticipant = s.dialogues?.dialogue_participants?.some((p: any) => p.user_id === user.id)
//       const hasVerified = s.verifications?.some((v: any) => v.user_id === user.id)
//       return isParticipant && !hasVerified
//     }).length,
//     approved: syntheses.filter(s => s.approved).length
//   }

//   return (
//     <div className="min-h-screen bg-slate-950">
//       <nav className="border-b border-slate-800 p-4">
//         <button
//           onClick={() => router.push('/dashboard')}
//           className="text-sm text-slate-400 hover:text-slate-300"
//         >
//           ← Back to Dashboard
//         </button>
//       </nav>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="mb-8 animate-fadeUp">
//           <Tag color="blue">Module 4</Tag>
//           <h2 className="font-display text-3xl font-bold mt-4 mb-2">
//             Community Verification
//           </h2>
//           <p className="text-slate-400">
//             Review and validate AI-generated consensus syntheses
//           </p>
//         </div>

//         {/* Stats */}
//         <div className="grid md:grid-cols-3 gap-4 mb-8">
//           {[
//             { label: 'Total Syntheses', value: stats.total, color: 'text-blue-400' },
//             { label: 'Awaiting Your Review', value: stats.awaitingReview, color: 'text-amber-400' },
//             { label: 'Approved', value: stats.approved, color: 'text-green-400' }
//           ].map((stat, i) => (
//             <Card key={stat.label} className="text-center animate-fadeUp" style={{ animationDelay: `${i * 50}ms` }}>
//               <div className={`text-3xl font-display font-bold ${stat.color}`}>
//                 {stat.value}
//               </div>
//               <div className="text-xs text-slate-400 mt-2">{stat.label}</div>
//             </Card>
//           ))}
//         </div>

//         {/* Syntheses List */}
//         {syntheses.length === 0 ? (
//           <Card className="text-center py-12">
//             <p className="text-slate-400">
//               No syntheses to review yet. Participate in dialogues to generate consensus.
//             </p>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {syntheses.map((synthesis, i) => {
//               const participants = synthesis.dialogues?.dialogue_participants || []
//               const verifications = synthesis.verifications || []
//               const totalParticipants = participants.length
//               const totalVerified = verifications.length
//               const approvalRate = totalVerified > 0
//                 ? Math.round((verifications.filter((v: any) => v.decision === 'approve').length / totalVerified) * 100)
//                 : 0
              
//               const isParticipant = participants.some((p: any) => p.user_id === user.id)
//               const hasVerified = verifications.some((v: any) => v.user_id === user.id)
//               const needsReview = isParticipant && !hasVerified

//               return (
//                 <Card
//                   key={synthesis.id}
//                   className={`
//                     cursor-pointer hover:border-amber-400/30 transition-all animate-fadeUp
//                     ${needsReview ? 'border-amber-400/20 bg-amber-400/5' : ''}
//                   `}
//                   style={{ animationDelay: `${i * 50}ms` }}
//                   onClick={() => router.push(`/verification/${synthesis.id}`)}
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <div className="flex gap-2 mb-2">
//                         {needsReview && <Tag color="amber">Needs Your Review</Tag>}
//                         {synthesis.approved && <Tag color="green">✓ Approved</Tag>}
//                       </div>
//                       <h3 className="font-display text-xl font-bold mb-1">
//                         {synthesis.dialogues?.topic || synthesis.topic}
//                       </h3>
//                       <p className="text-sm text-slate-400">
//                         {totalVerified}/{totalParticipants} verified · {new Date(synthesis.created_at).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <div className={`
//                         text-2xl font-display font-bold
//                         ${approvalRate >= 70 ? 'text-green-400' : approvalRate >= 40 ? 'text-amber-400' : 'text-red-400'}
//                       `}>
//                         {approvalRate}%
//                       </div>
//                       <div className="text-xs text-slate-500">Approval</div>
//                     </div>
//                   </div>

//                   <p className="text-sm text-slate-300 mb-4 line-clamp-2">
//                     {synthesis.synthesis?.policyRecommendation}
//                   </p>

//                   {/* Progress Bar */}
//                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
//                     <div
//                       className={`h-full transition-all ${synthesis.approved ? 'bg-green-400' : 'bg-amber-400'}`}
//                       style={{ width: `${(totalVerified / totalParticipants) * 100}%` }}
//                     />
//                   </div>
//                 </Card>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


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
    const { data } = await supabase
      .from('syntheses')
      .select(`
        *,
        dialogues (
          topic,
          dialogue_participants (
            user_id
          )
        ),
        verifications (
          user_id,
          decision
        )
      `)
      .order('created_at', { ascending: false })

    if (data) {
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
      <nav className="border-b border-slate-800 p-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <p className="text-slate-400">
              No syntheses to review yet. Participate in dialogues to generate consensus.
            </p>
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
                <Card
                  key={synthesis.id}
                  className={`
                    cursor-pointer hover:border-amber-400/30 transition-all animate-fadeUp
                    ${needsReview ? 'border-amber-400/20 bg-amber-400/5' : ''}
                  `}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => router.push(`/verification/${synthesis.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex gap-2 mb-2">
                        {needsReview && <Tag color="amber">Needs Your Review</Tag>}
                        {synthesis.approved && <Tag color="green">✓ Approved</Tag>}
                      </div>
                      <h3 className="font-display text-xl font-bold mb-1">
                        {synthesis.dialogues?.topic || synthesis.topic}
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
                    {synthesis.synthesis?.policyRecommendation}
                  </p>

                  {/* Progress Bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${synthesis.approved ? 'bg-green-400' : 'bg-amber-400'}`}
                      style={{ width: `${(totalVerified / totalParticipants) * 100}%` }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}