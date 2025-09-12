// TinnyLlama: tiny CV-grounded assistant (client-side, no external LLM required)
(function(){
  const ui = {
    toggle: document.getElementById('tl-toggle'),
    panel: document.getElementById('tl-panel'),
    close: document.getElementById('tl-close'),
    messages: document.getElementById('tl-messages'),
    q: document.getElementById('tl-q'),
    send: document.getElementById('tl-send')
  };
  if (!ui.toggle || !ui.panel) return;

  let corpus = '';
  let chunks = [];
  let llm = null; // { apiBase, apiKey, model }

  function show(){ ui.panel.classList.add('active'); ui.q.focus(); }
  function hide(){ ui.panel.classList.remove('active'); }
  ui.toggle.addEventListener('click', show);
  ui.close.addEventListener('click', hide);

  function addMsg(text, cls){ const d=document.createElement('div'); d.className='tl-msg'+(cls?(' '+cls):''); d.textContent=text; ui.messages.appendChild(d); ui.messages.scrollTop = ui.messages.scrollHeight; }

  function normalize(s){ return s.toLowerCase().replace(/[^a-z0-9\s]/g,' '); }
  function clean(text){
    // remove pdf artifacts like \f16, \cf3 etc and stray backslashes
    return String(text)
      .replace(/\\f\d+/g,' ')
      .replace(/\\cf\d+/g,' ')
      .replace(/\\b0|\\i0|\\fs\d+|\\ulnone/g,' ')
      .replace(/\\/g,' ')
      .replace(/\s+/g,' ') // collapse spaces
      .trim();
  }

  // Simple retrieval: split into paragraph chunks and rank by term overlap with the query
  function ensureChunks(){ if (chunks.length) return; const parts = clean(corpus).split(/\n{2,}/).map(p=>p.trim()).filter(Boolean); chunks = parts.flatMap(p => p.length > 800 ? p.match(/.{1,800}(?:\.|\s|$)/g) : [p]); }
  function score(query){
    ensureChunks();
    const q = normalize(query).split(/\s+/).filter(Boolean);
    const scores = chunks.map((c,i)=>({ i, s: 0 }));
    for (const token of q){
      const re = new RegExp('\\b'+token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
      chunks.forEach((c, i) => { if (re.test(c)) scores[i].s += 1; });
    }
    scores.sort((a,b)=>b.s-a.s);
    return scores.slice(0,3).filter(r=>r.s>0).map(r=>chunks[r.i]);
  }

  async function answer(q){
    const best = score(q);
    if (llm && best.length){
      try { return await callLLM(q, best.join('\n\n')); } catch (e) { /* fall through */ }
    }
    if (!best.length){
      return "I couldn't find details about that in my CV. Try asking about roles, projects, education, tools, or achievements.";
    }
    return 'From my CV, relevant details:\n\n' + best.map((t,i)=>`${i+1}. ${t}`).join('\n\n');
  }

  async function callLLM(question, context){
    const messages = [
      { role: 'system', content: 'You are a concise assistant that ONLY answers based on the provided CV context. If the answer is not in the context, say you cannot find it.' },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}\nAnswer succinctly in 2-4 sentences.` }
    ];
    if (llm.provider === 'ollama') {
      const url = (llm.apiBase || 'http://localhost:11434') + '/api/chat';
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: llm.model || 'tinylama', messages, stream: false })
      });
      if (!res.ok) throw new Error('ollama');
      const data = await res.json();
      const text = data.message?.content?.trim() || data.messages?.slice(-1)[0]?.content?.trim();
      if (!text) throw new Error('ollama-empty');
      return text;
    } else {
      // OpenAI-compatible
      const url = (llm.apiBase || 'https://api.openai.com/v1') + '/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + llm.apiKey },
        body: JSON.stringify({ model: llm.model || 'gpt-4o-mini', messages, temperature: 0.2, max_tokens: 220 })
      });
      if (!res.ok) throw new Error('llm');
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('llm-empty');
      return text;
    }
  }

  async function onSend(){
    const text = (ui.q.value||'').trim(); if (!text) return; ui.q.value=''; addMsg(text, 'user');
    try { const a = await answer(text); addMsg(a, 'bot'); } catch { addMsg("Sorry, something went wrong.", 'bot'); }
  }
  ui.send.addEventListener('click', onSend);
  ui.q.addEventListener('keydown', e => { if (e.key === 'Enter') onSend(); });

  // Load CV text: prefer data/cv.txt; fallback to cv.pdf (requires pdf.js)
  function buildFromDOM(){
    try {
      let text = '';
      const add = (s)=>{ if (s) text += s.replace(/\s+/g,' ').trim() + "\n\n"; };
      // Hero + about text
      document.querySelectorAll('#top .hero-title, #top .hero-sub, #top .hero-text').forEach(el=>add(el.textContent));
      // Skills section
      const skillBlocks = document.querySelectorAll('#skills .mb-3');
      if (skillBlocks.length){
        let sk = 'Skills:';
        skillBlocks.forEach(b=>{
          const name = (b.querySelector('strong')?.textContent || '').trim();
          const bar = b.querySelector('.progress .progress-bar');
          const style = bar?.getAttribute('style') || '';
          let m = /width:\s*([0-9.]+)%/i.exec(style);
          let pct = m ? parseFloat(m[1]) : parseFloat((bar?.textContent||'').replace(/[^0-9.]/g,''));
          if (!isNaN(pct)) sk += ` ${name} (${pct}%).`; else sk += ` ${name}.`;
        });
        add(sk);
      }
      // Services/links names
      document.querySelectorAll('#services .service-item h4, #services .service-item p').forEach(el=>add(el.textContent));
      // Footer focus/stack/platforms tags
      document.querySelectorAll('.fg-card .fg-title, .fg-card .fg-list').forEach(el=>add(el.textContent));
      return text.trim();
    } catch { return ''; }
  }

  function loadCV(){
    fetch('data/cv.txt').then(r => r.ok ? r.text() : Promise.reject()).then(text => { corpus = text; addMsg('TinnyLlama is ready. Ask me anything about my CV.', 'bot'); })
    .catch(()=>{
      // try PDF
      if (!window['pdfjsLib']) {
        // build from visible page content as a last resort
        corpus = buildFromDOM();
        if (corpus) addMsg('TinnyLlama loaded site content. For best answers, add data/cv.txt or cv.pdf.', 'bot');
        else addMsg('TinnyLlama ready (no CV found). Add data/cv.txt or cv.pdf for better answers.', 'bot');
        return;
      }
      try {
        const url = 'cv.pdf';
        const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        pdfjsLib.getDocument(url).promise.then(doc => {
          const pagePromises = [];
          for (let i=1;i<=doc.numPages;i++){ pagePromises.push(doc.getPage(i).then(p=>p.getTextContent().then(tc=>tc.items.map(it=>it.str).join(' ')))); }
          Promise.all(pagePromises).then(pages => { corpus = pages.join('\n\n'); addMsg('TinnyLlama loaded cv.pdf. Ask me anything about my CV.', 'bot'); })
            .catch(()=> { corpus = buildFromDOM(); if (corpus) addMsg('TinnyLlama loaded site content. Add data/cv.txt for best answers.', 'bot'); else addMsg('TinnyLlama ready. Add data/cv.txt for best results.', 'bot'); });
        }).catch(()=> { corpus = buildFromDOM(); if (corpus) addMsg('TinnyLlama loaded site content. Add data/cv.txt for best answers.', 'bot'); else addMsg('TinnyLlama ready. Add data/cv.txt for best results.', 'bot'); });
      } catch { corpus = buildFromDOM(); if (corpus) addMsg('TinnyLlama loaded site content. Add data/cv.txt for best answers.', 'bot'); else addMsg('TinnyLlama ready. Add data/cv.txt for best results.', 'bot'); }
    });
  }
  // Load optional LLM config from data/llm.json or localStorage('tl_api_key')
  (function(){
    const key = localStorage.getItem('tl_api_key');
    if (key) llm = { apiBase: 'https://api.openai.com/v1', apiKey: key, model: 'gpt-4o-mini' };
    fetch('data/llm.json').then(r => r.ok ? r.json() : null).then(cfg => { if (cfg) llm = { provider: cfg.provider || llm?.provider, apiBase: cfg.apiBase || llm?.apiBase, apiKey: cfg.apiKey || llm?.apiKey, model: cfg.model || llm?.model }; }).catch(()=>{});
  })();
  loadCV();
})();
