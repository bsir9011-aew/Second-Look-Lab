import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Eye, FileImage, Heart, LockKeyhole, MessageSquareText, RefreshCcw, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { XP_PER_EXPERIENCE } from './labJourney'
import './screenshot-mystery.css'

type Phase = 'choose' | 'consequence' | 'inspect' | 'reconsider' | 'ending'
type FirstAction = 'broadcast' | 'ask' | 'hold'
type LastAction = 'accuse' | 'correct' | 'ignore'
type ClueId = 'thread' | 'rehearsal' | 'livestream'

const firstOptions: {id: FirstAction; label: string; hint: string}[] = [
  { id: 'broadcast', label: 'Share it with the group', hint: 'If the claim is real, people deserve to know.' },
  { id: 'ask', label: 'Message Mara privately', hint: 'Ask what she meant before making it public.' },
  { id: 'hold', label: 'Save it and check the source', hint: 'A cropped screenshot is not a complete record.' },
]

const firstFallout: Record<FirstAction, { title: string; text: string; note: string }> = {
  broadcast: {
    title: 'The accusation spreads.',
    text: 'Within minutes, your group chat has a new headline: “The organizers faked the donations.” Two people forward the crop again.',
    note: 'You have amplified a claim you cannot yet verify. Sharing feels decisive, but it makes correction harder.',
  },
  ask: {
    title: 'You get an answer - not proof.',
    text: 'Mara replies: “That was an internal rehearsal. We used a sample total. Please look at the original.”',
    note: 'The reply is plausible, but the person in the screenshot has an interest in defending it. Check independent context.',
  },
  hold: {
    title: 'One missing detail stands out.',
    text: 'You zoom in. The message has no channel title, no previous replies and no link to the actual livestream.',
    note: 'You have slowed the rumor down. But the crop still leaves a real question unanswered.',
  },
}

const clues: { id: ClueId; eyebrow: string; title: string; preview: string; content: string; note: string }[] = [
  {
    id: 'thread', eyebrow: 'CLUE 01 · FULL CHAT', title: 'The conversation above it',
    preview: 'See the messages removed by the crop.',
    content: '4:58 PM · “Please fix the placeholder figure on the rehearsal slide. The live total must come from the actual dashboard.”\n5:04 PM · Mara: “I changed the total before the livestream. Nobody noticed.”\n5:06 PM · “Thanks. Remember: sample figures are for the practice run only.”',
    note: 'The quoted line is real in this fictional story, but its immediate context changes what it means.',
  },
  {
    id: 'rehearsal', eyebrow: 'CLUE 02 · SOURCE IMAGE', title: 'What the screenshot left out',
    preview: 'Inspect the uncropped presentation slide.',
    content: 'TOP OF ORIGINAL SLIDE: “REHEARSAL ONLY · SAMPLE FIGURES”\nDUMMY TOTAL: $48,000\nBOTTOM: “Replace with live donation dashboard before broadcast.”',
    note: 'The crop removed the label saying the numbers were fictional.',
  },
  {
    id: 'livestream', eyebrow: 'CLUE 03 · PUBLIC RECORD', title: 'What viewers actually saw',
    preview: 'Compare the livestream with the screenshot.',
    content: '7:12 PM · The fictional event livestream displays “Donations so far: $12,480”. Its public recap repeats $12,480.\nThe rehearsal slide does not appear in the published clip.',
    note: 'The public figure is different from the rehearsal example. That matters more than the alarming crop.',
  },
]

const finalOptions: { id: LastAction; label: string; hint: string }[] = [
  { id: 'accuse', label: 'Post the screenshot with a fraud accusation', hint: 'The wording is suspicious enough to you.' },
  { id: 'correct', label: 'Ask for a clear public correction with the full context', hint: 'Explain that the crop shows a rehearsal, and show the public total.' },
  { id: 'ignore', label: 'Delete the image and move on', hint: 'The original claim was misleading, so nothing else needs doing.' },
]

