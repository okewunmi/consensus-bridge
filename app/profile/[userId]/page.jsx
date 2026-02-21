// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { useUser } from '@/lib/hooks/useUser'
// import { Card } from '@/components/ui/Card'
// import { Tag } from '@/components/ui/Tag'
// import { Spinner } from '@/components/ui/Spinner'
// import { ExportBeliefProfileButton } from '@/lib/pdf-export/page'

// import { UserBadges, BadgeProgress, StreakTracker } from '@/components/gamification'
// const supabase = createClient()

// export default function UserProfilePage() {
//   const params = useParams()
//   const userId = params.userId
//   const { user: currentUser, loading: userLoading } = useUser()
//   const [userData, setUserData] = useState(null)
//   const [stats, setStats] = useState({})
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     if (!userLoading && !currentUser) {
//       router.push('/auth')
//     }
//   }, [currentUser, userLoading, router])

//   useEffect(() => {
//     if (!userId) return
//     loadProfile()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId])

//   const loadProfile = async () => {
//     setLoading(true)
    
//     // Get user info
//     const { data: user } = await supabase
//       .from('users')
//       .select('*')
//       .eq('id', userId)
//       .single()
    
//     if (!user) {
//       setLoading(false)
//       return
//     }
    
//     // Get stats
//     const { data: dialogues } = await supabase
//       .from('dialogue_participants')
//       .select('dialogue_id')
//       .eq('user_id', userId)
    
//     const { data: messages } = await supabase
//       .from('messages')
//       .select('id')
//       .eq('user_id', userId)
//       .eq('is_ai', false)
    
//     const { data: verifications } = await supabase
//       .from('verifications')
//       .select('decision')
//       .eq('user_id', userId)
    
//     setUserData(user)
//     setStats({
//       dialogues: dialogues?.length || 0,
//       messages: messages?.length || 0,
//       verifications: verifications?.length || 0,
//       endorsed: verifications?.filter(v => v.decision === 'endorse').length || 0,
//       joinedDays: user.created_at 
//         ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
//         : 0
//     })
    
//     setLoading(false)
//   }

//   if (userLoading || loading) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <Spinner size={32} />
//       </div>
//     )
//   }

//   if (!currentUser || !userData) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-slate-400 mb-4">User not found</p>
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="text-amber-400 hover:underline"
//           >
//             ← Back to Dashboard
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const isOwnProfile = currentUser.id === userId

//   return (
//     <div className="min-h-screen bg-slate-950">
//       {/* Navigation */}
//       <nav className="border-b border-slate-800 p-3 sm:p-4">
//         <button
//           onClick={() => {
//             router.push('/dashboard')
//             router.refresh()
//           }}
//           className="text-xs sm:text-sm text-slate-400 hover:text-slate-300"
//         >
//           ← Dashboard
//         </button>
//       </nav>

//       <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
//         {/* Profile Header - Mobile optimized */}
//         <div className="mb-6 sm:mb-8 animate-fadeUp">
//           <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
//             {/* Avatar - Larger on desktop */}
//             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl sm:text-4xl flex-shrink-0 mx-auto sm:mx-0">
//               {userData.name?.[0]?.toUpperCase() || '?'}
//             </div>

//             {/* User Info */}
//             <div className="flex-1 text-center sm:text-left">
//               <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
//                 {userData.name}
//                 {isOwnProfile && (
//                   <span className="text-amber-400 text-base sm:text-lg ml-2">(You)</span>
//                 )}
//               </h1>
              
//               <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
//                 {userData.political_lean && (
//                   <Tag color="blue">{userData.political_lean}</Tag>
//                 )}
//                 <Tag color="slate">
//                   Joined {stats.joinedDays} day{stats.joinedDays !== 1 ? 's' : ''} ago
//                 </Tag>
//               </div>

//               {userData.email && isOwnProfile && (
//                 <p className="text-xs sm:text-sm text-slate-500 mb-2">{userData.email}</p>
//               )}
//             </div>

//             {/* Edit button (own profile only) */}
//             {isOwnProfile && (
//               <button
//                 onClick={() => router.push('/settings')}
//                 className="w-full sm:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 hover:border-slate-600 transition-colors"
//               >
//                 Edit Profile
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Stats Grid - Mobile 2x2, Desktop 4 across */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
//           {[
//             { value: stats.dialogues, label: 'Dialogues', color: 'text-blue-400' },
//             { value: stats.messages, label: 'Messages', color: 'text-green-400' },
//             { value: stats.verifications, label: 'Verified', color: 'text-amber-400' },
//             { value: stats.endorsed, label: 'Endorsed', color: 'text-purple-400' }
//           ].map((stat, i) => (
//             <Card 
//               key={stat.label} 
//               className="text-center py-4 sm:py-6 animate-fadeUp"
//               style={{ animationDelay: `${i * 50}ms` }}
//             >
//               <div className={`text-2xl sm:text-3xl lg:text-4xl font-display font-bold ${stat.color} mb-1 sm:mb-2`}>
//                 {stat.value}
//               </div>
//               <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
//             </Card>
//           ))}
//         </div>

//         {/* Belief Profile - If exists */}
//         {userData.belief_profile && (
//           <div className="space-y-4 sm:space-y-6">
//             <Card className="p-4 sm:p-6 animate-fadeUp" style={{ animationDelay: '200ms' }}>
//               <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3 sm:mb-4">
//                 Worldview
//               </div>
//               <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
//                 {userData.belief_profile.worldview}
//               </p>
//             </Card>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//               {/* Core Values */}
//               {userData.belief_profile.coreValues && (
//                 <Card className="p-4 sm:p-6 animate-fadeUp" style={{ animationDelay: '300ms' }}>
//                   <div className="text-xs text-green-400 font-mono uppercase tracking-wider mb-3 sm:mb-4">
//                     Core Values
//                   </div>
//                   <div className="space-y-2">
//                     {userData.belief_profile.coreValues.map((value, i) => (
//                       <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
//                         <span className="text-green-400 mt-0.5 flex-shrink-0">◆</span>
//                         <span className="break-words">{value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Common Ground Potential */}
//               {userData.belief_profile.commonGround && (
//                 <Card className="p-4 sm:p-6 animate-fadeUp" style={{ animationDelay: '350ms' }}>
//                   <div className="text-xs text-blue-400 font-mono uppercase tracking-wider mb-3 sm:mb-4">
//                     Common Ground
//                   </div>
//                   <div className="space-y-2">
//                     {userData.belief_profile.commonGround.map((item, i) => (
//                       <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
//                         <span className="text-blue-400 mt-0.5 flex-shrink-0">◆</span>
//                         <span className="break-words">{item}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           </div>
//         )}

//         {/* No Belief Profile Message */}
//         {!userData.belief_profile && (
//           <Card className="text-center py-8 sm:py-12 animate-fadeUp" style={{ animationDelay: '200ms' }}>
//             <p className="text-sm sm:text-base text-slate-400">
//               {isOwnProfile 
//                 ? "You haven't completed your belief mapping yet."
//                 : `${userData.name} hasn't completed their belief mapping yet.`
//               }
//             </p>
//             {isOwnProfile && (
//               <button
//                 onClick={() => router.push('/belief-mapping')}
//                 className="mt-4 px-6 py-2 bg-amber-400 text-slate-950 rounded font-semibold hover:bg-amber-300 transition-colors"
//               >
//                 Complete Belief Mapping →
//               </button>
//             )}
//           </Card>
//         )}
//       </div>
    
// <UserBadges userId={user.id} />
// <BadgeProgress userId={user.id} />
// <StreakTracker userId={user.id} />
// <ExportBeliefProfileButton 
//   user={user}
//   beliefProfile={user.belief_profile}
// />
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
import { Spinner } from '@/components/ui/Spinner'
import { ExportBeliefProfileButton } from '@/lib/pdf-export/page'
import { UserBadges, BadgeProgress, StreakTracker } from '@/components/gamification'

const supabase = createClient()

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId
  const { user: currentUser, loading: userLoading } = useUser()
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/auth')
    }
  }, [currentUser, userLoading, router])

  useEffect(() => {
    if (!userId) return
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadProfile = async () => {
    setLoading(true)
    
    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!user) {
      setLoading(false)
      return
    }
    
    // Get stats
    const { data: dialogues } = await supabase
      .from('dialogue_participants')
      .select('dialogue_id')
      .eq('user_id', userId)
    
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('user_id', userId)
      .eq('is_ai', false)
    
    const { data: verifications } = await supabase
      .from('verifications')
      .select('decision')
      .eq('user_id', userId)
    
    setUserData(user)
    setStats({
      dialogues: dialogues?.length || 0,
      messages: messages?.length || 0,
      verifications: verifications?.length || 0,
      endorsed: verifications?.filter(v => v.decision === 'endorse').length || 0,
      joinedDays: user.created_at 
        ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
        : 0
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

  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">User not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-amber-400 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser.id === userId

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

      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Profile Header - Mobile optimized */}
        <div className="mb-6 sm:mb-8 animate-fadeUp">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar - Larger on desktop */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl sm:text-4xl flex-shrink-0 mx-auto sm:mx-0">
              {userData.name?.[0]?.toUpperCase() || '?'}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
                {userData.name}
                {isOwnProfile && (
                  <span className="text-amber-400 text-base sm:text-lg ml-2">(You)</span>
                )}
              </h1>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                {userData.political_lean && (
                  <Tag color="blue">{userData.political_lean}</Tag>
                )}
                <Tag color="slate">
                  Joined {stats.joinedDays} day{stats.joinedDays !== 1 ? 's' : ''} ago
                </Tag>
              </div>

              {userData.email && isOwnProfile && (
                <p className="text-xs sm:text-sm text-slate-500 mb-2">{userData.email}</p>
              )}
            </div>

            {/* Edit button (own profile only) */}
            {isOwnProfile && (
              <button
                onClick={() => router.push('/settings')}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 hover:border-slate-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid - Mobile 2x2, Desktop 4 across */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { value: stats.dialogues, label: 'Dialogues', color: 'text-blue-400' },
            { value: stats.messages, label: 'Messages', color: 'text-green-400' },
            { value: stats.verifications, label: 'Verified', color: 'text-amber-400' },
            { value: stats.endorsed, label: 'Endorsed', color: 'text-purple-400' }
          ].map((stat, i) => (
            <Card 
              key={stat.label} 
              className="text-center py-4 sm:py-6 animate-fadeUp"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-display font-bold ${stat.color} mb-1 sm:mb-2`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Gamification Section - NEW! */}
        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
          {/* Badges Earned */}
          <div className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
            <UserBadges userId={userId} />
          </div>

          {/* Badge Progress & Streak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="animate-fadeUp" style={{ animationDelay: '250ms' }}>
              <BadgeProgress userId={userId} />
            </div>
            <div className="animate-fadeUp" style={{ animationDelay: '300ms' }}>
              <StreakTracker userId={userId} />
            </div>
          </div>
        </div>

        {/* Export Button */}
        {userData.belief_profile && (
          <div className="mb-6 sm:mb-8 animate-fadeUp" style={{ animationDelay: '350ms' }}>
            <ExportBeliefProfileButton 
              user={userData}
              beliefProfile={userData.belief_profile}
            />
          </div>
        )}

        {/* Belief Profile - If exists */}
        {userData.belief_profile && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 animate-fadeUp" style={{ animationDelay: '400ms' }}>
              <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3 sm:mb-4">
                Worldview
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {userData.belief_profile.worldview}
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Core Values */}
              {userData.belief_profile.coreValues && (
                <Card className="p-4 sm:p-6 animate-fadeUp" style={{ animationDelay: '450ms' }}>
                  <div className="text-xs text-green-400 font-mono uppercase tracking-wider mb-3 sm:mb-4">
                    Core Values
                  </div>
                  <div className="space-y-2">
                    {userData.belief_profile.coreValues.map((value, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">◆</span>
                        <span className="break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Common Ground Potential */}
              {userData.belief_profile.commonGround && (
                <Card className="p-4 sm:p-6 animate-fadeUp" style={{ animationDelay: '500ms' }}>
                  <div className="text-xs text-blue-400 font-mono uppercase tracking-wider mb-3 sm:mb-4">
                    Common Ground
                  </div>
                  <div className="space-y-2">
                    {userData.belief_profile.commonGround.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">◆</span>
                        <span className="break-words">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* No Belief Profile Message */}
        {!userData.belief_profile && (
          <Card className="text-center py-8 sm:py-12 animate-fadeUp" style={{ animationDelay: '400ms' }}>
            <p className="text-sm sm:text-base text-slate-400">
              {isOwnProfile 
                ? "You haven't completed your belief mapping yet."
                : `${userData.name} hasn't completed their belief mapping yet.`
              }
            </p>
            {isOwnProfile && (
              <button
                onClick={() => router.push('/belief-mapping')}
                className="mt-4 px-6 py-2 bg-amber-400 text-slate-950 rounded font-semibold hover:bg-amber-300 transition-colors"
              >
                Complete Belief Mapping →
              </button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}