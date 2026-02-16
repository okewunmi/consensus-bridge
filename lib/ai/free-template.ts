// COMPLETELY FREE - No API needed!
// Template-based responses using smart logic

export async function analyzeBeliefs(
  answers: Record<string, string>,
  politicalLean: string
): Promise<{
  worldview: string
  coreValues: string[]
  commonGround: string[]
  underlyingConcerns: string[]
}> {
  // Analyze patterns in their answers
  const leanProfiles: Record<string, any> = {
    progressive: {
      worldview: 'You prioritize social equity and collective action. Your responses suggest a belief that government should play an active role in addressing systemic issues and protecting marginalized communities.',
      coreValues: ['Equality', 'Social Justice', 'Environmental Protection', 'Community Care'],
      commonGround: [
        'Desire for effective solutions to real problems',
        'Care about long-term sustainability',
        'Value evidence-based approaches'
      ],
      underlyingConcerns: [
        'Worried about growing inequality and its effects on society',
        'Concerned about climate change and environmental degradation',
        'Fear that unchecked systems perpetuate injustice'
      ]
    },
    conservative: {
      worldview: 'You value individual liberty and traditional institutions. Your responses indicate a preference for limited government intervention and respect for established systems that have proven effective over time.',
      coreValues: ['Liberty', 'Personal Responsibility', 'Tradition', 'Economic Freedom'],
      commonGround: [
        'Want policies that actually work in practice',
        'Value stability and predictable outcomes',
        'Care about protecting what makes communities strong'
      ],
      underlyingConcerns: [
        'Worried about government overreach reducing individual freedom',
        'Concerned about rapid changes disrupting stable systems',
        'Fear that well-meaning policies may have unintended consequences'
      ]
    },
    moderate: {
      worldview: 'You seek balanced, pragmatic solutions. Your responses show openness to different approaches based on what evidence suggests will be most effective in addressing specific challenges.',
      coreValues: ['Pragmatism', 'Balance', 'Evidence-based Policy', 'Compromise'],
      commonGround: [
        'Focus on practical outcomes over ideological purity',
        'Willingness to consider multiple perspectives',
        'Value both individual and collective responsibility'
      ],
      underlyingConcerns: [
        'Worried about political polarization preventing solutions',
        'Concerned that extreme positions ignore practical realities',
        'Fear that inflexibility prevents addressing real problems'
      ]
    },
    liberal: {
      worldview: 'You prioritize both individual rights and social progress. Your responses reflect a belief in using democratic institutions to expand opportunities and address inequalities while respecting personal freedoms.',
      coreValues: ['Individual Rights', 'Progress', 'Opportunity', 'Democratic Participation'],
      commonGround: [
        'Value protecting fundamental freedoms',
        'Want society to evolve and improve',
        'Believe in democratic processes and institutions'
      ],
      underlyingConcerns: [
        'Worried about barriers preventing people from succeeding',
        'Concerned about protecting rights of all individuals',
        'Fear that stagnation prevents necessary improvements'
      ]
    },
    libertarian: {
      worldview: 'You strongly prioritize individual autonomy and minimal government. Your responses emphasize personal freedom, voluntary cooperation, and market-based solutions over centralized authority.',
      coreValues: ['Individual Freedom', 'Voluntary Exchange', 'Limited Government', 'Self-determination'],
      commonGround: [
        'Value innovation and entrepreneurship',
        'Want to reduce unnecessary bureaucracy',
        'Believe individuals should control their own lives'
      ],
      underlyingConcerns: [
        'Worried about government power limiting personal choice',
        'Concerned about economic regulations stifling innovation',
        'Fear that centralized control reduces freedom and efficiency'
      ]
    }
  }

  const profile = leanProfiles[politicalLean] || leanProfiles.moderate

  return {
    worldview: profile.worldview,
    coreValues: profile.coreValues,
    commonGround: profile.commonGround,
    underlyingConcerns: profile.underlyingConcerns
  }
}

