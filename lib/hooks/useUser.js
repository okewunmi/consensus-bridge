
// 'use client'

// import { useEffect, useState } from 'react'
// import { createClient } from '@/lib/supabase/client'

// export function useUser() {
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     let isMounted = true
//     const supabase = createClient()

//     const fetchProfile = async (userId) => {
//       try {
//         const { data, error } = await supabase
//           .from('users')
//           .select('*')
//           .eq('id', userId)
//           .single()

//         if (error) console.error('Profile fetch error:', error)
//         if (isMounted) setProfile(data ?? null)
//       } catch (err) {
//         console.error('Profile fetch failed:', err)
//         if (isMounted) setProfile(null)
//       }
//     }

//     const initAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
        
//         if (!isMounted) return

//         const currentUser = session?.user ?? null
//         setUser(currentUser)
        
//         if (currentUser) {
//           await fetchProfile(currentUser.id)
//         } else {
//           setProfile(null)
//         }
//       } catch (err) {
//         console.error('Auth check failed:', err)
//         if (isMounted) {
//           setUser(null)
//           setProfile(null)
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false)
//         }
//       }
//     }

//     initAuth()

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         if (!isMounted) return

//         const currentUser = session?.user ?? null
//         setUser(currentUser)

//         if (currentUser) {
//           await fetchProfile(currentUser.id)
//         } else {
//           setProfile(null)
//         }
//       }
//     )

//     return () => {
//       isMounted = false
//       subscription.unsubscribe()
//     }
//   }, [])

//   return { user, profile, loading }
// }

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUser() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const fetchProfile = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) console.error('Profile fetch error:', error)
        if (isMounted) setProfile(data ?? null)
      } catch (err) {
        console.error('Profile fetch failed:', err)
        if (isMounted) setProfile(null)
      }
    }

    // ✅ Use onAuthStateChange only — remove initAuth to avoid double firing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        // ✅ Always set loading false after first auth event
        if (isMounted) setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, profile, loading }
}