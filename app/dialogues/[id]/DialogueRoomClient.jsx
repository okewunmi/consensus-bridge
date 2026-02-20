'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import Link from "next/link"

const supabase = createClient()

export default function DialogueRoomClient({ params }) {
  const dialogueId = params.id
  const { user, profile, loading: userLoading } = useUser()
  const [messages, setMessages] = useState([])
  const [dialogue, setDialogue] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [realtimeError, setRealtimeError] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef(null)
  const pollingInterval = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) router.push('/auth')
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('dialogues')
        .select(`
          *,
          dialogue_participants (
            user_id,
            users ( id, name, political_lean, belief_profile, email )
          )
        `)
        .eq('id', dialogueId)
        .single()
      if (data) setDialogue(data)
    }
    load()
  }, [user, dialogueId])

  useEffect(() => {
    if (!dialogueId) return

    let channel = null
    let mounted = true

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('dialogue_id', dialogueId)
        .order('created_at', { ascending: true })
      if (mounted && data) setMessages(data)
    }

    const setupRealtime = async () => {
      await loadMessages()

      channel = supabase
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
            if (mounted) setMessages(prev => [...prev, payload.new])
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeError(false)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setRealtimeError(true)
            pollingInterval.current = setInterval(loadMessages, 3000)
          }
        })
    }

    setupRealtime()

    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
      if (pollingInterval.current) clearInterval(pollingInterval.current)
    }
  }, [dialogueId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiThinking])

  const sendMessage = async () => {
    if (!input.trim() || sending || aiThinking || !user || !profile) return

    const messageText = input
    setSending(true)
    setInput('')

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          dialogue_id: dialogueId,
          user_id: user.id,
          user_name: profile.name,
          user_lean: profile.political_lean,
          content: messageText,
          is_ai: false
        })

      if (error) throw error

      // Send email notifications
      if (dialogue) {
        const participants = dialogue.dialogue_participants?.map(p => p.users).filter(Boolean) || []
        const otherParticipants = participants.filter(p => p.id !== user.id)
        
        import('@/lib/email/email').then(({ sendNewMessageEmail }) => {
          for (const participant of otherParticipants) {
            if (participant.email) {
              sendNewMessageEmail(
                participant.email,
                profile.name,
                dialogue.topic,
                messageText.substring(0, 100),
                dialogueId
              ).catch(err => console.error('Email error:', err))
            }
          }
        }).catch(() => {
          console.log('Email notifications not configured')
        })
      }

      if (realtimeError) {
        setTimeout(async () => {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('dialogue_id', dialogueId)
            .order('created_at', { ascending: true })
          if (data) setMessages(data)
        }, 500)
      }

      setTimeout(() => triggerAi(), 800)
    } catch (err) {
      console.error('Send error:', err)
      alert('Failed to send: ' + err.message)
      setInput(messageText)
    }

    setSending(false)
  }

  const triggerAi = async () => {
    setAiThinking(true)
    try {
      const { facilitateDialogue } = await import('@/app/actions/ai')
      const result = await facilitateDialogue(dialogueId)

      if (!result.success) {
        console.error('AI failed:', result.error)
      }

      if (realtimeError) {
        setTimeout(async () => {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('dialogue_id', dialogueId)
            .order('created_at', { ascending: true })
          if (data) setMessages(data)
        }, 1000)
      }
    } catch (err) {
      console.error('AI exception:', err)
    }
    setAiThinking(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleGenerateSynthesis = async () => {
    const humanMessages = messages.filter(m => !m.is_ai)
    if (humanMessages.length < 4) {
      alert('Need at least 4 human messages')
      return
    }
    setGenerating(true)
    try {
      const { generateSynthesis } = await import('@/app/actions/ai')
      const result = await generateSynthesis(dialogueId)
      if (!result.success) {
        alert('Failed: ' + result.error)
      } else {
        alert('Synthesis generated!')
        router.push('/verification')
        router.refresh()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setGenerating(false)
  }

  const shareDialogue = async () => {
    const shareUrl = `${window.location.origin}/dialogues/${dialogueId}`
    const shareText = `Join me in discussing "${dialogue.topic}" on Consensus Bridge`

    try {
      if (navigator.share) {
        await navigator.share({
          title: dialogue.topic,
          text: shareText,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    }
  }

  if (userLoading || !dialogue) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }
  if (!user || !profile) return null

  const participants = dialogue.dialogue_participants?.map(p => p.users).filter(Boolean) || []
  const isParticipant = participants.some(p => p.id === user.id)
  const humanCount = messages.filter(m => !m.is_ai).length

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg flex-shrink-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => {
              router.push('/dialogues')
              router.refresh()
            }}
            className="text-xs sm:text-sm text-slate-400 hover:text-slate-300 mb-2 sm:mb-3 block"
          >
            ← Dialogues
          </button>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg sm:text-xl lg:text-2xl font-bold mb-1 break-words line-clamp-2">
                {dialogue.topic}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {participants.length} participants · {messages.length} messages
                {aiThinking && <span className="hidden sm:inline ml-2 text-amber-400">· AI thinking...</span>}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={shareDialogue}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded hover:border-amber-400/50 transition-colors flex items-center gap-1.5"
                title="Share dialogue"
              >
                <span className="text-sm">📤</span>
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded hover:border-slate-600"
              >
                {showSidebar ? 'Hide Info' : 'Show Info'}
              </button>

              <Tag color={dialogue.status === 'active' ? 'green' : 'blue'}>
                {dialogue.status}
              </Tag>

              {humanCount >= 4 && (
                <Button
                  onClick={handleGenerateSynthesis}
                  loading={generating}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5"
                >
                  <span className="hidden sm:inline">Synthesize</span>
                  <span className="sm:hidden">⬡</span> →
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-4">
            {messages.length === 0 && !aiThinking && (
              <div className="text-center py-8 sm:py-16 text-slate-500 text-sm sm:text-base">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}

            {messages.map(msg => {
              const isMe = msg.user_id === user.id
              const isAI = msg.is_ai
              return (
                <div key={msg.id} className={`flex gap-2 sm:gap-3 ${isMe && !isAI ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isAI ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
                      : isMe ? 'bg-blue-400/10 border border-blue-400/30 text-blue-400'
                        : 'bg-green-400/10 border border-green-400/30 text-green-400'
                  }`}>
                    {isAI ? '⚖' : (msg.user_name?.[0] || '?')}
                  </div>

                  <div className="flex-1 min-w-0 max-w-[85%] sm:max-w-2xl">
                    <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                      isAI ? 'bg-amber-400/5 border border-amber-400/20'
                        : isMe ? 'bg-blue-400/10 border border-blue-400/20'
                          : 'bg-slate-800 border border-slate-700'
                    }`}>
                      <div className={`text-[10px] sm:text-xs font-mono uppercase mb-1 ${
                        isAI ? 'text-amber-400' : isMe ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {isAI ? '⚖ Facilitator' : (
                          <Link 
                            href={`/profile/${msg.user_id}`}
                            className="hover:underline"
                          >
                            {msg.user_name}
                          </Link>
                        )}
                        {msg.user_lean && !isAI && (
                          <span className="text-slate-500 ml-1 hidden sm:inline">({msg.user_lean})</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {aiThinking && (
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center text-xs font-bold">
                  ⚖
                </div>
                <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
                  <div className="text-[10px] sm:text-xs font-mono uppercase text-amber-400 mb-1">
                    ⚖ Facilitator
                  </div>
                  <div className="flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400/60 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-800 bg-slate-900 p-2 sm:p-4 flex-shrink-0">
            {!isParticipant ? (
              <div className="text-center text-xs sm:text-sm text-slate-400">
                Viewing only.{' '}
                <button
                  onClick={() => {
                    router.push('/dialogues')
                    router.refresh()
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Go back to join
                </button>
              </div>
            ) : (
              <div className="flex gap-2 sm:gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={aiThinking ? 'AI is responding...' : 'Type your message...'}
                  disabled={aiThinking || sending}
                  rows={2}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 outline-none resize-none disabled:opacity-50"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending || aiThinking}
                  className="self-end px-3 sm:px-4 py-2 sm:py-3"
                >
                  {sending ? <Spinner size={14} /> : '↑'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className={`
          ${showSidebar ? 'fixed inset-0 bg-slate-950/80 z-40' : 'hidden'}
          lg:relative lg:block lg:bg-transparent lg:z-auto
        `}>
          <div className={`
            ${showSidebar ? 'absolute right-0 top-0 bottom-0 w-72 animate-slideInRight' : ''}
            lg:relative lg:w-72 lg:animate-none
            border-l border-slate-800 bg-slate-900 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto
          `}>
            {showSidebar && (
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden w-full px-3 py-2 bg-slate-800 text-slate-400 text-xs rounded mb-3 hover:bg-slate-700"
              >
                ✕ Close
              </button>
            )}

            <Card className="p-3 sm:p-4">
              <div className="text-xs text-amber-400 font-mono uppercase mb-3">
                Participants
              </div>
              {participants.map(p => (
                <Link
                  key={p.id}
                  href={`/profile/${p.id}`}
                  className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 hover:bg-slate-800/50 p-2 rounded transition-colors"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    p.id === user.id ? 'bg-blue-400/20 text-blue-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {p.name?.[0]}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 truncate">
                    {p.name}{p.id === user.id ? ' (you)' : ''}
                  </div>
                </Link>
              ))}
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="text-xs text-slate-400 font-mono uppercase mb-2">
                Progress
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-amber-400">
                {humanCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {humanCount >= 4 ? '✅ Ready for synthesis' : `${4 - humanCount} more to unlock`}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}