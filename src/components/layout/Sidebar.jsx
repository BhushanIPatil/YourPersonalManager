import { Link, useLocation } from 'react-router-dom'
import {
  IconPlanner,
  IconDashboard,
  IconTravel,
  IconProject,
  IconAbout,
  IconContact,
  IconChevronLeft,
  IconChevronRight,
} from './SidebarIcons'

const navItems = [
  { path: '/', label: 'Planner', Icon: IconPlanner },
  { path: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { path: '/travel', label: 'Travel Manager', Icon: IconTravel },
  { path: '/project', label: 'Project Planner', Icon: IconProject },
  { path: '/about', label: 'About', Icon: IconAbout },
  { path: '/contact', label: 'Contact', Icon: IconContact },
]

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Main navigation"
    >
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon" aria-hidden>📋</span>
          <span className="sidebar__brand-text">Daily Planner</span>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__list">
            {navItems.map(({ path, label, Icon }) => {
              const isActive = location.pathname === path
              return (
                <li key={path} className="sidebar__item">
                  <Link
                    to={path}
                    className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    title={collapsed ? label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sidebar__link-indicator" aria-hidden />
                    <span className="sidebar__link-icon">
                      <Icon />
                    </span>
                    <span className="sidebar__link-label">{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="sidebar__toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  )
}
