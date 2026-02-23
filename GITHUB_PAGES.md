# Deploying to GitHub Pages

This project is set up to build and deploy to GitHub Pages via GitHub Actions.

## One-time setup

1. **Enable GitHub Pages from Actions**
   - In your repo: **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to **GitHub Actions**

2. **Push to `main`**
   - Pushing to the `main` branch runs the workflow and deploys the site.
   - Your site will be at: `https://<username>.github.io/<repo-name>/`

## Optional: Supabase in production

If the app needs Supabase in production, add repository secrets and use them in the workflow:

1. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. In `.github/workflows/deploy-pages.yml`, uncomment the env lines in the build job:
   ```yaml
   VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
   VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
   ```

## Local build matching GitHub Pages

To build locally with the same base path as GitHub Pages (e.g. to test the built app):

```bash
# Replace "project" with your repo name
$env:VITE_BASE="project"; npm run build
npm run preview
```

Then open the URL shown by `preview` (e.g. `http://localhost:4173/project/`).
