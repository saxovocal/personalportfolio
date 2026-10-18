# Wharton Chan — Medicine, Science & Swing

A static, responsive portfolio built with Astro, strict TypeScript, and Tailwind CSS 4. No database, authentication, paid CMS, or server runtime is required. Text and data can be maintained without changing page components. Original SVG illustrations mark spaces where verified photographs and footage will eventually appear.

## Local development

Use Node.js 24 and npm 11. The lockfile is committed for reproducible installs.

```sh
cd /workspace/personalportfolio # or your local checkout
npm ci
npm run dev
```

In cloud tasks, use the existing isolated checkout; no worktree is needed. If the home directory is not writable in a cloud task, use `npm ci --cache /tmp/wharton-npm-cache` and `export ASTRO_TELEMETRY_DISABLED=1` before Astro commands. The development server listens on port 4321. No secret is needed to develop or build.

```sh
npm run check   # Astro + strict TypeScript
npm run build   # static output in dist/
npm test        # checks generated routes, internal links, metadata and form contracts
npm run preview
```

Run `build` before `test`; tests inspect the actual generated site, not source templates. The browser QA described in `docs/QA.md` complements these checks. Forms intentionally start disabled and do not submit during local development. No publication, DNS changes, or remote Git writes are performed by setup.

## Content updates (a 1–2 hour weekly workflow)

1. Edit the relevant Markdown or data file.
2. Run check, build, and tests; review the changed pages on mobile and desktop.
3. Commit and push to a feature branch. Review Netlify's deploy preview before merging.

### Research projects

Edit `src/content/projects/*.md`. Front matter contains title, theme, number (display order), status, summary, methods, and featured. Allowed status values: `Current`, `Completed`, `To be confirmed`. Existing project statuses are deliberately unconfirmed because the brief did not supply them. The filename determines the URL. Retain the sections on background, research questions, methods, contributions, outputs, and future directions. Add only verified contributions and outputs. The directory is organized by theme and the Medicine page displays the three supplied projects.

### Publications

Edit `src/data/publications.json`. Replace the placeholder notice and add verified records to `entries` using this shape:

```ts
{
  title: string,
  authors: string,        // complete author list in intended display order
  journal: string,
  year: number,
  url: string,            // HTTPS DOI or original journal URL
  contribution?: string
}
```

There are **no publication entries yet**. The site does not invent a bibliography. Entries render by descending year and link to originals; no individual publication pages are needed. Add the full verified list before describing it as complete.

### Performance media and photographs

Edit `src/data/media.json`. Supported `type` values:

- `placeholder`: no external requests or fake playback controls.
- `youtube`: `src` must be a privacy-enhanced `https://www.youtube-nocookie.com/embed/VIDEO_ID` URL. Each embed has a title and lazy loading.
- `video`: put an optimized MP4 under `public/media/`, use a root-relative `src`, and add a matching `.vtt` caption file with the same basename. Supply an optimized `poster` image. Include captions for speech and meaningful audio descriptions as appropriate.
- `photo`: put an optimized image under `public/media/`; use `description` as accurate alt text. The gallery uses a 960×600 display ratio; crop to this ratio before export.

Use `title`, `description`, and `caption` to give context. For hero/about portraits, replace the explicitly marked illustrations in `src/pages/index.astro` and `src/pages/about.astro` with authorized photographs, preferably using Astro's `Image` component and local `src/assets/` files for automatic optimization. Set real intrinsic dimensions, descriptive alt text, responsive sizes, and lazy loading below the fold. Do not lazy-load a primary hero photo. The current vector illustrations are original, lightweight, and require no remote photo service.

Add the band's verified Instagram URL in `src/data/site.ts`. Wharton is a frontline musician, not the band leader or owner. Keep full-band coordination language intact.

### Other copy and styling

Page content is in `src/pages/`. Shared navigation and footer are in `src/layouts/Layout.astro`. Typography, colour, spacing, responsive rules, and reduced-motion handling are in `src/styles/global.css`. Tailwind utilities are available; design tokens are also defined with `@theme`. System serif/sans-serif stacks avoid third-party font requests.

## Forms and professional boundaries

`/book/` and `/admissions/book/` contain separate Netlify-compatible forms, honeypots, required fields, consent, browser validation, and progressive enhancement. Names are `performance-enquiry` and `admissions-enquiry`. Failed network requests show an error without discarding entered information. Without JavaScript, enabled forms submit through Netlify to `/thank-you/`.