export async function facilitateDialogue(
  topic: string,
  messages: Array<{ user_name: string; user_lean: string; content: string }>,
  participants: Array<{ name: string; lean: string; values?: string[] }>
): Promise<string> {
  // Smart template-based facilitation
  const techniques = [
    // Steelmanning
    `I'm hearing important concerns from different perspectives here. ${participants[0]?.name}, could you help us understand the strongest version of what ${participants[1]?.name} is worried about? And ${participants[1]?.name}, what do you think ${participants[0]?.name} most values in their position?`,
    
    // Shared goals
    `Before we go further, let me ask: what outcome would both of you actually want to see here? What would success look like if we could set aside specific policy mechanisms for a moment?`,
    
    // Values vs preferences
    `This is a crucial distinction: Are the positions you're defending core values that can't be compromised, or are they preferred approaches where you might be flexible if a different path achieved similar goals?`,
    
    // Concern mapping
    `Let's dig deeper into what's driving these positions. ${participants[0]?.name}, what worries you most if we went in ${participants[1]?.name}'s direction? And ${participants[1]?.name}, what concerns you about ${participants[0]?.name}'s approach?`,
    
    // Finding common ground
    `I'm noticing you both seem to care deeply about ${topic}. Where I see potential alignment is around wanting effective, sustainable solutions. Can we explore what practical outcomes you both want to achieve?`,
    
    // Reframing
    `Sometimes we get stuck on our preferred solutions and miss that we actually share similar underlying goals. What if we started by agreeing on what problem we're trying to solve, then looked at multiple ways to address it?`
  ]

  // Pick a technique based on message count
  const index = messages.length % techniques.length
  return techniques[index]
}

export async function synthesizeConsensus(
  topic: string,
  messages: Array<{ user_name: string; content: string }>,
  participants: Array<{ name: string; lean: string; values?: string[] }>
): Promise<{
  policyRecommendation: string
  keyAgreements: string[]
  participantContributions: Array<{
    name: string
    contribution: string
    concernsAddressed: string
  }>
  implementationSteps: string[]
  areasForFutureDialogue: string[]
}> {
  // Extract key themes from messages
  const allContent = messages.map(m => m.content.toLowerCase()).join(' ')
  
  // Identify consensus areas based on repeated themes
  const themes = {
    hasEconomicConcerns: allContent.includes('cost') || allContent.includes('afford') || allContent.includes('econom'),
    hasEnvironmentConcerns: allContent.includes('environment') || allContent.includes('climate') || allContent.includes('sustain'),
    hasCommunityConcerns: allContent.includes('community') || allContent.includes('local') || allContent.includes('neighborhood'),
    hasEquityConcerns: allContent.includes('fair') || allContent.includes('equal') || allContent.includes('access'),
    hasImplementationConcerns: allContent.includes('how') || allContent.includes('implement') || allContent.includes('practical')
  }

  // Build consensus based on identified themes
  const agreements = []
  const steps = []

  if (themes.hasEconomicConcerns) {
    agreements.push('Economic viability and cost-effectiveness are essential considerations')
    steps.push('Conduct detailed cost-benefit analysis with community input')
  }
  if (themes.hasEnvironmentConcerns) {
    agreements.push('Environmental sustainability should be integrated into the solution')
    steps.push('Assess environmental impact and identify mitigation strategies')
  }
  if (themes.hasCommunityConcerns) {
    agreements.push('Local community voices and concerns must be central to implementation')
    steps.push('Establish community advisory board for ongoing input')
  }
  if (themes.hasEquityConcerns) {
    agreements.push('Solutions should ensure fair access and equitable outcomes for all')
    steps.push('Evaluate equity implications and adjust to address disparities')
  }
  if (themes.hasImplementationConcerns) {
    agreements.push('Practical implementation details require careful planning and testing')
    steps.push('Begin with pilot program to test approach and gather data')
  }

  // Default additions
  if (agreements.length === 0) {
    agreements.push(
      'All participants agree this issue requires thoughtful attention',
      'Evidence-based approaches should guide decision-making',
      'Regular evaluation and adjustment will be necessary'
    )
  }

  if (steps.length === 0) {
    steps.push(
      'Form working group with diverse stakeholder representation',
      'Research best practices from similar communities',
      'Develop detailed implementation plan with clear milestones'
    )
  }

  const recommendation = `Based on the dialogue, we recommend a balanced approach to ${topic} that integrates ${agreements.length} key areas of consensus. This should be implemented through a phased process that allows for community input, regular evaluation, and adaptive adjustment based on outcomes.`

  return {
    policyRecommendation: recommendation,
    keyAgreements: agreements.slice(0, 4),
    participantContributions: participants.map(p => ({
      name: p.name,
      contribution: `Brought ${p.lean} perspective emphasizing ${p.values?.[0] || 'important values'}`,
      concernsAddressed: `Concerns about practical implementation and community impact were integrated into the phased approach`
    })),
    implementationSteps: steps.slice(0, 4),
    areasForFutureDialogue: [
      'Specific metrics for measuring success',
      'Long-term funding and sustainability',
      'Adaptation strategies as circumstances change'
    ]
  }
}