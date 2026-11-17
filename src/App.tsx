import { useEffect, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check,
  CircleHelp, Clock3, Eye, Fingerprint, HeartHandshake, Layers3, LockKeyhole,
  MailWarning, Menu, MousePointerClick, ShieldCheck, Sparkles, X,
} from 'lucide-react'

type Topic = 'Decide' | 'Detect' | 'Play'
type Scenario = {
  id: string
  number: string
  topic: Topic
  kind?: 'story' | 'booking' | 'estimate' | 'comparison'
  secondChoices?: string[]
  readTime: string
  title: string
  teaser: string
  question: string
  choices: string[]
  revealTitle: string
  newEvidence: string
  secondQuestion: string
  explanationTitle: string
  explanation: string
  takeaway: string
  challenge: string
  resource?: { label: string; url: string }
}

const scenarios: Scenario[] = [
  {
    id: 'ai-apology', number: '01', topic: 'Decide', readTime: '3 MIN',
    title: 'The apology written by AI',
    teaser: 'The words were perfect. But were they really theirs?',
    question: 'Your partner sends a thoughtful apology. Later, you find out an AI assistant wrote most of it. Does that make the apology less sincere?',
    choices: ['Yes. An apology should be in their own words.', 'No. The feelings can still be genuine.', 'I need to know more before deciding.'],
    revealTitle: 'One detail changes the story.',
    newEvidence: 'Your partner struggled to explain how they felt, but told the AI what happened, edited the draft, took responsibility and changed the behavior that hurt you.',
    secondQuestion: 'What matters most when you reconsider the apology?',
    secondChoices: ['AI involvement still makes it feel less personal to me.', 'The apology can be sincere when the feelings and accountability are real.', 'I would judge sincerity by what changes afterwards.'],
    explanationTitle: 'Authorship is not the same as sincerity.',
    explanation: 'A personally written message can still be manipulative. An AI-assisted message can communicate genuine intent. The more useful questions are whether the person takes responsibility, understands the harm and changes their behavior. Different people can reasonably value personal authorship differently.',
    takeaway: 'Look beyond how the message was written. Evaluate responsibility and actions over time.',
    challenge: 'In a different situation, would your judgment change if the person used AI to write a resignation letter?',
  },
  {
    id: 'the-bank-call', number: '02', topic: 'Detect', readTime: '4 MIN',
    title: 'The call from your bank',
    teaser: 'The caller ID matches. The urgency feels real.',
    question: 'Your bank appears to be calling from its genuine number. The caller says an unknown transfer is pending and you have five minutes to stop it. What do you do first?',
    choices: ['Follow their instructions to freeze the transfer.', 'Hang up and call the bank using a number I already trust.', 'Ask the caller for my account details to prove who they are.'],
    revealTitle: 'The phone number is not proof.',
    newEvidence: 'Caller ID can be spoofed. A fraudster may make a call appear to come from an organization you trust. A convincing voice and accurate details still do not authenticate the caller.',
    secondQuestion: 'What would you do now that caller ID may be spoofed?',
    secondChoices: ['Keep talking because the displayed number matches.', 'End the call and independently contact the bank.', 'Ask the caller to verify their identity using my security code.'],
    explanationTitle: 'Verify through an independent channel.',
    explanation: 'A trustworthy way to verify an unexpected financial request is to end the conversation and contact your bank through the official app, card or a previously saved phone number. Do not use a contact number or link supplied by the suspicious caller. If you already shared information, promptly contact your bank.',
    takeaway: 'Urgency is not authentication. Independently verify unexpected money or credential requests.',
    challenge: 'What if the caller knows your last three transactions? Would that make the caller trustworthy?',
    resource: { label: 'CISA: Recognize and Report Phishing', url: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing' },
  },
  {
    id: 'only-two-left', number: '03', topic: 'Detect', kind: 'booking', readTime: '3 MIN',
    title: 'Only two rooms left',
    teaser: 'A timer is counting down. Should you rush?',
    question: 'You are comparing hotel rooms. A booking site says “Only 2 left!” and shows a countdown: 08:42. Would you book immediately?',
    choices: ['Yes. I do not want to lose the deal.', 'No. I will compare options and check the terms.', 'Maybe. It depends on the evidence and urgency.'],
    revealTitle: 'The timer has reset.',
    newEvidence: 'Twenty minutes later you revisit the page. The countdown has restarted at 10:00, and the same offer is still available.',
    secondQuestion: 'What is your next move now?',
    secondChoices: ['Book immediately anyway.', 'Compare the final price, cancellation terms and alternatives.', 'Assume every limited offer is fraudulent.'],
    explanationTitle: 'Scarcity claims need context.',
    explanation: 'Limited availability can be genuine, but an unexplained or resetting timer may be a pressure tactic. One observation does not prove fraud. Compare final prices, cancellation rules and independently available offers before deciding.',
    takeaway: 'A countdown is a claim, not a deadline you must obey. Check what is actually being limited.',
    challenge: 'If the offer is truly limited, what evidence would help you make a confident decision?',
  },

  {
    id: 'the-third-cancellation', number: '04', topic: 'Decide', readTime: '3 MIN',
    title: 'The friend who always cancels',
    teaser: 'The third cancelled plan. Is it really about you?',
    question: 'A close friend cancels dinner for the third time with a vague “Something came up.” You feel brushed aside. What would you do?',
    choices: ['Assume they no longer value our friendship.', 'Ask how they are doing before reaching a conclusion.', 'Stop inviting them without mentioning why.'],
    revealTitle: 'There was more going on.',
    newEvidence: 'You learn that your friend has been helping a parent through a difficult period and did not want to discuss family matters yet. They still should have communicated more clearly.',
    secondQuestion: 'Which response now seems most constructive?',
    secondChoices: ['Say how the cancellations affected me and ask what would work better.', 'Insist they explain every private detail.', 'Pretend nothing happened and keep feeling resentful.'],
    explanationTitle: 'Context can change the story, not erase its impact.',
    explanation: 'People often interpret vague behavior through their own experience, but several explanations may fit the same facts. Learning the context does not mean your disappointment was imaginary. A practical next step is a clear conversation rather than mind-reading.',
    takeaway: 'Ask before assuming, then explain your own needs without demanding private details.',
    challenge: 'What if your friend had a pattern of cancelling even when life was calm?',
  },
  {
    id: 'gut-vs-data', number: '05', topic: 'Play', kind: 'estimate', readTime: '2 MIN',
    title: 'Gut vs. Data: how many use Facebook?',
    teaser: 'Make a prediction before you see the survey.',
    question: 'Before seeing the figures, estimate what share of U.S. adults said they ever use Facebook in a Pew Research Center survey conducted in 2025.',
    choices: [],
    revealTitle: 'The survey says 71%.',
    newEvidence: 'Pew Research Center surveyed 5,022 U.S. adults between February 5 and June 18, 2025. In that survey, 71% said they ever use Facebook.',
    secondQuestion: 'Which source would give you the strongest evidence for that national estimate?',
    secondChoices: ['A survey report showing the sample, question and methodology.', 'My own social circle and its habits.', 'The number of reactions to a viral Facebook post.'],
    explanationTitle: 'A number needs its denominator.',
    explanation: 'This 71% figure describes reported use among U.S. adults in a particular survey, not daily activity or global use. It is not a personal score. Good statistical thinking asks who was surveyed, how the question was worded and how the sample was selected.',
    takeaway: 'When a statistic surprises you, check the population, year and definition before trusting or rejecting it.',
    challenge: 'How differently would you predict the share of daily Facebook users?',
    resource: { label: 'Pew Research Center: Americans’ Social Media Use 2025', url: 'https://www.pewresearch.org/internet/2025/11/20/americans-social-media-use-2025/' },
  },
  {
    id: 'the-better-deal', number: '06', topic: 'Play', kind: 'comparison', readTime: '2 MIN',
    title: 'The better deal',
    teaser: 'A bigger pack looks cheaper. Is it?',
    question: 'You want one bag of coffee. Bag A is 750 g for $12. Bag B is 1 kg for $15. Which has the lower price per kilogram before delivery?',
    choices: ['Bag A: $12 for 750 g', 'Bag B: $15 for 1 kg', 'They cost the same per kilogram'],
    revealTitle: 'Now include delivery.',
    newEvidence: 'Bag A ships free. Bag B has a $4 delivery fee. You are buying exactly one bag, so the full delivery fee belongs in your comparison.',
    secondQuestion: 'Which is now cheaper per kilogram delivered?',
    secondChoices: ['Bag A: $12 ÷ 0.75 kg = $16/kg', 'Bag B: $19 ÷ 1 kg = $19/kg', 'They still cost exactly the same'],
    explanationTitle: 'The cheapest sticker price is not the full cost.',
    explanation: 'Before delivery, Bag A costs $16/kg while Bag B costs $15/kg. With a $4 delivery charge on Bag B, it becomes $19/kg. Bag A is now cheaper per kilogram for this one-bag purchase. Discounts, shipping and minimum quantities can reverse a comparison.',
    takeaway: 'Compare the same unit after adding the costs that apply to your actual purchase.',
    challenge: 'What if you ordered three bags and the shipping fee stayed fixed at $4?',
  },
]

type Phase = 'decide' | 'reveal' | 'reconsider' | 'learn'

function ScenarioExperience({ scenario, onClose, onNext }: { scenario: Scenario; onClose: () => void; onNext: () => void }) {
  const [phase, setPhase] = useState<Phase>('decide')
  const [first, setFirst] = useState<number | null>(null)
  const [second, setSecond] = useState<number | null>(null)
  const [estimate, setEstimate] = useState(50)
  const [showFinePrint, setShowFinePrint] = useState(false)
  const secondChoices = scenario.secondChoices ?? scenario.choices
  const phases: Phase[] = ['decide', 'reveal', 'reconsider', 'learn']
  const currentIndex = phases.indexOf(phase)
  const close = () => { onClose() }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = oldOverflow }
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="experience" role="dialog" aria-modal="true" aria-label={`${scenario.title} interactive scenario`}>
        <div className="experience-top">
          <div className="experience-brand"><span className="eye-mini"><Eye size={16} /></span> SECOND LOOK <span className="subtle-slash">/</span> THE LAB</div>
          <button className="icon-button" onClick={close} aria-label="Close interactive scenario"><X size={20}/></button>
        </div>
        <div className="experience-progress" aria-label={`Step ${currentIndex + 1} of 4`}>
          {phases.map((p, i) => <span key={p} className={i <= currentIndex ? 'on' : ''}/>) }
        </div>
        <div className="experience-content" key={`${scenario.id}-${phase}`}>
          <div className="eyebrow emerald">{scenario.topic.toUpperCase()} <span className="dot-sep">•</span> {currentIndex + 1} / 4</div>
          {phase === 'decide' && <>
            <h2>{scenario.title}</h2>
            <p className="experience-question">{scenario.question}</p>
            {scenario.kind === 'comparison' && <div className="mini-deals" aria-label="Compare coffee offers"><div><small>OPTION A</small><strong>750 g</strong><span>$12.00</span><small>Before delivery</small></div><div><small>OPTION B</small><strong>1 kg</strong><span>$15.00</span><small>Before delivery</small></div></div>}
            {scenario.kind === 'booking' && <div className="mock-offer" aria-label="Fictional hotel booking offer"><small>SIMULATED BOOKING PAGE</small><strong>Only 2 rooms left!</strong><span>Offer timer: 08:42</span><button type="button" className="mock-terms-button" onClick={() => setShowFinePrint(v => !v)} aria-expanded={showFinePrint}>{showFinePrint ? 'Hide' : 'Inspect'} booking terms <ArrowRight size={14}/></button>{showFinePrint && <p>Cancellation fees apply after booking. Displayed availability and countdown are not independently verified.</p>}</div>}
            {scenario.kind === 'estimate' ? <div className="estimate-panel"><label htmlFor="estimate-percentage">Your estimate: <strong>{estimate}%</strong></label><input id="estimate-percentage" aria-label="Percentage of U.S. adults" type="range" min="0" max="100" step="1" value={estimate} onChange={e => setEstimate(Number(e.target.value))}/><div className="range-axis"><span>0%</span><span>100%</span></div><p>Use the slider to lock in your guess. The actual result appears only after you continue.</p></div> : <div className="options-list" role="group" aria-label="Choose your first answer">
              {scenario.choices.map((text, i) => <button className={`option ${first === i ? 'selected' : ''}`} key={i} type="button" aria-pressed={first === i} onClick={() => setFirst(i)}><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{text}</span>{first === i && <Check size={18} className="option-check"/>}</button>)}
            </div>}
            <button disabled={scenario.kind !== 'estimate' && first === null} className="button-primary wide" onClick={() => setPhase('reveal')}>Reveal new information <ArrowRight size={18}/></button>
          </>}
          {phase === 'reveal' && <>
            <div className="reveal-symbol"><Sparkles size={26}/></div>
            <h2>{scenario.revealTitle}</h2>
            <p className="experience-question">{scenario.newEvidence}</p>
            {scenario.kind === 'estimate' && <div className="estimate-results"><div><span>YOUR ESTIMATE</span><strong>{estimate}%</strong><span className="estimate-meter"><i style={{width: `${estimate}%`}}/></span></div><div><span>PEW RESEARCH 2025</span><strong>71%</strong><span className="estimate-meter published"><i style={{width:'71%'}}/></span></div><p>Your estimate differed by {Math.abs(estimate - 71)} percentage points. The question measured reported use, not daily activity.</p></div>}
            <div className="choice-recap"><span>{scenario.kind === 'estimate' ? 'YOUR ORIGINAL ESTIMATE' : 'YOUR ORIGINAL DECISION'}</span><strong>{scenario.kind === 'estimate' ? `${estimate}%` : first !== null ? scenario.choices[first] : 'Not selected'}</strong></div>
            <button className="button-primary wide" onClick={() => setPhase('reconsider')}>Take a second look <ArrowRight size={18}/></button>
          </>}
          {phase === 'reconsider' && <>
            <h2>Would you decide differently?</h2>
            <p className="experience-question">{scenario.secondQuestion}</p>
            <div className="options-list" role="group" aria-label="Choose your answer after the new information">
              {secondChoices.map((text, i) => <button className={`option ${second === i ? 'selected' : ''}`} key={i} type="button" aria-pressed={second === i} onClick={() => setSecond(i)}><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{text}</span>{second === i && <Check size={18} className="option-check"/>}</button>)}
            </div>
            <button disabled={second === null} className="button-primary wide" onClick={() => setPhase('learn')}>See the explanation <ArrowRight size={18}/></button>
          </>}
          {phase === 'learn' && <>
            <div className="result-pill"><Check size={14}/>Second look completed</div>
            <div className="decision-review"><div><span>FIRST RESPONSE</span><strong>{scenario.kind === 'estimate' ? `${estimate}%` : first === null ? 'Not recorded' : scenario.choices[first]}</strong></div><ArrowRight size={17} aria-hidden="true"/><div><span>AFTER NEW EVIDENCE</span><strong>{second === null ? 'Not recorded' : secondChoices[second]}</strong></div></div>
            <h2>{scenario.explanationTitle}</h2>
            <p className="experience-question smaller">{scenario.explanation}</p>
            <div className="takeaway"><div className="takeaway-icon"><ShieldCheck size={20}/></div><div><strong>THE TAKEAWAY</strong><p>{scenario.takeaway}</p></div></div>
            <div className="challenge"><strong>TRY THE IDEA AGAIN</strong><p>{scenario.challenge}</p></div>
            {scenario.resource && <a className="resource-link" target="_blank" rel="noopener noreferrer" href={scenario.resource.url}>Further reading: {scenario.resource.label} <ArrowUpRight size={14}/></a>}
            <div className="result-actions"><button className="button-outline" onClick={() => {setPhase('decide'); setFirst(null); setSecond(null); setEstimate(50); setShowFinePrint(false)}}>Try again</button><button className="button-primary" onClick={onNext}>Try another <ArrowRight size={17}/></button><button className="button-outline" onClick={close}>Back to the Lab</button></div>
          </>}
        </div>
        <div className="experience-footer"><LockKeyhole size={14}/> Fictional scenario • Private practice only • No responses collected</div>
      </div>
    </div>
  )
}

