
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, Eye, LockKeyhole, MessageCircle, Phone, RefreshCw, ShieldCheck, X } from 'lucide-react'
import './message-simulation.css'
import { XP_PER_EXPERIENCE } from './labJourney'

type Phase = 'inbox' | 'clue' | 'verify' | 'outcome'
type FirstAction = 'transfer' | 'question' | 'call'
type FinalAction = 'transfer' | 'question' | 'verify'

const firstActions: { id: FirstAction; text: string; hint: string }[] = [
  { id: 'transfer', text: 'Send the money right away', hint: 'She sounds distressed, and the amount is specific.' },
  { id: 'question', text: 'Ask something only Mom would know', hint: 'Maybe a family detail will prove it is her.' },
  { id: 'call', text: 'Call Mom using her saved number', hint: 'Use a contact you already trusted before this message.' },
]

const finalActions: { id: FinalAction; text: string }[] = [
  { id: 'transfer', text: 'Send the transfer - the detail sounds genuine.' },
  { id: 'question', text: 'Ask another personal question in this chat.' },
  { id: 'verify', text: 'Verify through a saved number or trusted family contact.' },
]

const firstConsequences: Record<FirstAction, string> = {
  transfer: 'You open the transfer screen. The simulation pauses before any money can be sent. The sender texts again: “Please hurry.”',
  question: 'You ask about the family dog. The reply appears immediately: “Milo, of course.” It sounds convincing.',
  call: 'You dial Mom’s saved phone number. Nobody answers. The unknown sender insists: “Please don’t call. I can’t talk.”',
}

const finalConsequences: Record<FinalAction, { title: string; text: string; tone: 'good' | 'caution' }> = {
  transfer: {
    title: 'An urgent story is still unverified.',
    text: 'A name, a photo, or a plausible personal detail can be found online or learned elsewhere. The simulated transfer was not sent. In real life, stop before paying and verify independently.',
    tone: 'caution',
  },
  question: {
    title: 'Another question may not establish identity.',
    text: 'Asking questions creates a pause, but personal details can be public or stolen. Independent contact is a stronger check before you send money.',
    tone: 'caution',
  },
  verify: {
    title: 'You chose independent verification.',
    text: 'Contact Mom on a number you already had, or speak with another trusted family member through their saved details. If no one answers, do not send money until you verify the request.',
    tone: 'good',
  },
}

type Props = {
  onClose: () => void
  onExplore: () => void
  onComplete: () => void
  alreadyCompleted: boolean
  focusMode: boolean
}

