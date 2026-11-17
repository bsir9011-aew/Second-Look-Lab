# Second Look Lab - usability test protocol (v0.3)

## What we are testing

The new **The Family Text** simulation is a fictional learning experience about verifying an urgent money request from an unfamiliar number.

We distinguish three types of evidence:
1. **Scripted browser tests** in Playwright: verify buttons, branching, dialogs, keyboard exit, and responsive layout. These are automated software checks, **not** simulated people giving opinions.
2. **Synthetic persona reviews** (optional, using a separate tool): useful for finding confusing wording and potential barriers. Treat opinions as hypotheses, not actual visitor preferences.
3. **Real users** (recommended): only these can tell us whether a scenario feels genuinely interesting.

## Low-cost first user test: 5-8 people

Share the public GitHub Pages URL with people who do not know the project. Try to include:
- Someone comfortable with technology
- Someone who rarely plays browser games
- Someone over 50
- Someone who mainly uses a phone
- Someone who dislikes long written instructions

Ask each person to **use the page normally without an introduction** and, if possible, observe without giving hints. No need to collect names, ages, emails, or individual responses from the simulation.

### Tasks (7-10 minutes)
1. Open Second Look Lab from a direct link.
2. Find and complete the highlighted message simulation.
3. Explain in one sentence what the simulation was teaching.
4. Try a second experience of their choice.

### Ask afterward
- What made you stop and read, or skip?
- At which point did you feel uncertain about what to do?
- Did your action change anything meaningful in the story?
- Did any text or button feel confusing?
- Would you willingly try a second story? Why / why not?

### Observe rather than assume
- Could the user start without help?
- Where did they hesitate or backtrack?
- Did they complete the full story?
- Did they voluntarily choose another challenge?
- Did they understand that the family-text story was fictional and collected no data?

## Decision criteria

- Fix immediately: broken navigation, inaccessible controls, incorrect security advice, privacy ambiguity.
- Consider redesign: more than one person independently gets stuck at the same point.
- Do not mistake five positive comments for proven demand or conversion potential.
- Do not claim synthetic review feedback was obtained from actual website visitors.

## Next experiments

If real users engage, test a second distinct narrative format before adding accounts, analytics or payments. If they rush through, shorten scenes and make each choice change visible content rather than adding more text.
