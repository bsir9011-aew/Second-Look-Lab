# Second Look Lab

**Interactive decision entertainment** - a public, English-language experiment in decisions, everyday traps, and playful evidence-based learning. This is **not** the future enterprise/B2B training platform.

## Interactive v0.7 - The Screenshot mystery

**The Screenshot** is a new five-act fictional investigative story with a stronger game loop:
1. Receive a cropped screenshot implying fraud at a community fundraiser.
2. Choose whether to broadcast, ask privately, or pause and check the source; see a distinct immediate consequence.
3. Inspect a board of three independently expandable artifacts (full conversation, uncropped rehearsal slide, and public livestream record), in any order.
4. Reconsider the claim after learning that the screenshot is authentic, but its cropped framing is misleading.
5. Choose how to handle the spreading rumor and see one of **three genuinely different endings**.

This story does not use actual charity records, made-up audience vote totals or pretend user data. It explores why a real quote can mislead without source context and why correcting a circulating rumor calls for verifiable evidence.

- Reach the story via the homepage's new prominent banner, the primary hero CTA, or the **Dossier**.
- It counts as an eighth unique experience in **Detect**, granting 120 discovery XP only once. Alternate paths remain playable with no additional XP.
- Uses the existing v2 local storage and JSON Lab Passport format: old progress imports unchanged; old backups remain valid.
- Focus Mode hides XP banners in the mystery. No choices are stored, recorded or transmitted.
- Included in offline PWA app shell. Dedicated Playwright tests cover the evidence board, three endings, mobile layout, keyboard Escape, replay protection, Focus Mode, and offline completion.
- Caveat: this is a new simulated story whose enjoyability has not been established with real users. The outcomes are educational scenarios, not psychological assessments.

## Mobile Lab v0.6 - installable PWA

This is still the same public Second Look Lab website. It can now be installed as a **Progressive Web App** (PWA) where the browser supports it, without an app store or an account.

- Production build generates a manifest-compatible **192×192 and 512×512 PNG eye icon** and a **versioned, path-scoped service worker**, with no new runtime dependencies. The deployment continues to work under the GitHub Pages project URL `/Second-Look-Lab/`.
- Once the website has been opened online and the service worker has completed caching, the **core website and interactive stories can open offline**. External research links are *not* available offline, and newly published content still needs an internet connection to arrive.
- On mobile the UI adds three quick links (Home / Play / Dossier), reduces the footprint of the simulated conversation, scrolls to the latest message and gives the scenario modal the full screen height.
- The optional install panel shows a native install prompt where `beforeinstallprompt` is supported and plain instructions where it is not (including iOS Safari). **Do not claim automatic installation on iOS**.
- The PWA uses **the same scenario and XP code** as the website. PWA storage may be separate from browser storage on some platforms; users should **export Lab Passport** before relying on installation to preserve local progress.
- Manifest shortcuts `?launch=stories` and `?launch=dossier` open the intended screen for supported launchers.

### PWA quality checks

```bash
npm run build
npm run test:e2e
npm run test:pwa
```

The PWA tests use the production **Vite preview**, not the development server, to verify generated install icons, manifest, service worker control and a story completed while offline on desktop and emulated mobile. These are software tests; a physical-device install and real-user desirability are not yet confirmed.

## Interactive v0.5.1 - Dossier usability improvements

- Replace the large sticky two-column Dossier with a full-width introduction and balanced, responsive panels.
- Add a **Next Discovery** button recommending an actually unfinished story (featured collection first; then the rest of the library). If every current story is explored, offer a replay without claiming that new content exists.
- Make the **Trust & Deception** entries clickable, opening the correct story including the separate immersive Family Text simulation. Already completed entries offer replay.
- Make the full experience index expandable and playable, keeping the default page shorter without losing access.
- Preserve rank, XP, Focus Mode, Passport and all existing saved progress. Navigation changes do not affect awards.
- Validate desktop and emulated mobile usability via Playwright; these are software checks, not human feedback.

## Interactive v0.5 - The Second Look Dossier

The existing level system is extended, not replaced:

