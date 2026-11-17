# Second Look Lab

**Interactive decision entertainment** - a public, English-language experiment in decisions, everyday traps, and playful evidence-based learning. This is **not** the future enterprise/B2B training platform.

## Interactive v0.2

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
- All interactions are local to the browser. There are **no votes saved, user accounts, real poll data, cookies or trackers**.

**Source for Gut vs. Data:** Pew Research Center, [Americans' Social Media Use 2025](https://www.pewresearch.org/internet/2025/11/20/americans-social-media-use-2025/), survey February 5 - June 18, 2025. Reported Facebook use is **not** the same as daily use.

## Development

```bash
npm install
npm run dev
npm run build
```

Vite builds a static site; `src/styles.css` retains the original editorial styling and `src/v02.css` extends it for interactive components. No backend needed for this MVP.

### Automated verification and deployment

- `.github/workflows/verify.yml` runs `npm run build` on pull requests and the feature branch.
- `.github/workflows/deploy.yml` deploys `main` to GitHub Pages.
- Pages **Source** needs to be set to **GitHub Actions**.

## Boundaries and next steps

The current sample is for testing interaction, editorial tone and usability. It does not validate market demand or learning outcomes. Real community statistics, analytics, a newsletter and payment features require separate design and lawful implementation. Prioritize small tests with actual users, source quality and accessibility before expanding content and infrastructure.
