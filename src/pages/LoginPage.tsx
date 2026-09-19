import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingOverlay, PassCodeDialog } from '../components/Dialogs'
import { Badge, Card, Field, Pill } from '../components/ui'
import { usePortfolio } from '../data/portfolio-context'
import { EMAIL_PATTERN, SITE_VERSION, strings, VALID_PASSWORD_LENGTH } from '../data/strings'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, validatePasscode, fillMasterCredentials, fetchConfig } = usePortfolio()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hidden, setHidden] = useState(true)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)

  useEffect(() => {
    void fetchConfig().catch(() => undefined)
  }, [fetchConfig])

  const allowLogin = EMAIL_PATTERN.test(email) && password.length >= VALID_PASSWORD_LENGTH

  async function submit(nextEmail = email, nextPassword = password) {
    if (!EMAIL_PATTERN.test(nextEmail) || nextPassword.length < VALID_PASSWORD_LENGTH || loading) {
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await login(nextEmail, nextPassword)
      navigate('/home', { replace: true })
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
      setMessage(code.startsWith('auth/') ? strings.authFail : strings.dbFail)
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void submit()
  }

  return (
    <div className="desk-bg min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16">
        <Badge>{strings.heroBadge}</Badge>
        <p className="mb-6 mt-3 text-center font-heading text-4xl font-bold">
          {strings.heroHello} <span className="text-gold">{strings.heroName}</span>
        </p>
        <Card className="p-8 md:p-10">
          <form onSubmit={onSubmit}>
            <h1 className="mb-6 font-heading text-2xl font-bold">{strings.labelLogin}</h1>
            <Field
              label={strings.loginEmail}
              value={email}
              type="email"
              onChange={(event) => {
                const value = event.target.value
                setEmail(value)
                setEmailError(value.length > 0 && !EMAIL_PATTERN.test(value))
              }}
              error={emailError ? strings.loginEmailError : undefined}
            />
            <Field
              label={strings.loginPassword}
              value={password}
              type={hidden ? 'password' : 'text'}
              onChange={(event) => {
                const value = event.target.value
                setPassword(value)
                setPasswordError(value.length > 0 && value.length < VALID_PASSWORD_LENGTH)
              }}
              hint={passwordError ? strings.loginPwdError : strings.loginPasswordHelper}
              trailing={
                <button type="button" onClick={() => setHidden((value) => !value)}>
                  {hidden ? 'Show' : 'Hide'}
                </button>
              }
            />
            {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
            <Pill type="submit" disabled={!allowLogin || loading} className="mt-6 disabled:opacity-40">
              {strings.login.toUpperCase()}
            </Pill>
          </form>
        </Card>
        <div className="mt-8 flex items-end justify-between">
          <p className="text-xs text-nav">{strings.appVersionCaption(SITE_VERSION)}</p>
          <Pill variant="white" className="text-sm" onClick={() => setShowPasscode(true)}>
            {strings.labelMaster.toUpperCase()}
          </Pill>
        </div>
      </div>
      {showPasscode ? (
        <PassCodeDialog
          onDismiss={() => setShowPasscode(false)}
          validatePasscode={validatePasscode}
          onConfirm={() => {
            setShowPasscode(false)
            void fillMasterCredentials().then(({ email: nextEmail, password: nextPassword }) => {
              setEmail(nextEmail)
              setPassword(nextPassword)
              void submit(nextEmail, nextPassword)
            })
          }}
        />
      ) : null}
      <LoadingOverlay visible={loading} />
    </div>
  )
}
