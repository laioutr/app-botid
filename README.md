# Vercel BotID for Laioutr

[![Laioutr][laioutr-src]][laioutr-href]
[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Makes [Vercel BotID](https://vercel.com/docs/botid) the bot-protection provider of a
[Laioutr](https://laioutr.com) storefront. It checks the actions the project lists and rejects a request
that BotID does not classify as a person.

- [Release notes](/CHANGELOG.md)
- [Documentation](https://docs.laioutr.com/apps/app-docs/botid)

## Usage

Requires `@laioutr-core/frontend-core` with bot protection.

```bash
pnpm add @laioutr/app-botid
```

```ts
export default defineNuxtConfig({
  modules: ['@laioutr/app-botid'],
});
```

List the actions to protect in the project's `laioutrrc.json`:

```json
{
  "config": {
    "botProtection": { "actions": ["newsletter/subscribe"], "whenUnavailable": "open" }
  }
}
```

## Limits

- **Vercel only.** On any other production host no check is registered, and every protected action is
  rejected. The build logs a warning when it targets another host.
- **Do not enable "Vercel BotID Deep Analysis"** in the Vercel dashboard. The browser then loads
  Kasada's script whatever this app configures, and every check is billed.
- **Test a protected action from a page in the storefront, not with `curl`.** BotID rejects a request
  that did not pass through its client script. Scripts use frontend-core's signed bypass header.
- **BotID's challenge script loads on the first protected request**, not on page load, so that request
  is slower.

## Development

```bash
pnpm install
pnpm dev:prepare   # generates .nuxt, which lint, tests and typecheck need
pnpm test
pnpm lint
```

In development, BotID classifies every request as a person without contacting Vercel. Verify the
challenge flow on a Vercel preview deployment.

## Publishing

Releases run through [changesets](https://github.com/changesets/changesets) and publish to npmjs.org
with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so CI needs no npm token and
every release carries provenance.

Day to day: run `pnpm changeset` to describe your change and merge it. The release workflow opens a
"chore: release" PR collecting the pending changesets; merging **that** builds and publishes.

### One-time setup per repository

1. **Repository secrets**
   - `NPM_LAIOUTR_TOKEN` — read access to npm.laioutr.cloud, so CI can install `@laioutr-core/*`.
   - `RELEASE_TOKEN` — a fine-grained PAT owned by the org, scoped to this repo, with **Contents:
     read and write** and **Pull requests: read and write**. A PR opened with the default
     `GITHUB_TOKEN` cannot trigger workflows, so release PRs would arrive with no CI and could never
     satisfy a required-status rule.

2. **Bootstrap the package on npm.** Trusted publishing is configured on a package that already
   exists, so the very first version has to be published by hand. `publishConfig.provenance` fails
   outside CI — there is no OIDC provider — so disable it for that one publish:

   ```bash
   pnpm prepack
   npm publish --access public --no-provenance
   ```

   A brand-new package can 404 on the registry for a few minutes afterwards. That is replication lag,
   not a failed publish; check again before re-running anything.

3. **Configure the trusted publisher** on the package's npm settings page: GitHub Actions,
   this repository, workflow `release.yml`. Every release after that is tokenless.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@laioutr/app-botid/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@laioutr/app-botid
[license-src]: https://img.shields.io/npm/l/@laioutr/app-botid.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@laioutr/app-botid
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
[laioutr-src]: https://img.shields.io/badge/%F0%9F%A6%99_Laioutr_App-702DCE
[laioutr-href]: https://www.laioutr.com/
