
// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { useUser } from '@/lib/hooks/useUser'
// import { Card } from '@/components/ui/Card'
// import { Tag } from '@/components/ui/Tag'
// import { Button } from '@/components/ui/Button'
// import { Spinner } from '@/components/ui/Spinner'

// const supabase = createClient()

// export default function DialoguesPage() {
//   const { user, profile, loading: userLoading } = useUser()
//   const [dialogues, setDialogues] = useState([])
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showCreate, setShowCreate] = useState(false)
//   const [joiningId, setJoiningId] = useState(null) // Track which dialogue is being joined
//   const [newDialogue, setNewDialogue] = useState({
//     topic: '',
//     description: '',
//     selectedUsers: []
//   })
//   const router = useRouter()

//   useEffect(() => {
//     if (!userLoading && !user) {
//       router.push('/auth')
//     }
//   }, [user, userLoading, router])

//   useEffect(() => {
//     if (!user) return

//     const loadDialogues = async () => {
//       const { data, error } = await supabase
//         .from('dialogues')
//         .select(`
//           *,
//           dialogue_participants (
//             user_id,
//             users (
//               id,
//               name,
//               political_lean
//             )
//           ),
//           messages (
//             id
//           )
//         `)
//         .order('created_at', { ascending: false })

//       if (error) console.error('Load dialogues error:', error)
//       if (data) setDialogues(data)
//       setLoading(false)
//     }

//     const loadUsers = async () => {
//       const { data } = await supabase
//         .from('users')
//         .select('id, name, political_lean, belief_profile')
//         .neq('id', user.id)
//         .not('belief_profile', 'is', null)

//       if (data) setUsers(data)
//     }

//     loadDialogues()
//     loadUsers()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user])

//   const createDialogue = async () => {
//     if (!newDialogue.topic || newDialogue.selectedUsers.length === 0) {
//       alert('Please add a topic and select at least one participant')
//       return
//     }

//     const { data: dialogue, error: dialogueError } = await supabase
//       .from('dialogues')
//       .insert({
//         topic: newDialogue.topic,
//         description: newDialogue.description,
//         created_by: user?.id,
//         status: 'active'
//       })
//       .select()
//       .single()

//     if (dialogueError) {
//       alert(dialogueError.message)
//       return
//     }

//     // Add participants (including creator)
//     const allParticipants = [user?.id, ...newDialogue.selectedUsers]
//     const participants = allParticipants.map(userId => ({
//       dialogue_id: dialogue.id,
//       user_id: userId
//     }))

//     const { error: participantError } = await supabase
//       .from('dialogue_participants')
//       .insert(participants)

//     if (participantError) {
//       alert(participantError.message)
//       return
//     }

//     router.push(`/dialogues/${dialogue.id}`)
//   }

//   // NEW: Join an existing dialogue
//   const joinDialogue = async (e, dialogueId) => {
//     e.stopPropagation() // Prevent card click from navigating
    
//     if (!user || !profile) {
//       alert('Please complete your belief profile first')
//       return
//     }

//     if (!profile.belief_profile) {
//       alert('Please complete your belief mapping before joining a dialogue')
//       router.push('/belief-mapping')
//       return
//     }

//     setJoiningId(dialogueId)

//     const { error } = await supabase
//       .from('dialogue_participants')
//       .insert({
//         dialogue_id: dialogueId,
//         user_id: user.id
//       })

//     if (error) {
//       if (error.code === '23505') {
//         // Already a participant - just navigate
//         router.push(`/dialogues/${dialogueId}`)
//       } else {
//         alert('Could not join dialogue: ' + error.message)
//         setJoiningId(null)
//       }
//       return
//     }

//     router.push(`/dialogues/${dialogueId}`)
//   }

//   const toggleUser = (userId) => {
//     setNewDialogue(prev => ({
//       ...prev,
//       selectedUsers: prev.selectedUsers.includes(userId)
//         ? prev.selectedUsers.filter(id => id !== userId)
//         : [...prev.selectedUsers, userId]
//     }))
//   }

//   if (userLoading || loading) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <Spinner size={32} />
//       </div>
//     )
//   }

//   if (!user || !profile) return null

//   if (showCreate) {
//     return (
//       <div className="min-h-screen bg-slate-950">
//         <nav className="border-b border-slate-800 p-4">
//           <button
//             onClick={() => setShowCreate(false)}
//             className="text-sm text-slate-400 hover:text-slate-300"
//           >
//             ← Back to Dialogues
//           </button>
//         </nav>

//         <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
//           <h2 className="font-display text-3xl font-bold mb-2">Create New Dialogue</h2>
//           <p className="text-slate-400 mb-8">
//             Choose a topic and invite participants with diverse perspectives
//           </p>

//           <Card className="mb-6">
//             <label className="block text-sm font-medium text-slate-300 mb-2">
//               Dialogue Topic
//             </label>
//             <input
//               type="text"
//               value={newDialogue.topic}
//               onChange={(e) => setNewDialogue({ ...newDialogue, topic: e.target.value })}
//               placeholder="e.g., Climate policy in our community"
//               className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors mb-4"
//             />