function App() {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [topic, setTopic] = useState<'All' | Topic>('All')
  const filtered = topic === 'All' ? scenarios : scenarios.filter(s => s.topic === topic)
  const go = (id: string) => {setMenuOpen(false); document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}

  return <>
    <div className="announcement"><span className="announcement-dot"/> AN INDEPENDENT EXPERIMENT IN BETTER THINKING <span className="announcement-right">EARLY ACCESS • VOL. 01 <ArrowUpRight size={13}/></span></div>
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Second Look Lab home">
          <span className="brand-mark"><Eye size={25} strokeWidth={2}/></span><span>SECOND <i>LOOK</i><small>LAB</small></span>
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          <button onClick={() => go('stories')}>Explore stories</button>
          <button onClick={() => go('how-it-works')}>Our approach</button>
          <button onClick={() => go('science')}>The science</button>
          <button onClick={() => go('about')}>About</button>
        </nav>
        <button className="nav-cta" onClick={() => {setActiveScenario(scenarios[1]);setMenuOpen(false)}}>Enter the Lab <ArrowUpRight size={16}/></button>
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen(m=>!m)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true"/>
        <div className="hero-orbit hero-orbit-one" aria-hidden="true"/>
        <div className="hero-orbit hero-orbit-two" aria-hidden="true"/>
        <div className="container hero-body">
          <div className="hero-copy">
            <div className="eyebrow light"><span className="line"/> THINKING CLEARLY IN A NOISY WORLD</div>
            <h1>What if there's<br/><em>more to the story?</em></h1>
            <p>We make thousands of judgments every day. Some in a split second. Explore the details we miss, the stories we believe, and the decisions that shape our lives.</p>
            <div className="hero-actions"><button className="button-light" onClick={() => go('stories')}>Explore the stories <ArrowUpRight size={18}/></button><button className="button-ghost-light" onClick={() => go('how-it-works')}>How it works <ArrowRight size={17}/></button></div>
            <div className="hero-footnote"><span className="footnote-line"/> NO HYPE. NO EASY ANSWERS. JUST A SECOND LOOK.</div>
          </div>
          <div className="hero-art" aria-label="A visual illustration of two perspectives">
            <div className="orbital-ring outer"/><div className="orbital-ring middle"/><div className="orbital-ring inner"/>
            <div className="hero-symbol"><div className="hero-lens"><Eye size={86} strokeWidth={1.25}/></div></div>
            <div className="float-note top-note"><span className="small-note-tag">01 / FIRST IMPRESSION</span><strong>It seems obvious.</strong></div>
            <div className="float-note bottom-note"><span className="small-note-tag">02 / NEW CONTEXT</span><strong>Look again.</strong><span className="tiny-line"/></div>
            <div className="hero-art-tag">SHIFT YOUR PERSPECTIVE <ArrowDownRight size={13}/></div>
          </div>
        </div>
        <div className="hero-bottom-border"/>
      </section>

      <section className="intro-strip">
        <div className="container intro-strip-inner"><div className="intro-label"><Sparkles size={17}/> OUR IDEA IN A SENTENCE</div><p>Not here to tell you <em>what</em> to think. Here to explore <em>how</em> we think.</p><span className="intro-asterisk">✳</span></div>
      </section>

      <section className="stories-section section-padding" id="stories">
        <div className="container">
          <div className="section-heading"><div><div className="eyebrow dark"><span className="line"/> THE READING ROOM / 001</div><h2>Stories worth<br/><em>thinking twice about.</em></h2></div><p>Every story begins with a question. Your answer might change when you see what was missing.</p></div>
          <div className="topic-filters" aria-label="Filter stories by subject">{(['All','Human behavior','Digital trust','Everyday traps'] as const).map(t => <button key={t} className={topic === t ? 'active' : ''} onClick={()=>setTopic(t)}>{t}{topic === t && <span className="filter-dot"/>}</button>)}</div>
          <div className="story-grid">{filtered.map((s) => <article className={`story-card story-${s.id}`} key={s.id}>
            <button className="story-cover" onClick={() => setActiveScenario(s)} aria-label={`Open ${s.title} interactive story`}>
              <div className="cover-top"><span>FIELD NOTES / {s.number}</span><ArrowUpRight size={19}/></div>
              {s.id === 'ai-apology' && <div className="cover-visual apology-visual"><span className="chat-bubble b1">I know I hurt you...</span><span className="chat-bubble b2">I want to do better.</span><span className="chat-spark"><Sparkles size={25}/></span></div>}
              {s.id === 'the-bank-call' && <div className="cover-visual bank-visual"><div className="fake-phone"><div className="phone-notch"/><div className="calling-icon"><Fingerprint size={29}/></div><strong>UNKNOWN CALLER</strong><small>“Your bank's fraud team”</small><div className="call-controls"><span/><span/></div></div></div>}
              {s.id === 'only-two-left' && <div className="cover-visual hotel-visual"><div className="booking-pane"><span className="pane-top">LIMITED AVAILABILITY</span><strong>ONLY 2 LEFT</strong><div className="mock-countdown"><Clock3 size={16}/> 08:42</div><span className="pane-bottom">BOOK BEFORE IT'S GONE</span></div></div>}
            </button>
            <div className="story-info"><div className="story-meta"><span>{s.topic.toUpperCase()}</span><span>{s.readTime} READ</span></div><button className="story-title-button" onClick={() => setActiveScenario(s)}><h3>{s.title}</h3></button><p>{s.teaser}</p><button className="text-cta" onClick={() => setActiveScenario(s)}>Take a second look <ArrowUpRight size={17}/></button></div>
          </article>)}</div>
          <p className="stories-note"><CircleHelp size={15}/> Stories are fictional thought experiments. No fabricated stories are presented as reader submissions.</p>
        </div>
      </section>

      <section className="method-section section-padding" id="how-it-works">
        <div className="container method-layout">
          <div className="method-copy"><div className="eyebrow light"><span className="line"/> THE SECOND LOOK METHOD</div><h2>First, decide.<br/><em>Then discover.</em></h2><p>The most interesting part of a story sometimes arrives after you've already made up your mind. Our interactive stories let you experience that moment for yourself.</p><button className="button-light" onClick={() => setActiveScenario(scenarios[0])}>Try a 3-minute scenario <ArrowUpRight size={18}/></button></div>
          <div className="method-steps">
            {[{num:'01',title:'Make the call',desc:'Read a realistic situation and choose what you would do.',icon:<MousePointerClick size={21}/>},{num:'02',title:'See what was missing',desc:'Discover a detail that changes the picture.',icon:<Eye size={21}/>},{num:'03',title:'Think again',desc:'Revisit your judgment with more context.',icon:<Layers3 size={21}/>},{num:'04',title:'Take it into real life',desc:'Leave with one idea you can actually use.',icon:<ArrowUpRight size={21}/>}].map((it)=><div className="method-step" key={it.num}><span className="step-num">{it.num}</span><div><h3>{it.title}</h3><p>{it.desc}</p></div><span className="step-icon">{it.icon}</span></div>)}
          </div>
        </div>
      </section>

      <section className="science-section section-padding" id="science"><div className="container science-layout"><div className="science-art"><div className="science-outline"><span className="science-lbl sl-one">ASSUMPTION</span><span className="science-lbl sl-two">EVIDENCE</span><span className="science-lbl sl-three">PERSPECTIVE</span><div className="science-ellipses"><div/><div/><div/></div></div><div className="science-quote">“I hadn't<br/>considered that.”</div></div><div className="science-copy"><div className="eyebrow dark"><span className="line"/> BEYOND THE HOT TAKE</div><h2>Curiosity is<br/><em>a better habit.</em></h2><p>We explore human behavior, digital trust, and the design of everyday decisions. When we discuss psychology or security, we separate evidence from opinion and explain what a single scenario cannot prove.</p><div className="science-values"><div><BookOpen size={20}/><span>Evidence before certainty</span></div><div><HeartHandshake size={20}/><span>Different views, without the shouting</span></div><div><ShieldCheck size={20}/><span>Practical lessons, not fear</span></div></div></div></div></section>

      <section className="newsletter-section" id="about"><div className="container newsletter-layout"><div><div className="eyebrow light"><span className="line"/> AN INDEPENDENT PROJECT</div><h2>Look closer.<br/><em>Think better.</em></h2><p>Second Look Lab is an early public learning experiment about trust, choices, and digital life. We're building useful, original stories before building a business.</p><div className="label-row"><span><Check size={14}/> No fake testimonials</span><span><Check size={14}/> No pretend survey results</span><span><Check size={14}/> No spam</span></div></div><aside className="org-card"><span className="org-icon"><MailWarning size={26}/></span><div className="eyebrow emerald">FOR TEAMS & ORGANIZATIONS</div><h3>Imagine training that makes people think.</h3><p>We're exploring a future library of interactive scenarios for security awareness and AI literacy. This is a concept in development, not a product for sale yet.</p><span className="org-status"><span/> RESEARCH STAGE</span></aside></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><span className="brand-mark mini"><Eye size={19}/></span><span>SECOND LOOK LAB</span></div><p>Better questions. Better judgment. More perspective.</p><span>© {new Date().getFullYear()} Second Look Lab · Concept prototype v0.1</span></div></footer>
    {activeScenario && <ScenarioExperience key={activeScenario.id} scenario={activeScenario} onClose={() => setActiveScenario(null)} />}
  </>
}

export default App
