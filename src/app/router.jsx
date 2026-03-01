import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { PlannerPage } from '../features/planner'
import { DashboardPage } from '../features/dashboard'
import { ProjectPage } from '../features/project'
import { PlaceholderPage } from '../pages/PlaceholderPage'

/**
 * Central route configuration.
 * Add protected routes and role-based redirects when auth is integrated.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PlannerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/:page" element={<PlaceholderPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
