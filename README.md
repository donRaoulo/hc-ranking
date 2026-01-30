# RG Ranking (Create React App + GitHub Pages)

## Was ist das?
- `chars.txt`: 1 Char-Name pro Zeile
- GitHub Action erzeugt regelmäßig `public/ranking.json` (mit Playwright/Chromium)
- React App zeigt Rangliste aus `ranking.json` (kein CORS/kein Live-Scraping im Browser)

## Setup (GitHub)
1. Repo erstellen und diese Dateien hochladen.
2. In `package.json` die `homepage` setzen auf:
   `https://DEIN_GITHUB_USER.github.io/DEIN_REPO_NAME`
3. Repo → **Settings → Pages** → **Source: GitHub Actions**
4. Actions laufen lassen:
   - `Build ranking.json` erzeugt/aktualisiert `public/ranking.json`
   - `Deploy to GitHub Pages` veröffentlicht die Seite

## Hinweise
- Wenn `ranking.json` leer bleibt, schau in den GitHub Actions Logs: evtl. liefert Rising-Gods 403 für GitHub Runner.
- Du kannst das Update-Intervall im Workflow ändern (cron).
