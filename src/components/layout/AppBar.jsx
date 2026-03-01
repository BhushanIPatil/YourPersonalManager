import { Link } from 'react-router-dom'

export function AppBar({ onMenuClick, sidebarCollapsed }) {
  return (
    <header className="appbar">
      <button
        type="button"
        className="appbar__menu-btn"
        onClick={onMenuClick}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="appbar__menu-icon" />
        <span className="appbar__menu-icon" />
        <span className="appbar__menu-icon" />
      </button>
      <Link to="/" className="appbar__brand" aria-label="Daily Planner - Home">
        <span className="appbar__brand-icon">📋</span>
        <span className="appbar__brand-text">Daily Planner</span>
      </Link>
    </header>
  )
}
