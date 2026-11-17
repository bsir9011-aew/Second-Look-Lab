import { useState } from 'react'
import { ArrowRight, Award, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardCopy, Download, EyeOff, FileKey, Layers3, Medal, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { EXPERIENCE_IDS, LEVELS, LENSES, XP_PER_EXPERIENCE, type ExperienceId, type calculateJourney } from './labJourney'
import './journey.css'
import './dossier.css'

const LABELS: Record<ExperienceId, string> = {
  'ai-apology': 'AI apology', 'the-bank-call': 'Bank call', 'only-two-left': 'Hotel pressure',
  'the-third-cancellation': 'The friend', 'gut-vs-data': 'Gut vs. Data',
  'the-better-deal': 'Better deal', 'the-family-text': 'Family text',
}

type JourneyStats = ReturnType<typeof calculateJourney>

export default function JourneyDashboard({
  stats, completed, focusMode, passport, onReset, onOpenExperience, onFocusChange, onImport,
}: {
  stats: JourneyStats
  completed: ExperienceId[]
  focusMode: boolean
  passport: string
  onReset: () => void
  onOpenExperience: (id: ExperienceId) => void
  onFocusChange: (value: boolean) => void
  onImport: (input: string) => number
}) {
  const [importText, setImportText] = useState('')
  const [feedback, setFeedback] = useState('')
  // Recommend a genuinely unfinished story; finish the featured collection first.
  const nextIncomplete = [...stats.collection.experiences, ...EXPERIENCE_IDS]
    .find(id => !completed.includes(id)) as ExperienceId | undefined
  const recommendedId: ExperienceId = nextIncomplete ?? 'the-family-text'
  const hasUnfinished = Boolean(nextIncomplete)
  const inCollection = stats.collection.experiences.includes(recommendedId as (typeof stats.collection.experiences)[number]) && !stats.collection.done
  const reset = () => {
    if (window.confirm('Reset your Second Look Lab progress saved in this browser?')) {
      onReset()
      setFeedback('Local progress reset. Your downloaded Passport, if any, is unchanged.')
    }
  }
  const copyPassport = async () => {
    try {
      await navigator.clipboard.writeText(passport)
      setFeedback('Passport copied. Keep it somewhere safe to restore your progress.')
    } catch {
      setFeedback('Unable to copy automatically. You can download the Passport instead.')
    }
  }
  const downloadPassport = () => {
    const blob = new Blob([passport], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'second-look-lab-passport.json'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setFeedback('Passport download started. Keep the file to restore your progress.')
  }
  const importProgress = () => {
    try {
      const count = onImport(importText.trim())
      setFeedback('Passport accepted. ' + count + ' experience IDs checked. Progress was merged without removing existing discoveries.')
      setImportText('')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to import this Passport.')
    }
  }

  return (
    <section className="journey-section" id="my-progress" aria-labelledby="journey-heading">
      <div className="container journey-layout">
        <div className="journey-heading">
          <div className="dossier-intro-copy">
            <div className="eyebrow dark"><span className="line"/> THE SECOND LOOK DOSSIER</div>
            <h2 id="journey-heading">Your curiosity, <em>collected.</em></h2>
            <p>Keep track of the stories you've explored across Decide, Detect and Play. Ranks celebrate participation, not certified expertise.</p>
          </div>
          <div className="dossier-intro-actions">
            <div className="dossier-next">
              <div className="dossier-next-eyebrow"><Sparkles size={15}/>{hasUnfinished ? 'NEXT DISCOVERY' : 'YOUR COLLECTION IS COMPLETE'}</div>
              <strong>{hasUnfinished ? LABELS[recommendedId] : 'Explore a different path'}</strong>
              <p>{hasUnfinished
                ? (inCollection ? `Trust & Deception · ${stats.collection.completedCount} of ${stats.collection.total} discovered` : 'A new experience is ready when you are.')
                : 'All seven current experiences explored. Try another perspective while we add more.'}</p>
              <button className="journey-start" onClick={() => onOpenExperience(recommendedId)}>
                {hasUnfinished ? 'Start this experience' : 'Replay The Family Text'} <ArrowRight size={17}/>
              </button>
            </div>
            <div className="dossier-focus-control"><label><input type="checkbox" checked={focusMode} onChange={event => onFocusChange(event.target.checked)} /> <EyeOff size={15}/> Focus Mode - hide XP and badges</label></div>
          </div>
        </div>

        <div className="journey-card">
          {!focusMode ? <>
            <div className="journey-card-head">
              <div className="journey-level-icon"><Award size={28}/></div>
              <div className="journey-level-name"><span>YOUR CURRENT LEVEL</span><strong>Level {stats.level} · {stats.title}</strong></div>
              <span className="journey-xp">{stats.xp} XP</span>
            </div>
            <div className="journey-progress-head">
              <span>{stats.next ? 'NEXT: ' + LEVELS[stats.level + 1].name : 'MAX LEVEL'}</span>
              <span>{stats.next ? stats.next.xp - stats.xp + ' XP to go' : 'All ranks unlocked'}</span>
            </div>
            <div className="journey-bar" role="progressbar" aria-label="Progress toward next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(stats.percent)}><span style={{ width: stats.percent + '%' }}/></div>
            <div className="journey-ladder" aria-label="Rank progression from level 0 to 10">
              {LEVELS.map((rank,i) => <span key={rank.name} className={i <= stats.level ? 'earned' : ''} title={'Level ' + i + ': ' + rank.name} aria-label={'Level ' + i + ': ' + rank.name + (i <= stats.level ? ', reached' : ', locked')}>{i}</span>)}
            </div>
          </> : <div className="dossier-focus-notice"><EyeOff size={19}/><div><strong>Focus Mode is on.</strong><span>Levels and badges are hidden. Your progress is still safely recorded in this browser.</span></div></div>}

          <div className="dossier-subhead"><Layers3 size={17}/><strong>THREE LENSES</strong><small>Where you've explored</small></div>
          <div className="dossier-lenses">
            {stats.lenses.map(lens => <div className="dossier-lens" key={lens.id}>
              <div className="dossier-lens-label"><strong>{lens.id.toUpperCase()}</strong><span>{lens.completedCount} / {lens.total} explored</span></div>
              <div className="dossier-lens-track" role="progressbar" aria-label={lens.id + ' exploration'} aria-valuemin={0} aria-valuemax={lens.total} aria-valuenow={lens.completedCount}>
                <span style={{ width: (lens.completedCount / lens.total * 100) + '%' }}/>
              </div>
              <small>{LENSES.find(item => item.id === lens.id)?.description}</small>
            </div>)}
          </div>

          <div className="dossier-subhead"><BookOpen size={17}/><strong>FEATURED COLLECTION</strong><small>{stats.collection.completedCount} / {stats.collection.total} discovered</small></div>
          <div className="dossier-collection">
            <div><strong>{stats.collection.name}</strong><p>{stats.collection.description}</p></div>
            <div className="dossier-case-list">
              {stats.collection.experiences.map(id => <button key={id} type="button"
                aria-label={(completed.includes(id) ? 'Replay ' : 'Start ') + LABELS[id] + ' experience'}
                onClick={() => onOpenExperience(id)}
                className={completed.includes(id) ? 'done' : ''}>
                {completed.includes(id) ? <Check size={16} aria-hidden="true"/> : <span className="dossier-unseen-dot" aria-hidden="true"/>}
                <span>{LABELS[id]}</span><ChevronRight size={17} aria-hidden="true" className="dossier-case-arrow"/>
              </button>)}
            </div>
            {stats.collection.done && <span className="dossier-collection-complete"><Check size={14}/> Collection complete</span>}
          </div>

          {!focusMode && <>
            <div className="dossier-subhead"><Medal size={17}/><strong>DISCOVERIES</strong><small>{stats.badges.filter(b => b.earned).length} / {stats.badges.length} badges</small></div>
            <div className="dossier-badges">
              {stats.badges.map(badge => <div key={badge.id} className={'dossier-badge' + (badge.earned ? ' unlocked' : '')} title={badge.description}>
                <span>{badge.earned ? <Award size={21}/> : <CircleHelp size={21}/>}</span>
                <div><strong>{badge.name}</strong><small>{badge.description}</small></div>
              </div>)}
            </div>
          </>}

          <details className="dossier-passport">
            <summary><FileKey size={17}/> LAB PASSPORT · Backup & transfer <ChevronDown size={16}/></summary>
            <p>Keep your progress when you change devices or clear browser data. No account needed. Passport contains completed experience IDs and your Focus Mode preference - no answers or personal details. It is a readable JSON file, not encrypted.</p>
            <div className="dossier-passport-actions">
              <button type="button" onClick={copyPassport}><ClipboardCopy size={16}/> Copy Passport</button>
              <button type="button" onClick={downloadPassport}><Download size={16}/> Download JSON</button>
            </div>
            <label htmlFor="dossier-import">Import a Passport (merge progress)</label>
            <textarea id="dossier-import" rows={3} placeholder="Paste your Second Look Lab Passport JSON here..." value={importText} onChange={e => setImportText(e.target.value)} maxLength={12000}/>
            <button className="dossier-import-button" onClick={importProgress} disabled={!importText.trim()}>Import & merge discoveries</button>
            <small>Import never removes existing discoveries. Backups can be edited, so local badges are personal keepsakes, not verified credentials.</small>
          </details>

          <details className="journey-completions dossier-all-stories">
            <summary className="journey-completions-head">
              <strong>ALL EXPERIENCES <ChevronDown size={15} aria-hidden="true"/></strong>
              <span>{stats.completedCount} / {stats.total} unique</span>
            </summary>
            <div className="journey-experience-grid">
              {EXPERIENCE_IDS.map(id => <button key={id} type="button"
                className={completed.includes(id) ? 'journey-done' : ''}
                onClick={() => onOpenExperience(id)}
                aria-label={(completed.includes(id) ? 'Replay ' : 'Start ') + LABELS[id] + ' experience'}>
                {completed.includes(id) ? <Check size={14} aria-hidden="true"/> : <span className="journey-unseen" aria-hidden="true"/>}
                <span>{LABELS[id]}</span><ChevronRight size={15} aria-hidden="true"/>
              </button>)}
            </div>
          </details>
          <div className="journey-foot">
            <span><ShieldCheck size={13}/> Saved locally · {focusMode ? 'Progress tracking active' : XP_PER_EXPERIENCE + ' XP per new experience'}</span>
            <button onClick={reset} aria-label="Reset progress saved in this browser"><RotateCcw size={13}/> Reset</button>
          </div>
          {feedback && <p className="dossier-feedback" role="status">{feedback}</p>}
          <p className="journey-note"><CircleHelp size={13}/> Replays are free but grant no repeat XP. Browser data may be removed; keep a Passport backup if your discoveries matter to you.</p>
        </div>
      </div>
    </section>
  )
}
