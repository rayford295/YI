# Hosting

## Status

The repository is private and the site is not published. We rehearsed a public release on
GitHub Pages on 2026-10-24 (it worked: <https://rayford295.github.io/Yi-at-First-Sight/>),
then took it down to add more features first.

## When Ready to Publish: GitHub Pages (Public, Free)

1. Make the repository public: **Settings → General → Danger Zone → Change visibility**.
2. **Settings → Pages → Source: GitHub Actions**.
3. Add this job to `.github/workflows/ci.yml` (after `test-and-build`, which must upload
   `dist` with `actions/upload-pages-artifact@v3` instead of `actions/upload-artifact`):

   ```yaml
     deploy:
       if: github.ref == 'refs/heads/main' && github.event_name == 'push'
       needs: test-and-build
       runs-on: ubuntu-latest
       permissions:
         pages: write
         id-token: write
       concurrency:
         group: pages
         cancel-in-progress: false
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

4. Push to `main`. The site appears at <https://rayford295.github.io/Yi-at-First-Sight/>
   about a minute later and updates on every push. `index.html` carries `noindex, nofollow`,
   so search engines are asked not to list it, but anyone with the link can open it.

To take it offline again: **Settings → Pages → Unpublish site**, then make the repository
private.

## Later: a Private Version

If we ever want a login in front of it, the plan below keeps the same code and adds a
login gate. It is optional.


Goal: Jingyi opens one link on her phone, signs in with her email, and sees the site.
Nobody else can.

The site is static (`dist/` after `npm run build`), so any static host works. The plan below
uses **Cloudflare Pages** for hosting and **Cloudflare Access** for the login gate; both are
free at this scale, and Pages can build straight from the GitHub repository (private or
public). GitHub Pages cannot add a login, and on a free account it only serves public repositories.

## One-Time Setup (About 15 Minutes)

### 1. Create the Pages project

1. Sign in at <https://dash.cloudflare.com> (create a free account if needed).
2. **Workers & Pages → Create → Pages → Connect to Git**, authorise GitHub, pick
   `rayford295/Yi-at-First-Sight`.
3. Build settings:
   - Production branch: `main`
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. **Save and Deploy**. The first build takes a minute or two and gives a URL like
   `https://yi-at-first-sight.pages.dev`. Every later push to `main` redeploys automatically.

### 2. Lock it behind a login

1. **Zero Trust** (left sidebar) → pick the free plan when asked.
2. **Access → Applications → Add an application → Self-hosted**.
   - Application name: `Yi at First Sight`
   - Application domain: `yi-at-first-sight.pages.dev` (the URL from step 1)
   - Session duration: `1 month` (so she is not asked to sign in every visit)
3. **Add a policy**: name `us`, action **Allow**, include **Emails** and list exactly two
   addresses: Yifan's and Jingyi's.
4. Identity providers: keep **One-time PIN**. Visitors type their email and receive a
   six-digit code; no password, no app to install.
5. Save. Open the URL in a private window to confirm it asks for an email first.

Pages also creates preview URLs (`<hash>.yi-at-first-sight.pages.dev`) for other branches.
To cover them with the same login, add a second application with domain
`*.yi-at-first-sight.pages.dev` and the same policy, or turn off preview deployments in the
Pages project settings.

### 3. (Optional) a nicer address

If you own a domain, **Custom domains** in the Pages project adds, for example,
`love.example.com`; then add that domain to the Access application too.

## Before Her Birthday

- Rewrite the letter (`src/features/birthday-map/letter.ts`) and push.
- Open the production URL on a phone, sign in with your own email, and click through every
  page once. The first sign-in from a new device sends the code to the email on the policy.
- Send her the link, and tell her to use the email you listed in the policy.

## Notes

- Fonts load from Google Fonts and map tiles from OpenStreetMap; both are reachable from the
  United States. Access from mainland China is not a goal for v1.
- Photos are served by Pages behind Access, so only signed-in visitors can fetch them.
- Nothing in the site needs secrets or environment variables; there is no backend.
