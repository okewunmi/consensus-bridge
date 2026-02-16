'use server'

// import { analyzeBeliefs as analyzeBeliefsFn, facilitateDialogue as facilitateDialogueFn, synthesizeConsensus as synthesizeConsensusFn } from '@/lib/ai/anthropic'

import { analyzeBeliefs as analyzeBeliefsFn, facilitateDialogue as facilitateDialogueFn, synthesizeConsensus as synthesizeConsensusFn } from '@/lib/ai/groq'

import { createClient } from '@/lib/supabase/server'

export async function analyzeBeliefs(
  answers: Record<string, string>,
  politicalLean: string
) {
  try {
    const analysis = await analyzeBeliefsFn(answers, politicalLean)
    return { success: true, data: analysis }
  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    return { success: false, error: error.message }
  }
}

export async function facilitateDialogue(
  dialogueId: string
) {
  try {
    const supabase = createClient()
    
    // Get dialogue details
    const { data: dialogue } = await supabase
      .from('dialogues')
      .select(`
        topic,
        dialogue_participants (
          users (
            name,
            political_lean,
            belief_profile
          )
        )
      `)
      .eq('id', dialogueId)
      .single()

    if (!dialogue) {
      throw new Error('Dialogue not found')
    }

    // Get recent messages
    const { data: messages } = await supabase
      .from('messages')
      .select('user_name, user_lean, content')
      .eq('dialogue_id', dialogueId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!messages || messages.length === 0) {
      throw new Error('No messages to facilitate')
    }

    // Prepare participants
    const participants = dialogue.dialogue_participants.map((p: any) => ({
      name: p.users.name,
      lean: p.users.political_lean,
      values: p.users.belief_profile?.coreValues || []
    }))

    // Get AI facilitation
    const response = await facilitateDialogueFn(
      dialogue.topic,
      messages.reverse(),
      participants
    )

    // Save AI message
    const { error } = await supabase
      .from('messages')
      .insert([{
        dialogue_id: dialogueId,
        user_name: 'AI Facilitator',
        user_lean: 'neutral',
        content: response,
        is_ai: true
      }])

    if (error) throw error

    return { success: true, data: response }
  } catch (error: any) {
    console.error('Facilitation Error:', error)
    return { success: false, error: error.message }
  }
}

export async function generateSynthesis(dialogueId: string) {
  try {
    const supabase = createClient()
    
    // Get dialogue details
    const { data: dialogue } = await supabase
      .from('dialogues')
      .select(`
        topic,
        dialogue_participants (
          user_id,
          users (
            name,
            political_lean,
            belief_profile
          )
        )
      `)
      .eq('id', dialogueId)
      .single()

    if (!dialogue) {
      throw new Error('Dialogue not found')
    }

    // Get all messages
    const { data: messages } = await supabase
      .from('messages')
      .select('user_name, content, is_ai')
      .eq('dialogue_id', dialogueId)
      .order('created_at', { ascending: true })

    if (!messages || messages.length < 8) {
      throw new Error('Need at least 8 messages to generate synthesis')
    }

    // Filter out AI messages for synthesis
    const humanMessages = messages.filter(m => !m.is_ai)

    // Prepare participants
    const participants = dialogue.dialogue_participants.map((p: any) => ({
      name: p.users.name,
      lean: p.users.political_lean,
      values: p.users.belief_profile?.coreValues || []
    }))

    // Generate synthesis
    const synthesis = await synthesizeConsensusFn(
      dialogue.topic,
      humanMessages,
      participants
    )

    // Save synthesis
    const { data: newSynthesis, error: synthesisError } = await supabase
      .from('syntheses')
      .insert([{
        dialogue_id: dialogueId,
        topic: dialogue.topic,
        synthesis: synthesis
      }])
      .select()
      .single()

    if (synthesisError) throw synthesisError

    // Update dialogue status
    const { error: updateError } = await supabase
      .from('dialogues')
      .update({ 
        status: 'synthesis',
        synthesis_id: newSynthesis.id
      })
      .eq('id', dialogueId)

    if (updateError) throw updateError

    return { success: true, data: newSynthesis }
  } catch (error: any) {
    console.error('Synthesis Error:', error)
    return { success: false, error: error.message }
  }
}
