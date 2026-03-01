import { useState } from 'react'
import { SprintProjectRow, TodayWorkRow } from '../components'
import { useProjectPlanner } from '../hooks/useProjectPlanner'

const TABS = [
  { id: 'sprint', label: 'Sprint planning' },
  { id: 'today', label: "Today's work" },
]

export function ProjectPage() {
  const [activeTab, setActiveTab] = useState('sprint')
  const {
    sprintProjects,
    updateSprintProject,
    addSprintProject,
    removeSprintProject,
    todayItems,
    updateTodayItem,
    addTodayItem,
    removeTodayItem,
  } = useProjectPlanner()

  return (
    <>
      <div className="background-effects" />
      <main className="container">
        <header className="header">
          <h1 className="title">Project Planner</h1>
          <p className="subtitle">
            Plan your sprint and track daily work — multiple projects, tasks, and environments
          </p>
        </header>

        <div className="project-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`project-tab ${activeTab === tab.id ? 'project-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'sprint' && (
          <section className="card project-card">
            <h2 className="project-card__title">Sprint planning</h2>
            <p className="project-card__desc">
              Add project title, sprint number (e.g. Sprint 01), task ID (16577 or CQ-01), branch, changes, and track Dev / QA / Prod.
            </p>
            <div className="project-table-wrap">
              <div className="project-row project-row--head sprint-row">
                <span className="project-input--title">Project title</span>
                <span className="project-input--sprint">Sprint</span>
                <span className="project-input--task">Task</span>
                <span className="project-input--branch">Branch</span>
                <span className="project-input--changes">Changes</span>
                <span className="project-checkboxes">Dev / QA / Prod</span>
                <span className="project-input--note">Note</span>
                <span className="project-row__remove" />
              </div>
              {sprintProjects.map((project) => (
                <SprintProjectRow
                  key={project.id}
                  project={project}
                  onChange={updateSprintProject}
                  onRemove={removeSprintProject}
                  canRemove={sprintProjects.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn btn-add"
              onClick={addSprintProject}
              aria-label="Add project"
            >
              + Add project
            </button>
          </section>
        )}

        {activeTab === 'today' && (
          <section className="card project-card">
            <h2 className="project-card__title">Today&apos;s work</h2>
            <p className="project-card__desc">
              Plan daily work: date, project, task, changes, status, and Dev / QA / Prod deployment flags.
            </p>
            <div className="project-table-wrap">
              <div className="project-row project-row--head today-row">
                <span className="project-input--date">Date</span>
                <span className="project-input--title">Project title</span>
                <span className="project-input--task">Task</span>
                <span className="project-input--changes">Changes</span>
                <span className="project-input--status">Status</span>
                <span className="project-checkboxes">Dev / QA / Prod</span>
                <span className="project-input--note">Note</span>
                <span className="project-row__remove" />
              </div>
              {todayItems.map((item) => (
                <TodayWorkRow
                  key={item.id}
                  item={item}
                  onChange={updateTodayItem}
                  onRemove={removeTodayItem}
                  canRemove={todayItems.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn btn-add"
              onClick={addTodayItem}
              aria-label="Add row"
            >
              + Add row
            </button>
          </section>
        )}
      </main>
    </>
  )
}
