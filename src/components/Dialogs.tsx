import { useState, type FormEvent, type ReactNode } from 'react'
import { Card, Field, Heading, Overlay, TechoButton, TextButton } from './ui'

export function TechoDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  dismissLabel,
  onDismiss,
  onClose,
}: {
  title?: string
  children?: ReactNode
  confirmLabel: string
  onConfirm: () => void
  dismissLabel?: string
  onDismiss?: () => void
  onClose?: () => void
}) {
  return (
    <Overlay>
      <Card className="card-dialog">
        {title ? <Heading as="h2" size="dialog" className="mb-3">{title}</Heading> : null}
        {children}
        <div className="mt-4 flex justify-end gap-3">
          {dismissLabel && onDismiss ? (
            <TextButton onClick={onDismiss}>{dismissLabel}</TextButton>
          ) : null}
          <TextButton onClick={onConfirm}>{confirmLabel}</TextButton>
        </div>
        {onClose ? (
          <button type="button" className="sr-only" onClick={onClose}>
            Close
          </button>
        ) : null}
      </Card>
    </Overlay>
  )
}

export function PassCodeDialog({
  onDismiss,
  onConfirm,
  validatePasscode,
}: {
  onDismiss: () => void
  onConfirm: () => void
  validatePasscode: (value: string) => Promise<boolean> | boolean
}) {
  const [passcode, setPasscode] = useState('')
  const [hidden, setHidden] = useState(true)
  const [error, setError] = useState(false)
  const [configError, setConfigError] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(false)
    setConfigError(false)
    try {
      const ok = await validatePasscode(passcode)
      setError(!ok)
      if (ok) onConfirm()
    } catch {
      setConfigError(true)
    }
  }

  return (
    <Overlay>
      <Card className="card-dialog">
        <form onSubmit={submit}>
          <Heading as="h2" size="dialog" className="mb-4">Enter Pass Code for master login</Heading>
          <Field
            label="PassCode"
            value={passcode}
            maxLength={6}
            onChange={(event) => {
              setError(false)
              setConfigError(false)
              setPasscode(event.target.value)
            }}
            type={hidden ? 'password' : 'text'}
            error={error ? 'Incorrect PassCode' : configError ? 'Cannot Retrieve Config Data' : undefined}
            trailing={
              <button type="button" onClick={() => setHidden((value) => !value)}>
                {hidden ? 'Show' : 'Hide'}
              </button>
            }
          />
          <div className="mt-5 flex justify-end gap-3">
            <TechoButton onClick={onDismiss}>Cancel</TechoButton>
            <TechoButton type="submit">Confirm</TechoButton>
          </div>
        </form>
      </Card>
    </Overlay>
  )
}

export function LoadingOverlay({ visible, label = 'Fetching data' }: { visible: boolean; label?: string }) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-paper/70">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      <p className="mt-3 text-sm text-ink">{label}</p>
    </div>
  )
}
