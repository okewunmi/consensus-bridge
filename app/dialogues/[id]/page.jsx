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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const supabase = createClient()

export default function DialoguesPage() {
  const { user, profile, loading: userLoading } = useUser()
  const [dialogues, setDialogues] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [joiningId, setJoiningId] = useState(null) // Track which dialogue is being joined
  const [newDialogue, setNewDialogue] = useState({
    topic: '',
    description: '',
    selectedUsers: []
  })
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user) return

    const loadDialogues = async () => {
      const { data, error } = await supabase
        .from('dialogues')
        .select(`
          *,
          dialogue_participants (
            user_id,
            users (
              id,
              name,
              political_lean
            )
          ),
          messages (
            id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) console.error('Load dialogues error:', error)
      if (data) setDialogues(data)
      setLoading(false)
    }

    const loadUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, political_lean, belief_profile')
        .neq('id', user.id)
        .not('belief_profile', 'is', null)

      if (data) setUsers(data)
    }

    loadDialogues()
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const createDialogue = async () => {
    if (!newDialogue.topic || newDialogue.selectedUsers.length === 0) {
      alert('Please add a topic and select at least one participant')
      return
    }

    const { data: dialogue, error: dialogueError } = await supabase
      .from('dialogues')
      .insert({
        topic: newDialogue.topic,
        description: newDialogue.description,
        created_by: user?.id,
        status: 'active'
      })
      .select()
      .single()

    if (dialogueError) {
      alert(dialogueError.message)
      return
    }

    // Add participants (including creator)
    const allParticipants = [user?.id, ...newDialogue.selectedUsers]
    const participants = allParticipants.map(userId => ({
      dialogue_id: dialogue.id,
      user_id: userId
    }))

    const { error: participantError } = await supabase
      .from('dialogue_participants')
      .insert(participants)

    if (participantError) {
      alert(participantError.message)
      return
    }

    router.push(`/dialogues/${dialogue.id}`)
  }

  // NEW: Join an existing dialogue
  const joinDialogue = async (e, dialogueId) => {
    e.stopPropagation() // Prevent card click from navigating
    
    if (!user || !profile) {
      alert('Please complete your belief profile first')
      return
    }

    if (!profile.belief_profile) {
      alert('Please complete your belief mapping before joining a dialogue')
      router.push('/belief-mapping')
      return
    }

    setJoiningId(dialogueId)

    const { error } = await supabase
      .from('dialogue_participants')
      .insert({
        dialogue_id: dialogueId,
        user_id: user.id
      })

    if (error) {
      if (error.code === '23505') {
        // Already a participant - just navigate
        router.push(`/dialogues/${dialogueId}`)
      } else {
        alert('Could not join dialogue: ' + error.message)
        setJoiningId(null)
      }
      return
    }

    router.push(`/dialogues/${dialogueId}`)
  }

  const toggleUser = (userId) => {
    setNewDialogue(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }))
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile) return null

  if (showCreate) {
    return (
      <div className="min-h-screen bg-slate-950">
        <nav className="border-b border-slate-800 p-4">
          <button
            onClick={() => setShowCreate(false)}
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            ← Back to Dialogues
          </button>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
          <h2 className="font-display text-3xl font-bold mb-2">Create New Dialogue</h2>
          <p className="text-slate-400 mb-8">
            Choose a topic and invite participants with diverse perspectives
          </p>

          <Card className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dialogue Topic
            </label>
            <input
              type="text"
              value={newDialogue.topic}
              onChange={(e) => setNewDialogue({ ...newDialogue, topic: e.target.value })}
              placeholder="e.g., Climate policy in our community"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors mb-4"
            />

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={newDialogue.description}
              onChange={(e) => setNewDialogue({ ...newDialogue, description: e.target.value })}
              placeholder="Brief description of what you'd like to discuss..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors mb-4"
            />

            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Participants ({newDialogue.selectedUsers.length} selected)
            </label>

            {users.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">
                No other users with belief profiles found. Invite others to join!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {users.map(u => {
                  const selected = newDialogue.selectedUsers.includes(u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleUser(u.id)}
                      className={`
                        p-3 rounded text-left transition-all text-sm
                        ${selected
                          ? 'bg-amber-400/10 border border-amber-400 text-amber-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600'
                        }
                      `}
                    >
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs opacity-70">{u.political_lean}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          <Button onClick={createDialogue}>
            Create Dialogue →
          </Button>
        </div>
      </div>
    )
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
        <div className="flex justify-between items-center mb-8 animate-fadeUp">
          <div>
            <h2 className="font-display text-3xl font-bold mb-2">Active Dialogues</h2>
            <p className="text-slate-400">Join ongoing conversations or start new ones</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            + New Dialogue
          </Button>
        </div>

        {dialogues.length === 0 ? (
          <Card className="text-center py-12 animate-fadeUp">
            <p className="text-slate-400 mb-6">
              No dialogues yet. Create the first one!
            </p>
            <Button onClick={() => setShowCreate(true)}>
              Create Dialogue →
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {dialogues.map((dialogue, i) => {
              const participants = dialogue.dialogue_participants?.map(p => p.users) || []
              const messageCount = dialogue.messages?.length || 0
              const isParticipant = participants.some(p => p?.id === user.id)

              return (
                <Card
                  key={dialogue.id}
                  className={`
                    cursor-pointer hover:border-amber-400/30 transition-all animate-fadeUp
                    ${isParticipant ? 'border-amber-400/20' : ''}
                  `}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => router.push(`/dialogues/${dialogue.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display text-xl font-bold">
                          {dialogue.topic}
                        </h3>
                        {isParticipant && (
                          <Tag color="green">You&apos;re In</Tag>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        {participants.length} participants · {messageCount} messages
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Tag color={dialogue.status === 'active' ? 'green' : 'blue'}>
                        {dialogue.status}
                      </Tag>
                      {/* JOIN BUTTON - only show if not a participant */}
                      {!isParticipant && dialogue.status === 'active' && (
                        <button
                          onClick={(e) => joinDialogue(e, dialogue.id)}
                          disabled={joiningId === dialogue.id}
                          className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-semibold rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
                        >
                          {joiningId === dialogue.id ? 'Joining...' : 'Join →'}
                        </button>
                      )}
                      {isParticipant && (
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/dialogues/${dialogue.id}`) }}
                          className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded hover:bg-slate-600 transition-colors"
                        >
                          Enter →
                        </button>
                      )}
                    </div>
                  </div>

                  {dialogue.description && (
                    <p className="text-sm text-slate-300 mb-3">{dialogue.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {participants.map(p => p && (
                      <Tag key={p.id} color="blue">{p.name}</Tag>
                    ))}
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