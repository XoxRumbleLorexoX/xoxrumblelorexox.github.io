/* Minimal client-side Markdown renderer with fenced code blocks
 * Supports: #/##/### headings, paragraphs, bullet lists (- ), inline `code`, and fenced ``` blocks.
 * Intent: keep it tiny and dependency-free for local portfolios.
 */
(function(global){
  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function inline(s){
    // inline code
    return s.replace(/`([^`]+)`/g, function(_, code){ return '<code>'+escapeHtml(code)+'</code>'; });
  }

  function render(md){
    const lines = (md || '').replace(/\r\n?/g,'\n').split('\n');
    let out = [];
    let inCode = false, codeLang = '', codeBuf = [];
    let inList = false;

    function flushParagraph(buf){
      const text = buf.join(' ').trim();
      if(text) out.push('<p>'+inline(text)+'</p>');
      buf.length = 0;
    }

    const pbuf = [];
    for(let i=0;i<lines.length;i++){
      const raw = lines[i];
      const line = raw.trimEnd();

      // Fenced code blocks
      const fence = line.match(/^```(.*)$/);
      if(fence){
        if(inCode){
          // closing fence
          out.push('<pre><code'+(codeLang?(' class="lang-'+codeLang+'"'):'')+'>'+escapeHtml(codeBuf.join('\n'))+'</code></pre>');
          inCode = false; codeLang = ''; codeBuf = [];
        } else {
          // opening fence
          flushParagraph(pbuf);
          inCode = true; codeLang = fence[1].trim(); codeBuf = [];
        }
        continue;
      }

      if(inCode){ codeBuf.push(raw); continue; }

      // Headings
      if(/^###\s+/.test(line)){ flushParagraph(pbuf); out.push('<h3>'+inline(line.replace(/^###\s+/,''))+'</h3>'); continue; }
      if(/^##\s+/.test(line)){ flushParagraph(pbuf); out.push('<h2>'+inline(line.replace(/^##\s+/,''))+'</h2>'); continue; }
      if(/^#\s+/.test(line)){ flushParagraph(pbuf); out.push('<h1>'+inline(line.replace(/^#\s+/,''))+'</h1>'); continue; }

      // Lists
      if(/^\s*-\s+/.test(line)){
        flushParagraph(pbuf);
        if(!inList){ out.push('<ul>'); inList = true; }
        out.push('<li>'+inline(line.replace(/^\s*-\s+/,''))+'</li>');
        continue;
      } else if(inList && line === ''){
        out.push('</ul>'); inList = false; continue;
      } else if(inList && !/^\s*-\s+/.test(line)){
        // Close list if a non-list line appears
        out.push('</ul>'); inList = false;
      }

      // Blank line => paragraph break
      if(line === ''){ flushParagraph(pbuf); continue; }

      // Accumulate paragraph text
      pbuf.push(line);
    }

    if(inCode){ out.push('<pre><code'+(codeLang?(' class="lang-'+codeLang+'"'):'')+'>'+escapeHtml(codeBuf.join('\n'))+'</code></pre>'); }
    if(inList){ out.push('</ul>'); }
    if(pbuf.length){ flushParagraph(pbuf); }
    return out.join('\n');
  }

  global.renderMarkdown = render;
})(window);

