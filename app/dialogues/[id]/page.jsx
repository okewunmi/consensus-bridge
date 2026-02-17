// 'use client'

// import { useEffect, useState, useRef } from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { useUser } from '@/lib/hooks/useUser'
// import { useRealtimeMessages } from '@/lib/hooks/useRealtime'
// import { Card } from '@/components/ui/Card'
// import { Tag } from '@/components/ui/Tag'
// import { Button } from '@/components/ui/Button'
// import { Spinner } from '@/components/ui/Spinner'

// const supabase = createClient()

// export default function DialogueRoomPage() {
//   const params = useParams()
//   const dialogueId = params.id
//   const { user, profile, loading: userLoading } = useUser()
//   const { messages, loading: messagesLoading } = useRealtimeMessages(dialogueId)
//   const [dialogue, setDialogue] = useState(null)
//   const [input, setInput] = useState('')
//   const [sending, setSending] = useState(false)
//   const [generating, setGenerating] = useState(false)
//   const messagesEndRef = useRef(null)
//   const router = useRouter()

//   useEffect(() => {
//     if (!userLoading && !user) {
//       router.push('/auth')
//     }
//   }, [user, userLoading, router])

//   useEffect(() => {
//     if (!user) return

//     const loadDialogue = async () => {
//       const { data } = await supabase
//         .from('dialogues')
//         .select(`
//           *,
//           dialogue_participants (
//             user_id,
//             users (
//               id,
//               name,
//               political_lean,
//               belief_profile
//             )
//           )
//         `)
//         .eq('id', dialogueId)
//         .single()

//       if (data) {
//         setDialogue(data)
//       }
//     }

