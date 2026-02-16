'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeMessages(dialogueId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
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
  }, [dialogueId])

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

  return { messages, loading }
}
