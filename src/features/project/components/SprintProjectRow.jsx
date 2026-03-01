export function SprintProjectRow({ project, onChange, onRemove, canRemove }) {
  const handleChange = (field, value) => {
    onChange(project.id, { [field]: value })
  }

  return (
    <div className="project-row sprint-row">
      <input
        type="text"
        className="project-input project-input--title"
        placeholder="Project title"
        value={project.projectTitle}
        onChange={(e) => handleChange('projectTitle', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--sprint"
        placeholder="Sprint 01"
        value={project.sprintNumber}
        onChange={(e) => handleChange('sprintNumber', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--task"
        placeholder="16577 or CQ-01"
        value={project.taskId}
        onChange={(e) => handleChange('taskId', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--branch"
        placeholder="Branch"
        value={project.branch}
        onChange={(e) => handleChange('branch', e.target.value)}
      />
      <input
        type="text"
        className="project-input project-input--changes"
        placeholder="Changes"
        value={project.changes}
        onChange={(e) => handleChange('changes', e.target.value)}
      />
      <div className="project-checkboxes">
        <label className="project-check">
          <input
            type="checkbox"
            checked={project.develop}
            onChange={(e) => handleChange('develop', e.target.checked)}
          />
          <span>Dev</span>
        </label>
        <label className="project-check">
          <input
            type="checkbox"
            checked={project.qa}
            onChange={(e) => handleChange('qa', e.target.checked)}
          />
          <span>QA</span>
        </label>
        <label className="project-check">
          <input
            type="checkbox"
            checked={project.prod}
            onChange={(e) => handleChange('prod', e.target.checked)}
          />
          <span>Prod</span>
        </label>
      </div>
      <input
        type="text"
        className="project-input project-input--note"
        placeholder="Note"
        value={project.note}
        onChange={(e) => handleChange('note', e.target.value)}
      />
      <button
        type="button"
        className="btn-remove"
        onClick={() => onRemove(project.id)}
        disabled={!canRemove}
        aria-label="Remove project"
      >
        &times;
      </button>
    </div>
  )
}
