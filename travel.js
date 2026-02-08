/**
 * Travel Manager
 * - Form handling with dynamic rows
 * - Professional PDF generation
 * - PDF upload, extract, edit, regenerate
 */

(function () {
  'use strict';

  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const form = document.getElementById('travel-form');
  const transportContainer = document.getElementById('transport-container');
  const itineraryContainer = document.getElementById('itinerary-container');
  const expensesContainer = document.getElementById('expenses-container');
  const uploadZone = document.getElementById('upload-zone');
  const pdfInput = document.getElementById('pdf-input');
  const uploadStatus = document.getElementById('upload-status');

  function getFormData() {
    const accCost = parseFloat(document.getElementById('accommodation-cost')?.value) || 0;
    const transport = getTransportData();
    const expenses = getExpensesData();
    const transportTotal = transport.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const expensesTotal = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    return {
      tripTitle: document.getElementById('trip-title')?.value || '',
      travelerName: document.getElementById('traveler-name')?.value || '',
      dateFrom: document.getElementById('date-from')?.value || '',
      dateTo: document.getElementById('date-to')?.value || '',
      destination: document.getElementById('destination')?.value || '',
      purpose: document.getElementById('purpose')?.value || 'Business',
      accommodation: {
        name: document.getElementById('accommodation-name')?.value || '',
        address: document.getElementById('accommodation-address')?.value || '',
        checkIn: document.getElementById('check-in')?.value || '',
        checkOut: document.getElementById('check-out')?.value || '',
        nights: document.getElementById('nights')?.value || '',
        cost: accCost,
        paidBy: document.getElementById('accommodation-paidby')?.value || '',
        paidAtDate: document.getElementById('accommodation-paidat-date')?.value || '',
        paidAtTime: document.getElementById('accommodation-paidat-time')?.value || ''
      },
      transport,
      itinerary: getItineraryData(),
      expenses,
      notes: document.getElementById('travel-notes')?.value || '',
      totalBudget: parseFloat(document.getElementById('total-budget')?.value) || 0,
      totalSpent: accCost + transportTotal + expensesTotal
    };
  }

  function getTransportData() {
    return Array.from(transportContainer.querySelectorAll('.transport-row')).map((row) => ({
      type: row.querySelector('.transport-type')?.value || '',
      desc: row.querySelector('.transport-desc')?.value || '',
      amount: row.querySelector('.transport-amount')?.value || '0',
      paidBy: row.querySelector('.transport-paidby')?.value || '',
      paidAtDate: row.querySelector('.transport-paidat-date')?.value || '',
      paidAtTime: row.querySelector('.transport-paidat-time')?.value || ''
    }));
  }

  function getItineraryData() {
    return Array.from(itineraryContainer.querySelectorAll('.itinerary-row')).map((row) => ({
      date: row.querySelector('.itinerary-date')?.value || '',
      activity: row.querySelector('.itinerary-activity')?.value || '',
      notes: row.querySelector('.itinerary-notes')?.value || ''
    }));
  }

  function getExpensesData() {
    return Array.from(expensesContainer.querySelectorAll('.expense-row')).map((row) => ({
      category: row.querySelector('.expense-category')?.value || '',
      desc: row.querySelector('.expense-desc')?.value || '',
      amount: row.querySelector('.expense-amount')?.value || '0',
      date: row.querySelector('.expense-date')?.value || '',
      time: row.querySelector('.expense-time')?.value || '',
      paidBy: row.querySelector('.expense-paidby')?.value || ''
    }));
  }

  function addTransportRow() {
    const today = new Date().toISOString().slice(0, 10);
    const row = document.createElement('div');
    row.className = 'transport-row';
    row.innerHTML = `
      <select class="transport-type">
        <option value="Flight">Flight</option>
        <option value="OwnCar">Own Car</option>
        <option value="Car">Car Rental</option>
        <option value="Rail">Rail</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" class="transport-desc" placeholder="Details">
      <input type="number" class="transport-amount" min="0" step="0.01" placeholder="Amount">
      <input type="text" class="transport-paidby" placeholder="Paid by">
      <input type="date" class="transport-paidat-date" value="${today}">
      <input type="time" class="transport-paidat-time" placeholder="Paid at time">
      <button type="button" class="btn-remove">&times;</button>
    `;
    transportContainer.appendChild(row);
    updateSummary();
  }

  function addItineraryRow() {
    const today = new Date().toISOString().slice(0, 10);
    const row = document.createElement('div');
    row.className = 'itinerary-row';
    row.innerHTML = `
      <input type="date" class="itinerary-date" value="${today}">
      <input type="text" class="itinerary-activity" placeholder="Activity / Plan">
      <textarea class="itinerary-notes" placeholder="Notes" rows="2"></textarea>
      <button type="button" class="btn-remove">&times;</button>
    `;
    itineraryContainer.appendChild(row);
    updateSummary();
  }

  function addExpenseRow() {
    const today = new Date().toISOString().slice(0, 10);
    const row = document.createElement('div');
    row.className = 'expense-row';
    row.innerHTML = `
      <input type="text" class="expense-category" placeholder="Category">
      <input type="text" class="expense-desc" placeholder="Description">
      <input type="number" class="expense-amount" min="0" step="0.01" placeholder="Amount">
      <input type="date" class="expense-date" value="${today}">
      <input type="time" class="expense-time" placeholder="Paid at time">
      <input type="text" class="expense-paidby" placeholder="Paid by">
      <button type="button" class="btn-remove">&times;</button>
    `;
    expensesContainer.appendChild(row);
    updateSummary();
  }

  function updateSummary() {
    const data = getFormData();
    const el = document.getElementById('travel-summary');
    if (!el) return;

    let html = '';
    if (data.tripTitle || data.destination) {
      html += `<div class="summary-section">
        <h3>Trip</h3>
        <p><strong>${escapeHtml(data.tripTitle || '-')}</strong></p>
        <p>${escapeHtml(data.destination || '-')} | ${data.dateFrom || '-'} to ${data.dateTo || '-'}</p>
      </div>`;
    }
    if (data.accommodation.name || data.accommodation.cost) {
      const acc = data.accommodation;
      let accExtra = '';
      if (acc.paidBy || acc.paidAtDate || acc.paidAtTime)
        accExtra = `<p class="summary-meta">Paid by: ${escapeHtml(acc.paidBy || '-')} | ${acc.paidAtDate || '-'} ${acc.paidAtTime || ''}</p>`;
      html += `<div class="summary-section">
        <h3>Accommodation</h3>
        <p>${escapeHtml(acc.name || '-')} - $${acc.cost.toFixed(2)}</p>${accExtra}
      </div>`;
    }
    const hasTransport = data.transport.some((t) => t.type || t.desc || t.amount);
    if (hasTransport) {
      html += `<div class="summary-section">
        <h3>Transport</h3>
        <table class="summary-table"><thead><tr><th>Type</th><th>Details</th><th>Amount</th><th>Paid by</th><th>Paid at</th></tr></thead><tbody>`;
      data.transport.forEach((t) => {
        if (t.type || t.desc || t.amount)
          html += `<tr><td>${escapeHtml(t.type)}</td><td>${escapeHtml(t.desc)}</td><td>$${parseFloat(t.amount || 0).toFixed(2)}</td><td>${escapeHtml(t.paidBy || '-')}</td><td>${t.paidAtDate || '-'} ${t.paidAtTime || ''}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    const hasExp = data.expenses.some((e) => e.category || e.desc || e.amount);
    if (hasExp) {
      html += `<div class="summary-section">
        <h3>Expenses</h3>
        <table class="summary-table">
        <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Time</th><th>Paid by</th></tr></thead>
        <tbody>`;
      data.expenses.forEach((e) => {
        if (e.category || e.desc || e.amount)
          html += `<tr><td>${escapeHtml(e.category)}</td><td>${escapeHtml(e.desc)}</td><td>$${parseFloat(e.amount || 0).toFixed(2)}</td><td>${e.date || '-'}</td><td>${e.time || '-'}</td><td>${escapeHtml(e.paidBy || '-')}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    html += `<div class="summary-section summary-total">
      <p>Total Spent: <strong>$${data.totalSpent.toFixed(2)}</strong></p>
      ${data.totalBudget ? `<p>Budget: $${data.totalBudget.toFixed(2)} | Remaining: $${(data.totalBudget - data.totalSpent).toFixed(2)}</p>` : ''}
    </div>`;
    el.innerHTML = html || '<p style="color:#94a3b8">Fill in the form to see summary</p>';
  }

  function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function generatePDF() {
    const data = getFormData();
    if (!data.tripTitle) {
      alert('Please enter a trip title.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const m = 18;
    let y = 18;
    const lineH = 6;
    const fontColor = [45, 55, 72];
    const lightGray = [148, 163, 184];

    doc.setFont('helvetica');
    doc.setTextColor(...fontColor);

    // Header - minimal professional
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TRAVEL REPORT', m, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(data.tripTitle, m, y);
    y += lineH;
    if (data.travelerName) doc.text(`Traveler: ${data.travelerName}`, m, y), (y += lineH);
    doc.text(`Dates: ${data.dateFrom || '-'} to ${data.dateTo || '-'}`, m, y);
    y += lineH;
    doc.text(`Destination: ${data.destination || '-'}  |  Purpose: ${data.purpose}`, m, y);
    y += 10;

    // Accommodation
    if (data.accommodation.name || data.accommodation.cost) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      doc.text('ACCOMMODATION', m, y);
      y += lineH;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(data.accommodation.name || '-', m, y);
      y += lineH;
      if (data.accommodation.address) doc.text(data.accommodation.address, m, y), (y += lineH);
      doc.text(`Check-in: ${data.accommodation.checkIn || '-'}  Check-out: ${data.accommodation.checkOut || '-'}  Nights: ${data.accommodation.nights || '-'}`, m, y);
      y += lineH;
      doc.text(`Cost: $${data.accommodation.cost.toFixed(2)}`, m, y);
      if (data.accommodation.paidBy || data.accommodation.paidAtDate || data.accommodation.paidAtTime) {
        y += lineH;
        doc.text(`Paid by: ${data.accommodation.paidBy || '-'}  |  Paid at: ${data.accommodation.paidAtDate || '-'} ${data.accommodation.paidAtTime || ''}`, m, y);
      }
      y += 8;
    }

    // Transport
    const hasTransport = data.transport.some((t) => t.type || t.desc || t.amount);
    if (hasTransport) {
      doc.setFont(undefined, 'bold');
      doc.text('TRANSPORT', m, y);
      y += lineH;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text('Type', m, y);
      doc.text('Details', m + 22, y);
      doc.text('Paid by', m + 75, y);
      doc.text('Paid at', m + 105, y);
      doc.text('Amount', pw - m - 20, y, { align: 'right' });
      doc.setFontSize(9);
      y += lineH;
      doc.setDrawColor(220, 220, 220);
      doc.line(m, y - 2, pw - m, y - 2);
      y += 3;
      let transportTotal = 0;
      data.transport.forEach((t) => {
        if (!t.type && !t.desc && !t.amount) return;
        doc.text(t.type || '-', m, y);
        doc.text((t.desc || '-').slice(0, 35), m + 22, y);
        doc.text((t.paidBy || '-').slice(0, 8), m + 75, y);
        doc.text(`${(t.paidAtDate || '-').slice(0, 10)} ${t.paidAtTime || ''}`, m + 105, y);
        const amt = parseFloat(t.amount) || 0;
        transportTotal += amt;
        doc.text(`$${amt.toFixed(2)}`, pw - m - 20, y, { align: 'right' });
        y += lineH;
      });
      doc.text(`Subtotal: $${transportTotal.toFixed(2)}`, pw - m - 20, y, { align: 'right' });
      y += 8;
    }

    // Itinerary
    const hasItinerary = data.itinerary.some((i) => i.date || i.activity || i.notes);
    if (hasItinerary) {
      doc.setFont(undefined, 'bold');
      doc.text('ITINERARY', m, y);
      y += lineH;
      doc.setFont(undefined, 'normal');
      data.itinerary.forEach((i) => {
        if (!i.date && !i.activity && !i.notes) return;
        doc.text(`${i.date || '-'}  ${i.activity || '-'}`, m, y);
        y += lineH;
        if (i.notes) doc.text(`  ${i.notes}`, m + 5, y), (y += lineH);
        if (y > 270) doc.addPage(), (y = 18);
      });
      y += 6;
    }

    // Expenses
    const colExpCat = m;
    const colExpDesc = m + 28;
    const colExpDate = m + 82;
    const colExpTime = m + 102;
    const colExpPaidBy = m + 118;
    const colExpAmount = pw - m - 22;
    const hasExp = data.expenses.some((e) => e.category || e.desc || e.amount);
    if (hasExp) {
      doc.setFont(undefined, 'bold');
      doc.text('EXPENSES', m, y);
      y += lineH;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text('Category', colExpCat, y);
      doc.text('Description', colExpDesc, y);
      doc.text('Date', colExpDate, y);
      doc.text('Time', colExpTime, y);
      doc.text('Paid by', colExpPaidBy, y);
      doc.text('Amount', colExpAmount, y, { align: 'right' });
      doc.setFontSize(9);
      y += lineH;
      doc.setDrawColor(220, 220, 220);
      doc.line(m, y - 2, pw - m, y - 2);
      y += 3;
      let expTotal = 0;
      data.expenses.forEach((e) => {
        if (!e.category && !e.desc && !e.amount) return;
        doc.text((e.category || '-').slice(0, 8), colExpCat, y);
        doc.text((e.desc || '-').slice(0, 22), colExpDesc, y);
        doc.text((e.date || '-').slice(0, 10), colExpDate, y);
        doc.text((e.time || '-').slice(0, 5), colExpTime, y);
        doc.text((e.paidBy || '-').slice(0, 8), colExpPaidBy, y);
        const amt = parseFloat(e.amount) || 0;
        expTotal += amt;
        doc.text(`$${amt.toFixed(2)}`, colExpAmount, y, { align: 'right' });
        y += lineH;
        if (y > 270) doc.addPage(), (y = 18);
      });
      doc.text(`Subtotal: $${expTotal.toFixed(2)}`, colExpAmount, y, { align: 'right' });
      y += 8;
    }

    // Summary
    doc.setDrawColor(200, 200, 200);
    doc.line(m, y, pw - m, y);
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL SPENT: $${data.totalSpent.toFixed(2)}`, m, y);
    if (data.totalBudget) {
      y += lineH;
      doc.setFont(undefined, 'normal');
      doc.text(`Budget: $${data.totalBudget.toFixed(2)}  |  Remaining: $${(data.totalBudget - data.totalSpent).toFixed(2)}`, m, y);
    }
    y += 8;

    if (data.notes) {
      if (y > 250) doc.addPage(), (y = 18);
      doc.setFont(undefined, 'bold');
      doc.text('NOTES', m, y);
      y += lineH;
      doc.setFont(undefined, 'normal');
      const noteLines = doc.splitTextToSize(data.notes, pw - 2 * m);
      doc.text(noteLines, m, y);
    }

    doc.setProperties({
      title: `Travel Report - ${data.tripTitle}`,
      subject: JSON.stringify({ ...data, _v: 1, _type: 'travel' }),
      creator: 'Travel Manager'
    });

    doc.save(`Travel-Report-${(data.tripTitle || 'trip').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
  }

  async function extractTravelFromPDF(arrayBuffer) {
    const task = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await task.promise;
    try {
      const meta = await pdf.getMetadata();
      const sub = meta?.info?.Subject;
      if (sub) {
        const d = JSON.parse(sub);
        if (d._v === 1 && d._type === 'travel') return d;
      }
    } catch (_) {}
    return null;
  }

  function autofillForm(data) {
    document.getElementById('trip-title').value = data.tripTitle || '';
    document.getElementById('traveler-name').value = data.travelerName || '';
    document.getElementById('date-from').value = data.dateFrom || '';
    document.getElementById('date-to').value = data.dateTo || '';
    document.getElementById('destination').value = data.destination || '';
    document.getElementById('purpose').value = data.purpose || 'Business';

    const acc = data.accommodation || {};
    document.getElementById('accommodation-name').value = acc.name || '';
    document.getElementById('accommodation-address').value = acc.address || '';
    document.getElementById('check-in').value = acc.checkIn || '';
    document.getElementById('check-out').value = acc.checkOut || '';
    document.getElementById('nights').value = acc.nights || '';
    document.getElementById('accommodation-cost').value = acc.cost ?? '';
    const accPaidBy = document.getElementById('accommodation-paidby');
    const accPaidAtDate = document.getElementById('accommodation-paidat-date');
    const accPaidAtTime = document.getElementById('accommodation-paidat-time');
    if (accPaidBy) accPaidBy.value = acc.paidBy || '';
    if (accPaidAtDate) accPaidAtDate.value = acc.paidAtDate || '';
    if (accPaidAtTime) accPaidAtTime.value = acc.paidAtTime || '';

    transportContainer.innerHTML = '';
    (data.transport || []).forEach((t) => {
      addTransportRow();
      const rows = transportContainer.querySelectorAll('.transport-row');
      const r = rows[rows.length - 1];
      if (r) {
        r.querySelector('.transport-type').value = t.type || 'Flight';
        r.querySelector('.transport-desc').value = t.desc || '';
        r.querySelector('.transport-amount').value = t.amount || '';
        const pb = r.querySelector('.transport-paidby');
        const pd = r.querySelector('.transport-paidat-date');
        const pt = r.querySelector('.transport-paidat-time');
        if (pb) pb.value = t.paidBy || '';
        if (pd) pd.value = t.paidAtDate || '';
        if (pt) pt.value = t.paidAtTime || '';
      }
    });
    if (!(data.transport || []).length) {
      addTransportRow();
    }

    itineraryContainer.innerHTML = '';
    (data.itinerary || []).forEach((i) => {
      addItineraryRow();
      const rows = itineraryContainer.querySelectorAll('.itinerary-row');
      const r = rows[rows.length - 1];
      if (r) {
        r.querySelector('.itinerary-date').value = i.date || '';
        r.querySelector('.itinerary-activity').value = i.activity || '';
        r.querySelector('.itinerary-notes').value = i.notes || '';
      }
    });
    if (!(data.itinerary || []).length) {
      addItineraryRow();
    }

    expensesContainer.innerHTML = '';
    (data.expenses || []).forEach((e) => {
      addExpenseRow();
      const rows = expensesContainer.querySelectorAll('.expense-row');
      const r = rows[rows.length - 1];
      if (r) {
        r.querySelector('.expense-category').value = e.category || '';
        r.querySelector('.expense-desc').value = e.desc || '';
        r.querySelector('.expense-amount').value = e.amount || '';
        r.querySelector('.expense-date').value = e.date || '';
        const timeEl = r.querySelector('.expense-time');
        if (timeEl) timeEl.value = e.time || '';
        const paidByEl = r.querySelector('.expense-paidby');
        if (paidByEl) paidByEl.value = e.paidBy || '';
      }
    });
    if (!(data.expenses || []).length) {
      addExpenseRow();
    }

    document.getElementById('travel-notes').value = data.notes || '';
    document.getElementById('total-budget').value = data.totalBudget || '';

    uploadStatus.textContent = 'Form filled. Edit and regenerate PDF.';
    uploadStatus.className = 'upload-status success';
    updateSummary();
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
      const data = await extractTravelFromPDF(buf);
      if (data) autofillForm(data);
      else {
        uploadStatus.textContent = 'Could not parse PDF. Use a travel PDF from this app.';
        uploadStatus.className = 'upload-status error';
      }
    } catch (e) {
      uploadStatus.textContent = 'Error reading PDF.';
      uploadStatus.className = 'upload-status error';
    }
  }

  function init() {
    const today = new Date().toISOString().slice(0, 10);
    const dfrom = document.getElementById('date-from');
    const dto = document.getElementById('date-to');
    if (dfrom && !dfrom.value) dfrom.value = today;
    if (dto && !dto.value) dto.value = today;
    document.querySelectorAll('.itinerary-date').forEach((el) => { if (!el.value) el.value = today; });
    document.querySelectorAll('.expense-date').forEach((el) => { if (!el.value) el.value = today; });
    const accPaidAt = document.getElementById('accommodation-paidat-date');
    if (accPaidAt && !accPaidAt.value) accPaidAt.value = today;
    document.querySelectorAll('.transport-paidat-date').forEach((el) => { if (!el.value) el.value = today; });
    updateSummary();
  }

  document.getElementById('add-transport').addEventListener('click', addTransportRow);
  document.getElementById('add-itinerary').addEventListener('click', addItineraryRow);
  document.getElementById('add-expense').addEventListener('click', addExpenseRow);

  transportContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove') && transportContainer.querySelectorAll('.transport-row').length > 1)
      e.target.closest('.transport-row')?.remove();
    updateSummary();
  });
  itineraryContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove') && itineraryContainer.querySelectorAll('.itinerary-row').length > 1)
      e.target.closest('.itinerary-row')?.remove();
    updateSummary();
  });
  expensesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove') && expensesContainer.querySelectorAll('.expense-row').length > 1)
      e.target.closest('.expense-row')?.remove();
    updateSummary();
  });

  form.addEventListener('submit', (e) => { e.preventDefault(); generatePDF(); });

  ['input', 'change'].forEach((ev) => {
    form.addEventListener(ev, () => updateSummary());
  });

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

  init();
})();
