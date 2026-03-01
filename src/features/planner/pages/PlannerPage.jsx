import { ActivityRow, UploadSection, PlannerPreview } from '../components'
import { usePlannerForm } from '../hooks/usePlannerForm'

export function PlannerPage() {
  const {
    planDate,
    setPlanDate,
    planTitle,
    setPlanTitle,
    activities,
    updateActivity,
    addActivity,
    removeActivity,
    handleGeneratePDF,
    handlePdfUpload,
  } = usePlannerForm()

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = handleGeneratePDF()
    if (!ok) {
      alert('Please fill in date, title, and at least one activity.')
    }
  }

  return (
    <>
      <div className="background-effects" />
      <main className="container">
        <header className="header">
          <h1 className="title">Daily Activity Planner</h1>
          <p className="subtitle">Plan your day, export to PDF, or edit existing plans</p>
        </header>

        <div className="two-column-layout">
          <div className="left-column">
            <section className="card planner-card">
              <form id="planner-form" className="planner-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="plan-date">Date</label>
                  <input
                    type="date"
                    id="plan-date"
                    name="plan-date"
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="plan-title">Title</label>
                  <input
                    type="text"
                    id="plan-title"
                    name="plan-title"
                    placeholder="e.g. My Daily Plan"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="activities-section">
                  <div className="section-header">
                    <h2>Activities</h2>
                  </div>

                  <div id="activities-container">
                    {activities.map((activity, index) => (
                      <ActivityRow
                        key={index}
                        index={index}
                        activity={activity}
                        onChange={updateActivity}
                        onRemove={removeActivity}
                        canRemove={activities.length > 1}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    id="add-activity"
                    className="btn btn-add"
                    aria-label="Add activity"
                    onClick={addActivity}
                  >
                    <span>+ Add Activity</span>
                  </button>
                </div>

                <div className="actions">
                  <button type="submit" id="generate-pdf" className="btn btn-primary">
                    Generate & Download PDF
                  </button>
                </div>
              </form>
            </section>

            <UploadSection onUploadSuccess={handlePdfUpload} />
          </div>

          <aside className="right-column card preview-card">
            <h2>Preview</h2>
            <PlannerPreview date={planDate} title={planTitle} activities={activities} />
          </aside>
        </div>
      </main>
    </>
  )
}