- **Three Lenses**: Decide, Detect, Play counts from existing completed experiences; no inferences about intelligence or ability.
- **One collection**: Trust & Deception (bank call, family text and hotel pressure).
- **Three genuine badges**: First Second Look; Across the Lab; Trust Decoder. These describe exploration only.
- **Focus Mode**: hides XP, rank and badges, including XP announcements inside finished scenarios. Discoveries are still counted locally.
- **Lab Passport**: download/copy JSON; paste to **import and merge** progress into another browser, without an account. No answers or identity data in the Passport.
- **Automatic upgrade from v0.4**: older `second-look-lab:journey:v1` data is read and copied to `second-look-lab:dossier:v2` while preserving unique completions and 120 XP per experience.
- Progress is still **local to the device/browser**, not automatically synchronized. Passports are plain-text and can be edited: they are not cryptographic proof or certificates.

Canonical product principles for future sessions: [docs/PRODUCT_PRINCIPLES.md](docs/PRODUCT_PRINCIPLES.md).

## Interactive v0.4 - local progress and levels

The original v0.4 introduced an optional, private **Your Journey** progression panel: levels **0 to 10**, 120 discovery XP per *unique* completed experience, progress toward the next rank, and a collection of seven completed experiences. The level reflects participation in the site, **not tested skills, professional competence or a certificate**.

Progress is stored only in browser `localStorage` under `second-look-lab:journey:v1`. It does not require an account or backend and is never sent to a server. Replay doesn't add XP; a reset button clears local progress after confirmation. Different devices/browsers have different progress. Some high levels are intentionally not reachable until more original experiences are published.

## Interactive v0.3

New **The Family Text** experience: a fictional, branching SMS story with a simulated phone screen, an initial decision, new evidence, an independent-verification choice and contextual feedback. The interface never asks for real personal data or transfers money. It is shown as a featured immersive story on the homepage.

The original six scenarios remain available under Decide / Detect / Play.

### v0.2 scenario library

Six original experiences across **Decide / Detect / Play**:

| Section | Experience | Mechanic |
| --- | --- | --- |
| Decide | The apology written by AI | Two-stage social judgment |
| Decide | The friend who always cancels | New social context changes the decision |
| Detect | The call from your bank | Independent verification after spoofing disclosure |
| Detect | Only two rooms left | Mock booking, inspectable terms and resetting scarcity claim |
| Play | Gut vs. Data: how many use Facebook? | Percent estimate vs a dated Pew Research survey |
| Play | The better deal | Per-unit price comparison before and after a delivery charge |

Other features:
- Mobile-friendly editorial design, a featured experience rotated daily from an existing collection and filtered browsing.
- Different first and second questions where appropriate; choices are not compared mechanically when their meanings differ.
- Meaningful result recap, next-experience button and source link for the statistics game.
- Stories and booking interfaces are **fictional simulations**. No fake reader testimonials or community statistics.
- All interactions are local to the browser. There are **no decision answers saved, user accounts, real poll data, analytics cookies or trackers**. Only the local list of uniquely completed experiences is stored for leveling.

**Source for Gut vs. Data:** Pew Research Center, [Americans' Social Media Use 2025](https://www.pewresearch.org/internet/2025/11/20/americans-social-media-use-2025/), survey February 5 - June 18, 2025. Reported Facebook use is **not** the same as daily use.

## Development

```bash
npm install
npm run dev
npm run build
npm run test:e2e
```

Vite builds a static site; `src/styles.css` retains the original editorial styling and `src/v02.css` extends it for interactive components. No backend needed for this MVP.

### Automated verification and deployment

- `.github/workflows/verify.yml` runs the TypeScript/Vite build and scripted Chromium browser journeys including v0.4 migration, Passport importing, Focus Mode, progress persistence and replay protection (desktop and mobile) on pull requests. These tests check software behavior; they are **not** human usability feedback.
- `.github/workflows/deploy.yml` deploys `main` to GitHub Pages.
- Pages **Source** needs to be set to **GitHub Actions**.

A future optional small-group usability protocol for 5-8 real people is available in [`docs/TESTING.md`](docs/TESTING.md). Synthetic persona feedback is not presented as feedback from real visitors.

## Boundaries and next steps

The current sample is for testing interaction, editorial tone and usability. It does not validate market demand or learning outcomes. Real community statistics, analytics, a newsletter and payment features require separate design and lawful implementation. Currently, rely on automated browser tests and explicitly labelled synthetic reviews if available; these do not establish real user interest. Prioritize source quality, accessibility and testing with real users when feasible before major investment.
