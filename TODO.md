# TODOs / Improvement Backlog

This backlog captures practical improvements discovered from the current state of the portfolio site.

## High-priority

- [ ] **Extract inline `<style>` from `index.html` into `css/theme-modern.css`** to improve maintainability and reduce HTML size.
- [x] **Fix empty meta tags** (`description`, `author`) and add Open Graph/Twitter cards for better SEO and sharing previews.
- [ ] **Add a Content Security Policy (CSP)** and audit inline scripts/styles that block stronger CSP settings.
- [ ] **Create a proper build/minification step** (HTML/CSS/JS/image optimization) for production deployment.
- [ ] **Audit JavaScript error handling** (especially image/frame preloading paths) and add graceful fallbacks for missing assets.

## Performance

- [ ] **Lazy-load offscreen media** (`loading="lazy"`, `decoding="async"`) and compress oversized image assets.
- [ ] **Ship modern image formats** (`.webp`/`.avif`) with fallbacks for legacy browsers.
- [ ] **Avoid loading duplicate libraries** (`bootstrap.css` + `bootstrap.min.css` and `bootstrap.js` + `bootstrap.min.js` patterns) and keep only one version.
- [ ] **Throttle/debounce expensive `resize` and pointer listeners** in animation-heavy scripts.
- [ ] **Reduce main-thread animation cost** by adapting particle/frame counts to device capability (`prefers-reduced-motion`, low-end device checks).

## Accessibility

- [ ] **Run an accessibility pass** (keyboard navigation, focus states, color contrast, heading order, landmark roles).
- [ ] **Respect `prefers-reduced-motion`** for all animated effects (cursor orbiter, particles, image sequence, hologram effects).
- [ ] **Review alt text quality** for meaningful images and mark decorative images with empty alt attributes.
- [ ] **Add skip-link + clearer navigation semantics** for single-page pane routing.

## Code quality / architecture

- [ ] **Split large scripts into modules** (navigation, animations, content rendering, external data).
- [ ] **Introduce linting/formatting** (ESLint + Prettier) and add CI checks.
- [ ] **Remove dead/commented blocks** and outdated comments in JS files.
- [ ] **Document expected data schemas** for `data/thoughts.json` and `data/medium.json`.
- [ ] **Add automated smoke tests** (Playwright or Cypress) for pane navigation and critical links.

## Content / maintainability

- [ ] **Modernize `readme.md`** with setup, local preview instructions, deployment process, and architecture overview.
- [ ] **Add a changelog** so visible site updates are tracked.
- [ ] **Create a contribution guide** with coding conventions, asset sizing limits, and commit/PR standards.
- [ ] **Audit third-party dependencies** (Bootstrap/Font Awesome versions) and upgrade to supported versions.
- [ ] **Add link checking** in CI to detect broken external profiles/resources over time.
