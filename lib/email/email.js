// lib/email.js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Consensus Bridge <noreply@consensusbridge.com>'
// Note: You need to verify your domain in Resend dashboard
// Or use: onboarding@resend.dev for testing

export async function sendWelcomeEmail(to, name) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Consensus Bridge!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #fbbf24;">Welcome, ${name}!</h1>
          <p>Thank you for joining Consensus Bridge - where we build consensus across political divides.</p>
          
          <h2>Get Started:</h2>
          <ol>
            <li><strong>Complete your belief mapping</strong> - Help our AI understand your perspective</li>
            <li><strong>Join a dialogue</strong> - Find conversations that matter to you</li>
            <li><strong>Build consensus</strong> - Work together to find common ground</li>
          </ol>
          
          <a href="${process.env.NEXT_PUBLIC_URL}/belief-mapping" 
             style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Start Belief Mapping →
          </a>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 40px;">
            Questions? Reply to this email - we read every message.
          </p>
        </div>
      `
    })
    console.log('Welcome email sent to', to)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendNewMessageEmail(to, userName, dialogueTopic, messagePreview, dialogueId) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New message in "${dialogueTopic}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fbbf24;">Someone replied in your dialogue</h2>
          
          <div style="background: #1e293b; border-left: 4px solid #fbbf24; padding: 16px; margin: 20px 0;">
            <div style="color: #fbbf24; font-weight: bold; margin-bottom: 8px;">${userName}:</div>
            <div style="color: #e2e8f0;">${messagePreview}...</div>
          </div>
          
          <p>Topic: <strong>${dialogueTopic}</strong></p>
          
          <a href="${process.env.NEXT_PUBLIC_URL}/dialogues/${dialogueId}" 
             style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            View Dialogue →
          </a>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
            You're receiving this because you're a participant in this dialogue.
            <a href="${process.env.NEXT_PUBLIC_URL}/settings" style="color: #64748b;">Notification settings</a>
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send new message email:', error)
  }
}

export async function sendSynthesisReadyEmail(to, dialogueTopic, dialogueId) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Synthesis ready: "${dialogueTopic}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Consensus Reached!</h2>
          
          <p>Great news! The dialogue "<strong>${dialogueTopic}</strong>" has reached the minimum number of messages and is ready for synthesis.</p>
          
          <p>Our AI has generated a synthesis that captures the common ground found in your conversation.</p>
          
          <a href="${process.env.NEXT_PUBLIC_URL}/verification" 
             style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Review Synthesis →
          </a>
          
          <p style="color: #64748b; font-size: 14px;">
            Your verification helps ensure the synthesis accurately represents the dialogue.
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send synthesis ready email:', error)
  }
}

export async function sendVerificationNeededEmail(to, synthesisId, dialogueTopic) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Please verify synthesis: "${dialogueTopic}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fbbf24;">⚖ Your Input Needed</h2>
          
          <p>A synthesis has been generated for the dialogue "<strong>${dialogueTopic}</strong>" that you participated in.</p>
          
          <p>Please review and verify whether it accurately captures the consensus reached.</p>
          
          <div style="background: #1e293b; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #e2e8f0;">You can:</p>
            <ul style="color: #e2e8f0; margin: 8px 0;">
              <li><span style="color: #10b981;">✓ Endorse</span> - Accurate representation</li>
              <li><span style="color: #fbbf24;">◯ Refine</span> - Needs improvement</li>
              <li><span style="color: #ef4444;">✗ Reject</span> - Doesn't capture consensus</li>
            </ul>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_URL}/verification/${synthesisId}" 
             style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Verify Now →
          </a>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}

export async function sendDailyDigest(to, userName, stats) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your daily Consensus Bridge summary',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fbbf24;">Good morning, ${userName}!</h2>
          
          <p>Here's what happened in your dialogues yesterday:</p>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #60a5fa;">${stats.newMessages}</div>
              <div style="color: #94a3b8; font-size: 14px;">New Messages</div>
            </div>
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #10b981;">${stats.newSyntheses}</div>
              <div style="color: #94a3b8; font-size: 14px;">Syntheses Ready</div>
            </div>
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #fbbf24;">${stats.activeDialogues}</div>
              <div style="color: #94a3b8; font-size: 14px;">Active Dialogues</div>
            </div>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" 
             style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            View Dashboard →
          </a>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_URL}/settings" style="color: #64748b;">Unsubscribe from daily digest</a>
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send daily digest:', error)
  }
}