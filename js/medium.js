// Medium preloader: shows posts from a local JSON cache, with optional RSS fallback
(function () {
  const mount = document.getElementById('medium-section');
  if (!mount) return;

  const listEl = mount.querySelector('#medium-posts');
  const statusEl = mount.querySelector('#medium-status');
  const username = (mount.getAttribute('data-username') || 'X0xRumbleLorex0X').replace(/^@/, '');

  function render(posts) {
    listEl.innerHTML = '';
    if (!posts || !posts.length) {
      statusEl.textContent = 'No cached posts yet. Use tools/convert script or RSS fetch to populate.';
      return;
    }
    statusEl.textContent = '';
    const take = posts.slice(0, 3);
    for (const p of take) {
      const card = document.createElement('a');
      card.className = 'post-card';
      card.href = p.link;
      card.target = '_blank';
      card.rel = 'noopener';
      card.innerHTML = `
        <div class="post-card__body">
          <h3 class="post-card__title">${escapeHTML(p.title || 'Untitled')}</h3>
          <p class="post-card__desc">${escapeHTML(p.description || '').slice(0, 160)}${(p.description||'').length>160?'…':''}</p>
          <div class="post-card__meta">${formatDate(p.pubDate)} · Read on Medium</div>
        </div>`;
      listEl.appendChild(card);
    }
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }
  function formatDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  }

  // 1) Inline JSON fallback (works with file://)
  try {
    const inline = document.getElementById('medium-cache');
    if (inline && inline.textContent.trim()) {
      const json = JSON.parse(inline.textContent);
      if (Array.isArray(json) && json.length) {
        render(json);
      }
    }
  } catch {}

  // 2) Try local file via fetch (works when served over HTTP)
  fetch('data/medium.json', { cache: 'no-store' })
    .then(r => (r && r.ok ? r.json() : []))
    .then(data => { if (Array.isArray(data) && data.length) render(data); })
    .catch(() => {});
})();
