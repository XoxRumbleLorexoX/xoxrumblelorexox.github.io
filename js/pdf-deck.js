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
            const containerWidth = Math.max(holder.clientWidth, el.clientWidth, el.getBoundingClientRect().width, 960);
            const maxWidth = Math.min(containerWidth, 1600);
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // crisp but not too heavy
            const scale = (maxWidth * dpr) / viewport.width;
            const v = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(v.width);
            canvas.height = Math.floor(v.height);
            holder.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            page.render({ canvasContext: ctx, viewport: v });
            // Display size independent from render resolution
            canvas.style.width = maxWidth + 'px';
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
