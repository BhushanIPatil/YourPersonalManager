/**
 * Project Planner
 * - Project name, work items, status, task ID, work done record
 * - PDF generation
 * - PDF upload, extract, edit, regenerate
 */

(function () {
  'use strict';

  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const form = document.getElementById('project-form');
  const tasksContainer = document.getElementById('tasks-container');
  const uploadZone = document.getElementById('upload-zone');
  const pdfInput = document.getElementById('pdf-input');
  const uploadStatus = document.getElementById('upload-status');

  function getFormData() {
    const tasks = Array.from(tasksContainer.querySelectorAll('.task-row')).map((row) => ({
      taskId: row.querySelector('.task-id')?.value || '',
      work: row.querySelector('.task-work')?.value || '',
      status: row.querySelector('.task-status')?.value || 'Not Started',
      record: row.querySelector('.task-record')?.value || ''
    }));

    return {
      projectName: document.getElementById('project-name')?.value || '',
      tasks
    };
  }

  function addTaskRow() {
    const row = document.createElement('div');
    row.className = 'task-row';
    row.innerHTML = `
      <input type="text" class="task-id" placeholder="Task ID">
      <input type="text" class="task-work" placeholder="Project work description" required>
      <select class="task-status">
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="On Hold">On Hold</option>
      </select>
      <textarea class="task-record" placeholder="Work done record" rows="2"></textarea>
      <button type="button" class="btn-remove">&times;</button>
    `;
    tasksContainer.appendChild(row);
    updatePreview();
  }

  function updatePreview() {
    const data = getFormData();
    const el = document.getElementById('project-preview');
    if (!el) return;

    let html = '';
    if (data.projectName) {
      html += `<div class="preview-section">
        <h3>Project</h3>
        <p><strong>${escapeHtml(data.projectName)}</strong></p>
      </div>`;
    }

    const hasTasks = data.tasks.some((t) => t.taskId || t.work || t.status || t.record);
    if (hasTasks) {
      html += `<div class="preview-section">
        <h3>Tasks</h3>
        <table class="preview-table">
          <thead><tr><th>ID</th><th>Work</th><th>Status</th></tr></thead>
          <tbody>`;
      data.tasks.forEach((t) => {
        if (t.taskId || t.work || t.status || t.record) {
          html += `<tr>
            <td>${escapeHtml(t.taskId || '-')}</td>
            <td>${escapeHtml(t.work || '-')}</td>
            <td>${escapeHtml(t.status || '-')}</td>
          </tr>`;
          if (t.record) html += `<tr><td colspan="3" style="font-size:0.7rem;color:#64748b">Record: ${escapeHtml(t.record)}</td></tr>`;
        }
      });
      html += `</tbody></table></div>`;
    }

    el.innerHTML = html || '<p style="color:#94a3b8">Fill in the form to see preview</p>';
  }

  function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function generatePDF() {
    const data = getFormData();
    if (!data.projectName) {
      alert('Please enter a project name.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const m = 18;
    let y = 18;
    const lineH = 6;
    const fontColor = [45, 55, 72];

    doc.setFont('helvetica');
    doc.setTextColor(...fontColor);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PROJECT REPORT', m, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(data.projectName, m, y);
    y += 10;

    const colTaskId = m;
    const colWork = m + 32;
    const colStatus = m + 108;
    const colRecord = m + 138;
    const workWidth = 72;
    const recordWidth = pw - colRecord - m;

    const hasTasks = data.tasks.some((t) => t.taskId || t.work || t.status || t.record);
    if (hasTasks) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      doc.text('TASK ID', colTaskId, y);
      doc.text('PROJECT WORK', colWork, y);
      doc.text('STATUS', colStatus, y);
      doc.text('WORK DONE RECORD', colRecord, y);
      y += lineH;

      doc.setDrawColor(220, 220, 220);
      doc.line(m, y - 2, pw - m, y - 2);
      y += 4;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);

      data.tasks.forEach((t) => {
        if (!t.taskId && !t.work && !t.status && !t.record) return;

        const workLines = doc.splitTextToSize(t.work || '-', workWidth);
        const recordLines = doc.splitTextToSize(t.record || '-', recordWidth);
        const cellLines = Math.max(workLines.length, recordLines.length, 1);
        const cellH = cellLines * lineH + 2;

        doc.text(t.taskId || '-', colTaskId, y + 3);
        doc.text(workLines, colWork, y + 3);
        doc.text(t.status || '-', colStatus, y + 3);
        doc.text(recordLines, colRecord, y + 3);
        y += cellH;

        if (y > 270) {
          doc.addPage();
          y = 18;
        }
      });
    }

    doc.setProperties({
      title: `Project - ${data.projectName}`,
      subject: JSON.stringify({ ...data, _v: 1, _type: 'project' }),
      creator: 'Project Planner'
    });

    doc.save(`Project-${(data.projectName || 'project').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
  }

  async function extractProjectFromPDF(arrayBuffer) {
    const task = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await task.promise;
    try {
      const meta = await pdf.getMetadata();
      const sub = meta?.info?.Subject;
      if (sub) {
        const d = JSON.parse(sub);
        if (d._v === 1 && d._type === 'project') return d;
      }
    } catch (_) {}
    return null;
  }

  function autofillForm(data) {
    document.getElementById('project-name').value = data.projectName || '';

    tasksContainer.innerHTML = '';
    (data.tasks || []).forEach((t) => {
      addTaskRow();
      const rows = tasksContainer.querySelectorAll('.task-row');
      const r = rows[rows.length - 1];
      if (r) {
        r.querySelector('.task-id').value = t.taskId || '';
        r.querySelector('.task-work').value = t.work || '';
        r.querySelector('.task-status').value = t.status || 'Not Started';
        const rec = r.querySelector('.task-record');
        if (rec) rec.value = t.record || '';
      }
    });
    if (!(data.tasks || []).length) addTaskRow();

    uploadStatus.textContent = 'Form filled. Edit and regenerate PDF.';
    uploadStatus.className = 'upload-status success';
    updatePreview();
  }

  async function handlePdfUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      uploadStatus.textContent = 'Please select a valid PDF file.';
      uploadStatus.className = 'upload-status error';
      return;
    }
    uploadStatus.textContent = 'Extracting...';
    uploadStatus.className = 'upload-status';
    try {
      const buf = await file.arrayBuffer();
      const data = await extractProjectFromPDF(buf);
      if (data) autofillForm(data);
      else {
        uploadStatus.textContent = 'Could not parse PDF. Use a project PDF from this app.';
        uploadStatus.className = 'upload-status error';
      }
    } catch (e) {
      uploadStatus.textContent = 'Error reading PDF.';
      uploadStatus.className = 'upload-status error';
    }
  }

  document.getElementById('add-task').addEventListener('click', addTaskRow);

  tasksContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove') && tasksContainer.querySelectorAll('.task-row').length > 1) {
      e.target.closest('.task-row')?.remove();
      updatePreview();
    }
  });

  form.addEventListener('submit', (e) => { e.preventDefault(); generatePDF(); });

  ['input', 'change'].forEach((ev) => form.addEventListener(ev, () => updatePreview()));

  uploadZone.addEventListener('click', () => pdfInput.click());
  pdfInput.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (f) handlePdfUpload(f);
    e.target.value = '';
  });
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const f = e.dataTransfer?.files?.[0];
    if (f) handlePdfUpload(f);
  });

  updatePreview();
})();
