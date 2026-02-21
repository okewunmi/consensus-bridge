'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Brand colors
const COLORS = {
  primary: '#fbbf24', // amber-400
  dark: '#0f172a',    // slate-950
  light: '#e2e8f0',   // slate-200
  muted: '#64748b',   // slate-500
}

// ============================================================================
// 2. EXPORT SYNTHESIS AS PDF
// ============================================================================

export async function exportSynthesisPDF(synthesis, dialogue, verifications = []) {
  const doc = new jsPDF()
  
  // Header
  addHeader(doc, 'Consensus Synthesis Report')
  
  let y = 40
  
  // Title
  doc.setFontSize(18)
  doc.setTextColor(COLORS.dark)
  doc.text('Dialogue Topic:', 20, y)
  y += 7
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  const topicLines = doc.splitTextToSize(dialogue.topic, 170)
  doc.text(topicLines, 20, y)
  y += topicLines.length * 7 + 10
  
  // Metadata
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(COLORS.muted)
  doc.text(`Created: ${new Date(synthesis.created_at).toLocaleDateString()}`, 20, y)
  y += 5
  doc.text(`Participants: ${dialogue.dialogue_participants?.length || 0}`, 20, y)
  y += 5
  doc.text(`Status: ${synthesis.approved ? 'Approved' : 'Pending'}`, 20, y)
  y += 15
  
  // Consensus Statement
  doc.setFontSize(14)
  doc.setTextColor(COLORS.primary)
  doc.text('Consensus Statement', 20, y)
  y += 8
  doc.setFontSize(11)
  doc.setTextColor(COLORS.dark)
  const consensusLines = doc.splitTextToSize(synthesis.consensus_statement, 170)
  doc.text(consensusLines, 20, y)
  y += consensusLines.length * 5 + 10
  
  // Common Ground
  if (synthesis.common_ground && synthesis.common_ground.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(COLORS.primary)
    doc.text('Common Ground', 20, y)
    y += 8
    doc.setFontSize(11)
    doc.setTextColor(COLORS.dark)
    
    synthesis.common_ground.forEach((point, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      const bullet = `${i + 1}. ${point}`
      const lines = doc.splitTextToSize(bullet, 165)
      doc.text(lines, 25, y)
      y += lines.length * 5 + 3
    })
    y += 7
  }
  
  // Open Questions
  if (synthesis.open_questions && synthesis.open_questions.length > 0) {
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    
    doc.setFontSize(14)
    doc.setTextColor(COLORS.primary)
    doc.text('Open Questions', 20, y)
    y += 8
    doc.setFontSize(11)
    doc.setTextColor(COLORS.dark)
    
    synthesis.open_questions.forEach((question, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      const bullet = `${i + 1}. ${question}`
      const lines = doc.splitTextToSize(bullet, 165)
      doc.text(lines, 25, y)
      y += lines.length * 5 + 3
    })
    y += 7
  }
  
  // Verification Stats
  if (verifications.length > 0) {
    if (y > 220) {
      doc.addPage()
      y = 20
    }
    
    const endorsed = verifications.filter(v => v.decision === 'endorse').length
    const refined = verifications.filter(v => v.decision === 'refine').length
    const rejected = verifications.filter(v => v.decision === 'reject').length
    
    doc.setFontSize(14)
    doc.setTextColor(COLORS.primary)
    doc.text('Community Verification', 20, y)
    y += 10
    
    autoTable(doc, {
      startY: y,
      head: [['Decision', 'Count', 'Percentage']],
      body: [
        ['Endorsed', endorsed, `${Math.round(endorsed / verifications.length * 100)}%`],
        ['Needs Refinement', refined, `${Math.round(refined / verifications.length * 100)}%`],
        ['Rejected', rejected, `${Math.round(rejected / verifications.length * 100)}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.dark },
      margin: { left: 20 },
    })
  }
  
  // Footer
  addFooter(doc)
  
  // Save
  doc.save(`consensus-synthesis-${synthesis.id.slice(0, 8)}.pdf`)
  
  // Track export
  await trackExport('synthesis_pdf', dialogue.id, synthesis.id)
}

// ============================================================================
// 3. EXPORT DIALOGUE TRANSCRIPT
// ============================================================================

export async function exportTranscriptPDF(dialogue, messages) {
  const doc = new jsPDF()
  
  // Header
  addHeader(doc, 'Dialogue Transcript')
  
  let y = 40
  
  // Title
  doc.setFontSize(18)
  doc.setTextColor(COLORS.dark)
  doc.text('Dialogue:', 20, y)
  y += 7
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  const topicLines = doc.splitTextToSize(dialogue.topic, 170)
  doc.text(topicLines, 20, y)
  y += topicLines.length * 7 + 10
  
  // Metadata
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(COLORS.muted)
  doc.text(`Created: ${new Date(dialogue.created_at).toLocaleDateString()}`, 20, y)
  y += 5
  doc.text(`Total Messages: ${messages.length}`, 20, y)
  y += 15
  
  // Messages
  doc.setFontSize(12)
  doc.setTextColor(COLORS.primary)
  doc.text('Transcript', 20, y)
  y += 10
  
  messages.forEach((msg, i) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    
    // Speaker
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(msg.is_ai ? COLORS.primary : COLORS.dark)
    const speaker = msg.is_ai ? '⚖ Facilitator' : msg.user_name
    doc.text(speaker, 20, y)
    
    // Timestamp
    doc.setFont(undefined, 'normal')
    doc.setTextColor(COLORS.muted)
    doc.text(new Date(msg.created_at).toLocaleTimeString(), 150, y, { align: 'right' })
    y += 5
    
    // Message content
    doc.setFontSize(10)
    doc.setTextColor(COLORS.dark)
    const contentLines = doc.splitTextToSize(msg.content, 150)
    doc.text(contentLines, 20, y)
    y += contentLines.length * 5 + 8
  })
  
  // Footer
  addFooter(doc)
  
  // Save
  doc.save(`dialogue-transcript-${dialogue.id.slice(0, 8)}.pdf`)
  
  // Track export
  await trackExport('transcript', dialogue.id, null)
}

// ============================================================================
// 4. EXPORT BELIEF PROFILE
// ============================================================================

export async function exportBeliefProfilePDF(user, beliefProfile) {
  const doc = new jsPDF()
  
  // Header
  addHeader(doc, 'Belief Profile')
  
  let y = 40
  
  // User info
  doc.setFontSize(18)
  doc.setTextColor(COLORS.dark)
  doc.text(user.name, 20, y)
  y += 10
  doc.setFontSize(11)
  doc.setTextColor(COLORS.muted)
  doc.text(`Political Orientation: ${user.political_lean}`, 20, y)
  y += 15
  
  // Worldview
  doc.setFontSize(14)
  doc.setTextColor(COLORS.primary)
  doc.text('Worldview', 20, y)
  y += 8
  doc.setFontSize(11)
  doc.setTextColor(COLORS.dark)
  const worldviewLines = doc.splitTextToSize(beliefProfile.worldview, 170)
  doc.text(worldviewLines, 20, y)
  y += worldviewLines.length * 5 + 10
  
  // Core Values
  if (beliefProfile.coreValues && beliefProfile.coreValues.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(COLORS.primary)
    doc.text('Core Values', 20, y)
    y += 8
    doc.setFontSize(11)
    doc.setTextColor(COLORS.dark)
    
    beliefProfile.coreValues.forEach((value, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`• ${value}`, 25, y)
      y += 6
    })
    y += 5
  }
  
  // Common Ground Potential
  if (beliefProfile.commonGround && beliefProfile.commonGround.length > 0) {
    if (y > 240) {
      doc.addPage()
      y = 20
    }
    
    doc.setFontSize(14)
    doc.setTextColor(COLORS.primary)
    doc.text('Common Ground Opportunities', 20, y)
    y += 8
    doc.setFontSize(11)
    doc.setTextColor(COLORS.dark)
    
    beliefProfile.commonGround.forEach((item, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`• ${item}`, 25, y)
      y += 6
    })
  }
  
  // Footer
  addFooter(doc)
  
  // Save
  doc.save(`belief-profile-${user.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  
  // Track export
  await trackExport('belief_profile', null, null)
}

// ============================================================================
// 5. HELPER FUNCTIONS
// ============================================================================

function addHeader(doc, title) {
  // Logo/Icon
  doc.setFillColor(COLORS.primary)
  doc.rect(20, 10, 10, 10, 'F')
  doc.setFontSize(16)
  doc.setTextColor(COLORS.dark)
  doc.text('⬡', 22, 18)
  
  // Title
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Consensus Bridge', 35, 18)
  
  // Subtitle
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(COLORS.muted)
  doc.text(title, 35, 24)
  
  // Line
  doc.setDrawColor(COLORS.muted)
  doc.line(20, 28, 190, 28)
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(COLORS.muted)
    doc.text(
      `Generated by Consensus Bridge • ${new Date().toLocaleDateString()}`,
      105,
      285,
      { align: 'center' }
    )
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
  }
}

async function trackExport(type, dialogueId, synthesisId) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from('exports').insert({
    user_id: user.id,
    export_type: type,
    dialogue_id: dialogueId,
    synthesis_id: synthesisId,
  })
}

// ============================================================================
// 6. EXPORT BUTTON COMPONENTS
// ============================================================================



import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function ExportSynthesisButton({ synthesis, dialogue, verifications }) {
  const [exporting, setExporting] = useState(false)
  
  const handleExport = async () => {
    setExporting(true)
    try {
      await exportSynthesisPDF(synthesis, dialogue, verifications)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF')
    }
    setExporting(false)
  }
  
  return (
    <Button
      onClick={handleExport}
      loading={exporting}
      className="bg-blue-500 hover:bg-blue-600"
    >
      📄 Export PDF
    </Button>
  )
}

export function ExportTranscriptButton({ dialogue, messages }) {
  const [exporting, setExporting] = useState(false)
  
  const handleExport = async () => {
    setExporting(true)
    try {
      await exportTranscriptPDF(dialogue, messages)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export transcript')
    }
    setExporting(false)
  }
  
  return (
    <Button
      onClick={handleExport}
      loading={exporting}
      className="bg-green-500 hover:bg-green-600"
    >
      📝 Export Transcript
    </Button>
  )
}

export function ExportBeliefProfileButton({ user, beliefProfile }) {
  const [exporting, setExporting] = useState(false)
  
  const handleExport = async () => {
    setExporting(true)
    try {
      await exportBeliefProfilePDF(user, beliefProfile)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export profile')
    }
    setExporting(false)
  }
  
  return (
    <Button
      onClick={handleExport}
      loading={exporting}
      className="bg-purple-500 hover:bg-purple-600"
    >
      👤 Export Profile
    </Button>
  )
}