// 'use client'

// import { useEffect, useState } from 'react'
// import { createClient } from '@/lib/supabase/client'

// export function useRealtimeMessages(dialogueId: string) {
//   const [messages, setMessages] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const supabase = createClient()

//   useEffect(() => {
//     // Load initial messages
//     loadMessages()

//     // Subscribe to new messages
//     const channel = supabase
//       .channel(`dialogue:${dialogueId}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//           filter: `dialogue_id=eq.${dialogueId}`
//         },
//         (payload) => {
//           setMessages(prev => [...prev, payload.new])
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [dialogueId])

//   const loadMessages = async () => {
//     const { data } = await supabase
//       .from('messages')
//       .select('*')
//       .eq('dialogue_id', dialogueId)
//       .order('created_at', { ascending: true })

//     if (data) {
//       setMessages(data)
//     }
//     setLoading(false)
//   }

//   return { messages, loading }
// }

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Create client OUTSIDE hook (only once) - fixes supabase warning
const supabase = createClient()

export function useRealtimeMessages(dialogueId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Move loadMessages INSIDE useEffect - fixes warning
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('dialogue_id', dialogueId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
      setLoading(false)
    }

    // Load initial messages
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`dialogue:${dialogueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `dialogue_id=eq.${dialogueId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dialogueId])  // ✅ No warning - only dialogueId in deps

  return { messages, loading }
}