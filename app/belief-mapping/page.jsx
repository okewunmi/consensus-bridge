'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const BELIEF_QUESTIONS = [
  {
    id: 'economy',
    topic: 'Economic Policy',
    question: 'How should government approach wealth redistribution?',
    options: [
      'Government should actively redistribute wealth through taxation',
      'Market forces with minimal intervention produce best outcomes',
      'Balanced approach: safety nets with market freedom',
      'Depends heavily on economic conditions and context',
    ],
  },
  {
    id: 'climate',
    topic: 'Climate & Environment',
    question: "What's the right approach to climate change?",
    options: [
      'Immediate aggressive government action, even at economic cost',
      'Market-driven innovation will solve this better than regulation',
      'Gradual transition balancing economic and environmental needs',
      'Local/community solutions over top-down mandates',
    ],
  },
  {
    id: 'immigration',
    topic: 'Immigration',
    question: 'How should immigration policy be shaped?',
    options: [
      'Open, welcoming policies — immigration strengthens society',
      'Strict limits and enforcement to protect existing citizens',
      'Merit-based system with humanitarian protections',
      'Regional flexibility rather than one national policy',
    ],
  },
  {
    id: 'healthcare',
    topic: 'Healthcare',
    question: 'Who should be responsible for healthcare access?',
    options: [
      'Universal public coverage — healthcare is a human right',
      'Private market — competition drives better care',
      'Mixed public-private system with universal baseline',
      'Individuals, with government as safety net only',
    ],
  },
  {
    id: 'values',
    topic: 'Core Values',
    question: 'Which value do you prioritize most in policy decisions?',
    options: [
      'Equality — ensuring everyone has same opportunities',
      'Liberty — protecting individual freedom from government',
      'Community — strengthening shared bonds and mutual aid',
      'Security — keeping people safe and stable',
    ],
  },
]

export default function BeliefMappingPage() {
  const { user, profile, loading: userLoading } = useUser()
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user || !profile) {
    router.push('/auth')
    return null
  }

  const q = BELIEF_QUESTIONS[current]
  const allAnswered = Object.keys(answers).length === BELIEF_QUESTIONS.length

  const select = (qId, option) => {
    setAnswers({ ...answers, [qId]: option })
    if (current < BELIEF_QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300)
    }
  }

  const analyzeBeliefs = async () => {
    setAnalyzing(true)
    
    // Call real AI analysis
    const { analyzeBeliefs: analyzeAction } = await import('@/app/actions/ai')
    const result = await analyzeAction(answers, profile?.political_lean || 'moderate')
    
    if (!result.success) {
      alert('Analysis failed: ' + result.error)
      setAnalyzing(false)
      return
    }

    // Save to database
    await supabase
      .from('users')
      .update({ belief_profile: result.data })
      .eq('id', user.id)

    setAnalysis(result.data)
    setAnalyzing(false)
  }

  if (analysis) {
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

        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
          <div className="mb-6">
            <Tag color="green">✓ Belief Map Complete</Tag>
            <h2 className="font-display text-3xl font-bold mt-4 mb-2">
              Your Civic Profile
            </h2>
            <p className="text-slate-400">
              Based on your responses, here&apos;s how AI understands your worldview
            </p>
          </div>

          <Card className="mb-6 border-amber-400/20 bg-amber-400/5">
            <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
              Worldview
            </div>
            <p className="text-slate-300 leading-relaxed">{analysis.worldview}</p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="text-xs text-green-400 font-mono uppercase tracking-wider mb-3">
                Core Values
              </div>
              <div className="space-y-2">
                {analysis.coreValues.map((value, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5">◆</span>
                    {value}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="text-xs text-blue-400 font-mono uppercase tracking-wider mb-3">
                Common Ground Potential
              </div>
              <div className="space-y-2">
                {analysis.commonGround.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-blue-400 mt-0.5">◆</span>
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Button onClick={() => router.push('/dashboard')}>
            Continue to Dashboard →
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

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="mb-8">
          <Tag>Step {current + 1} of {BELIEF_QUESTIONS.length}</Tag>
          <h2 className="font-display text-4xl font-bold mt-4 mb-2">
            Map Your Beliefs
          </h2>
          <p className="text-slate-400">
            Answer honestly. There are no right answers — only your perspective.
          </p>
        </div>

        {/* Progress */}
        <div className="h-1 bg-slate-800 rounded-full mb-8">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${(current / BELIEF_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <Card className="mb-6 animate-slideIn">
          <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-3">
            {q.topic}
          </div>
          <h3 className="font-display text-2xl font-bold mb-6 leading-tight">
            {q.question}
          </h3>
          <div className="space-y-3">
            {q.options.map((option, i) => {
              const selected = answers[q.id] === option
              return (
                <button
                  key={i}
                  onClick={() => select(q.id, option)}
                  className={`
                    w-full text-left p-4 rounded-lg border transition-all
                    ${selected
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }
                  `}
                >
                  <span className="text-slate-500 font-mono text-sm mr-3">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-3">
          {current > 0 && (
            <Button
              variant="secondary"
              onClick={() => setCurrent(c => c - 1)}
            >
              ← Back
            </Button>
          )}
          {allAnswered && (
            <Button
              onClick={analyzeBeliefs}
              loading={analyzing}
            >
              {analyzing ? 'Analyzing...' : 'Generate My Profile →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}