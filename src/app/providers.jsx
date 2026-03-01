import { BrowserRouter } from 'react-router-dom'
// Future: AuthProvider, ThemeProvider, QueryClientProvider, etc.

/**
 * Compose all app-level providers.
 * Add AuthProvider, theme, state management here when integrating backend.
 */
export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      {/* Future: <AuthProvider>, <QueryClientProvider>, <ThemeProvider> */}
      {children}
    </BrowserRouter>
  )
}