const endings: Record<LastAction, { title: string; narrative: string; takeaway: string; tone: 'careful' | 'caution' }> = {
  accuse: {
    title: 'The rumor outgrows the evidence.',
    narrative: 'You share the accusation. The original message is genuine, but it refers to sample figures in a rehearsal. Someone reposts your warning without the word “unverified”. The organizers now have to untangle a claim of fraud that the available evidence does not support.',
    takeaway: 'Authentic quotes can tell misleading stories when the context disappears. A serious allegation needs the original source and a verified comparison.',
    tone: 'caution',
  },
  correct: {
    title: 'You challenge the claim, not the person.',
    narrative: 'You ask the organizers to clarify the crop publicly. They publish the uncropped rehearsal label alongside the figure actually shown in the livestream. The people who received the rumor can now check what happened instead of choosing sides.',
    takeaway: 'The strongest correction gives people a source, context and a way to verify the specific claim.',
    tone: 'careful',
  },
  ignore: {
    title: 'Silence does not undo a shared mistake.',
    narrative: 'You delete the screenshot, but the cropped version keeps moving through the group. You know it was misleading; the people who saw it do not. A calm, sourced correction could have helped limit the confusion.',
    takeaway: 'When misinformation is already circulating, privately knowing the truth is different from helping others check it.',
    tone: 'caution',
  },
}

type Props = {
  onClose: () => void
  onComplete: () => void
  onExplore: () => void
  alreadyCompleted: boolean
  focusMode: boolean
}

