// app/lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewMessageEmail(to, dialogueTopic, messagePreview) {
  await resend.emails.send({
    from: 'Consensus Bridge <noreply@consensusbridge.com>',
    to,
    subject: `New message in "${dialogueTopic}"`,
    html: `
      <h2>Someone replied in your dialogue</h2>
      <p><strong>${dialogueTopic}</strong></p>
      <p>${messagePreview}...</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/dialogues/${dialogueId}">View dialogue →</a>
    `
  });
}