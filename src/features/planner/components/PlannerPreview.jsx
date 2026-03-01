export function PlannerPreview({ date, title, activities }) {
  const dateStr = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Select date'
  const displayTitle = title || 'Untitled'
  const hasContent = activities.some((a) => a.desc || a.notes)

  return (
    <div className="planner-preview" id="planner-preview">
      <div className="preview-header">
        <strong>Daily Activity Planner</strong>
        <p className="preview-meta">{dateStr} &nbsp;|&nbsp; {displayTitle}</p>
      </div>
      <div className="preview-details">
        <p><strong>Date:</strong> {date || '-'}</p>
        <p><strong>Title:</strong> {displayTitle}</p>
      </div>
      {hasContent ? (
        <table className="preview-table">
          <thead>
            <tr>
              <th />
              <th>Time</th>
              <th>Activity</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {activities
              .filter((act) => act.desc || act.notes)
              .map((act, i) => (
                <tr key={i} className={act.done ? 'preview-done' : ''}>
                  <td className="preview-check">{act.done ? '☑' : '☐'}</td>
                  <td>{act.time || '-'}</td>
                  <td>{act.desc || '-'}</td>
                  <td>{act.notes || ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p className="preview-empty">Fill in the form to see preview</p>
      )}
    </div>
  )
}
