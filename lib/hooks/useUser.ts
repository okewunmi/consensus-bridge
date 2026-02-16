// 'use client'

// import { useEffect, useState } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import type { User } from '@supabase/supabase-js'

// interface UserProfile {
//   id: string
//   email: string
//   name: string
//   political_lean: string
//   belief_profile: any | null
//   dialogues_participated: number
// }

// export function useUser() {
//   const [user, setUser] = useState<User | null>(null)
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [loading, setLoading] = useState(true)
//   const supabase = createClient()

//   useEffect(() => {
//     // Get initial user
//     supabase.auth.getUser().then(async ({ data: { user } }) => {
//       setUser(user)
      
//       if (user) {
//         // Get user profile
//         const { data: profile } = await supabase
//           .from('users')
//           .select('*')
//           .eq('id', user.id)
//           .single()
        
//         setProfile(profile)
//       }
      
//       setLoading(false)
//     })

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         setUser(session?.user ?? null)
        
//         if (session?.user) {
//           const { data: profile } = await supabase
//             .from('users')
//             .select('*')
//             .eq('id', session.user.id)
//             .single()
          
//           setProfile(profile)
//         } else {
//           setProfile(null)
//         }
        
//         setLoading(false)
//       }
//     )

//     return () => subscription.unsubscribe()
//   }, [])

//   return { user, profile, loading }
// }

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  name: string
  political_lean: string
  belief_profile: any | null
  dialogues_participated: number
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) console.error('Profile fetch error:', error)
      setProfile(data ?? null)
    } catch (err) {
      console.error('Profile fetch failed:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Use ONLY onAuthStateChange — avoids the getUser() race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          const currentUser = session?.user ?? null
          setUser(currentUser)

          if (currentUser) {
            await fetchProfile(currentUser.id)
          } else {
            setProfile(null)
          }
        } catch (err) {
          console.error('Auth state change error:', err)
        } finally {
          setLoading(false) // Always runs, no matter what
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading }
}