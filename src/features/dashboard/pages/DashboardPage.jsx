/**
 * Dashboard feature: role-based overview (future).
 * Will show different content based on user role when auth is integrated.
 */
export function DashboardPage() {
  return (
    <>
      <div className="background-effects" />
      <main className="container">
        <header className="header">
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Your overview and quick actions. Role-based content coming with authentication.</p>
        </header>
        <section className="card">
          <p style={{ color: 'var(--text-secondary)' }}>
            Dashboard widgets and role-based views will be added when the backend and authentication are integrated.
          </p>
        </section>
      </main>
    </>
  )
}
