import { Award, Check, CircleHelp, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { EXPERIENCE_IDS, LEVELS, XP_PER_EXPERIENCE, type ExperienceId, type calculateJourney } from './labJourney'
import './journey.css'

const LABELS: Record<ExperienceId, string> = {
  'ai-apology': 'AI apology',
  'the-bank-call': 'Bank call',
  'only-two-left': 'Hotel pressure',
  'the-third-cancellation': 'The friend',
  'gut-vs-data': 'Gut vs. Data',
  'the-better-deal': 'Better deal',
  'the-family-text': 'Family text',
}

type JourneyStats = ReturnType<typeof calculateJourney>

export default function JourneyDashboard({
  stats, completed, onReset, onTry,
}: {
  stats: JourneyStats
  completed: ExperienceId[]
  onReset: () => void
  onTry: () => void
}) {
  const reset = () => {
    if (window.confirm('Reset your Second Look Lab progress saved in this browser?')) onReset()
  }
  return (
    <section className="journey-section" id="my-progress" aria-labelledby="journey-heading">
      <div className="container journey-layout">
        <div className="journey-heading">
          <div className="eyebrow dark"><span className="line"/> YOUR JOURNEY</div>
          <h2 id="journey-heading">Every discovery<br/><em>adds up.</em></h2>
          <p>Explore unique experiences, collect discovery points and build your Second Look Lab journey. These levels celebrate participation, not certified expertise.</p>
          <button className="journey-start" onClick={onTry}>Explore another challenge <Sparkles size={17}/></button>
        </div>
        <div className="journey-card">
          <div className="journey-card-head">
            <div className="journey-level-icon"><Award size={28}/></div>
            <div className="journey-level-name"><span>YOUR CURRENT LEVEL</span><strong>Level {stats.level} · {stats.title}</strong></div>
            <span className="journey-xp">{stats.xp} XP</span>
          </div>
          <div className="journey-progress-head">
            <span>{stats.next ? 'NEXT: ' + LEVELS[stats.level + 1].name : 'MAX LEVEL'}</span>
            <span>{stats.next ? stats.next.xp - stats.xp + ' XP to go' : 'All ranks unlocked'}</span>
          </div>
          <div className="journey-bar" role="progressbar" aria-label="Progress toward next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(stats.percent)}>
            <span style={{ width: stats.percent + '%' }}/>
          </div>
          <div className="journey-ladder" aria-label="Rank progression from level 0 to 10">
            {LEVELS.map((rank,i) => <span key={rank.name} className={i <= stats.level ? 'earned' : ''} title={'Level ' + i + ': ' + rank.name} aria-label={'Level ' + i + ': ' + rank.name + (i <= stats.level ? ', reached' : ', locked')}>{i}</span>)}
          </div>
          <div className="journey-completions">
            <div className="journey-completions-head"><strong>EXPLORER'S COLLECTION</strong><span>{stats.completed} / {stats.total} unique</span></div>
            <div className="journey-experience-grid">
              {EXPERIENCE_IDS.map(id => <span key={id} className={completed.includes(id) ? 'journey-done' : ''}>
                {completed.includes(id) ? <Check size={13} aria-hidden="true"/> : <span className="journey-unseen" aria-hidden="true"/>}
                {LABELS[id]}
              </span>)}
            </div>
          </div>
          <div className="journey-foot">
            <span><ShieldCheck size={13}/> Saved only in this browser · {XP_PER_EXPERIENCE} XP for each new completed story</span>
            <button onClick={reset} aria-label="Reset progress saved in this browser"><RotateCcw size={13}/> Reset</button>
          </div>
          <p className="journey-note"><CircleHelp size={13}/> Replaying a story is always free, but earns no extra XP. More levels will become reachable as we publish new experiences.</p>
        </div>
      </div>
    </section>
  )
}
