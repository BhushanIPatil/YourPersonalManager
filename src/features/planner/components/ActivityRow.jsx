export function ActivityRow({ index, activity, onChange, onRemove, canRemove }) {
  const { time, desc, notes, done } = activity

  const handleChange = (field, value) => {
    onChange(index, { ...activity, [field]: value })
  }

  return (
    <div className="activity-row" data-index={index}>
      <label className="activity-done-wrap">
        <input
          type="checkbox"
          className="activity-done"
          name={`activity-done-${index}`}
          aria-label="Mark as completed"
          checked={done}
          onChange={(e) => handleChange('done', e.target.checked)}
        />
        <span className="checkmark" />
      </label>
      <input
        type="time"
        className="activity-time"
        name={`activity-time-${index}`}
        value={time}
        onChange={(e) => handleChange('time', e.target.value)}
      />
      <input
        type="text"
        className="activity-desc"
        name={`activity-desc-${index}`}
        placeholder="Activity description"
        value={desc}
        onChange={(e) => handleChange('desc', e.target.value)}
        required
      />
      <textarea
        className="activity-notes"
        name={`activity-notes-${index}`}
        placeholder="Notes (optional)"
        rows={2}
        value={notes}
        onChange={(e) => handleChange('notes', e.target.value)}
      />
      <button
        type="button"
        className="btn-remove"
        data-index={index}
        aria-label="Remove activity"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
      >
        &times;
      </button>
    </div>
  )
}
