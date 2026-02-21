
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'

const supabase = createClient()

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const [progress, setProgress] = useState(null)
  const [runTour, setRunTour] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!data) {
      // Create new progress
      const { data: newProgress } = await supabase
        .from('onboarding_progress')
        .insert({ user_id: user.id })
        .select()
        .single()
      
      setProgress(newProgress)
      setRunTour(true) // Start tour for new users
    } else {
      setProgress(data)
      setRunTour(!data.tutorial_completed)
    }

    setLoading(false)
  }

  const updateProgress = async (field, value) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !progress) return

    const updates = { [field]: value }
    
    // Check if all completed
    const allCompleted = 
      (field === 'tutorial_completed' ? value : progress.tutorial_completed) &&
      (field === 'belief_mapping_completed' ? value : progress.belief_mapping_completed) &&
      (field === 'first_dialogue_joined' ? value : progress.first_dialogue_joined) &&
      (field === 'first_message_sent' ? value : progress.first_message_sent) &&
      (field === 'first_synthesis_verified' ? value : progress.first_synthesis_verified)

    if (allCompleted && !progress.completed_at) {
      updates.completed_at = new Date().toISOString()
    }

    await supabase
      .from('onboarding_progress')
      .update(updates)
      .eq('user_id', user.id)

    setProgress({ ...progress, ...updates })
  }

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false)
      updateProgress('tutorial_completed', true)
    }
  }

  return (
    <OnboardingContext.Provider 
      value={{ 
        progress, 
        updateProgress, 
        runTour, 
        setRunTour,
        loading 
      }}
    >
      {children}
      {!loading && runTour && (
        <Joyride
          steps={dashboardSteps}
          run={runTour}
          stepIndex={stepIndex}
          continuous
          showProgress
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#fbbf24',
              zIndex: 10000,
            },
            tooltip: {
              borderRadius: 8,
              fontSize: 14,
            },
            buttonNext: {
              backgroundColor: '#fbbf24',
              color: '#0f172a',
              borderRadius: 6,
            },
            buttonBack: {
              color: '#64748b',
            },
          }}
        />
      )}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

// ============================================================================
// 2. TOUR STEPS - Dashboard
// ============================================================================

const dashboardSteps = [
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">Welcome to Consensus Bridge! 🌉</h2>
        <p>Let's take a quick tour to help you get started building consensus across political divides.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="belief-mapping"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">Complete Your Belief Mapping</h3>
        <p>Tell us about your worldview so our AI can facilitate better dialogues.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="browse-dialogues"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">Browse Dialogues</h3>
        <p>Find conversations on topics you care about. Join active dialogues or start your own!</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics"]',
    content: (
      <div>
        <h3 className="font-bold mb-2">Track Your Impact</h3>
        <p>See your stats and how much consensus you've helped build.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">You're Ready! 🚀</h2>
        <p>Start by completing your belief mapping, then join your first dialogue. Let's build consensus together!</p>
      </div>
    ),
    placement: 'center',
  },
]

// ============================================================================
// 3. ONBOARDING CHECKLIST COMPONENT
// ============================================================================

export function OnboardingChecklist() {
  const { progress, loading } = useOnboarding()

  if (loading || !progress) return null

  const items = [
    {
      key: 'tutorial_completed',
      label: 'Complete tutorial',
      icon: '🎓',
      completed: progress.tutorial_completed,
    },
    {
      key: 'belief_mapping_completed',
      label: 'Map your beliefs',
      icon: '🧭',
      completed: progress.belief_mapping_completed,
      href: '/belief-mapping',
    },
    {
      key: 'first_dialogue_joined',
      label: 'Join a dialogue',
      icon: '⚖',
      completed: progress.first_dialogue_joined,
      href: '/dialogues',
    },
    {
      key: 'first_message_sent',
      label: 'Send your first message',
      icon: '💬',
      completed: progress.first_message_sent,
    },
    {
      key: 'first_synthesis_verified',
      label: 'Verify a synthesis',
      icon: '✓',
      completed: progress.first_synthesis_verified,
      href: '/verification',
    },
  ]

  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  // Don't show if fully completed
  if (progress.completed_at) return null

  return (
    <div className="bg-gradient-to-br from-amber-400/10 to-amber-600/10 border border-amber-400/30 rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Getting Started</h3>
          <p className="text-sm text-slate-400">
            {completedCount} of {totalCount} complete
          </p>
        </div>
        <div className="text-3xl font-bold text-amber-400">
          {percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-amber-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.key}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all
              ${item.completed
                ? 'bg-green-400/10 border border-green-400/30'
                : 'bg-slate-800 border border-slate-700 hover:border-amber-400/50'
              }
            `}
          >
            <div className="text-2xl">{item.icon}</div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${item.completed ? 'text-green-400 line-through' : 'text-slate-200'}`}>
                {item.label}
              </div>
            </div>
            {item.completed ? (
              <div className="text-green-400">✓</div>
            ) : item.href ? (
              <a
                href={item.href}
                className="px-3 py-1 bg-amber-400 text-slate-950 rounded text-xs font-semibold hover:bg-amber-300 transition-colors"
              >
                Start →
              </a>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
            )}
          </div>
        ))}
      </div>

      {percentage === 100 && !progress.completed_at && (
        <div className="mt-4 p-4 bg-green-400/10 border border-green-400/30 rounded-lg text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-bold text-green-400">Congratulations!</div>
          <div className="text-sm text-slate-400">You've completed onboarding!</div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 4. PROGRESS TRACKING HELPERS
// ============================================================================

// Call these functions when users complete actions

export async function markBeliefMappingComplete() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('onboarding_progress')
    .update({ belief_mapping_completed: true })
    .eq('user_id', user.id)
}

export async function markFirstDialogueJoined() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('onboarding_progress')
    .select('first_dialogue_joined')
    .eq('user_id', user.id)
    .single()

  if (data && !data.first_dialogue_joined) {
    await supabase
      .from('onboarding_progress')
      .update({ first_dialogue_joined: true })
      .eq('user_id', user.id)
  }
}

export async function markFirstMessageSent() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('onboarding_progress')
    .select('first_message_sent')
    .eq('user_id', user.id)
    .single()

  if (data && !data.first_message_sent) {
    await supabase
      .from('onboarding_progress')
      .update({ first_message_sent: true })
      .eq('user_id', user.id)
  }
}

export async function markFirstSynthesisVerified() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('onboarding_progress')
    .select('first_synthesis_verified')
    .eq('user_id', user.id)
    .single()

  if (data && !data.first_synthesis_verified) {
    await supabase
      .from('onboarding_progress')
      .update({ first_synthesis_verified: true })
      .eq('user_id', user.id)
  }
}

// ============================================================================
// 5. TOOLTIPS FOR FIRST-TIME FEATURES
// ============================================================================

export function FeatureTooltip({ show, children, message, onDismiss }) {
  if (!show) return children

  return (
    <div className="relative">
      {children}
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-amber-400 text-slate-950 rounded-lg shadow-xl">
        <div className="text-sm font-medium mb-2">{message}</div>
        <button
          onClick={onDismiss}
          className="text-xs underline hover:no-underline"
        >
          Got it!
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-amber-400" />
      </div>
    </div>
  )
}