export default function MessageSimulation({ onClose, onExplore, onComplete, alreadyCompleted, focusMode }: Props) {
  const [phase, setPhase] = useState<Phase>('inbox')
  const [firstAction, setFirstAction] = useState<FirstAction | null>(null)
  const [finalAction, setFinalAction] = useState<FinalAction | null>(null)
  const [earnedThisRun, setEarnedThisRun] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const phases: Phase[] = ['inbox', 'clue', 'verify', 'outcome']
  const step = phases.indexOf(phase) + 1

  useEffect(() => {
    const restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])'))
      if (focusable.length === 0) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; restoreFocus?.focus() }
  }, [onClose])

  useEffect(() => { if (dialogRef.current) dialogRef.current.scrollTop = 0 }, [phase])

  const reset = () => { setFirstAction(null); setFinalAction(null); setEarnedThisRun(false); setPhase('inbox') }
  const finish = () => {
    if (finalAction === null) return
    setEarnedThisRun(!alreadyCompleted)
    onComplete()
    setPhase('outcome')
  }

  return (
    <div className="message-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="message-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="message-dialog-title">
        <header className="message-dialog-top">
          <div className="message-lab-brand"><Eye size={18} aria-hidden="true" /><span>SECOND LOOK</span><span className="message-slash">/</span><span>LIVE SIMULATION</span></div>
          <button className="message-close" ref={closeRef} aria-label="Close simulation" onClick={onClose}><X size={21} /></button>
        </header>
        <div className="message-layout">
          <div className="message-phone-region">
            <div className="message-phone-label"><span className="message-live-dot" /> DETECT / THE FAMILY TEXT</div>
            <div className="message-phone" aria-label="Simulated mobile conversation">
              <div className="message-phone-status"><span>14:32</span><span>●●● <span aria-hidden="true">▰</span></span></div>
              <div className="message-phone-contact">
                <span className="message-contact-avatar"><MessageCircle size={20} /></span>
                <div><strong>Unknown number</strong><small>Claims to be Mom</small></div>
                <Phone size={18} aria-hidden="true" />
              </div>
              <div className="message-chat" aria-live="polite">
                <div className="message-date">TODAY · 14:32</div>
                <div className="message-bubble incoming">Hi, it's Mom. My phone died. I'm using someone else's.</div>
                <div className="message-bubble incoming">Can you send $320 to this new account? Please don't call - I'll explain later. ❤️</div>
                {firstAction === 'question' && phase !== 'inbox' && <div className="message-bubble outgoing">What's the name of our family dog?</div>}
                {firstAction === 'question' && phase !== 'inbox' && <div className="message-bubble incoming">Milo, of course.</div>}
                {firstAction === 'call' && phase !== 'inbox' && <div className="message-call-note"><Phone size={13} /> Called saved contact · no answer</div>}
                {firstAction === 'transfer' && phase !== 'inbox' && <div className="message-bubble incoming">Please hurry. This is important.</div>}
                {phase === 'verify' || phase === 'outcome' ? <div className="message-bubble incoming new-clue">Milo is asleep by the door, you know how he gets 🐾</div> : null}
                {phase === 'verify' || phase === 'outcome' ? <div className="message-phone-footnote">Milo's name also appears in a public family post.</div> : null}
              </div>
              <div className="message-phone-input" aria-hidden="true"><span>Message</span><span>➤</span></div>
            </div>
            <div className="message-trust"><LockKeyhole size={13} /> Fictional messages · No payments or data collected</div>
          </div>

          <div className="message-story">
            <div className="message-progress-top"><span>THE FAMILY TEXT</span><span>STEP {step} OF 4</span></div>
            <div className="message-progress" aria-label={'Step ' + step + ' of 4'}>{phases.map((item, i) => <span key={item} className={i < step ? 'active' : ''}/>)}</div>
            <div className="message-story-body" key={phase}>
              {phase === 'inbox' && <>
                <div className="message-eyebrow"><Clock3 size={15} /> 2-3 MIN EXPERIENCE</div>
                <h2 id="message-dialog-title">Would you send the money?</h2>
                <p>Two messages arrive from an unfamiliar number. The sender says they're your mother. There's urgency - but no proof.</p>
                <strong className="message-question">What's your first move?</strong>
                <div className="message-options">
                  {firstActions.map((choice, index) => <button key={choice.id} aria-pressed={firstAction === choice.id} className={firstAction === choice.id ? 'message-option selected' : 'message-option'} onClick={() => setFirstAction(choice.id)}>
                    <span className="message-option-letter">{String.fromCharCode(65 + index)}</span><span><strong>{choice.text}</strong><small>{choice.hint}</small></span>{firstAction === choice.id && <Check size={19} />}
                  </button>)}
                </div>
                <button className="message-primary" disabled={!firstAction} onClick={() => setPhase('clue')}>See what happens <ArrowRight size={17} /></button>
              </>}
              {phase === 'clue' && <>
                <div className="message-eyebrow">AFTER YOUR FIRST CHOICE</div>
                <h2 id="message-dialog-title">The conversation continues.</h2>
                <p className="message-consequence">{firstAction ? firstConsequences[firstAction] : ''}</p>
                <div className="message-insight"><span>YOUR FIRST MOVE</span><strong>{firstActions.find(choice => choice.id === firstAction)?.text}</strong></div>
                <p>Something about the request still deserves a second look.</p>
                <button className="message-primary" onClick={() => setPhase('verify')}>Read the next message <ArrowRight size={17}/></button>
                <button className="message-link" onClick={() => setPhase('inbox')}><ArrowLeft size={14}/> Change my first choice</button>
              </>}
              {phase === 'verify' && <>
                <div className="message-eyebrow">NEW DETAIL UNLOCKED</div>
                <h2 id="message-dialog-title">They know your dog's name.</h2>
                <p>The sender mentions Milo. But you notice that Milo's name is visible in a public family post.</p>
                <div className="message-insight"><span>THE KEY QUESTION</span><strong>Does knowing a personal detail prove who sent the message?</strong></div>
                <strong className="message-question">What would you do now?</strong>
                <div className="message-options">
                  {finalActions.map((choice, index) => <button key={choice.id} aria-pressed={finalAction === choice.id} className={finalAction === choice.id ? 'message-option selected' : 'message-option'} onClick={() => setFinalAction(choice.id)}><span className="message-option-letter">{String.fromCharCode(65 + index)}</span><span><strong>{choice.text}</strong></span>{finalAction === choice.id && <Check size={19}/>}</button>)}
                </div>
                <button className="message-primary" disabled={finalAction === null} onClick={finish}>Reveal the outcome <ArrowRight size={17}/></button>
              </>}
              {phase === 'outcome' && finalAction !== null && <>
                <div className={'message-result-tag ' + finalConsequences[finalAction].tone}><ShieldCheck size={16}/>{finalAction === 'verify' ? 'SAFER RESPONSE' : 'RISK TO RECONSIDER'}</div>
                {!focusMode && <div className={'journey-earned' + (earnedThisRun ? '' : ' replayed')}><Check size={14}/>{earnedThisRun ? '+' + XP_PER_EXPERIENCE + ' discovery XP · New experience' : 'Previously explored · No repeat XP'}</div>}
                <h2 id="message-dialog-title">{finalConsequences[finalAction].title}</h2>
                <p>{finalConsequences[finalAction].text}</p>
                <div className="message-action-path"><span>PRESSURE</span><ArrowRight size={14}/><span>IDENTITY CLAIM</span><ArrowRight size={14}/><strong>INDEPENDENT VERIFICATION</strong></div>
                <div className="message-takeaway"><strong>ONE RULE TO REMEMBER</strong><p>An urgent request from a new number is not verified by a familiar name or convincing story. Use contact details you already trusted before the request.</p></div>
                <p className="message-source">Further reading: <a href="https://www.cisa.gov/secure-our-world/recognize-and-report-phishing" target="_blank" rel="noopener noreferrer">CISA - Recognize and Report Phishing</a></p>
                <div className="message-end-actions"><button className="message-primary" onClick={onExplore}>Explore the Lab <ArrowRight size={17}/></button><button className="message-secondary" onClick={reset}><RefreshCw size={15}/> Try a different choice</button></div>
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
