const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'Blocked', 'Review']

export function TodayWorkRow({ item, onChange, onRemove, canRemove }) {
  const handleChange = (field, value) => {
    onChange(item.id, { [field]: value })
  }

  return (
    <div className="project-row today-row">
      <input
        type="date"
        className="project-input project-input--date"
        value={item.date}
        onChange={(e) => handleChange('date', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--title"
        placeholder="Project title"
        value={item.projectTitle}
        onChange={(e) => handleChange('projectTitle', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--task"
        placeholder="Task (e.g. 16577, CQ-01)"
        value={item.taskId}
        onChange={(e) => handleChange('taskId', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--changes"
        placeholder="Changes"
        value={item.changes}
        onChange={(e) => handleChange('changes', e.target.value)}
      />
      <select
        className="project-input project-input--status"
        value={item.status}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="project-checkboxes">
        <label className="project-check">
          <input
            type="checkbox"
            checked={item.dev}
            onChange={(e) => handleChange('dev', e.target.checked)}
          />
          <span>Dev</span>
        </label>
        <label className="project-check">
          <input
            type="checkbox"
            checked={item.qa}
            onChange={(e) => handleChange('qa', e.target.checked)}
          />
          <span>QA</span>
        </label>
        <label className="project-check">
          <input
            type="checkbox"
            checked={item.prod}
            onChange={(e) => handleChange('prod', e.target.checked)}
          />
          <span>Prod</span>
        </label>
      </div>
      <input
        type="text"
        className="project-input project-input--note"
        placeholder="Note"
        value={item.note}
        onChange={(e) => handleChange('note', e.target.value)}
      />
      <button
        type="button"
        className="btn-remove"
        onClick={() => onRemove(item.id)}
        disabled={!canRemove}
        aria-label="Remove row"
      >
        &times;
      </button>
    </div>
  )
}
