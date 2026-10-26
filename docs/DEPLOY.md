# Hosting

## Status

Live at <https://jingyifan.love/> since 2026-10-26. The repository is **private** again (the
account's plan allows Pages from a private repository, checked 2026-10-26: the site stayed up and
redeployed after the switch), GitHub Pages has
`jingyifan.love` as its custom domain with **Enforce HTTPS** on, `www.` and the old
`rayford295.github.io/YI/` address redirect there, and the DNS at Cloudflare is in place. Every push to
`main` redeploys through the `deploy` job in `.github/workflows/ci.yml`, which only runs while
the repository variable `PUBLISH` is `true` (Settings → Secrets and variables → Actions →
Variables); unset it and the job is skipped, CI stays green and the site stays as it was.
`index.html` carries `noindex, nofollow`, and the site opens with a question only the two of us
can answer (`src/core/gate.ts`), so a public URL shows strangers nothing but that question.
With the repository private the source and the photos in it are ours alone; the built site is
public at the domain, behind the gate. Making the repository public again is never needed for
publishing.

Addresses are clean paths (`/cs`, `/sync?c=J7A`), not `#/cs`. Pages has no rewrite rules, so
the build copies `index.html` to `404.html` (the `spa-404` plugin in `vite.config.ts`): Pages
answers any unknown path with it, the app starts and reads `location.pathname`
(`src/core/router.ts`). Links with the old `#/` still open the same page. If the site ever moves
off the domain root (say back to `/YI/`), set Vite's `base` to that folder and the manifest's
`start_url` / `scope` with it.

## The Domain: jingyifan.love

Bought at Cloudflare Registrar (at cost, WHOIS privacy and auto-renew included), so the DNS
lives in the Cloudflare dashboard: **jingyifan.love → DNS → Records**. The site is built with
`base: './'`, so it runs at the root of a domain and under `/YI/` alike; nothing in the code
changes with the address.

### DNS records (Cloudflare dashboard → DNS → Records)

| Type | Host | Value | Why |
|---|---|---|---|
| A | `@` | `185.199.108.153` | GitHub Pages, apex |
| A | `@` | `185.199.109.153` | |
| A | `@` | `185.199.110.153` | |
| A | `@` | `185.199.111.153` | |
| AAAA | `@` | `2606:50c0:8000::153` | IPv6, optional but recommended |
| AAAA | `@` | `2606:50c0:8001::153` | |
| AAAA | `@` | `2606:50c0:8002::153` | |
| AAAA | `@` | `2606:50c0:8003::153` | |
| CNAME | `www` | `rayford295.github.io` | so `www.jingyifan.love` also works |

Add each record with **Proxy status: DNS only** (grey cloud), not Proxied, until GitHub has
issued the certificate; afterwards it can stay DNS only (simplest) or be switched to Proxied with
SSL/TLS mode set to *Full*. Delete any placeholder records Cloudflare created. Leave TTL on Auto.

### GitHub side

1. **Settings → Pages → Custom domain**: enter `jingyifan.love`, save. GitHub checks the DNS
   (a few minutes after the records are added; up to a day in the worst case).
2. Tick **Enforce HTTPS** once the check passes and the certificate is issued (usually within
   an hour).
3. `public/CNAME` keeps the domain across deploys from Actions; do not delete it.
4. Optional: **Settings → Pages → Verified domains** on the profile (`github.com/settings/pages`)
   adds `jingyifan.love` as a verified domain, which stops anyone else's Pages site from
   claiming it if ours is ever unpublished.

After this the site answers at `https://jingyifan.love/` (and `www.` redirects there);
the old `rayford295.github.io/YI/` address redirects to the domain as well.

### If hosting moves to Cloudflare Pages

Add `jingyifan.love` under the Pages project's **Custom domains**; Cloudflare writes the DNS
records itself when the domain is on Cloudflare, otherwise it shows the CNAME to add. Add the
same domain to the Access application so the login covers it.

## How It Was Published: GitHub Pages (Public, Free)

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

4. Push to `main`. The site appears at <https://jingyifan.love/> (or at
   <https://rayford295.github.io/YI/> before the domain is set up) about a minute later and
   updates on every push. `index.html` carries `noindex, nofollow`,
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
   `rayford295/YI`.
3. Build settings:
   - Production branch: `main`
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. **Save and Deploy**. The first build takes a minute or two and gives a URL like
   `https://yi.pages.dev`. Every later push to `main` redeploys automatically.

### 2. Lock it behind a login

1. **Zero Trust** (left sidebar) → pick the free plan when asked.
2. **Access → Applications → Add an application → Self-hosted**.
   - Application name: `Yi at First Sight`
   - Application domain: `yi.pages.dev` (the URL from step 1)
   - Session duration: `1 month` (so she is not asked to sign in every visit)
3. **Add a policy**: name `us`, action **Allow**, include **Emails** and list exactly two
   addresses: Yifan's and Jingyi's.
4. Identity providers: keep **One-time PIN**. Visitors type their email and receive a
   six-digit code; no password, no app to install.
5. Save. Open the URL in a private window to confirm it asks for an email first.

Pages also creates preview URLs (`<hash>.yi.pages.dev`) for other branches.
To cover them with the same login, add a second application with domain
`*.yi.pages.dev` and the same policy, or turn off preview deployments in the
Pages project settings.

### 3. The address

**Custom domains** in the Pages project adds `jingyifan.love` (see *The Domain* above); then
add that domain to the Access application too.

## Before Sending the Link

Checked on a real phone (Safari on iOS and Chrome on Android if possible), not only on a laptop:

- [ ] <https://jingyifan.love/> opens with the padlock; `http://` and `www.` end up there too.
- [ ] The gate accepts the answer in every spelling we listed (`9.20`, `0920`, `20260920`).
- [ ] Pick a player; the town loads, the welcome line appears once, the d-pad shows on the phone.
- [ ] Walk, tap a tile to walk, bump the partner and a cat, open a door, go in, come back to the door.
- [ ] Sound: the first step makes a footfall (iOS plays only after a tap, which the step is);
      the footer switch mutes and remembers.
- [ ] Clear one level end to end on the phone; the card, confetti and chime appear.
- [ ] Add to Home Screen; the icon opens full screen and the town works offline on the second
      launch (airplane mode).
- [ ] The webcam try-on on the ring page asks for the camera and shows the ring on a hand.
- [ ] Rewrite the letter (`src/features/birthday-map/letter.ts`) and push; the deploy takes a
      minute.
- [ ] If the Cloudflare Access variant is in use: sign in with your own email first; the first
      sign-in from a new device sends the code to the email on the policy, and she must use the
      email listed there.

## Notes

- Fonts load from Google Fonts and map tiles from OpenStreetMap; both are reachable from the
  United States. Access from mainland China is not a goal for v1.
- Photos are served by Pages behind Access, so only signed-in visitors can fetch them.
- Nothing in the site needs secrets or environment variables; there is no backend.
