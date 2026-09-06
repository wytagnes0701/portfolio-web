import { useState, type FormEvent, type ReactNode } from 'react'
import { Card, Field, Overlay } from './ui'

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
      <Card className="w-full max-w-md bg-paper p-6 text-ink">
        {title ? <h2 className="mb-3 text-lg font-medium">{title}</h2> : null}
        {children}
        <div className="mt-4 flex justify-end gap-3">
          {dismissLabel && onDismiss ? (
            <button type="button" className="text-sm font-medium text-nav" onClick={onDismiss}>
              {dismissLabel}
            </button>
          ) : null}
          <button type="button" className="text-sm font-medium text-nav" onClick={onConfirm}>
            {confirmLabel}
          </button>
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
      <Card className="w-full max-w-md bg-paper p-6 text-ink">
        <form onSubmit={submit}>
          <h2 className="mb-4 text-lg font-medium">Enter Pass Code for master login</h2>
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
            <button type="button" onClick={onDismiss} className="rounded-[10px] bg-techo-blue px-4 py-2 text-ink">
              Cancel
            </button>
            <button type="submit" className="rounded-[10px] bg-techo-blue px-4 py-2 text-ink">
              Confirm
            </button>
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
