# Netlify Deploy Guide

This project already includes a GitHub Actions workflow at `.github/workflows/netlify-deploy.yml`.
The repo also pins Node for Netlify with `netlify.toml`, `.nvmrc`, and `package.json`.

Recommended setup:

1. Add the site to Netlify once.
2. Set the required environment variables in Netlify.
3. Create a Netlify build hook.
4. Add that build hook to GitHub Actions as a secret.
5. Push to `main` to trigger deploys.

## 1. Add This Project to Netlify

In Netlify:

1. Open `Add new project`.
2. Choose `Import an existing project`.
3. Connect GitHub.
4. Select this repository.
5. Let Netlify detect Next.js automatically.

If Netlify asks for build settings manually, use:

```txt
Build command: npm run build
```

For Next.js on Netlify, framework detection should handle the rest. Do not expose server secrets in public client variables.
This repo pins Netlify to Node `20`, which matches the current project runtime and avoids Node 22 build mismatches.

## 2. Add Environment Variables in Netlify

Open:

`Site configuration` → `Environment variables`

Add the values from `.env.example`:

```env
DATABASE_URL=""
NEXT_PUBLIC_SITE_URL="https://your-site.netlify.app"
NEXT_PUBLIC_SHOP_NAME="ECO BRIGHT LED & SOLAR"
NEXT_PUBLIC_ORDER_TELEGRAM_URL="https://t.me/ecobrightledsolar"
NEXT_PUBLIC_TELEGRAM_CHECKOUT_URL="+85512710410"
NEXT_PUBLIC_DEFAULT_CURRENCY="USD"
```

Notes:

- `DATABASE_URL` must stay server-side only.
- `NEXT_PUBLIC_*` values are exposed to the browser.
- Never place tokens, passwords, private keys, or database credentials in `NEXT_PUBLIC_*`.
- If you change env vars later, trigger a new deploy.

If a secret was ever committed to Git history or exposed in build logs, rotate it immediately. Treat previously committed secrets as compromised.

## 3. Create a Netlify Build Hook

Open:

`Site configuration` → `Build & deploy` → `Continuous deployment` → `Build hooks`

Create a new build hook for the production branch:

- Branch: `main`
- Name: `github-actions-production`

Copy the generated URL.

## 4. Add the Build Hook to GitHub

Open GitHub for this repository:

`Settings` → `Secrets and variables` → `Actions`

Create a new repository secret:

```txt
Name: NETLIFY_BUILD_HOOK
Value: <paste the Netlify build hook URL>
```

This secret is required by:

`/Users/kosalpen/Documents/eco-bright/.github/workflows/netlify-deploy.yml`

## 5. Deploy

Production deploys now happen when:

- you push to `main`
- you manually run the workflow from the GitHub `Actions` tab

The workflow does this:

1. checks out the repo
2. installs dependencies with `npm ci`
3. runs `npm run check`
4. triggers the Netlify build hook

## 6. Verify the First Deploy

After the first run:

1. Open Netlify deploy logs.
2. Confirm the build finishes successfully.
3. Open the deployed site.
4. Check:
   - homepage loads
   - product catalog renders
   - invoice UI works
   - API-backed data loads correctly

## Troubleshooting

### Workflow fails with missing secret

The GitHub secret is missing:

```txt
NETLIFY_BUILD_HOOK
```

Add it in GitHub Actions secrets.

### Netlify build fails

Usually one of these:

- missing `DATABASE_URL`
- incorrect public env vars
- branch mismatch between workflow and Netlify hook
- stale build cache after a Node version change

### Deploy does not run on push

Check:

- branch is really `main`
- GitHub Actions is enabled
- the workflow file exists at `.github/workflows/netlify-deploy.yml`

### Netlify is using the wrong Node version

This repo pins Node in three places:

- `.nvmrc`
- `package.json` `engines.node`
- `netlify.toml`

If Netlify still shows Node 22 in logs, clear the Netlify build cache and redeploy once so the new runtime is picked up.

## Optional Next Step

If you want stricter Netlify build settings in-repo, add a `netlify.toml` file next. That is optional for this setup, but useful if you want explicit redirect, header, or framework configuration in version control.

## Official References

- Netlify Next.js overview: [docs.netlify.com/frameworks/next-js/overview](https://docs.netlify.com/frameworks/next-js/overview/)
- Netlify build hooks: [docs.netlify.com/build/configure-builds/build-hooks](https://docs.netlify.com/build/configure-builds/build-hooks/)
- GitHub Actions secrets: [docs.github.com/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
