import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Planner' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/travel', label: 'Travel Manager' },
  { path: '/project', label: 'Project Planner' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Daily Activity Planner - Home">
          <span className="brand-icon">📋</span>
          <span className="brand-text">Daily Planner</span>
        </Link>
        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
