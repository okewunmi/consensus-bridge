// "use client"

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'
// import { useUser } from '@/lib/hooks/useUser'
// import { Card } from '@/components/ui/Card'
// import { Tag } from '@/components/ui/Tag'
// import { Spinner } from '@/components/ui/Spinner'
// import { OnboardingChecklist } from '@/lib/onboarding/page'
// import { Leaderboard } from '@/components/gamification'

// const supabase = createClient()

// export default function Dashboard() {
//   const { user, profile, loading } = useUser()
//   const [stats, setStats] = useState({ dialogues: 0, syntheses: 0, verifications: 0 })
//   const router = useRouter()

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push('/auth')
//     }
//   }, [user, loading, router])

//   useEffect(() => {
//     if (!user) return

//     const loadStats = async () => {
//       const { data: dialogues } = await supabase
//         .from('dialogue_participants')
//         .select('dialogue_id')
//         .eq('user_id', user.id)

//       const { data: verifications } = await supabase
//         .from('verifications')
//         .select('id')
//         .eq('user_id', user.id)

//       const { data: syntheses } = await supabase
//         .from('syntheses')
//         .select('id')
//         .eq('approved', true)

//       setStats({
//         dialogues: dialogues?.length || 0,
//         syntheses: syntheses?.length || 0,
//         verifications: verifications?.length || 0
//       })
//     }

//     loadStats()
//   }, [user])

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     router.push('/')
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <Spinner size={32} />
//       </div>
//     )
//   }

//   if (!user || !profile) return null

//   return (
//     <div className="min-h-screen bg-slate-950">
//       {/* Navigation - Mobile optimized */}
//       <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
//         <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
//           <div className="flex justify-between items-center gap-2">
//             {/* Logo - Smaller on mobile */}
//             <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//               <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-base sm:text-lg flex-shrink-0">
//                 ⬡
//               </div>
//               <div className="min-w-0">
//                 <h1 className="font-display font-bold text-sm sm:text-base lg:text-lg truncate">
//                   Consensus Bridge
//                 </h1>
//                 <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-wider hidden sm:block">
//                   Democratic Dialogue Platform
//                 </p>
//               </div>
//             </div>
            
//             {/* User info - Hidden on very small screens, truncated on mobile */}
//             <div className="flex items-center gap-2 sm:gap-4 min-w-0">
//               <span className="text-xs sm:text-sm text-slate-400 truncate max-w-[100px] sm:max-w-none">
//                 <span className="hidden sm:inline">Welcome, </span>
//                 {profile.name}
//               </span>
//               <button
//                 onClick={handleLogout}
//                 className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
//               >
//                 <span className="hidden sm:inline">Logout</span>
//                 <span className="sm:hidden">⋮</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
//         {/* Header - Responsive */}
//         <div className="mb-6 sm:mb-8 animate-fadeUp">
//           <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 break-words">
//             Welcome back, {profile.name}
//           </h2>
//           <p className="text-sm sm:text-base text-slate-400">
//             Your contribution to democratic dialogue
//           </p>
//         </div>

//         {/* Stats - 2 columns on mobile, 3 on desktop */}
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 animate-fadeUp">
//           {[
//             { label: 'Dialogues', value: stats.dialogues, icon: '⚖', color: 'text-blue-400' },
//             { label: 'Syntheses', value: stats.syntheses, icon: '⬡', color: 'text-green-400' },
//             { label: 'Verifications', value: stats.verifications, icon: '✦', color: 'text-amber-400' },
//           ].map((stat) => (
//             <Card key={stat.label} className="text-center py-4 sm:py-6">
//               <div className={`text-2xl sm:text-3xl mb-1 sm:mb-2 ${stat.color}`}>
//                 {stat.icon}
//               </div>
//               <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
//                 {stat.value}
//               </div>
//               <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
//             </Card>
//           ))}
//         </div>

