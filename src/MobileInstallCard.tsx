import { useEffect, useState } from 'react'
import { ArrowDownToLine, CheckCircle2, Download, Info, Smartphone } from 'lucide-react'

type DeferredInstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
}

export default function MobileInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as DeferredInstallEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setMessage('Second Look Lab was added to your device.')
    }
    const media = window.matchMedia('(display-mode: standalone)')
    const onDisplayChange = () => setInstalled(media.matches)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    media.addEventListener?.('change', onDisplayChange)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      media.removeEventListener?.('change', onDisplayChange)
    }
  }, [])

  const requestInstall = async () => {
    if (!installPrompt) return
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallPrompt(null)
      if (choice.outcome === 'dismissed') setMessage('No problem. You can still use every experience in your browser.')
    } catch {
      setMessage('Your browser could not start installation. Try the browser menu instead.')
      setInstallPrompt(null)
    }
  }

  return (
    <section className="mobile-install-section" id="install-app" aria-labelledby="mobile-install-heading">
      <div className="container mobile-install-layout">
        <div className="mobile-install-icon"><Smartphone size={29}/></div>
        <div className="mobile-install-copy">
          <div className="eyebrow dark"><span className="line"/> MOBILE LAB / v0.6</div>
          <h2 id="mobile-install-heading">Your Lab. In your pocket.</h2>
          <p>Play in the browser or add Second Look Lab to your home screen for an app-like experience. Once opened online, core stories can also run offline.</p>
          <p className="mobile-install-caveat"><Info size={15} aria-hidden="true"/> Your progress is saved in this browser. Installed versions may have separate storage - use Lab Passport to back up and transfer it.</p>
          {message && <p role="status" className="mobile-install-status">{message}</p>}
        </div>
        <div className="mobile-install-actions">
          {installed ? <span className="mobile-installed"><CheckCircle2 size={17}/> App mode active</span> : installPrompt
            ? <button className="mobile-install-button" type="button" onClick={requestInstall}><Download size={17}/> Add to home screen</button>
            : <span className="mobile-install-caption"><ArrowDownToLine size={17}/> Installation is optional</span>
          }
          {!installed && <details className="mobile-install-steps">
            <summary>How do I install it?</summary>
            <p><strong>Android / Chrome or Edge:</strong> open the browser menu and choose Install app or Add to Home screen.</p>
            <p><strong>iPhone / Safari:</strong> tap Share, then Add to Home Screen. Browser support and labels may vary.</p>
          </details>}
        </div>
      </div>
    </section>
  )
}
