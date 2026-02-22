// app/api/send-email/route.js
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create transporter (server-side only)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || 'Consensus Bridge <fourfivelabs@gmail.com>'

// Helper functions (NOT exported - only for use in this file)
async function sendWelcomeEmailInternal(to, name) {
  await transporter.sendMail({
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
}

async function sendNewMessageEmailInternal(to, userName, dialogueTopic, messagePreview, dialogueId) {
  await transporter.sendMail({
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
}

async function sendSynthesisReadyEmailInternal(to, dialogueTopic, dialogueId) {
  await transporter.sendMail({
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
}

async function sendVerificationNeededEmailInternal(to, synthesisId, dialogueTopic) {
  await transporter.sendMail({
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
}

// ✅ ONLY export the POST handler - this is what Next.js expects
export async function POST(request) {
  try {
    const body = await request.json()
    const { type, ...params } = body

    switch (type) {
      case 'welcome':
        await sendWelcomeEmailInternal(params.to, params.name)
        break
      
      case 'new-message':
        await sendNewMessageEmailInternal(
          params.to,
          params.userName,
          params.dialogueTopic,
          params.messagePreview,
          params.dialogueId
        )
        break
      
      case 'synthesis-ready':
        await sendSynthesisReadyEmailInternal(
          params.to,
          params.dialogueTopic,
          params.dialogueId
        )
        break
      
      case 'verification-needed':
        await sendVerificationNeededEmailInternal(
          params.to,
          params.synthesisId,
          params.dialogueTopic
        )
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}