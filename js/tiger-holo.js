// Low-poly 3D tiger hologram that follows the cursor (Three.js)
(function(){
  const holder = document.getElementById('tiger-holo-holder');
  const canvas = document.getElementById('tiger-holo-canvas');
  const hero = document.querySelector('.hero') || holder && holder.parentElement;
  if(!holder || !canvas) return;

  // Fallback 2D render if Three.js isn't available
  if(typeof window.THREE === 'undefined'){
    const ctx = canvas.getContext('2d');
    function resize2D(){
      const w = holder.clientWidth | 0;
      const h = holder.clientHeight | 0;
      if(canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
    }
    const ro = new ResizeObserver(resize2D); ro.observe(holder); resize2D();
    let t0 = performance.now();
    let rx = 0, ry = 0, hx = 0, hy = 0, tx = 0, ty = 0;
    function onMove(e){
      const R = (hero || document.body).getBoundingClientRect();
      const mx = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
      const my = e.clientY != null ? e.clientY : (e.touches && e.touches[0].clientY) || 0;
      const nx = ((mx - R.left) / Math.max(1,R.width)) * 2 - 1;
      const ny = ((my - R.top) / Math.max(1,R.height)) * 2 - 1;
      const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
      ry = clamp(nx*14,-16,16); rx = clamp(-ny*10,-12,12);
      tx = clamp(nx*Math.min(140,R.width*0.18),-160,160);
      ty = clamp(ny*Math.min(80,R.height*0.12),-100,100);
    }
    window.addEventListener('mousemove', onMove, {passive:true});
    window.addEventListener('touchmove', onMove, {passive:true});
    (function loop(now){
      requestAnimationFrame(loop);
      const t = (now - t0) * 0.001;
      hx += (tx - hx)*0.08; hy += (ty - hy)*0.08;
      holder.style.transform = 'translate(-50%,0) translate3d('+hx.toFixed(2)+'px,'+hy.toFixed(2)+'px,0) rotateX(' + (rx+Math.sin(t*1.1)*1.2).toFixed(2) + 'deg) rotateY(' + (ry+Math.cos(t*1.3)*1.2).toFixed(2) + 'deg)';
      const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h); ctx.save(); ctx.translate(w/2,h/2);
      const s=Math.min(w,h)/3;
      // glow
      const grad = ctx.createRadialGradient(0,0,s*0.2,0,0,s*1.2);
      grad.addColorStop(0,'rgba(255,166,77,0.45)'); grad.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(0,0,s*1.05,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation='lighter'; ctx.lineWidth=2; ctx.strokeStyle='rgba(255,166,77,0.95)';
      // head diamond
      ctx.beginPath(); ctx.moveTo(0,-s*0.9); ctx.lineTo(s*0.9,0); ctx.lineTo(0,s*0.7); ctx.lineTo(-s*0.9,0); ctx.closePath(); ctx.stroke();
      // ears
      ctx.beginPath(); ctx.moveTo(-s*0.6,-s*1.0); ctx.lineTo(-s*0.9,-s*0.4); ctx.lineTo(-s*0.2,-s*0.5); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.6,-s*1.0); ctx.lineTo(s*0.9,-s*0.4); ctx.lineTo(s*0.2,-s*0.5); ctx.closePath(); ctx.stroke();
      // eyes
      ctx.fillStyle='rgba(255,255,255,0.98)'; ctx.fillRect(-s*0.32,-s*0.15,s*0.2,s*0.06); ctx.fillRect(s*0.12,-s*0.15,s*0.2,s*0.06);
      // rounded nose (circle)
      ctx.fillStyle='rgba(255,191,135,0.9)';
      ctx.strokeStyle='rgba(255,166,77,1)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, s*0.02, s*0.09, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // mouth guide line
      ctx.strokeStyle='rgba(146,240,255,0.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-s*0.55, s*0.10); ctx.lineTo(s*0.55, s*0.10); ctx.stroke();
      // teeth (2 canines + incisors)
      ctx.fillStyle='rgba(255,255,255,0.98)';
      // canines as triangles
      function tri(x0,y0,x1,y1,x2,y2){ ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); ctx.closePath(); ctx.fill(); }
      tri(-s*0.34, s*0.12, -s*0.30, s*0.26, -s*0.26, s*0.12);
      tri( s*0.34, s*0.12,  s*0.30, s*0.26,  s*0.26, s*0.12);
      // incisors as small rectangles
      const incY = s*0.12, incH = s*0.08, incW = s*0.045;
      [-0.18,-0.09,0,0.09,0.18].forEach(nx=>{ ctx.fillRect(s*nx - incW/2, incY, incW, incH); });
      // whiskers
      ctx.strokeStyle='rgba(146,240,255,0.9)';
      [[-0.25,-0.05,-0.9,-0.03],[-0.25,-0.13,-0.95,-0.09],[-0.25,0.03,-0.85,0.07],[0.25,-0.05,0.9,-0.03],[0.25,-0.13,0.95,-0.09],[0.25,0.03,0.85,0.07]].forEach(a=>{ctx.beginPath(); ctx.moveTo(s*a[0],s*a[1]); ctx.lineTo(s*a[2],s*a[3]); ctx.stroke();});
      ctx.restore();
    })(t0);
    return;
  }

  // Scene
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.2, 6);

  const group = new THREE.Group();
  scene.add(group);

  // Materials
  const matCore = new THREE.MeshPhongMaterial({
    color: 0xffa64d, emissive: 0xff7f2a, emissiveIntensity: 1.15,
    transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, shininess: 120
  });
  const edgeOrange = new THREE.LineBasicMaterial({ color: 0xffa64d, transparent: true, opacity: 0.95 });
  const edgeDark = new THREE.LineBasicMaterial({ color: 0xff7f2a, transparent: true, opacity: 0.9 });
  const edgeCyan = new THREE.LineBasicMaterial({ color: 0x92f0ff, transparent: true, opacity: 0.95 });

  // Helpers
  function addMeshWithEdges(geo, mat, edgeMat){
    const mesh = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat || edgeOrange);
    group.add(mesh, edges);
    return mesh;
  }
  function addLine(mat, pts){
    const g = new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p[0], p[1], p[2]||0.9)));
    const l = new THREE.Line(g, mat);
    group.add(l);
  }

  // Head base (icosahedron for low-poly look)
  const head = addMeshWithEdges(new THREE.IcosahedronGeometry(1.35, 0), matCore, edgeOrange);
  head.scale.set(1.1, 1.0, 0.8);

  // Muzzle block
  // Muzzle block (slightly more transparent so teeth/nose pop)
  const muzzleMat = matCore.clone(); muzzleMat.opacity = 0.32; muzzleMat.emissiveIntensity = 0.85;
  const muzzle = addMeshWithEdges(new THREE.BoxGeometry(1.0, 0.6, 0.7), muzzleMat, edgeOrange);
  muzzle.position.set(0, -0.15, 0.55);

  // Cheeks (small low-poly spheres)
  const cheekL = addMeshWithEdges(new THREE.IcosahedronGeometry(0.38, 0), matCore, edgeOrange);
  cheekL.position.set(-0.5, -0.05, 0.65);
  const cheekR = addMeshWithEdges(new THREE.IcosahedronGeometry(0.38, 0), matCore, edgeOrange);
  cheekR.position.set(0.5, -0.05, 0.65);

  // Nose (rounded)
  const noseGeo = new THREE.SphereGeometry(0.28, 12, 10);
  const noseMat = new THREE.MeshPhongMaterial({ color: 0xffbf87, emissive: 0xff8f4d, emissiveIntensity: 0.8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, -0.02, 1.25);
  nose.material.depthTest = false;
  nose.renderOrder = 10;
  const noseEdge = new THREE.LineSegments(new THREE.EdgesGeometry(noseGeo), edgeOrange);
  noseEdge.position.copy(nose.position);
  noseEdge.renderOrder = 11;
  group.add(nose, noseEdge);

  // Ears (tetrahedrons)
  const earGeo = new THREE.TetrahedronGeometry(0.6, 0);
  const earL = addMeshWithEdges(earGeo, matCore, edgeOrange);
  earL.position.set(-0.95, 1.1, 0);
  earL.rotation.set(0.25, 0.1, -0.1);
  const earR = addMeshWithEdges(earGeo, matCore, edgeOrange);
  earR.position.set(0.95, 1.1, 0);
  earR.rotation.set(0.25, -0.1, 0.1);

  // Eyes (emissive planes)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98, blending: THREE.AdditiveBlending });
  const eyeGeo = new THREE.PlaneGeometry(0.28, 0.1);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.46, 0.25, 0.98);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.46, 0.25, 0.98);
  group.add(eyeL, eyeR);

  // Teeth (replace nose tip with visible teeth)
  const toothMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.95, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, shininess: 120 });
  function addTooth(x, y, z, r=0.085, h=0.22){
    const tg = new THREE.ConeGeometry(r, h, 4);
    const tmesh = new THREE.Mesh(tg, toothMat);
    tmesh.rotation.x = Math.PI; // point down
    tmesh.position.set(x, y, z);
    tmesh.material.depthTest = false;
    tmesh.renderOrder = 12;
    group.add(tmesh);
    return tmesh;
  }
  // Canines
  addTooth(-0.32, -0.34, 1.22, 0.12, 0.3);
  addTooth(0.32, -0.34, 1.22, 0.12, 0.3);
  // Incisors row
  [-0.18,-0.09,0,0.09,0.18].forEach((x,i)=> addTooth(x, -0.31, 1.22, 0.08, 0.22));
  // Mouth guide line
  addLine(edgeCyan, [[-0.55,-0.2,1.12],[0.55,-0.2,1.12]]);

  // Stripes (forehead, cheeks)
  addLine(edgeDark, [[-0.2,0.85,0.7],[0,0.6,0.85],[0.2,0.85,0.7]]);
  addLine(edgeDark, [[-0.55,0.55,0.7],[-0.2,0.35,0.85]]);
  addLine(edgeDark, [[0.55,0.55,0.7],[0.2,0.35,0.85]]);
  addLine(edgeDark, [[-0.7,0.1,0.8],[-0.35,0.0,0.95]]);
  addLine(edgeDark, [[-0.62,-0.05,0.8],[-0.28,-0.15,0.95]]);
  addLine(edgeDark, [[0.7,0.1,0.8],[0.35,0.0,0.95]]);
  addLine(edgeDark, [[0.62,-0.05,0.8],[0.28,-0.15,0.95]]);

  // Whiskers
  const wy = -0.05;
  addLine(edgeCyan, [[-0.25,wy,0.98],[-0.9,wy+0.02,0.98]]);
  addLine(edgeCyan, [[-0.25,wy-0.08,0.98],[-0.95,wy-0.04,0.98]]);
  addLine(edgeCyan, [[-0.25,wy+0.08,0.98],[-0.85,wy+0.12,0.98]]);
  addLine(edgeCyan, [[0.25,wy,0.98],[0.9,wy+0.02,0.98]]);
  addLine(edgeCyan, [[0.25,wy-0.08,0.98],[0.95,wy-0.04,0.98]]);
  addLine(edgeCyan, [[0.25,wy+0.08,0.98],[0.85,wy+0.12,0.98]]);

  // Lights
  scene.add(new THREE.AmbientLight(0x88bbff, 0.55));
  const key = new THREE.PointLight(0xffa64d, 0.9, 20); key.position.set(2, 2, 4); scene.add(key);
  const rim = new THREE.PointLight(0x7c5cff, 0.7, 20); rim.position.set(-3, 1, -2); scene.add(rim);

  // Cursor tracking and parallax
  const targetRot = { x: 0, y: 0 };
  const currentRot = { x: 0, y: 0 };
  const targetPos = { x: 0, y: 0 };
  let targetHX = 0, targetHY = 0, currHX = 0, currHY = 0;

  function onPointerMove(e){
    const R = (hero || document.body).getBoundingClientRect();
    const mx = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
    const my = e.clientY != null ? e.clientY : (e.touches && e.touches[0].clientY) || 0;
    const nx = ((mx - R.left) / Math.max(1,R.width)) * 2 - 1;  // [-1,1]
    const ny = ((my - R.top) / Math.max(1,R.height)) * 2 - 1;  // [-1,1]
    const clamp = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));
    targetRot.y = clamp(nx * 1.2, -1.2, 1.2);
    targetRot.x = clamp(-ny * 0.9, -0.9, 0.9);
    targetPos.x = clamp(nx * 0.35, -0.35, 0.35);
    targetPos.y = clamp(-ny * 0.28, -0.28, 0.28);
    const rangeX = Math.min(140, R.width * 0.18);
    const rangeY = Math.min(80, R.height * 0.12);
    targetHX = clamp(nx * rangeX, -rangeX, rangeX);
    targetHY = clamp(ny * rangeY, -rangeY, rangeY);
  }
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  // Resize
  function resize(){
    const w = holder.clientWidth;
    const h = holder.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(holder); resize();

  // Visibility perf
  let inView = true;
  const io = new IntersectionObserver((entries)=>{ inView = entries[0].isIntersecting; }, { root: null, threshold: 0 });
  io.observe(holder);

  // Animate
  let t0 = performance.now();
  function animate(now){
    requestAnimationFrame(animate);
    if(!inView) return;
    const t = (now - t0) * 0.001;
    currentRot.x += (targetRot.x - currentRot.x) * 0.08;
    currentRot.y += (targetRot.y - currentRot.y) * 0.08;
    group.rotation.set(currentRot.x, currentRot.y, Math.sin(t*0.7)*0.02);
    group.position.x += (targetPos.x - group.position.x) * 0.08;
    const floatY = Math.sin(t*1.2) * 0.06;
    const aimY = targetPos.y;
    group.position.y += ((floatY + aimY) - group.position.y) * 0.08;
    // holder parallax and subtle tilt
    currHX += (targetHX - currHX) * 0.08;
    currHY += (targetHY - currHY) * 0.08;
    holder.style.transform = 'translate(-50%,0) translate3d(' + currHX.toFixed(2) + 'px,' + currHY.toFixed(2) + 'px,0) rotateX(' + (currentRot.x*10).toFixed(2) + 'deg) rotateY(' + (currentRot.y*14).toFixed(2) + 'deg)';
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
