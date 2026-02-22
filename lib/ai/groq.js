import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function analyzeBeliefs(answers, politicalLean) {
  const summary = Object.entries(answers)
    .map(([topic, answer]) => `${topic}: "${answer}"`)
    .join('\n')

  const prompt = `Analyze these political belief responses from someone who identifies as ${politicalLean}.

Provide a JSON response with:
{
  "worldview": "2-3 sentence summary of their general worldview",
  "coreValues": ["value1", "value2", "value3"],
  "commonGround": ["area where they might find agreement with other perspectives 1", "area 2"],
  "underlyingConcerns": ["what fears or priorities drive their positions 1", "concern 2"]
}

Responses:
${summary}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // Current free model
    messages: [
      {
        role: 'system',
        content: 'You are a neutral political analyst helping facilitate cross-partisan dialogue. Be balanced, insightful, and constructive. Return ONLY valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const text = completion.choices[0]?.message?.content || '{}'
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  
  return JSON.parse(cleaned)
}

export async function facilitateDialogue(topic, messages, participants) {
  const history = messages.slice(-6).map(m => 
    `${m.user_name} (${m.user_lean}): ${m.content}`
  ).join('\n')

  const profiles = participants.map(p => 
    `${p.name} (${p.lean}): ${p.values?.join(', ') || 'Values pending'}`
  ).join('\n')

  const prompt = `You are facilitating a deliberative dialogue on "${topic}".

Participant profiles:
${profiles}

Recent exchanges:
${history}

Use deliberative democracy techniques:
- Steelmanning: Help participants articulate opposing views charitably
- Shared goals: Identify what everyone wants to achieve
- Values vs preferences: Distinguish core values from negotiable positions
- Concern mapping: Surface the fears or priorities driving positions

Respond in ~100 words. Acknowledge perspectives genuinely, introduce contrasting views respectfully, find shared values, and ask a deepening question.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a neutral democratic dialogue facilitator. Present all perspectives with equal respect. Never take sides. Help people find shared values beneath disagreements.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1000,
  })

  return completion.choices[0]?.message?.content || ''
}

export async function synthesizeConsensus(topic, messages, participants) {
  const dialogue = messages.map(m => 
    `${m.user_name}: ${m.content}`
  ).join('\n')

  const profiles = participants.map(p => 
    `${p.name} (${p.lean}): ${p.values?.join(', ') || 'Values pending'}`
  ).join('\n')

  const prompt = `Based on this dialogue about "${topic}", generate a consensus synthesis.

Participants:
${profiles}

Dialogue:
${dialogue}

Provide JSON with:
{
  "policyRecommendation": "Clear, actionable 2-3 sentence policy recommendation",
  "keyAgreements": ["specific agreement 1", "agreement 2", "agreement 3"],
  "participantContributions": [
    {
      "name": "participant name",
      "contribution": "how they shaped consensus",
      "concernsAddressed": "how their concerns were integrated"
    }
  ],
  "implementationSteps": ["step 1", "step 2", "step 3"],
  "areasForFutureDialogue": ["remaining question 1", "question 2"]
}

This should be an authentic synthesis, NOT a watered-down compromise.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a democratic policy synthesis expert. Generate concrete, actionable consensus from dialogue. Be specific and authentic. Return ONLY valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 9000,
  })

  const text = completion.choices[0]?.message?.content || '{}'
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  
  return JSON.parse(cleaned)
}