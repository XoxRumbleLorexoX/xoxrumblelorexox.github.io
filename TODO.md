# TODOs / Improvement Backlog

## Completed in this pass

- [x] Extracted inline `<style>` from `index.html` into `css/theme-modern.css`.
- [x] Added Content Security Policy and documented current inline/script constraints.
- [x] Added build/minification workflow (`tools/build.mjs`, npm scripts).
- [x] Improved JS fallback/error handling for media and external loaders.
- [x] Added lazy-loading and async decoding for images where applicable.
- [x] Added reduced-motion handling in CSS and animation-heavy scripts.
- [x] Added accessibility upgrades (skip link, landmark, semantic navigation baseline).
- [x] Added linting/formatting setup and CI checks.
- [x] Added smoke tests for key pane/navigation rendering.
- [x] Modernized `readme.md`, added changelog and contribution guide.
- [x] Added data schema documentation for local JSON payloads.
- [x] Added automated link checking in CI.

## Next pass (from end-of-pass testing)

- [ ] Upgrade legacy Bootstrap/Font Awesome assets to currently supported versions and retest visual regressions.
- [ ] Generate and wire `.webp`/`.avif` derivatives for hero/gallery images with `<picture>` fallbacks.
- [ ] Expand smoke tests to include dynamic PDF deck rendering and keyboard-only navigation paths.
