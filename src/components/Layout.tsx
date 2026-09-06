import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { usePortfolio } from '../data/PortfolioContext'
import { strings } from '../data/strings'
import { TechoDialog } from './Dialogs'
import { SiteFooter, SiteHeader } from './SiteHeader'

export function ProtectedLayout() {
  const { isReady, loginEmail, logout } = usePortfolio()
  const navigate = useNavigate()
  const [askLogout, setAskLogout] = useState(false)

  if (!isReady) return <Navigate to="/login" replace />
  return (
    <div className="desk-bg min-h-dvh">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter email={loginEmail} onLogout={() => setAskLogout(true)} />
      {askLogout ? (
        <TechoDialog
          title={strings.askLogout}
          confirmLabel={strings.confirm}
          onConfirm={() => {
            void logout().then(() => navigate('/login', { replace: true }))
          }}
          dismissLabel={strings.cancel}
          onDismiss={() => setAskLogout(false)}
        />
      ) : null}
    </div>
  )
}
