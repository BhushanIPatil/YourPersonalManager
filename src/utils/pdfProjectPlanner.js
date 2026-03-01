import { jsPDF } from 'jspdf'

function formatEnvFlags(develop, qa, prod) {
  const parts = []
  if (develop) parts.push('Develop')
  if (qa) parts.push('QA')
  if (prod) parts.push('Production')
  return parts.length ? parts.join(', ') : '-'
}

/**
 * Group sprint projects by project title + sprint number (each group = one project section)
 */
function groupByProjectAndSprint(projects) {
  const filtered = projects.filter(
    (p) => p.projectTitle?.trim() || p.taskId?.trim() || p.sprintNumber?.trim()
  )
  const groups = new Map()
  filtered.forEach((p) => {
    const key = `${(p.projectTitle || '').trim()}|${(p.sprintNumber || '').trim()}`
    if (!groups.has(key)) groups.set(key, { projectTitle: p.projectTitle || '', sprintNumber: p.sprintNumber || '', tasks: [] })
    groups.get(key).tasks.push(p)
  })
  return Array.from(groups.values())
}

/**
 * Generate PDF for Sprint planning: one section per project/sprint, then a table (Task, Branch, Changes, Dev/QA/Prod full text, Note)
 */
export function generateSprintPlanningPDF(projects) {
  const groups = groupByProjectAndSprint(projects)
  if (groups.length === 0) {
    return false
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  const tableWidth = pageWidth - 2 * margin
  let y = 18

  // Title
  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Project Planner — Sprint planning', margin, 18)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, margin, 25)
  y = 34

  const colW = {
    task: 26,
    branch: 38,
    changes: 42,
    env: 42,
    note: tableWidth - 26 - 38 - 42 - 42,
  }
  const colX = {
    task: margin,
    branch: margin + colW.task,
    changes: margin + colW.task + colW.branch,
    env: margin + colW.task + colW.branch + colW.changes,
    note: margin + colW.task + colW.branch + colW.changes + colW.env,
  }

  const lineH = 6
  const rowMinH = 8

  groups.forEach((group, groupIndex) => {
    if (y > 268) {
      doc.addPage()
      y = 18
    }

    // Project & Sprint info
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 41, 59)
    doc.text(`Project: ${group.projectTitle || '(Untitled)'}`, margin, y + 5)
    y += 8
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`Sprint: ${group.sprintNumber || '-'}`, margin, y + 5)
    y += 10

    // Table header: Task | Branch | Changes | Dev/QA/Prod | Note
    doc.setFillColor(224, 242, 254)
    doc.rect(margin, y, tableWidth, 8, 'F')
    doc.setFont(undefined, 'bold')
    doc.setFontSize(9)
    doc.text('Task', colX.task, y + 5.5)
    doc.text('Branch', colX.branch, y + 5.5)
    doc.text('Changes', colX.changes, y + 5.5)
    doc.text('Develop / QA / Production', colX.env, y + 5.5)
    doc.text('Note', colX.note, y + 5.5)
    doc.setFont(undefined, 'normal')
    y += 9

    group.tasks.forEach((p, i) => {
      if (y > 275) {
        doc.addPage()
        y = 18
      }
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)
      const envText = formatEnvFlags(p.develop, p.qa, p.prod)
      const taskLines = doc.splitTextToSize(p.taskId || '-', colW.task - 2)
      const branchLines = doc.splitTextToSize(p.branch || '-', colW.branch - 2)
      const changesLines = doc.splitTextToSize(p.changes || '-', colW.changes - 2)
      const envLines = doc.splitTextToSize(envText, colW.env - 2)
      const noteLines = doc.splitTextToSize(p.note || '', colW.note - 2)
      const rowLines = Math.max(1, taskLines.length, branchLines.length, changesLines.length, envLines.length, noteLines.length)
      const rowH = Math.max(rowMinH, rowLines * lineH + 4)

      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252)
        doc.rect(margin, y - 1, tableWidth, rowH, 'F')
      }
      doc.text(taskLines, colX.task, y + lineH)
      doc.text(branchLines, colX.branch, y + lineH)
      doc.text(changesLines, colX.changes, y + lineH)
      doc.text(envLines, colX.env, y + lineH)
      doc.text(noteLines, colX.note, y + lineH)
      y += rowH
    })

    y += 12
  })

  doc.setProperties({ title: 'Project Planner - Sprint planning', creator: 'Daily Planner' })
  doc.save(`Project-Planner-Sprint-${new Date().toISOString().slice(0, 10)}.pdf`)
  return true
}

/**
 * Generate PDF for Today's work data
 */
export function generateTodayWorkPDF(items) {
  const filtered = items.filter(
    (i) => i.projectTitle?.trim() || i.taskId?.trim() || i.changes?.trim()
  )
  if (filtered.length === 0) {
    return false
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  const lineHeight = 5
  let y = 18

  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pageWidth, 32, 'F')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text("Project Planner — Today's work", margin, 20)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, margin, 28)
  y = 38

  const colW = {
    date: 22,
    title: 35,
    task: 22,
    changes: 32,
    status: 24,
    flags: 18,
    note: pageWidth - margin * 2 - 22 - 35 - 22 - 32 - 24 - 18,
  }
  const colX = {
    date: margin,
    title: margin + colW.date,
    task: margin + colW.date + colW.title,
    changes: margin + colW.date + colW.title + colW.task,
    status: margin + colW.date + colW.title + colW.task + colW.changes,
    flags: margin + colW.date + colW.title + colW.task + colW.changes + colW.status,
    note: margin + colW.date + colW.title + colW.task + colW.changes + colW.status + colW.flags,
  }

  doc.setFillColor(224, 242, 254)
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(8)
  doc.text('Date', colX.date, y + 5.5)
  doc.text('Project', colX.title, y + 5.5)
  doc.text('Task', colX.task, y + 5.5)
  doc.text('Changes', colX.changes, y + 5.5)
  doc.text('Status', colX.status, y + 5.5)
  doc.text('D/Q/P', colX.flags, y + 5.5)
  doc.text('Note', colX.note, y + 5.5)
  doc.setFont(undefined, 'normal')
  y += 10

  doc.setFontSize(8)
  filtered.forEach((item, i) => {
    if (y > 275) {
      doc.addPage()
      y = 18
    }
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - 1, pageWidth - 2 * margin, 10, 'F')
    }
    doc.setTextColor(30, 41, 59)
    doc.text(item.date || '-', colX.date, y + 5)
    doc.text(doc.splitTextToSize(item.projectTitle || '-', colW.title - 2), colX.title, y + 5)
    doc.text(item.taskId || '-', colX.task, y + 5)
    doc.text(doc.splitTextToSize(item.changes || '-', colW.changes - 2), colX.changes, y + 5)
    doc.text(item.status || '-', colX.status, y + 5)
    const flags = [item.dev ? 'D' : '', item.qa ? 'Q' : '', item.prod ? 'P' : ''].filter(Boolean).join(',') || '-'
    doc.text(flags, colX.flags, y + 5)
    doc.text(doc.splitTextToSize(item.note || '', colW.note - 2), colX.note, y + 5)
    y += 10
  })

  doc.setProperties({ title: "Project Planner - Today's work", creator: 'Daily Planner' })
  doc.save(`Project-Planner-Today-${new Date().toISOString().slice(0, 10)}.pdf`)
  return true
}