**Delivery is not configured or verified.** `PUBLIC_FORMS_ENABLED` defaults to false; submit buttons stay disabled and each form announces its preview status. The hidden Netlify form markup remains present so Netlify can detect the forms during deployment. Never set the variable to true merely to make the page appear operational.

Activation checklist:

1. Confirm the owner's professional/privacy email, retention policy, data processor arrangements, and contact channel. Update `/contact/` and `/privacy/` with verified details. Do not put a private email into source without permission to publish it.
2. Enable form detection in the Netlify dashboard, deploy, and confirm that **both named forms** are detected. Configure notification recipients and spam controls.
3. In a controlled deploy preview, set `PUBLIC_FORMS_ENABLED=true` and redeploy. Submit dummy enquiries through both forms, verify dashboard receipt **and notification delivery**, and test the honeypot and failure messaging. Avoid real personal data in tests; delete test entries after verification.
4. Only after those tests, enable the variable for production and redeploy. Test the production forms once more. If delivery fails, restore false and redeploy until corrected.

Enquiries do not confirm availability, bookings, or admissions outcomes. Do not request sensitive records. The general research contact remains an explicit placeholder until a verified address is supplied. This site does not offer clinical appointments or individualized medical advice.

## GitHub setup

The initial repository was empty. All files here are the first implementation; no commits or pushes are created automatically. Use the existing `saxovocal/personalportfolio` checkout. Confirm repository visibility is **private** in GitHub settings; the website itself is intended to be public after deployment.

Review `git status` and the source (especially content, contact details, and deployment settings), then commit to your chosen branch and push using your existing GitHub authentication. If the first branch is named `work`, rename it to `main` only when you intend it as the default branch, then set the repository's default branch accordingly. Never commit `.env`, patient information, client records, or credentials. Connect Netlify's GitHub integration with access to this private repository.

## Netlify deployment and domain

`netlify.toml` sets the build to `npm run check && npm run build`, publishes `dist/`, and pins Node 24. Connect the private GitHub repository and select its actual production branch. No Astro server adapter is necessary for this static site.

Set these non-secret build environment variables in Netlify:

| Variable | Value |
| --- | --- |
| `SITE_URL` | Final HTTPS origin, e.g. your verified custom domain, without a trailing slash |
| `PUBLIC_FORMS_ENABLED` | `false` until form activation is completed; then `true` |

`SITE_URL` defaults to **https://example.com**, an explicit placeholder. Set it before production so canonical URLs, structured data, social images, robots.txt, and the sitemap use the real domain. Changing build variables requires a rebuild. The generated sitemap is at `/sitemap-index.xml`. The 1200×630 social image is `public/social.png`, rendered from the editable `public/social.svg`. Both are included. Re-export the PNG when changing the source artwork.

For a custom domain purchased via Google Domains (possibly now managed by Squarespace Domains): confirm the current registrar and existing DNS first. Add the verified domain in Netlify and follow the **current instructions shown for that site**. Review existing email/MX/TXT records and preserve them. Do not guess IP addresses, change nameservers, or change DNS without the owner's confirmation. After authorized changes propagate, verify HTTPS, the preferred primary hostname and redirects, canonical URLs, and sitemap. Automatic deploys occur after pushes to the configured branch; use deploy previews for review.

No production deploy, DNS change, Netlify account configuration, or live form test has been performed as part of this local implementation.

## Owner input needed before launch

- Final custom domain and authorization for any DNS changes.
- Professional portrait and authorized performance photographs.
- Verified performance clips, appropriate captions, and the band's Instagram URL.
- Full verified publication metadata and DOI/journal links.
- Confirmed status, specific personal contributions, and outputs for each research project.
- Public professional contact/privacy address, retention policy, and form notification recipients.
- Netlify connection, form detection, notification and spam configuration, and successful test submissions.
- Review of biography, service availability, pricing scope, privacy notice, and all supplied factual copy.

## Structure

```text
src/components/       Navigation-independent reusable presentation and forms
src/content/projects/ Markdown project descriptions and front matter
src/data/             Publications, performance media, and shared site information
src/layouts/          Shared HTML, SEO, navigation, footer
src/pages/            Static routes, generated project routes, robots.txt
src/styles/           Design system and responsive styling
public/               Static SVG identity and PNG/SVG social images
tests/               Generated-site integrity checks
docs/                 QA notes
```
