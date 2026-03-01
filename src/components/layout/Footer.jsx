import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="brand-icon">📋</span>
              <span>Daily Planner</span>
            </Link>
            <p className="footer-tagline">Plan your day. Export to PDF. Stay productive.</p>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><Link to="/">Planner</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/travel">Travel Manager</Link></li>
              <li><Link to="/project">Project Planner</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {year} Daily Activity Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
