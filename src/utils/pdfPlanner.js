import { jsPDF } from 'jspdf'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker for pdf.js (Vite) - use CDN for reliable worker loading
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
}

export function formatDisplayDate(iso) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Generate PDF using jsPDF
 */
export function generatePDF({ date, title, activities }) {
  if (!date || !title || activities.length === 0 || !activities[0].desc) {
    return false
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const colCheck = margin + 3
  const colTime = margin + 12
  const colActivity = margin + 38
  const colNotes = margin + 118
  const colWidthActivity = 72
  const colWidthNotes = pageWidth - margin - colNotes
  const lineHeight = 5
  let y = 20

  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pageWidth, 35, 'F')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('Daily Activity Planner', margin, 22)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text(`Date: ${formatDisplayDate(date)}  |  ${title}`, margin, 30)

  doc.setTextColor(30, 41, 59)
  y = 45

  doc.setFillColor(224, 242, 254)
  doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.text('', colCheck, y + 7)
  doc.text('Time', colTime, y + 7)
  doc.text('Activity', colActivity, y + 7)
  doc.text('Notes', colNotes, y + 7)
  doc.setFont(undefined, 'normal')
  y += 12

  activities.forEach((act, i) => {
    if (!act.time && !act.desc?.trim()) return

    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59)

    const descLines = doc.splitTextToSize(act.desc || '-', colWidthActivity)
    const notesLines = doc.splitTextToSize(act.notes || '', colWidthNotes)
    const rowLines = Math.max(1, descLines.length, notesLines.length)
    const rowHeight = Math.max(10, rowLines * lineHeight + 4)

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - 2, pageWidth - 2 * margin, rowHeight, 'F')
    }

    const cx = colCheck + 3
    const cy = y + lineHeight - 1
    const r = 2.2
    doc.setDrawColor(100, 116, 139)
    doc.circle(cx, cy, r, 'S')
    if (act.done) {
      doc.setFillColor(52, 211, 153)
      doc.setDrawColor(52, 211, 153)
      doc.circle(cx, cy, r, 'FD')
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.5)
      doc.line(cx - 1.1, cy, cx - 0.25, cy + 1)
      doc.line(cx - 0.25, cy + 1, cx + 1.3, cy - 1.1)
      doc.setDrawColor(30, 41, 59)
      doc.setLineWidth(0.2)
    }
    doc.text(act.time || '-', colTime, y + lineHeight)
    doc.text(descLines, colActivity, y + lineHeight)
    doc.text(notesLines, colNotes, y + lineHeight)
    y += rowHeight

    if (y > 270) {
      doc.addPage()
      y = 20
    }
  })

  y += 10
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)

  doc.setProperties({
    title: `Daily Planner - ${date}`,
    subject: JSON.stringify({ date, title, activities, _v: 1 }),
    creator: 'Daily Activity Planner',
  })

  doc.save(`Daily-Planner-${date}.pdf`)
  return true
}

async function extractTextFromPdf(pdf) {
  const numPages = pdf.numPages
  let fullText = ''
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map((item) => item.str).join(' ') + '\n'
  }
  return fullText
}

function parsePlannerPDF(text) {
  const result = { date: '', title: '', activities: [] }

  const dateMatch =
    text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) ||
    text.match(/Date:\s*([A-Za-z]{3},\s*[A-Za-z]+\s+\d{1,2},\s*\d{4})/i)
  if (dateMatch) {
    const raw = dateMatch[1]
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      result.date = raw
    } else {
      const d = new Date(raw)
      if (!isNaN(d.getTime())) {
        result.date = d.toISOString().slice(0, 10)
      }
    }
  }

  const titleMatch = text.match(/Title:\s*([^\n|]+)/i)
  if (titleMatch) {
    result.title = titleMatch[1].trim()
  }

  const lines = text.split(/\n/).filter(Boolean)
  const timeRegex = /^(\d{1,2}:\d{2}(?:\s*[AP]M)?)\s+(.+?)(?:\s{2,}|\t)(.*)$/
  const simpleTimeRegex = /^(\d{1,2}:\d{2})\s+(.+)$/

  for (const line of lines) {
    const trimmed = line.trim()
    if (
      !trimmed ||
      trimmed.includes('Daily Activity Planner') ||
      trimmed.includes('Plan Details') ||
      trimmed === 'Time' ||
      trimmed === 'Activity' ||
      trimmed === 'Notes'
    ) {
      continue
    }

    const match = trimmed.match(timeRegex) || trimmed.match(simpleTimeRegex)
    if (match) {
      let time = match[1]
      const desc = match[2] || ''
      const notes = match[3] || ''

      if (time.includes('AM') || time.includes('PM')) {
        const d = new Date('2000-01-01 ' + time)
        if (!isNaN(d.getTime())) {
          time = d.toTimeString().slice(0, 5)
        }
      } else if (time.length === 4) {
        time = '0' + time
      }

      result.activities.push({ time, desc: desc.trim(), notes: notes.trim(), done: false })
    }
  }

  return result
}

/**
 * Extract planner data from PDF: metadata first, then text parsing
 */
export async function extractPlannerFromPDF(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  try {
    const meta = await pdf.getMetadata()
    const subject = meta?.info?.Subject
    if (subject) {
      const data = JSON.parse(subject)
      if (data._v === 1 && (data.date || data.activities)) {
        return data
      }
    }
  } catch {
    // fall through to text extraction
  }

  const text = await extractTextFromPdf(pdf)
  return parsePlannerPDF(text)
}
