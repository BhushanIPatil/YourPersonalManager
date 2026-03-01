import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AppBar } from './AppBar'
import { Footer } from './Footer'

/**
 * Main app layout: fixed sidebar + main area (AppBar, content, Footer).
 */
export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  return (
    <div className={`layout-wrapper ${sidebarCollapsed ? 'layout-wrapper--sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className="main-content">
        <AppBar onMenuClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        <div className="main-content__body">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  )
}
