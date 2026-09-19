import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { LoadingOverlay, TechoDialog } from '../components/Dialogs'
import { usePortfolio } from '../data/PortfolioContext'
import { getFirebase, isFirebaseConfigured } from '../data/firebase'
import { strings } from '../data/strings'
import { publicUrl } from '../lib/format'

export function SplashPage() {
  const navigate = useNavigate()
  const { fetchConfig } = usePortfolio()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        if (!isFirebaseConfigured()) {
          throw new Error('missing-config')
        }
        await signOut(getFirebase().auth)
        await fetchConfig()
        if (!cancelled) {
          await new Promise((resolve) => window.setTimeout(resolve, 800))
          navigate('/login', { replace: true })
        }
      } catch {
        if (!cancelled) {
          setError(
            isFirebaseConfigured() ? strings.firebaseConfigError : strings.missingFirebase,
          )
        }
      }
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [fetchConfig, navigate])

  return (
    <div className="desk-bg flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center">
        <img
          src={publicUrl('/favicon.png')}
          alt=""
          className="h-40 w-40 rounded-2xl bg-white object-contain p-4"
        />
        <LoadingOverlay visible={!error} label={strings.fetchingData} />
      </div>
      {error ? (
        <TechoDialog title={error} confirmLabel={strings.buttonOk} onConfirm={() => navigate('/login')}>
          <p className="text-sm text-ink/80">{strings.missingFirebase}</p>
        </TechoDialog>
      ) : null}
    </div>
  )
}
