// Simplified Skills Overlay: static radial nodes with fill proportional to skill level
(function(){
  const btn = document.getElementById('skills-overlay-toggle');
  const overlay = document.getElementById('skills-overlay');
  const canvas = document.getElementById('skills-canvas');
  const closeBtn = document.getElementById('skills-close');
  const tooltip = document.getElementById('skills-tooltip');
  if (!btn || !overlay || !canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize(){
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    if (overlay.classList.contains('active')) draw();
  }
  resize();
  window.addEventListener('resize', resize);

  function parseSkillsFromDOM(){
    const host = document.getElementById('skills');
    if (!host) return null;
    const items = [];
    host.querySelectorAll('.mb-3').forEach(block => {
      const labelEl = block.querySelector('strong');
      const bar = block.querySelector('.progress .progress-bar');
      if (!labelEl || !bar) return;
      const labelText = labelEl.textContent.trim();
      // percentage from style or innerText
      const style = bar.getAttribute('style') || '';
      let m = /width:\s*([0-9.]+)%/i.exec(style);
      let pct = m ? parseFloat(m[1]) : parseFloat((bar.textContent||'').replace(/[^0-9.]/g,''));
      if (isNaN(pct)) pct = 60; // default
      const level = Math.max(0, Math.min(1, pct/100));
      // split combined labels like C/C++/C# or Java/JavaScript/TypeScript
      labelText.split(/[\/]/).map(s=>s.trim()).filter(Boolean).forEach(part => {
        // prefer short names for JS/TS
        const short = part.replace('JavaScript','JS').replace('TypeScript','TS');
        items.push({ label: short, level });
      });
    });
    return items.length ? items : null;
  }

  const skills = parseSkillsFromDOM() || [
    { label:'Python', level:0.90 },
    { label:'C', level:0.80 },
    { label:'C++', level:0.80 },
    { label:'C#', level:0.75 },
    { label:'Bash', level:0.75 },
    { label:'Java', level:0.65 },
    { label:'JS', level:0.70 },
    { label:'TS', level:0.70 },
    { label:'SQL', level:0.70 },
    { label:'HTML', level:0.85 },
    { label:'CSS', level:0.75 },
    { label:'MATLAB', level:0.60 },
    { label:'Rust', level:0.30 },
    { label:'Go', level:0.40 },
    { label:'Swift', level:0.55 },
    { label:'DAX', level:0.50 },
  ];

  let nodes = []; // {x,y,r,label,level}
  function layout(){
    nodes = [];
    const cx = w/2, cy = h/2; // center
    const minDim = Math.min(w, h);
    const baseR = minDim/42; // node outer radius
    // Arrange in two rings for readability
    const ring1 = Math.ceil(skills.length * 0.6);
    const ring2 = skills.length - ring1;
    const R1 = minDim/3.2;
    const R2 = minDim/2.2;
    for (let i=0;i<skills.length;i++){
      const a = (i < ring1)
        ? (i/ring1) * Math.PI*2
        : ((i-ring1)/ring2) * Math.PI*2 + (Math.PI/ring2); // offset rings
      const R = (i < ring1) ? R1 : R2;
      nodes.push({
        x: cx + Math.cos(a)*R,
        y: cy + Math.sin(a)*R,
        r: baseR,
        label: skills[i].label,
        level: skills[i].level
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const cx = w/2, cy = h/2;
    // Gentle background glow
    const g = ctx.createRadialGradient(cx, cy, Math.min(w,h)*0.05, cx, cy, Math.min(w,h)*0.6);
    g.addColorStop(0, 'rgba(124,92,255,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

    // Center node
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(w,h)/90, 0, Math.PI*2); ctx.fill();

    // Nodes (no interconnections)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${14*dpr}px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
    nodes.forEach(n => {
      // outer ring
      ctx.beginPath();
      ctx.fillStyle = 'rgba(124,92,255,0.9)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
      // inner fill proportional to level (0..1)
      const innerR = Math.max(1*dpr, n.r * n.level);
      ctx.beginPath(); ctx.fillStyle = 'rgba(5,7,10,0.85)'; ctx.arc(n.x, n.y, innerR, 0, Math.PI*2); ctx.fill();
      // label below
      ctx.fillStyle = 'rgba(230,233,239,0.95)';
      ctx.fillText(n.label, n.x, n.y + n.r + 14*dpr);
    });
  }

  function open(){
    overlay.classList.add('active');
    layout();
    draw();
  }
  function close(){ overlay.classList.remove('active'); tooltip.style.opacity='0'; }

  btn.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e)=>{ if (e.target === overlay) close(); });
  window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });

  // basic hover tooltip without animation overhead
  overlay.addEventListener('mousemove', (e)=>{
    if (!overlay.classList.contains('active')) return;
    const mx = e.clientX * dpr, my = e.clientY * dpr;
    let hit = null;
    for (const n of nodes){ const dx = n.x - mx, dy = n.y - my; if (dx*dx+dy*dy <= (n.r+3*dpr)**2){ hit = n; break; } }
    if (hit){
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top = e.clientY + 'px';
      tooltip.textContent = `${hit.label} • ${Math.round(hit.level*100)}%`;
      tooltip.style.opacity = '1';
    } else { tooltip.style.opacity = '0'; }
  });
})();
