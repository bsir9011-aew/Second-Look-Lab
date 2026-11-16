# Second Look Lab

A public-facing, English-language editorial and interactive learning prototype. Separate from the future enterprise training platform.

## What's included
- Responsive editorial home page, category navigation, mission and research standards.
- Three original, explicitly fictional interactive scenarios: AI apology, spoofed bank call and false scarcity timer.
- The learning loop: first decision → new evidence → second decision → explanation → practical takeaway.
- Reduced-motion accessibility support, keyboard-friendly controls, no analytics, no cookies, no accounts.
- Editorial content and scenarios run locally in the browser; **there is no real poll or server-side recording**.
- A small non-commercial "For organizations" information area (not a live product or offer).

## Run locally

```bash
npm install
npm run dev
```

Build: `npm run build`.

## Publish to GitHub Pages (no Codespaces required)

1. Create an empty **public** repository named `second-look-lab` (initialize with a README if uploading through the GitHub web UI).
2. Upload/push the files, including `.github/workflows/deploy.yml`. The workflow installs dependencies on GitHub.
3. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as source.
4. Open the **Actions** tab and confirm that `Deploy to GitHub Pages` completes successfully.
5. GitHub Pages will provide the site URL in the workflow deployment or Settings → Pages.

When you push updates to `main`, the site rebuilds and redeploys automatically. Repository must permit Actions and Pages.

## Scope and boundaries

This is an early design prototype. It must not imply statistically representative polls, claim that fictional scenarios happened, or present simplified explanations as clinical advice. Public and business data should remain separate in a future architecture. Verify legal/regulatory statements and scientific references before publishing substantial educational articles.
