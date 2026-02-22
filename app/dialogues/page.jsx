'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { markFirstDialogueJoined } from '@/lib/onboarding/page'
import { checkAndAwardBadges } from '@/components/ui/gamification'

const supabase = createClient()

export default function DialoguesPage() {
  const { user, profile, loading: userLoading } = useUser()
  const [dialogues, setDialogues] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [joiningId, setJoiningId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
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

  // Load dialogues with search and filter
  useEffect(() => {
    if (!user) return
    
    const timer = setTimeout(() => {
      loadDialogues()
    }, 300) // Debounce search
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchTerm, filter])

  // Load users once
  useEffect(() => {
    if (!user) return
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadDialogues = async () => {
    setLoading(true)
    
    let query = supabase
      .from('dialogues')
      .select(`
        *,
        dialogue_participants (
          user_id,
          users ( id, name, political_lean )
        ),
        messages ( id )
      `)
    
    // Apply search if term exists
    if (searchTerm.trim()) {
      query = query.or(`topic.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }
    
    // Apply status filter
    if (filter === 'active') {
      query = query.eq('status', 'active')
    }
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('loadDialogues error:', error)
      setLoading(false)
      return
    }
    
    // Apply "mine" filter in JavaScript (after fetch)
    let filteredData = data || []
    if (filter === 'mine') {
      filteredData = filteredData.filter(d => 
        d.dialogue_participants?.some(p => p.user_id === user.id)
      )
    }
    
    setDialogues(filteredData)
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

  const joinDialogue = async (e, dialogueId) => {
    e.stopPropagation()

    if (!profile?.belief_profile) {
      alert('Please complete your Belief Mapping before joining a dialogue.')
      router.push('/belief-mapping')
      return
    }

    setJoiningId(dialogueId)

    try {
      const { error } = await supabase
        .from('dialogue_participants')
        .insert({ dialogue_id: dialogueId, user_id: user.id })

      if (error) {
        if (error.code === '23505') {
          // Already joined, just navigate
          router.push(`/dialogues/${dialogueId}`)
          router.refresh()
          return
        }
        console.error('Join error:', error)
        alert(`Could not join: ${error.message}`)
        setJoiningId(null)
        return
      }

      // Track first dialogue joined for onboarding
      await markFirstDialogueJoined()
      

      // Check and award badges
      const newBadges = await checkAndAwardBadges(user.id)
      if (newBadges && newBadges.length > 0) {
        console.log('New badges earned:', newBadges)
        // Could show toast notification: "Badge Earned: First Steps! 🎉"
      }

      router.push(`/dialogues/${dialogueId}`)
      router.refresh()
    } catch (err) {
      console.error('Join exception:', err)
      alert(err.message)
      setJoiningId(null)
    }
  }

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
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (dialogueError) { alert(dialogueError.message); return }

    const allParticipants = [user.id, ...newDialogue.selectedUsers]
    const { error: participantError } = await supabase
      .from('dialogue_participants')
      .insert(allParticipants.map(userId => ({
        dialogue_id: dialogue.id,
        user_id: userId
      })))

    if (participantError) { alert(participantError.message); return }

    // Track first dialogue joined (creator is also a participant)
    await markFirstDialogueJoined()

    // Check and award badges
    const newBadges = await checkAndAwardBadges(user.id)
    if (newBadges && newBadges.length > 0) {
      console.log('New badges earned:', newBadges)
    }

    router.push(`/dialogues/${dialogue.id}`)
    router.refresh()
  }

  const toggleUser = (userId) =>
    setNewDialogue(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }))

  if (userLoading || (loading && !searchTerm)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }
  if (!user || !profile) return null

  // Create dialogue view
  if (showCreate) {
    return (
      <div className="min-h-screen bg-slate-950">
        <nav className="border-b border-slate-800 p-3 sm:p-4">
          <button 
            onClick={() => setShowCreate(false)} 
            className="text-xs sm:text-sm text-slate-400 hover:text-slate-300"
          >
            ← Back to Dialogues
          </button>
        </nav>

        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 animate-fadeUp">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Create New Dialogue</h2>
          <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8">
            Choose a topic and invite participants with diverse perspectives
          </p>

          <Card className="mb-4 sm:mb-6 p-4 sm:p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dialogue Topic
            </label>
            <input
              type="text"
              value={newDialogue.topic}
              onChange={(e) => setNewDialogue({ ...newDialogue, topic: e.target.value })}
              placeholder="e.g., Climate policy in our community"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors mb-4"
            />

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={newDialogue.description}
              onChange={(e) => setNewDialogue({ ...newDialogue, description: e.target.value })}
              placeholder="Brief description of what you'd like to discuss..."
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors mb-4"
            />

            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Participants ({newDialogue.selectedUsers.length} selected)
            </label>

            {users.length === 0 ? (
              <p className="text-slate-500 text-xs sm:text-sm py-4 text-center">
                No other users with belief profiles yet. Invite someone to join!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {users.map(u => {
                  const selected = newDialogue.selectedUsers.includes(u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleUser(u.id)}
                      className={`p-3 rounded text-left transition-all text-sm ${
                        selected
                          ? 'bg-amber-400/10 border border-amber-400 text-amber-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 active:border-amber-400/50'
                      }`}
                    >
                      <div className="font-semibold truncate">{u.name}</div>
                      <div className="text-xs opacity-70">{u.political_lean}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          <Button onClick={createDialogue} className="w-full sm:w-auto">
            Create Dialogue →
          </Button>
        </div>
      </div>
    )
  }

  // Dialogue list view with search and filter
  return (
    <div className="min-h-screen bg-slate-950">
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

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fadeUp">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              Active Dialogues
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Join ongoing conversations or start new ones
            </p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="w-full sm:w-auto"
          >
            + New Dialogue
          </Button>
        </div>

        {/* Search and Filter - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <input
            type="search"
            placeholder="Search dialogues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
          >
            <option value="all">All Dialogues</option>
            <option value="active">Active Only</option>
            <option value="mine">My Dialogues</option>
          </select>
        </div>

        {/* Loading state during search */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : dialogues.length === 0 ? (
          <Card className="text-center py-8 sm:py-12 animate-fadeUp px-4">
            {searchTerm || filter !== 'all' ? (
              <>
                <p className="text-sm sm:text-base text-slate-400 mb-4">
                  No dialogues found matching your {searchTerm ? 'search' : 'filter'}.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setFilter('all')
                  }}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6">
                  No dialogues yet. Create the first one!
                </p>
                <Button 
                  onClick={() => setShowCreate(true)}
                  className="w-full sm:w-auto"
                >
                  Create Dialogue →
                </Button>
              </>
            )}
          </Card>
        ) : (
          <>
            {/* Results count */}
            <div className="text-xs sm:text-sm text-slate-500 mb-3">
              {dialogues.length} dialogue{dialogues.length !== 1 ? 's' : ''} found
            </div>

            {/* Dialogues list */}
            <div className="space-y-3 sm:space-y-4">
              {dialogues.map((dialogue, i) => {
                const participants = dialogue.dialogue_participants?.map(p => p.users) || []
                const messageCount = dialogue.messages?.length || 0
                const isParticipant = participants.some(p => p?.id === user.id)

                return (
                  <Card
                    key={dialogue.id}
                    className={`transition-all animate-fadeUp p-4 sm:p-6 ${
                      isParticipant ? 'border-amber-400/20' : ''
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display text-lg sm:text-xl font-bold break-words">
                            {dialogue.topic}
                          </h3>
                          {isParticipant && <Tag color="green">You&apos;re In</Tag>}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400">
                          {participants.length} participants · {messageCount} messages
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                        <Tag color={dialogue.status === 'active' ? 'green' : 'blue'}>
                          {dialogue.status}
                        </Tag>

                        {isParticipant ? (
                          <button
                            onClick={() => {
                              router.push(`/dialogues/${dialogue.id}`)
                              router.refresh()
                            }}
                            className="px-3 sm:px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded transition-colors"
                          >
                            Enter →
                          </button>
                        ) : dialogue.status === 'active' ? (
                          <button
                            onClick={(e) => joinDialogue(e, dialogue.id)}
                            disabled={joiningId === dialogue.id}
                            className="px-3 sm:px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {joiningId === dialogue.id ? 'Joining...' : 'Join →'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              router.push(`/dialogues/${dialogue.id}`)
                              router.refresh()
                            }}
                            className="px-3 sm:px-4 py-1.5 bg-slate-800 text-slate-500 text-xs rounded"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>

                    {dialogue.description && (
                      <p className="text-xs sm:text-sm text-slate-300 mb-3 break-words">
                        {dialogue.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {participants.map(p => p && (
                        <Tag key={p.id} color="blue">
                          <span className="text-[10px] sm:text-xs">{p.name}</span>
                        </Tag>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}