//     loadDialogue()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user])

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const sendMessage = async () => {
//     if (!input.trim() || sending || !user || !profile) return

//     setSending(true)

//     const { error } = await supabase
//       .from('messages')
//       .insert({
//         dialogue_id: dialogueId,
//         user_id: user.id,
//         user_name: profile.name,
//         user_lean: profile.political_lean,
//         content: input,
//         is_ai: false
//       })

//     if (error) {
//       alert(error.message)
//     } else {
//       setInput('')
//     }

//     setSending(false)
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   const handleGenerateSynthesis = async () => {
//     if (messages.length < 8) {
//       alert('Need at least 8 messages to generate synthesis')
//       return
//     }

//     setGenerating(true)
//     const { generateSynthesis } = await import('@/app/actions/ai')
//     const result = await generateSynthesis(dialogueId)

//     if (!result.success) {
//       alert('Synthesis generation failed: ' + result.error)
//     } else {
//       alert('Synthesis generated! Check the Verification module.')
//       router.push('/verification')
//     }
//     setGenerating(false)
//   }

//   const handleFacilitate = async () => {
//     if (messages.length < 2) return

//     const { facilitateDialogue } = await import('@/app/actions/ai')
//     await facilitateDialogue(dialogueId)
//   }

//   if (userLoading || messagesLoading) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <Spinner size={32} />
//       </div>
//     )
//   }

//   if (!user || !profile || !dialogue) return null

//   const participants = dialogue.dialogue_participants?.map((p) => p.users) || []

//   return (
//     <div className="h-screen bg-slate-950 flex flex-col">
//       {/* Header */}
//       <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <button
//             onClick={() => router.push('/dialogues')}
//             className="text-sm text-slate-400 hover:text-slate-300 mb-3 block"
//           >
//             ← Back to Dialogues
//           </button>
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="font-display text-2xl font-bold mb-1">{dialogue.topic}</h1>
//               <p className="text-sm text-slate-400">
//                 {participants.length} participants · {messages.length} messages
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <Tag color="green">{dialogue.status}</Tag>
//               {messages.length >= 8 && dialogue.status === 'active' && (
//                 <Button
//                   onClick={handleGenerateSynthesis}
//                   loading={generating}
//                   className="ml-2"
//                 >
//                   Generate Synthesis →
//                 </Button>
//               )}
//               {messages.length >= 4 && messages.length % 3 === 0 && (
//                 <Button
//                   variant="ghost"
//                   onClick={handleFacilitate}
//                   className="ml-2"
//                 >
//                   Request AI Facilitation
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="flex-1 overflow-hidden flex">
//         {/* Messages Area */}
//         <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
//             {messages.map((msg) => {
//               const isCurrentUser = msg.user_id === user.id
//               const isAI = msg.is_ai

//               return (
//                 <div
//                   key={msg.id}
//                   className={`flex gap-3 animate-slideIn ${isCurrentUser ? 'flex-row-reverse' : ''}`}
//                 >
//                   {/* Avatar */}
//                   <div className={`
//                     w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
//                     ${isAI
//                       ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
//                       : isCurrentUser
//                         ? 'bg-blue-400/10 border border-blue-400/30 text-blue-400'
//                         : 'bg-green-400/10 border border-green-400/30 text-green-400'
//                     }
//                   `}>
//                     {isAI ? '⚖' : msg.user_name[0]}
//                   </div>

//                   {/* Message */}
//                   <div className="flex-1 max-w-2xl">
//                     <div className={`
//                       px-4 py-3 rounded-lg
//                       ${isAI
//                         ? 'bg-slate-900 border border-slate-800'
//                         : isCurrentUser
//                           ? 'bg-blue-400/10 border border-blue-400/20'
//                           : 'bg-green-400/10 border border-green-400/20'
//                       }
//                     `}>
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className={`
//                           text-xs font-mono uppercase tracking-wider
//                           ${isAI ? 'text-amber-400' : isCurrentUser ? 'text-blue-400' : 'text-green-400'}
//                         `}>
//                           {msg.user_name}
//                         </span>
//                         {msg.user_lean && !isAI && (
//                           <span className="text-xs text-slate-500">({msg.user_lean})</span>
//                         )}
//                       </div>
//                       <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
//                         {msg.content}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input Area */}
//           <div className="border-t border-slate-800 bg-slate-900 p-4">
//             <div className="flex gap-3">
//               <textarea
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder="Share your perspective... (Enter to send, Shift+Enter for new line)"
//                 rows={2}
//                 className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors resize-none"
//               />
//               <Button
//                 onClick={sendMessage}
//                 disabled={!input.trim() || sending}
//                 className="self-end"
//               >
//                 {sending ? <Spinner size={14} /> : '↑'}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="w-80 border-l border-slate-800 bg-slate-900/30 p-4 space-y-4 overflow-y-auto">
//           <Card>
//             <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
//               Participants
//             </div>
//             <div className="space-y-3">
//               {participants.map((p) => (
//                 <div key={p.id} className="flex items-start gap-3">
//                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
//                     {p.name[0]}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="font-semibold text-sm text-slate-300 truncate">{p.name}</div>
//                     <div className="text-xs text-slate-500">{p.political_lean}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>

//           <Card>
//             <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
//               Messages
//             </div>
//             <div className="text-3xl font-display font-bold text-amber-400">
//               {messages.length}
//             </div>
//             <div className="text-xs text-slate-500 mt-1">
//               {messages.length >= 8 ? 'Ready to synthesize ↑' : `${8 - messages.length} more to synthesize`}
//             </div>
//           </Card>

//           <Card>
//             <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
//               Guidelines
//             </div>
//             <div className="space-y-2 text-xs text-slate-400">
//               {[
//                 'Speak from experience',
//                 'Assume good faith',
//                 'Ask before challenging',
//                 'Seek shared values'
//               ].map((guideline) => (
//                 <div key={guideline} className="flex gap-2">
//                   <span className="text-amber-400">◆</span>
//                   {guideline}
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useRealtimeMessages } from '@/lib/hooks/useRealtime'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const supabase = createClient()

export default function DialogueRoomPage() {
  const params = useParams()
  const dialogueId = params.id
  const { user, profile, loading: userLoading } = useUser()
  const { messages, loading: messagesLoading } = useRealtimeMessages(dialogueId)
  const [dialogue, setDialogue] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [facilitating, setFacilitating] = useState(false) // NEW: track facilitation
  const [aiStatus, setAiStatus] = useState('') // NEW: show AI status messages
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user) return

    const loadDialogue = async () => {
      const { data, error } = await supabase
        .from('dialogues')
        .select(`
          *,
          dialogue_participants (
            user_id,
            users (
              id,
              name,
              political_lean,
              belief_profile
            )
          )
        `)
        .eq('id', dialogueId)
        .single()

      if (error) console.error('Load dialogue error:', error)
      if (data) setDialogue(data)
    }

    loadDialogue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending || !user || !profile) return

    setSending(true)
    const messageText = input
    setInput('') // Clear immediately for better UX

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

    if (error) {
      alert(error.message)
      setInput(messageText) // Restore message if failed
    }

    setSending(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleGenerateSynthesis = async () => {
    if (messages.length < 8) {
      alert('Need at least 8 messages to generate synthesis')
      return
    }

    setGenerating(true)
    setAiStatus('Generating synthesis...')

    try {
      const { generateSynthesis } = await import('@/app/actions/ai')
      const result = await generateSynthesis(dialogueId)

      if (!result.success) {
        alert('Synthesis generation failed: ' + result.error)
        setAiStatus('')
      } else {
        setAiStatus('Synthesis generated! Redirecting...')
        setTimeout(() => router.push('/verification'), 1500)
      }
    } catch (err) {
      alert('Error: ' + err.message)
      setAiStatus('')
    }

    setGenerating(false)
  }

  const handleFacilitate = async () => {
    if (messages.length < 2) {
      alert('Need at least 2 messages before requesting facilitation')
      return
    }

    setFacilitating(true)
    setAiStatus('AI Facilitator is thinking...')

    try {
      const { facilitateDialogue } = await import('@/app/actions/ai')
      const result = await facilitateDialogue(dialogueId)

      if (!result.success) {
        alert('Facilitation failed: ' + result.error)
      }
      // AI message will appear via realtime subscription
    } catch (err) {
      alert('Error: ' + err.message)
    }

    setFacilitating(false)
    setAiStatus('')
  }

  if (userLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile || !dialogue) return null

  const participants = dialogue.dialogue_participants?.map((p) => p.users) || []
  const isParticipant = participants.some(p => p?.id === user.id)

  // FIX: Show AI button after 2+ messages (not complex condition)
  const showFacilitateButton = messages.length >= 2 && !facilitating
  const showSynthesisButton = messages.length >= 8 && dialogue.status === 'active'

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dialogues')}
            className="text-sm text-slate-400 hover:text-slate-300 mb-3 block"
          >
            ← Back to Dialogues
          </button>
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">{dialogue.topic}</h1>
              <p className="text-sm text-slate-400">
                {participants.length} participants · {messages.length} messages
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Tag color="green">{dialogue.status}</Tag>

              {/* AI FACILITATE BUTTON - Fixed: shows after 2+ messages */}
              {showFacilitateButton && (
                <Button
                  variant="ghost"
                  onClick={handleFacilitate}
                  loading={facilitating}
                >
                  🤖 Request AI Facilitation
                </Button>
              )}

              {/* SYNTHESIS BUTTON - shows after 8+ messages */}
              {showSynthesisButton && (
                <Button
                  onClick={handleGenerateSynthesis}
                  loading={generating}
                >
                  Generate Synthesis →
                </Button>
              )}
            </div>
          </div>

          {/* AI Status Banner */}
          {aiStatus && (
            <div className="mt-2 px-3 py-2 bg-amber-400/10 border border-amber-400/30 rounded text-amber-300 text-sm flex items-center gap-2">
              <Spinner size={12} />
              {aiStatus}
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 overflow-hidden flex">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p className="mb-2">No messages yet.</p>
                <p className="text-sm">Start the conversation below!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isCurrentUser = msg.user_id === user.id
              const isAI = msg.is_ai

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser && !isAI ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${isAI
                      ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
                      : isCurrentUser
                        ? 'bg-blue-400/10 border border-blue-400/30 text-blue-400'
                        : 'bg-green-400/10 border border-green-400/30 text-green-400'
                    }
                  `}>
                    {isAI ? '🤖' : msg.user_name?.[0] || '?'}
                  </div>

                  {/* Message */}
                  <div className={`flex-1 max-w-2xl ${isCurrentUser && !isAI ? 'flex flex-col items-end' : ''}`}>
                    <div className={`
                      px-4 py-3 rounded-lg
                      ${isAI
                        ? 'bg-amber-400/5 border border-amber-400/20 w-full'
                        : isCurrentUser
                          ? 'bg-blue-400/10 border border-blue-400/20'
                          : 'bg-slate-800 border border-slate-700'
                      }
                    `}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`
                          text-xs font-mono uppercase tracking-wider
                          ${isAI ? 'text-amber-400' : isCurrentUser ? 'text-blue-400' : 'text-green-400'}
                        `}>
                          {isAI ? '🤖 AI Facilitator' : msg.user_name}
                        </span>
                        {msg.user_lean && !isAI && (
                          <span className="text-xs text-slate-500">({msg.user_lean})</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800 bg-slate-900 p-4">
            {!isParticipant ? (
              // Not a participant - show join prompt
              <div className="text-center py-2 text-slate-400 text-sm">
                You're viewing this dialogue. 
                <button
                  onClick={() => router.push('/dialogues')}
                  className="text-amber-400 ml-1 hover:underline"
                >
                  Go back to join
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Share your perspective... (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="self-end"
                >
                  {sending ? <Spinner size={14} /> : '↑ Send'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 border-l border-slate-800 bg-slate-900/30 p-4 space-y-4 overflow-y-auto hidden lg:block">
          <Card>
            <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
              Participants
            </div>
            <div className="space-y-3">
              {participants.map((p) => p && (
                <div key={p.id} className="flex items-start gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${p.id === user.id ? 'bg-blue-400/20 text-blue-400' : 'bg-slate-800 text-slate-300'}
                  `}>
                    {p.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-300 truncate">
                      {p.name} {p.id === user.id && '(you)'}
                    </div>
                    <div className="text-xs text-slate-500">{p.political_lean}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
              Progress
            </div>
            <div className="text-3xl font-display font-bold text-amber-400">
              {messages.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {messages.length >= 8
                ? '✅ Ready to synthesize!'
                : `${8 - messages.length} more messages to unlock synthesis`
              }
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min((messages.length / 8) * 100, 100)}%` }}
              />
            </div>
          </Card>

          <Card>
            <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
              AI Tools
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <p>🤖 <strong className="text-slate-300">AI Facilitation</strong> - Available after 2+ messages</p>
              <p>⬡ <strong className="text-slate-300">Synthesis</strong> - Available after 8+ messages</p>
            </div>
          </Card>

          <Card>
            <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
              Guidelines
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              {[
                'Speak from experience',
                'Assume good faith',
                'Ask before challenging',
                'Seek shared values'
              ].map((guideline) => (
                <div key={guideline} className="flex gap-2">
                  <span className="text-amber-400">◆</span>
                  {guideline}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}