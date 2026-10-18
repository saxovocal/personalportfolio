# Version 1 quality assurance

Validated in the cloud environment with Node.js 24.19.0, npm 11.9.0, Astro 6.4.8, and Chromium 154. The application is statically generated; no live service credentials are required for these checks.

## Automated checks

- Frozen installation (`npm ci`): passed.
- Astro/TypeScript (`npm run check`): zero errors, warnings, or hints.
- Static production build (`npm run build`): 18 HTML pages, plus robots.txt and sitemap output.
- Generated-site integrity (`npm test`): 5 tests passed. Includes required routes, unique metadata, internal links and anchors, the three project pages, form labels and consent, Netlify metadata, preview gating, and SEO artifacts.
- Chromium layout checks: all 17 normal routes at 1440, 768, and 390 pixels; no horizontal overflow or page JavaScript errors.
- Axe WCAG 2 A/AA and WCAG 2.1 AA automated checks on the 17 normal routes at desktop and mobile sizes. Initial contrast findings were corrected; the final scan reported zero violations.
- Mobile menu opening, navigation, Escape dismissal, and preview-form blocking checked in Chromium. With JavaScript disabled, mobile navigation remains visible and preview forms remain blocked.
- Both forms tested against a **mocked local response**, with valid data, simulated HTTP failure, preserved input after failure, and a simulated successful redirect. These are frontend checks; they do not establish Netlify delivery.

## Repeating browser checks

Start `npm run preview -- --port 4322` after a production build. Browser tools are optional development-only tools, installed outside the project to keep the application dependencies small:

```sh
npm install --prefix /tmp/wharton-browser-qa --cache /tmp/wharton-qa-npm-cache playwright-core @axe-core/playwright
NODE_PATH=/tmp/wharton-browser-qa/node_modules node tests/browser.cjs
NODE_PATH=/tmp/wharton-browser-qa/node_modules node tests/forms-browser.cjs
```

Chromium defaults to `/usr/bin/chromium`. Set `CHROMIUM_PATH` to another installed Chromium executable if necessary. Set `BASE_URL` to another **local test origin** if needed; do not run the form harness against a production form service. The harness intercepts form POSTs and uses dummy data. The general browser script saves full-page screenshots to `/tmp/wharton-1440.png` and `/tmp/wharton-390.png`.

## Manual checks before release

- Review real copy, project contributions/statuses, bibliography, privacy arrangements, and authorized media with the owner.
- Navigate with a keyboard and a screen reader, including the menu, forms, errors, and the skip link. Automated axe checks do not certify full accessibility.
- Review at phone, tablet, and desktop sizes; verify zoom/reflow and reduced-motion preferences.
- Test both forms on Netlify with dummy data, verify dashboard receipt and notification delivery, then remove test data. Follow README activation steps before enabling production submissions.
- Verify the real domain's canonicals, sitemap, social previews, HTTPS, and redirect behavior after authorized deployment.

## Known launch dependencies

No external deployment, Netlify form detection/delivery, DNS configuration, GitHub push, or fresh-cloud snapshot restoration was performed. The canonical origin is an explicit example.com placeholder until `SITE_URL` is set. Form submissions are deliberately disabled. Publications, photographs, performance videos, professional/privacy contact details, and specific research contributions/statuses remain clearly labeled pending verified input.
