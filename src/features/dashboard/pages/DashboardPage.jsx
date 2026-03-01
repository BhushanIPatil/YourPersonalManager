import { Link } from 'react-router-dom'

const overviewCards = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Application overview, quick links, and at-a-glance summary of your planning tools.',
    icon: '📊',
  },
  {
    path: '/project',
    title: 'Project Planner',
    description: 'Plan sprints and daily work: project title, sprint number, task IDs, branch, changes, and Dev / QA / Prod tracking.',
    icon: '📁',
  },
  {
    path: '/',
    title: 'Planner',
    description: 'Daily activity planner. Add activities with time and notes, export to PDF, or upload and edit existing planner PDFs.',
    icon: '📋',
  },
  {
    path: '/travel',
    title: 'Travel Manager',
    description: 'Manage travel plans and itineraries. (Coming soon)',
    icon: '✈️',
  },
  {
    path: '/about',
    title: 'About',
    description: 'Learn more about Daily Planner and how we help you stay productive.',
    icon: 'ℹ️',
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Get in touch for support or feedback.',
    icon: '✉️',
  },
]

export function DashboardPage() {
  return (
    <>
      <div className="background-effects" />
      <main className="container">
        <header className="header">
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Overview of your planning tools and quick access to all sections</p>
        </header>

        <section className="dashboard-overview">
          <p className="dashboard-overview__intro">
            Daily Planner helps you plan your day, manage project sprints, and track work across Dev, QA, and Prod. Use the cards below to jump to any section.
          </p>
          <div className="dashboard-grid">
            {overviewCards.map((card) => (
              <Link
                key={card.path}
                to={card.path}
                className="dashboard-card"
              >
                <span className="dashboard-card__icon" aria-hidden>{card.icon}</span>
                <h3 className="dashboard-card__title">{card.title}</h3>
                <p className="dashboard-card__desc">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
