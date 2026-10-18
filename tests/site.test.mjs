import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const routes = ['', 'medicine/', 'projects/', 'projects/bats-immunity-metabolism/', 'projects/inpatient-hypoglycaemia/', 'projects/hla-singapore/', 'music/', 'book/', 'admissions/', 'admissions/coaching/', 'admissions/mentorship/', 'admissions/process/', 'admissions/book/', 'about/', 'contact/', 'privacy/', 'thank-you/'];

test('every required route builds with unique title, description, canonical, and one h1', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of routes) {
    const html = read(`${route}index.html`);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && description, `metadata missing: /${route}`);
    assert.ok(!titles.has(title), `duplicate title: ${title}`);
    assert.ok(!descriptions.has(description), `duplicate description: /${route}`);
    titles.add(title); descriptions.add(description);
    assert.match(html, /<link rel="canonical" href="https:\/\//);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `h1 count: /${route}`);
    assert.match(html, /<html lang="en"/);
    assert.ok(!html.includes('&lt;br'), `escaped heading markup: /${route}`);
    assert.match(html, /id="main"/);
  }
});

test('rendered internal links and local assets resolve, including anchors', () => {
  for (const route of routes) {
    const html = read(`${route}index.html`);
    for (const [, href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
      const url = new URL(href, 'https://example.com');
      const path = url.pathname === '/' || url.pathname.endsWith('/') ? `${url.pathname.slice(1)}index.html` : url.pathname.slice(1);
      assert.ok(existsSync(new URL(path, root)), `broken ${href} on /${route}`);
      if (url.hash) {
        const target = read(path);
        assert.ok(target.includes(`id="${url.hash.slice(1)}"`), `missing anchor: ${href}`);
      }
    }
  }
});

test('medicine features exactly the three supplied projects; Markdown pages have complete sections', () => {
  const html = read('medicine/index.html');
  assert.equal((html.match(/class="project-row"/g) || []).length, 3);
  for (const route of routes.filter(r => r.startsWith('projects/') && r !== 'projects/')) {
    const project = read(`${route}index.html`);
    for (const heading of ['Scientific background', 'Research questions', 'Methodological approach', 'Personal contributions', 'Key outputs and publications', 'Future directions']) assert.ok(project.includes(heading), `${route}: ${heading}`);
    assert.ok(project.includes('To be confirmed'));
  }
});

test('Netlify forms are distinct, spam-protected, consented, and closed by default', () => {
  for (const [path,name] of [['book/index.html','performance-enquiry'], ['admissions/book/index.html','admissions-enquiry']]) {
    const html = read(path);
    assert.ok(html.includes(`name="${name}"`));
    assert.match(html, /method="POST"/);
    assert.match(html, /action="\/thank-you\/"/);
    assert.match(html, /data-netlify="true"/);
    assert.match(html, /netlify-honeypot="website"/);
    assert.match(html, /name="form-name"/);
    assert.match(html, /name="consent"[^>]*required/);
    assert.match(html, /type="email"[^>]*required/);
    if (process.env.PUBLIC_FORMS_ENABLED !== 'true') {
      assert.match(html, /data-enabled="false"/);
      assert.match(html, /type="submit"[^>]*disabled/);
    }
    const fields = [...html.matchAll(/<(?:input|select|textarea)\b([^>]+)>/g)];
    for (const [,attrs] of fields) {
      if (/type="hidden"|name="website"|type="checkbox"/.test(attrs)) continue;
      const id = attrs.match(/id="([^"]+)"/)?.[1];
      assert.ok(id && html.includes(`for="${id}"`), `missing label: ${attrs}`);
    }
  }
});

test('SEO artifacts are generated and no fabricated publication entries are rendered', () => {
  assert.ok(existsSync(new URL('sitemap-index.xml',root)));
  assert.match(read('robots.txt'), /Sitemap: https:\/\//);
  assert.match(read('medicine/index.html'), /awaiting verified bibliographic details/);
  assert.ok(existsSync(new URL('404.html', root)));
});
