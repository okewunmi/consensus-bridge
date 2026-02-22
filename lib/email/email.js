// lib/email/email.js - Client-side wrapper
// This file calls the API route to send emails

async function sendEmail(payload) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to send email')
  }
  
  return res.json()
}

// Export these functions to use throughout your app
export const sendWelcomeEmail = (to, name) =>
  sendEmail({ type: 'welcome', to, name })

export const sendNewMessageEmail = (to, userName, dialogueTopic, messagePreview, dialogueId) =>
  sendEmail({ type: 'new-message', to, userName, dialogueTopic, messagePreview, dialogueId })

export const sendSynthesisReadyEmail = (to, dialogueTopic, dialogueId) =>
  sendEmail({ type: 'synthesis-ready', to, dialogueTopic, dialogueId })

export const sendVerificationNeededEmail = (to, synthesisId, dialogueTopic) =>
  sendEmail({ type: 'verification-needed', to, synthesisId, dialogueTopic })

export const sendDailyDigest = (to, userName, stats) =>
  sendEmail({ type: 'daily-digest', to, userName, stats })