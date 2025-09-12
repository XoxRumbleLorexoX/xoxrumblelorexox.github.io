// Landing Event: a cursor + scroll reactive ripple in the landing section
(function () {
  const section = document.getElementById('landing-event');
  const canvas = document.getElementById('landing-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  let rafId = null;
  let active = false;
  let mouse = { x: 0, y: 0, inside: false };
  let lastScrollY = window.scrollY;
  let scrollImpulse = 0; // grows with scroll velocity, decays over time
  const ripples = [];

  function resize() {
    const rect = section.getBoundingClientRect();
    w = canvas.width = section.clientWidth;
    h = canvas.height = Math.max(220, rect.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Track when section is visible
  const io = new IntersectionObserver((entries) => {
    active = entries.some(e => e.isIntersecting);
    if (active && !rafId) rafId = requestAnimationFrame(loop);
  }, { threshold: 0.1 });
  io.observe(section);

  // Mouse
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.inside = true;
  });
  section.addEventListener('mouseleave', () => { mouse.inside = false; });

  // Scroll impulse
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const dy = Math.abs(y - lastScrollY);
    lastScrollY = y;
    // Normalize and clamp
    scrollImpulse += Math.min(40, dy * 0.15);
  }, { passive: true });

  function spawnRipple(x, y, strength) {
    ripples.push({ x, y, r: 0, a: Math.min(0.6, 0.15 + strength * 0.02), w: 1.5 + Math.min(6, strength * 0.05) });
    if (ripples.length > 40) ripples.shift();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!active) return;

    // Decay impulse
    scrollImpulse *= 0.92;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Subtle gradient background bloom centered on cursor
    if (mouse.inside) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.max(w, h) * 0.5);
      g.addColorStop(0, 'rgba(124,92,255,0.10)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Spawn ripples when there is scroll energy and the mouse is inside
    if (mouse.inside && scrollImpulse > 0.5) {
      spawnRipple(mouse.x, mouse.y, scrollImpulse);
    }

    // Draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 1.6 + rp.w * 0.25; // expand
      rp.a *= 0.965;             // fade
      if (rp.a < 0.015) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${rp.a})`;
      ctx.lineWidth = rp.w;
      ctx.stroke();
    }

    // Cursor follower dot
    if (mouse.inside) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 2.2 + Math.min(6, scrollImpulse * 0.08), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
    }
  }
})();