export default function ScreenshotMystery({ onClose, onComplete, onExplore, alreadyCompleted, focusMode }: Props) {
  const [phase, setPhase] = useState<Phase>('choose')
  const [firstAction, setFirstAction] = useState<FirstAction | null>(null)
  const [lastAction, setLastAction] = useState<LastAction | null>(null)
  const [inspected, setInspected] = useState<ClueId[]>([])
  const [expandedClue, setExpandedClue] = useState<ClueId | null>(null)
  const [earnedThisRun, setEarnedThisRun] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const phases: Phase[] = ['choose', 'consequence', 'inspect', 'reconsider', 'ending']
  const currentIndex = phases.indexOf(phase)
  const inspectedCount = inspected.length
  const allRead = inspectedCount === clues.length

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; previousFocus?.focus() }
  }, [onClose])

  useEffect(() => {
    if (dialogRef.current) dialogRef.current.scrollTop = 0
  }, [phase])

  function revealClue(id: ClueId) {
    setExpandedClue(current => current === id ? null : id)
    setInspected(current => current.includes(id) ? current : [...current, id])
  }
  function finish() {
    if (!lastAction) return
    setEarnedThisRun(!alreadyCompleted)
    onComplete()
    setPhase('ending')
  }
  function restart() {
    setPhase('choose')
    setFirstAction(null)
    setLastAction(null)
    setInspected([])
    setExpandedClue(null)
    setEarnedThisRun(false)
  }

  return (
    <div className="screenshot-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="screenshot-dialog" role="dialog" aria-modal="true" aria-labelledby="screenshot-title" ref={dialogRef}>
        <div className="screenshot-dialog-top">
          <span className="screenshot-brand"><Eye size={18} aria-hidden="true"/> SECOND LOOK <span>/</span> THE SCREENSHOT</span>
          <button className="screenshot-close" aria-label="Close The Screenshot story" onClick={onClose} ref={closeRef}><X size={21}/></button>
        </div>
        <div className="screenshot-progress" aria-label={'Step ' + (currentIndex + 1) + ' of 5'}>
          {phases.map((step, index) => <span key={step} className={index <= currentIndex ? 'active' : ''}/>)}
        </div>
        <div className="screenshot-main">
          <aside className="screenshot-evidence" aria-label="The shared screenshot">
            <div className="screenshot-panel-top"><FileImage size={18}/> THE IMAGE YOU RECEIVED <small>FICTIONAL CASE</small></div>
            <div className="screenshot-social">
              <div className="screenshot-message-intro"><span className="screenshot-avatar">?</span><span><strong>Someone in your group chat</strong><small>Forwarded a screenshot · source unknown</small></span></div>
              <p>“Did they fake the fundraiser total? Look at this.”</p>
              <div className="screenshot-cropped" aria-label="Cropped message: I changed the total before the livestream. Nobody noticed.">
                <span>SCREENSHOT · CROPPED</span>
                <div className="screenshot-bubble">I changed the total before the livestream. Nobody noticed.</div>
                <small>Sender, channel and earlier messages are outside the crop.</small>
              </div>
              <div className="screenshot-share-label"><MessageSquareText size={14}/> Shared without a source link</div>
            </div>
            <p className="screenshot-privacy"><LockKeyhole size={14}/> Fictional fundraiser, figures and messages. Nothing is posted or collected.</p>
          </aside>
          <div className="screenshot-story" key={phase}>
            <div className="screenshot-step"><span>DETECT · INTERACTIVE MYSTERY</span><strong>{currentIndex + 1} / 5</strong></div>
            {phase === 'choose' && <>
              <div className="screenshot-kicker"><Clock3 size={15}/> 3–4 MIN · THE FIRST INSTINCT</div>
              <h2 id="screenshot-title">One screenshot.<br/><em>One accusation.</em></h2>
              <p>A community fundraiser ended last night. This morning, someone sends a cropped message from Mara, an event organizer. It looks like an admission of changing the donation total.</p>
              <p><strong>What do you do first?</strong> Your choice will change what happens next.</p>
              <div className="screenshot-options">
                {firstOptions.map(option => <button type="button" key={option.id} className={firstAction === option.id ? 'selected' : ''} aria-pressed={firstAction === option.id} onClick={() => setFirstAction(option.id)}>
                  <span className="screenshot-choice-indicator">{firstAction === option.id ? <Check size={17}/> : <span/>}</span>
                  <span><strong>{option.label}</strong><small>{option.hint}</small></span>
                </button>)}
              </div>
              <button className="screenshot-primary" disabled={!firstAction} onClick={() => setPhase('consequence')}>See what happens <ArrowRight size={17}/></button>
            </>}
            {phase === 'consequence' && firstAction && <>
              <div className="screenshot-kicker"><MessageSquareText size={16}/> YOUR DECISION HAS CONSEQUENCES</div>
              <h2 id="screenshot-title">{firstFallout[firstAction].title}</h2>
              <p className="screenshot-consequence">{firstFallout[firstAction].text}</p>
              <p>{firstFallout[firstAction].note}</p>
              <div className="screenshot-quote"><span>YOUR FIRST MOVE</span><strong>{firstOptions.find(x => x.id === firstAction)?.label}</strong></div>
              <button className="screenshot-primary" onClick={() => setPhase('inspect')}>Open the evidence board <Search size={17}/></button>
              <button className="screenshot-link" onClick={() => setPhase('choose')}><ArrowLeft size={15}/> Change my first move</button>
            </>}
            {phase === 'inspect' && <>
              <div className="screenshot-kicker"><Search size={16}/> INVESTIGATION · {inspectedCount} / 3 CLUES OPENED</div>
              <h2 id="screenshot-title">The crop is not the whole story.</h2>
              <p>There are three pieces of evidence. Open at least two to make a second decision. The order is yours.</p>
              <div className="screenshot-clues">
                {clues.map(clue => {
                  const revealed = expandedClue === clue.id
                  const visited = inspected.includes(clue.id)
                  return <div key={clue.id} className={'screenshot-clue' + (visited ? ' revealed' : '')}>
                    <button type="button" aria-expanded={revealed} aria-controls={'clue-' + clue.id} onClick={() => revealClue(clue.id)}>
                      <span className="screenshot-clue-number">{visited ? <CheckCircle2 size={18}/> : <Search size={18}/>}</span>
                      <span><small>{clue.eyebrow}</small><strong>{clue.title}</strong><em>{clue.preview}</em></span>
                      <span className="screenshot-clue-toggle">{revealed ? 'Hide' : 'Inspect'}</span>
                    </button>
                    {revealed && <div id={'clue-' + clue.id} className="screenshot-clue-content">
                      <p>{clue.content}</p>
                      <span>{clue.note}</span>
                    </div>}
                  </div>
                })}
              </div>
              <p className="screenshot-clue-note" aria-live="polite">{inspectedCount < 2 ? 'Inspect ' + (2 - inspectedCount) + ' more clue' + (inspectedCount === 0 ? 's' : '') + ' to continue.' : allRead ? 'All three clues inspected. Ready to decide?' : 'You can decide now, or inspect the last clue.'}</p>
              <button className="screenshot-primary" disabled={inspectedCount < 2} onClick={() => setPhase('reconsider')}>Take a second look <ArrowRight size={17}/></button>
            </>}
            {phase === 'reconsider' && <>
              <div className="screenshot-kicker"><Sparkles size={16}/> THE TWIST</div>
              <h2 id="screenshot-title">Real message. <em>Wrong story.</em></h2>
              <p>It really was Mara's message. But the figures were fictional placeholders in a rehearsal, and the actual public livestream showed a different, verified total.</p>
              <div className="screenshot-twist"><span>THERE'S STILL A PROBLEM</span><p>The cropped accusation is now circulating. People who never see the full context may believe the fundraiser was fraudulent.</p></div>
              <strong className="screenshot-question">What would you do now?</strong>
              <div className="screenshot-options">
                {finalOptions.map(option => <button type="button" key={option.id} className={lastAction === option.id ? 'selected' : ''} aria-pressed={lastAction === option.id} onClick={() => setLastAction(option.id)}>
                  <span className="screenshot-choice-indicator">{lastAction === option.id ? <Check size={17}/> : <span/>}</span>
                  <span><strong>{option.label}</strong><small>{option.hint}</small></span>
                </button>)}
              </div>
              <button className="screenshot-primary" disabled={!lastAction} onClick={finish}>See the ending <ArrowRight size={17}/></button>
              <button className="screenshot-link" onClick={() => setPhase('inspect')}><ArrowLeft size={15}/> Review the evidence</button>
            </>}
            {phase === 'ending' && lastAction && <>
              <div className={'screenshot-ending-tag ' + endings[lastAction].tone}><ShieldCheck size={17}/> STORY COMPLETE · YOUR ENDING</div>
              {!focusMode && <div className={'journey-earned' + (earnedThisRun ? '' : ' replayed')}><Sparkles size={14}/>{earnedThisRun ? '+' + XP_PER_EXPERIENCE + ' discovery XP · New experience' : 'Previously explored · No repeat XP'}</div>}
              <h2 id="screenshot-title">{endings[lastAction].title}</h2>
              <p>{endings[lastAction].narrative}</p>
              <div className="screenshot-takeaway"><strong><Heart size={17}/> THE SECOND LOOK</strong><p>{endings[lastAction].takeaway}</p></div>
              <div className="screenshot-moves">
                <div><small>YOUR FIRST REACTION</small><strong>{firstOptions.find(x => x.id === firstAction)?.label}</strong></div>
                <ArrowRight size={18} aria-hidden="true"/>
                <div><small>AFTER NEW EVIDENCE</small><strong>{finalOptions.find(x => x.id === lastAction)?.label}</strong></div>
              </div>
              <p className="screenshot-ending-footnote">This outcome is fictional. The choices are not psychological diagnoses, and there is no score for moral opinions.</p>
              <div className="screenshot-end-actions">
                <button className="screenshot-outline" onClick={restart}><RefreshCcw size={16}/> Try another path</button>
                <button className="screenshot-primary" onClick={onExplore}>Try another experience <ArrowRight size={17}/></button>
                <button className="screenshot-link" onClick={onClose}>Back to the Lab</button>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}
