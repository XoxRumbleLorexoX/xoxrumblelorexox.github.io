// Simple, seamless PDF deck renderer using PDF.js (cdn)
(function () {
  const decks = Array.from(document.querySelectorAll('.pdf-deck'));
  if (!decks.length) return;

  // Load PDF.js from CDN only once
  function ensurePdfJs() {
    return new Promise((resolve) => {
      if (window['pdfjsLib']) return resolve(window['pdfjsLib']);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = () => resolve(window['pdfjsLib']);
      document.head.appendChild(s);
    });
  }

  function setupDeck(el) {
    const src = el.getAttribute('data-src');
    if (!src) return;
    el.classList.add('pdf-deck--loading');
    const pagesWrap = document.createElement('div');
    pagesWrap.className = 'pdf-pages';
    el.appendChild(pagesWrap);

    // Add CTA buttons under the deck that open pre-filled emails
    const parentSection = el.closest('section');
    const deckTitle = (parentSection && parentSection.querySelector('h1')) ? parentSection.querySelector('h1').textContent.trim() : 'Proposal';
    const email = 'shan.lingeswaran@outlook.com';
    function mailto(label) {
      const subject = encodeURIComponent(`${label} – ${deckTitle}`);
      const lines = [
        'Hi Shan,',
        '',
        `I'd like to discuss: ${deckTitle}.`,
        '',
        `Reference: ${location.href}`,
        `Attachment/Deck: ${src}`,
        '',
        'Thanks!',
      ];
      const body = encodeURIComponent(lines.join('\n'));
      return `mailto:${email}?subject=${subject}&body=${body}`;
    }
    const cta = document.createElement('div');
    cta.className = 'pdf-cta';
    cta.innerHTML = `
      <a class="btn btn-light pdf-btn" href="${mailto('Collaborate')}" target="_blank" rel="noopener">Collaborate</a>
      <a class="btn btn-dark pdf-btn" href="${mailto('Invest Now')}" target="_blank" rel="noopener">Invest Now</a>
    `;
    el.appendChild(cta);

    ensurePdfJs().then((pdfjsLib) => {
      // worker from CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      return pdfjsLib.getDocument(src).promise.then((pdf) => ({ pdf, pdfjsLib }));
    }).then(({ pdf }) => {
      el.classList.remove('pdf-deck--loading');
      const total = pdf.numPages;

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const holder = entry.target;
          io.unobserve(holder);
          const pageNum = Number(holder.getAttribute('data-page'));
          pdf.getPage(pageNum).then((page) => {
            const viewport = page.getViewport({ scale: 1 });
            // Use actual container width; avoid fixed desktop minimums
            const rawWidth = Math.floor(
              el.clientWidth || holder.clientWidth || el.getBoundingClientRect().width || window.innerWidth || viewport.width
            );
            // Clamp to reasonable bounds for mobile/desktop
            const cssWidth = Math.max(280, Math.min(rawWidth, 1600));
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // crisp but not too heavy
            const scale = (cssWidth * dpr) / viewport.width;
            const v = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(v.width);
            canvas.height = Math.floor(v.height);
            holder.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            page.render({ canvasContext: ctx, viewport: v });
            // Let CSS control responsive layout; canvas scales with container
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
          });
        });
      }, { rootMargin: '200px 0px' });

      // Create lazy holders
      for (let n = 1; n <= total; n++) {
        const holder = document.createElement('div');
        holder.className = 'pdf-page-holder';
        holder.setAttribute('data-page', String(n));
        pagesWrap.appendChild(holder);
        io.observe(holder);
      }
    }).catch((err) => {
      console.error('PDF load error for', src, err);
      el.innerHTML = '<div class="pdf-error shaded-text">Unable to load PDF.</div>';
    });
  }

  decks.forEach(setupDeck);
})();
