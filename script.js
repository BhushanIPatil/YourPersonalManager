/**
 * Daily Activity Planner
 * - Dynamic add/remove activity rows
 * - PDF generation (jsPDF)
 * - PDF upload & text extraction (pdf.js)
 * - Parse and autofill form from uploaded PDF
 */

(function () {
  'use strict';

  // Set PDF.js worker (required for pdf.js to work)
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // DOM elements
  const form = document.getElementById('planner-form');
  const activitiesContainer = document.getElementById('activities-container');
  const addActivityBtn = document.getElementById('add-activity');
  const generatePdfBtn = document.getElementById('generate-pdf');
  const uploadZone = document.getElementById('upload-zone');
  const pdfInput = document.getElementById('pdf-input');
  const uploadStatus = document.getElementById('upload-status');

  let activityIndex = 1;

  // Initialize: set default date to today
  function init() {
    const dateInput = document.getElementById('plan-date');
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().slice(0, 10);
      dateInput.value = today;
    }
    updatePreview();
  }

  /**
   * Create a new activity row
   */
  function createActivityRow(index) {
    const row = document.createElement('div');
    row.className = 'activity-row';
    row.dataset.index = index;
    row.innerHTML = `
      <label class="activity-done-wrap">
        <input type="checkbox" class="activity-done" name="activity-done-${index}" aria-label="Mark as completed">
        <span class="checkmark"></span>
      </label>
      <input type="time" class="activity-time" name="activity-time-${index}" value="09:00">
      <input type="text" class="activity-desc" name="activity-desc-${index}" placeholder="Activity description" required>
      <textarea class="activity-notes" name="activity-notes-${index}" placeholder="Notes (optional)" rows="2"></textarea>
      <button type="button" class="btn-remove" data-index="${index}" aria-label="Remove activity">&times;</button>
    `;
    return row;
  }

  /**
   * Add new activity row
   */
  function addActivityRow() {
    const row = createActivityRow(activityIndex);
    activitiesContainer.appendChild(row);
    activityIndex++;

    row.querySelector('.btn-remove').addEventListener('click', removeActivityRow);
    updatePreview();
  }

  /**
   * Remove activity row (keep at least one)
   */
  function removeActivityRow(e) {
    const rows = activitiesContainer.querySelectorAll('.activity-row');
    if (rows.length <= 1) return;

    const btn = e.target.closest('.btn-remove');
    if (btn) {
      const row = btn.closest('.activity-row');
      if (row) row.remove();
      updatePreview();
    }
  }


  /**
   * Collect all activities from the form
   */
  function getActivities() {
    const rows = activitiesContainer.querySelectorAll('.activity-row');
    return Array.from(rows).map((row) => {
      const notesEl = row.querySelector('.activity-notes');
      const doneEl = row.querySelector('.activity-done');
      return {
        time: row.querySelector('.activity-time').value,
        desc: row.querySelector('.activity-desc').value,
        notes: (notesEl && notesEl.value ? notesEl.value : '') || '',
        done: doneEl ? doneEl.checked : false
      };
    });
  }

  /**
   * Generate PDF using jsPDF
   * Uses light backgrounds and dark text for readability
   */
  function generatePDF() {
    const date = document.getElementById('plan-date').value;
    const title = document.getElementById('plan-title').value;
    const activities = getActivities();

    if (!date || !title || activities.length === 0 || !activities[0].desc) {
      alert('Please fill in date, title, and at least one activity.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const colCheck = margin + 3;
    const colTime = margin + 12;
    const colActivity = margin + 38;
    const colNotes = margin + 118;
    const colWidthActivity = 72;
    const colWidthNotes = pageWidth - margin - colNotes;
    const lineHeight = 5;
    let y = 20;

    // Header - light gray background, dark text
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Daily Activity Planner', margin, 22);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Date: ${formatDisplayDate(date)}  |  ${title}`, margin, 30);

    doc.setTextColor(30, 41, 59);
    y = 45;

    // Table header - light cyan, dark text
    doc.setFillColor(224, 242, 254);
    doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('', colCheck, y + 7);
    doc.text('Time', colTime, y + 7);
    doc.text('Activity', colActivity, y + 7);
    doc.text('Notes', colNotes, y + 7);
    doc.setFont(undefined, 'normal');
    y += 12;

    // Table rows with text wrapping
    activities.forEach((act, i) => {
      if (!act.time && !act.desc.trim()) return;

      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);

      const descLines = doc.splitTextToSize(act.desc || '-', colWidthActivity);
      const notesLines = doc.splitTextToSize(act.notes || '', colWidthNotes);
      const rowLines = Math.max(1, descLines.length, notesLines.length);
      const rowHeight = Math.max(10, rowLines * lineHeight + 4);

      // Alternate row background
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 2, pageWidth - 2 * margin, rowHeight, 'F');
      }

      // Draw circle checkbox (Remix Icon style: blank circle / circle with check)
      const cx = colCheck + 3;
      const cy = y + lineHeight - 1;
      const r = 2.2;
      doc.setDrawColor(100, 116, 139);
      doc.circle(cx, cy, r, 'S');
      if (act.done) {
        doc.setFillColor(52, 211, 153);
        doc.setDrawColor(52, 211, 153);
        doc.circle(cx, cy, r, 'FD');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(cx - 1.1, cy, cx - 0.25, cy + 1);
        doc.line(cx - 0.25, cy + 1, cx + 1.3, cy - 1.1);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.2);
      }
      doc.text(act.time || '-', colTime, y + lineHeight);
      doc.text(descLines, colActivity, y + lineHeight);
      doc.text(notesLines, colNotes, y + lineHeight);
      y += rowHeight;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Footer line
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);

    // Store structured data in metadata for PDF upload/edit feature
    doc.setProperties({
      title: `Daily Planner - ${date}`,
      subject: JSON.stringify({ date, title, activities, _v: 1 }),
      creator: 'Daily Activity Planner'
    });

    doc.save(`Daily-Planner-${date}.pdf`);
  }

  function formatDisplayDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  /**
   * Update the live preview panel
   */
  function updatePreview() {
    const preview = document.getElementById('planner-preview');
    if (!preview) return;

    const date = document.getElementById('plan-date')?.value || '';
    const title = document.getElementById('plan-title')?.value || 'Untitled';
    const activities = getActivities();

    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    }) : 'Select date';

    let html = `
      <div class="preview-header">
        <strong>Daily Activity Planner</strong>
        <p class="preview-meta">${dateStr} &nbsp;|&nbsp; ${escapeHtml(title)}</p>
      </div>
      <div class="preview-details">
        <p><strong>Date:</strong> ${escapeHtml(date || '-')}</p>
        <p><strong>Title:</strong> ${escapeHtml(title)}</p>
      </div>
      <table class="preview-table">
        <thead>
          <tr><th></th><th>Time</th><th>Activity</th><th>Notes</th></tr>
        </thead>
        <tbody>
    `;

    activities.forEach((act, i) => {
      if (!act.desc && !act.notes) return;
      const doneClass = act.done ? 'preview-done' : '';
      html += `
        <tr class="${doneClass}">
          <td class="preview-check">${act.done ? '☑' : '☐'}</td>
          <td>${escapeHtml(act.time || '-')}</td>
          <td>${escapeHtml(act.desc || '-')}</td>
          <td>${escapeHtml(act.notes || '')}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    preview.innerHTML = html || '<p class="preview-empty">Fill in the form to see preview</p>';
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Extract planner data from PDF: try metadata first, then text parsing
   */
  async function extractPlannerFromPDF(arrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Try metadata first (PDFs generated by this app store JSON in Subject)
    try {
      const meta = await pdf.getMetadata();
      const subject = meta?.info?.Subject;
      if (subject) {
        const data = JSON.parse(subject);
        if (data._v === 1 && (data.date || data.activities)) {
          return data;
        }
      }
    } catch (_) {
      /* fall through to text extraction */
    }

    // Fallback: extract text and parse (for PDFs without our metadata)
    const text = await extractTextFromPdf(pdf);
    return parsePlannerPDF(text);
  }

  async function extractTextFromPdf(pdf) {
    const numPages = pdf.numPages;
    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => item.str).join(' ') + '\n';
    }
    return fullText;
  }


  /**
   * Parse extracted PDF text and return { date, title, activities }
   * Fallback when metadata is not available
   */
  function parsePlannerPDF(text) {
    const result = { date: '', title: '', activities: [] };

    // Try to extract date - look for "Date: YYYY-MM-DD" or "Date: Mon, Jan 1, 2025"
    const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) ||
      text.match(/Date:\s*([A-Za-z]{3},\s*[A-Za-z]+\s+\d{1,2},\s*\d{4})/i);
    if (dateMatch) {
      const raw = dateMatch[1];
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        result.date = raw;
      } else {
        // Parse "Mon, Jan 1, 2025" to ISO
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          result.date = d.toISOString().slice(0, 10);
        }
      }
    }

    // Extract title - often after "Title:" or in header
    const titleMatch = text.match(/Title:\s*([^\n|]+)/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }

    // Extract activities - look for time pattern (HH:MM or HH:MM AM/PM) followed by activity text
    // Our table has: Time | Activity | Notes
    const lines = text.split(/\n/).filter(Boolean);
    const timeRegex = /^(\d{1,2}:\d{2}(?:\s*[AP]M)?)\s+(.+?)(?:\s{2,}|\t)(.*)$/;
    const simpleTimeRegex = /^(\d{1,2}:\d{2})\s+(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes('Daily Activity Planner') || trimmed.includes('Plan Details') ||
          trimmed === 'Time' || trimmed === 'Activity' || trimmed === 'Notes') continue;

      const match = trimmed.match(timeRegex) || trimmed.match(simpleTimeRegex);
      if (match) {
        let time = match[1];
        let desc = match[2] || '';
        let notes = match[3] || '';

        // Normalize time to HH:MM
        if (time.includes('AM') || time.includes('PM')) {
          const d = new Date('2000-01-01 ' + time);
          if (!isNaN(d.getTime())) {
            time = d.toTimeString().slice(0, 5);
          }
        } else if (time.length === 4) {
          time = '0' + time; // 9:00 -> 09:00
        }

        result.activities.push({ time, desc: desc.trim(), notes: notes.trim() });
      }
    }

    return result;
  }

  /**
   * Autofill form from parsed data
   */
  function autofillForm(data) {
    document.getElementById('plan-date').value = data.date || '';
    document.getElementById('plan-title').value = data.title || '';

    // Clear existing rows and add new ones
    activitiesContainer.innerHTML = '';

    if (data.activities && data.activities.length > 0) {
      data.activities.forEach((act, i) => {
        const row = createActivityRow(i);
        row.querySelector('.activity-time').value = act.time || '09:00';
        row.querySelector('.activity-desc').value = act.desc || '';
        const notesEl = row.querySelector('.activity-notes');
        if (notesEl) notesEl.value = act.notes || '';
        const doneEl = row.querySelector('.activity-done');
        if (doneEl) doneEl.checked = !!act.done;
        activitiesContainer.appendChild(row);
        row.querySelector('.btn-remove').addEventListener('click', removeActivityRow);
      });
      activityIndex = data.activities.length;
    } else {
      const row = createActivityRow(0);
      activitiesContainer.appendChild(row);
      row.querySelector('.btn-remove').addEventListener('click', removeActivityRow);
      activityIndex = 1;
    }

    uploadStatus.textContent = 'Form filled. You can edit and regenerate the PDF.';
    uploadStatus.className = 'upload-status success';
    updatePreview();
  }

  /**
   * Handle PDF file upload
   */
  async function handlePdfUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      uploadStatus.textContent = 'Please select a valid PDF file.';
      uploadStatus.className = 'upload-status error';
      return;
    }

    uploadStatus.textContent = 'Extracting text...';
    uploadStatus.className = 'upload-status';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = await extractPlannerFromPDF(arrayBuffer);
      autofillForm(parsed);
    } catch (err) {
      console.error('PDF parse error:', err);
      uploadStatus.textContent = 'Could not parse PDF. Try a planner PDF generated by this app.';
      uploadStatus.className = 'upload-status error';
    }
  }

  // Event listeners
  addActivityBtn.addEventListener('click', addActivityRow);

  document.getElementById('plan-date')?.addEventListener('input', updatePreview);
  document.getElementById('plan-date')?.addEventListener('change', updatePreview);
  document.getElementById('plan-title')?.addEventListener('input', updatePreview);

  activitiesContainer.addEventListener('input', (e) => {
    if (e.target.closest('.activity-row')) updatePreview();
  });
  activitiesContainer.addEventListener('change', (e) => {
    if (e.target.closest('.activity-row')) updatePreview();
  });
  activitiesContainer.addEventListener('click', (e) => {
    if (e.target.closest('.activity-done')) updatePreview();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    generatePDF();
  });

  activitiesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove')) {
      removeActivityRow(e);
    }
  });

  // Upload zone click
  uploadZone.addEventListener('click', () => pdfInput.click());

  pdfInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
    e.target.value = '';
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) handlePdfUpload(file);
  });

  // Initialize on load
  init();
})();