//         {/* Main Actions - Stack on mobile */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
//           {/* Belief Profile Card */}
//           <Card className="animate-fadeUp p-4 sm:p-6" style={{ animationDelay: '100ms' }}>
//             <h3 className="font-display text-lg sm:text-xl font-bold mb-3 sm:mb-4">
//               {profile.belief_profile ? 'Your Belief Profile' : 'Get Started'}
//             </h3>
//             {profile.belief_profile ? (
//               <div>
//                 <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
//                   {profile.belief_profile.worldview}
//                 </p>
//                 <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                   {profile.belief_profile.coreValues?.map((value) => (
//                     <Tag key={value} color="blue">
//                       <span className="text-[10px] sm:text-xs">{value}</span>
//                     </Tag>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <p className="text-xs sm:text-sm text-slate-400 mb-4">
//                   Complete your belief mapping to participate in dialogues
//                 </p>
//                 <Link
//                   href="/belief-mapping"
//                   className="inline-block w-full sm:w-auto text-center px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-400 text-slate-950 rounded font-semibold text-sm hover:bg-amber-300 transition-colors"
//                 >
//                   Start Belief Mapping →
//                 </Link>
//               </div>
//             )}
//           </Card>

//           {/* Quick Actions Card */}
//           <Card className="animate-fadeUp p-4 sm:p-6" style={{ animationDelay: '200ms' }}>
//             <h3 className="font-display text-lg sm:text-xl font-bold mb-3 sm:mb-4">
//               Quick Actions
//             </h3>
//             <div className="space-y-2 sm:space-y-3">
//               {[
//                 { 
//                   href: '/dialogues', 
//                   icon: '⚖', 
//                   label: 'Join Dialogue', 
//                   desc: 'Participate in cross-partisan conversation' 
//                 },
//                 { 
//                   href: '/verification', 
//                   icon: '✦', 
//                   label: 'Verify Consensus', 
//                   desc: 'Review and approve syntheses' 
//                 },
//               ].map((action) => (
//                 <Link
//                   key={action.href}
//                   href={action.href}
//                   className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded hover:border-amber-400/30 transition-all group"
//                 >
//                   <span className="text-xl sm:text-2xl flex-shrink-0">{action.icon}</span>
//                   <div className="min-w-0">
//                     <div className="font-semibold text-sm group-hover:text-amber-300 transition-colors">
//                       {action.label}
//                     </div>
//                     <div className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-2">
//                       {action.desc}
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </Card>
//         </div>

//         {/* Navigation Cards - 2x2 on mobile, 4 across on desktop */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
//           <OnboardingChecklist />
//           {[
//             { href: '/belief-mapping', icon: '◎', label: 'Belief Mapping' },
//             { href: '/dialogues', icon: '⚖', label: 'Dialogues' },
//             { href: '/verification', icon: '✦', label: 'Verification' },
//             { href: '/dashboard', icon: '⌂', label: 'Dashboard' },
//             { href: '/analytics', icon: '📊', label: 'Analytics' },
//             { href: `/profile/${user.id}`, icon: '👤', label: 'My Profile' },
//           ].map((nav, i) => (
//             <Link
//               key={nav.href}
//               href={nav.href}
//               className="p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded hover:border-amber-400/30 transition-all text-center group animate-fadeUp"
//               style={{ animationDelay: `${300 + i * 50}ms` }}
//             >
//               <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{nav.icon}</div>
//               <div className="text-xs sm:text-sm font-medium group-hover:text-amber-300 transition-colors">
//                 {nav.label}
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     <Leaderboard type="consensus" limit={10} />
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Spinner } from '@/components/ui/Spinner'
import { OnboardingChecklist } from '@/lib/onboarding/page'
import { Leaderboard } from '@/components/gamification'

const supabase = createClient()

