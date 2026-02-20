'use server'

import { analyzeBeliefs as analyzeBeliefsFn, facilitateDialogue as facilitateDialogueFn, synthesizeConsensus as synthesizeConsensusFn } from '@/lib/ai/groq'
import { createClient } from '@/lib/supabase/server'

export async function analyzeBeliefs(answers, politicalLean) {
  try {
    const analysis = await analyzeBeliefsFn(answers, politicalLean)
    return { success: true, data: analysis }
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return { success: false, error: error.message }
  }
}

export async function facilitateDialogue(dialogueId) {
  try {
    const supabase = createClient()

    // Get dialogue details
    const { data: dialogue, error: dialogueError } = await supabase
      .from('dialogues')
      .select(`
        topic,
        dialogue_participants (
          users ( name, political_lean, belief_profile )
        )
      `)
      .eq('id', dialogueId)
      .single()

    if (dialogueError || !dialogue) throw new Error('Dialogue not found')

    // Get recent messages — wait a moment to let the triggering message commit
    // (small retry loop handles the race condition on first message)
    let messages = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data } = await supabase
        .from('messages')
        .select('user_name, user_lean, content, is_ai')
        .eq('dialogue_id', dialogueId)
        .eq('is_ai', false)   // only human messages
        .order('created_at', { ascending: false })
        .limit(10)

      if (data && data.length > 0) { messages = data; break }
      // Wait 500ms before retrying
      await new Promise(r => setTimeout(r, 500))
    }

    if (!messages || messages.length === 0) {
      throw new Error('No human messages found to facilitate')
    }

    // Prepare participants
    const participants = dialogue.dialogue_participants.map(p => ({
      name: p.users.name,
      lean: p.users.political_lean,
      values: p.users.belief_profile?.coreValues || []
    }))

    // Call Groq for facilitation response
    const response = await facilitateDialogueFn(
      dialogue.topic,
      messages.reverse(), // chronological order
      participants
    )

    if (!response) throw new Error('Empty response from AI')

    // Save AI message to database
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        dialogue_id: dialogueId,
        user_id: null,            // AI has no user_id
        user_name: 'AI Facilitator',
        user_lean: 'neutral',
        content: response,
        is_ai: true
      })

    if (insertError) {
      console.error('Failed to save AI message:', insertError)
      throw insertError
    }

    return { success: true, data: response }
  } catch (error) {
    console.error('Facilitation Error:', error)
    return { success: false, error: error.message }
  }
}

export async function generateSynthesis(dialogueId) {
  try {
    const supabase = createClient()

    const { data: dialogue, error: dialogueError } = await supabase
      .from('dialogues')
      .select(`
        topic,
        dialogue_participants (
          user_id,
          users ( name, political_lean, belief_profile )
        )
      `)
      .eq('id', dialogueId)
      .single()

    if (dialogueError || !dialogue) throw new Error('Dialogue not found')

    // Get only human messages for synthesis
    const { data: messages } = await supabase
      .from('messages')
      .select('user_name, content, is_ai')
      .eq('dialogue_id', dialogueId)
      .eq('is_ai', false)
      .order('created_at', { ascending: true })

    if (!messages || messages.length < 4) {
      throw new Error('Need at least 4 human messages to generate synthesis')
    }

    const participants = dialogue.dialogue_participants.map(p => ({
      name: p.users.name,
      lean: p.users.political_lean,
      values: p.users.belief_profile?.coreValues || []
    }))

    const synthesis = await synthesizeConsensusFn(
      dialogue.topic,
      messages,
      participants
    )

    const { data: newSynthesis, error: synthesisError } = await supabase
      .from('syntheses')
      .insert({
        dialogue_id: dialogueId,
        topic: dialogue.topic,
        synthesis: synthesis
      })
      .select()
      .single()

    if (synthesisError) throw synthesisError

    await supabase
      .from('dialogues')
      .update({ status: 'synthesis', synthesis_id: newSynthesis.id })
      .eq('id', dialogueId)

    return { success: true, data: newSynthesis }
  } catch (error) {
    console.error('Synthesis Error:', error)
    return { success: false, error: error.message }
  }
}