//             <label className="block text-sm font-medium text-slate-300 mb-2">
//               Description (optional)
//             </label>
//             <textarea
//               value={newDialogue.description}
//               onChange={(e) => setNewDialogue({ ...newDialogue, description: e.target.value })}
//               placeholder="Brief description of what you'd like to discuss..."
//               rows={3}
//               className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors mb-4"
//             />

//             <label className="block text-sm font-medium text-slate-300 mb-3">
//               Select Participants ({newDialogue.selectedUsers.length} selected)
//             </label>

//             {users.length === 0 ? (
//               <p className="text-slate-500 text-sm py-4 text-center">
//                 No other users with belief profiles found. Invite others to join!
//               </p>
//             ) : (
//               <div className="grid md:grid-cols-2 gap-3">
//                 {users.map(u => {
//                   const selected = newDialogue.selectedUsers.includes(u.id)
//                   return (
//                     <button
//                       key={u.id}
//                       onClick={() => toggleUser(u.id)}
//                       className={`
//                         p-3 rounded text-left transition-all text-sm
//                         ${selected
//                           ? 'bg-amber-400/10 border border-amber-400 text-amber-300'
//                           : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600'
//                         }
//                       `}
//                     >
//                       <div className="font-semibold">{u.name}</div>
//                       <div className="text-xs opacity-70">{u.political_lean}</div>
//                     </button>
//                   )
//                 })}
//               </div>
//             )}
//           </Card>

//           <Button onClick={createDialogue}>
//             Create Dialogue →
//           </Button>
//         </div>
//       </div>
//     )
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
//         <div className="flex justify-between items-center mb-8 animate-fadeUp">
//           <div>
//             <h2 className="font-display text-3xl font-bold mb-2">Active Dialogues</h2>
//             <p className="text-slate-400">Join ongoing conversations or start new ones</p>
//           </div>
//           <Button onClick={() => setShowCreate(true)}>
//             + New Dialogue
//           </Button>
//         </div>

//         {dialogues.length === 0 ? (
//           <Card className="text-center py-12 animate-fadeUp">
//             <p className="text-slate-400 mb-6">
//               No dialogues yet. Create the first one!
//             </p>
//             <Button onClick={() => setShowCreate(true)}>
//               Create Dialogue →
//             </Button>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {dialogues.map((dialogue, i) => {
//               const participants = dialogue.dialogue_participants?.map(p => p.users) || []
//               const messageCount = dialogue.messages?.length || 0
//               const isParticipant = participants.some(p => p?.id === user.id)

//               return (
//                 <Card
//                   key={dialogue.id}
//                   className={`
//                     cursor-pointer hover:border-amber-400/30 transition-all animate-fadeUp
//                     ${isParticipant ? 'border-amber-400/20' : ''}
//                   `}
//                   style={{ animationDelay: `${i * 50}ms` }}
//                   onClick={() => router.push(`/dialogues/${dialogue.id}`)}
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1 flex-wrap">
//                         <h3 className="font-display text-xl font-bold">
//                           {dialogue.topic}
//                         </h3>
//                         {isParticipant && (
//                           <Tag color="green">You&apos;re In</Tag>
//                         )}
//                       </div>
//                       <p className="text-sm text-slate-400">
//                         {participants.length} participants · {messageCount} messages
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2 ml-4">
//                       <Tag color={dialogue.status === 'active' ? 'green' : 'blue'}>
//                         {dialogue.status}
//                       </Tag>
//                       {/* JOIN BUTTON - only show if not a participant */}
//                       {!isParticipant && dialogue.status === 'active' && (
//                         <button
//                           onClick={(e) => joinDialogue(e, dialogue.id)}
//                           disabled={joiningId === dialogue.id}
//                           className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-semibold rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
//                         >
//                           {joiningId === dialogue.id ? 'Joining...' : 'Join →'}
//                         </button>
//                       )}
//                       {isParticipant && (
//                         <button
//                           onClick={(e) => { e.stopPropagation(); router.push(`/dialogues/${dialogue.id}`) }}
//                           className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded hover:bg-slate-600 transition-colors"
//                         >
//                           Enter →
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {dialogue.description && (
//                     <p className="text-sm text-slate-300 mb-3">{dialogue.description}</p>
//                   )}

//                   <div className="flex flex-wrap gap-2">
//                     {participants.map(p => p && (
//                       <Tag key={p.id} color="blue">{p.name}</Tag>
//                     ))}
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

  // Join an existing dialogue
  const joinDialogue = async (e, dialogueId) => {
    e.stopPropagation()
    
    if (!profile?.belief_profile) {
      alert('Please complete your belief mapping before joining a dialogue')
      router.push('/belief-mapping')
      return
    }

    setJoiningId(dialogueId)

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Check your connection.')), 8000)
      )

      const joinPromise = supabase
        .from('dialogue_participants')
        .insert({ dialogue_id: dialogueId, user_id: user.id })

      const { error } = await Promise.race([joinPromise, timeoutPromise])

      if (error) {
        if (error.code === '23505') {
          // Already a participant - just navigate
          router.push(`/dialogues/${dialogueId}`)
          return
        }
        console.error('Join error:', error)
        alert(`Could not join: ${error.message}\n\nCode: ${error.code}`)
        setJoiningId(null)
        return
      }

      router.push(`/dialogues/${dialogueId}`)
    } catch (err) {
      console.error('Join failed:', err)
      alert(err.message)
      setJoiningId(null)
    }
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