export default function Dashboard() {
  const { user, profile, loading } = useUser()
  const [stats, setStats] = useState({ dialogues: 0, syntheses: 0, verifications: 0 })
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const loadStats = async () => {
      const { data: dialogues } = await supabase
        .from('dialogue_participants')
        .select('dialogue_id')
        .eq('user_id', user.id)

      const { data: verifications } = await supabase
        .from('verifications')
        .select('id')
        .eq('user_id', user.id)

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

    loadStats()
  }, [user])

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
      {/* Navigation - Mobile optimized */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            {/* Logo - Smaller on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-base sm:text-lg flex-shrink-0">
                ⬡
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-sm sm:text-base lg:text-lg truncate">
                  Consensus Bridge
                </h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-wider hidden sm:block">
                  Democratic Dialogue Platform
                </p>
              </div>
            </div>
            
            {/* User info - Hidden on very small screens, truncated on mobile */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <span className="text-xs sm:text-sm text-slate-400 truncate max-w-[100px] sm:max-w-none">
                <span className="hidden sm:inline">Welcome, </span>
                {profile.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">⋮</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header - Responsive */}
        <div className="mb-6 sm:mb-8 animate-fadeUp">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 break-words">
            Welcome back, {profile.name}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Your contribution to democratic dialogue
          </p>
        </div>

        {/* Onboarding Checklist - Shows until completed */}
        <OnboardingChecklist />

        {/* Stats - 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 animate-fadeUp">
          {[
            { label: 'Dialogues', value: stats.dialogues, icon: '⚖', color: 'text-blue-400' },
            { label: 'Syntheses', value: stats.syntheses, icon: '⬡', color: 'text-green-400' },
            { label: 'Verifications', value: stats.verifications, icon: '✦', color: 'text-amber-400' },
          ].map((stat) => (
            <Card key={stat.label} className="text-center py-4 sm:py-6">
              <div className={`text-2xl sm:text-3xl mb-1 sm:mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Actions - Stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Belief Profile Card */}
          <Card 
            className="animate-fadeUp p-4 sm:p-6" 
            style={{ animationDelay: '100ms' }}
            data-tour="belief-mapping"
          >
            <h3 className="font-display text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {profile.belief_profile ? 'Your Belief Profile' : 'Get Started'}
            </h3>
            {profile.belief_profile ? (
              <div>
                <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
                  {profile.belief_profile.worldview}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {profile.belief_profile.coreValues?.map((value) => (
                    <Tag key={value} color="blue">
                      <span className="text-[10px] sm:text-xs">{value}</span>
                    </Tag>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm text-slate-400 mb-4">
                  Complete your belief mapping to participate in dialogues
                </p>
                <Link
                  href="/belief-mapping"
                  className="inline-block w-full sm:w-auto text-center px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-400 text-slate-950 rounded font-semibold text-sm hover:bg-amber-300 transition-colors"
                >
                  Start Belief Mapping →
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card 
            className="animate-fadeUp p-4 sm:p-6" 
            style={{ animationDelay: '200ms' }}
            data-tour="browse-dialogues"
          >
            <h3 className="font-display text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {[
                { 
                  href: '/dialogues', 
                  icon: '⚖', 
                  label: 'Join Dialogue', 
                  desc: 'Participate in cross-partisan conversation' 
                },
                { 
                  href: '/verification', 
                  icon: '✦', 
                  label: 'Verify Consensus', 
                  desc: 'Review and approve syntheses' 
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded hover:border-amber-400/30 transition-all group"
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">{action.icon}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm group-hover:text-amber-300 transition-colors">
                      {action.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-2">
                      {action.desc}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaderboard - New! */}
        <div className="mb-6 sm:mb-8 animate-fadeUp" style={{ animationDelay: '300ms' }}>
          <Leaderboard type="consensus" limit={10} />
        </div>

        {/* Navigation Cards - 2x2 on mobile, 4 across on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { href: '/belief-mapping', icon: '◎', label: 'Belief Mapping' },
            { href: '/dialogues', icon: '⚖', label: 'Dialogues' },
            { href: '/verification', icon: '✦', label: 'Verification' },
            { href: '/dashboard', icon: '⌂', label: 'Dashboard' },
            { 
              href: '/analytics', 
              icon: '📊', 
              label: 'Analytics',
              'data-tour': 'analytics'
            },
            { href: `/profile/${user.id}`, icon: '👤', label: 'My Profile' },
          ].map((nav, i) => (
            <Link
              key={nav.href}
              href={nav.href}
              className="p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded hover:border-amber-400/30 transition-all text-center group animate-fadeUp"
              style={{ animationDelay: `${400 + i * 50}ms` }}
              {...(nav['data-tour'] ? { 'data-tour': nav['data-tour'] } : {})}
            >
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{nav.icon}</div>
              <div className="text-xs sm:text-sm font-medium group-hover:text-amber-300 transition-colors">
                {nav.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}