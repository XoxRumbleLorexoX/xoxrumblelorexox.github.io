// Lightweight Three.js OBJ viewer with OrbitControls
// Expects a container div with id #model-viewer and two buttons with ids
// #toggle-wireframe and #recenter-model

(function () {
  const container = document.getElementById('model-viewer');
  if (!container || !window.THREE) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(1.8, 1.4, 2.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 0.5;
  controls.maxDistance = 8;

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(2.5, 3, 2);
  scene.add(dir);

  // Ground reference (subtle)
  const grid = new THREE.GridHelper(10, 20, 0x333333, 0x222222);
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  grid.position.y = -0.5;
  scene.add(grid);

  // Model load
  const loader = new THREE.OBJLoader();
  let root = new THREE.Group();
  scene.add(root);

  // silent status (no UI toasts)
  function message() {}

  function clearRoot() {
    while (root.children.length) root.remove(root.children[0]);
  }

  function centerAndScale(object) {
    // Center the model and normalize its scale
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.0 / maxDim;

    object.position.sub(center); // center to origin
    object.scale.setScalar(scale * 1.6); // fit comfortably in view
  }

  function setWireframe(enabled) {
    root.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = enabled));
        } else {
          child.material.wireframe = enabled;
        }
      }
    });
  }

  function applyBasicMaterial(object) {
    // Apply a default, neutral material if none present
    object.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry && child.geometry.isBufferGeometry && !child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.15, roughness: 0.6, side: THREE.DoubleSide });
        } else if (child.material && child.material.isMaterial) {
          // Keep existing but ensure it responds to lights
          if (!child.material.isMeshStandardMaterial && !child.material.isMeshPhysicalMaterial) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.15, roughness: 0.6, side: THREE.DoubleSide });
          } else {
            child.material.side = THREE.DoubleSide;
          }
        }
      }
    });
  }

  function loadOBJ(path) {
    clearRoot();
    loader.load(
      path,
      (obj) => {
        applyBasicMaterial(obj);
        centerAndScale(obj);
        root.add(obj);
        // loaded
      },
      undefined,
      (err) => {
        console.error('Failed to load', path, err);
        // load fallback procedural
        loadProcedural('icosahedron');
      }
    );
  }

  function loadProcedural(kind) {
    clearRoot();
    let geo;
    switch (kind) {
      case 'torusKnot':
        geo = new THREE.TorusKnotGeometry(0.6, 0.22, 220, 20, 2, 3);
        break;
      case 'octahedron':
        geo = new THREE.OctahedronGeometry(0.85, 0);
        break;
      case 'tetrahedron':
        geo = new THREE.TetrahedronGeometry(0.95, 0);
        break;
      case 'icosahedron':
      default:
        geo = new THREE.IcosahedronGeometry(0.8, 0);
        break;
    }
    const mat = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.3, roughness: 0.45 });
    const mesh = new THREE.Mesh(geo, mat);
    root.add(mesh);
    controls.target.set(0, 0, 0);
    // procedural fallback
  }

  // initial load (procedural safe by default)
  loadProcedural('icosahedron');

  // Dropdown support
  const select = document.getElementById('model-select');
  if (select) {
    select.addEventListener('change', () => {
      const v = select.value;
      if (v.startsWith('proc:')) {
        const kind = v.split(':')[1];
        loadProcedural(kind);
      } else {
        loadOBJ(v);
      }
    });
  }

  // Buttons
  const wireBtn = document.getElementById('toggle-wireframe');
  const recenterBtn = document.getElementById('recenter-model');
  let wireframeOn = false;
  if (wireBtn) wireBtn.addEventListener('click', () => {
    wireframeOn = !wireframeOn;
    setWireframe(wireframeOn);
  });
  if (recenterBtn) recenterBtn.addEventListener('click', () => {
    // Recompute bounds and adjust camera target
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
  });

  // Resize handling
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // Render loop
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

// Fallback minimal viewer when THREE is unavailable (works offline without CDN)
(function () {
  const container = document.getElementById('model-viewer');
  if (!container || window.THREE) return; // Only run fallback if THREE missing

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);
  container.style.position = 'relative';

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let verts = [], edges = [];

  function setGeometry(kind) {
    if (kind === 'tetrahedron') {
      verts = [
        [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
      ];
      edges = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
    } else if (kind === 'octahedron') {
      verts = [
        [1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]
      ];
      edges = [[0,2],[2,1],[1,3],[3,0],[0,4],[2,4],[1,4],[3,4],[0,5],[2,5],[1,5],[3,5]];
    } else if (kind === 'torusKnot') {
      // Parametric torus knot polyline
      const p = 2, q = 3; const R = 1.0, r = 0.35; const N = 220; verts = []; edges = [];
      for (let i=0;i<N;i++){
        const t = (i/N) * Math.PI*2;
        const ct = Math.cos(q*t), st = Math.sin(q*t);
        const x = (R + r*Math.cos(p*t)) * Math.cos(q*t);
        const y = (R + r*Math.cos(p*t)) * Math.sin(q*t);
        const z = r*Math.sin(p*t);
        verts.push([x,y,z]);
        if (i>0) edges.push([i-1,i]);
      }
      edges.push([N-1,0]);
    } else { // icosahedron default
      const phi = (1 + Math.sqrt(5)) / 2;
      verts = [
        [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
        [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
        [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1],
      ];
      edges = [
        [0,11],[0,5],[0,1],[0,7],[0,10], [1,5],[1,7],[1,9],[1,8], [2,3],[2,4],[2,10],[2,11],[2,6], [3,4],[3,6],[3,8],[3,9], [4,5],[4,11],[4,3],[5,9],[5,0], [6,7],[6,10],[6,3], [7,8],[7,0], [8,9],[8,1], [9,1],[9,4], [10,11],[10,2],[10,6], [11,0],[11,2],[11,4]
      ];
    }
    // Normalize
    verts = verts.map(v => { const l = Math.hypot(v[0],v[1],v[2]) || 1; return [v[0]/l, v[1]/l, v[2]/l]; });
  }

  // initial geometry
  setGeometry('icosahedron');

  let rotX = 0.7, rotY = -0.6, dist = 3.0;
  let dragging = false, lastX = 0, lastY = 0;

  canvas.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rotY += dx * 0.01; rotX += dy * 0.01;
  });
  canvas.addEventListener('wheel', e => { e.preventDefault(); dist = Math.max(1.8, Math.min(6, dist + Math.sign(e.deltaY)*0.2)); }, { passive: false });

  // Buttons
  const recenterBtn = document.getElementById('recenter-model');
  if (recenterBtn) recenterBtn.addEventListener('click', () => { rotX = 0.7; rotY = -0.6; dist = 3.0; });
  const wireBtn = document.getElementById('toggle-wireframe');
  let wireframe = true; if (wireBtn) wireBtn.addEventListener('click', () => wireframe = !wireframe);

  function project([x,y,z]) {
    // Apply rotation
    const cx = Math.cos(rotX), sx = Math.sin(rotX); const cy = Math.cos(rotY), sy = Math.sin(rotY);
    let yy = cx*y - sx*z; let zz = sx*y + cx*z; let xx = cy*x + sy*zz; zz = -sy*x + cy*zz;
    // Perspective
    const f = 400 / (zz + dist*1.5);
    return [canvas.width/2 + xx*f, canvas.height/2 + yy*f];
  }

  function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(224,234,255,0.9)';
    const pts = verts.map(project);
    // Draw edges
    ctx.beginPath();
    for (const [a,b] of edges) { ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); }
    ctx.stroke();
    // Optional nodes
    if (!wireframe) {
      ctx.fillStyle = 'rgba(124,92,255,0.8)';
      for (const p of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, Math.PI*2); ctx.fill(); }
    }
  }
  render();

  // Hook up dropdown to switch procedural models in fallback
  const select = document.getElementById('model-select');
  if (select) {
    select.addEventListener('change', () => {
      const v = select.value || '';
      if (v.startsWith('proc:')) {
        setGeometry(v.split(':')[1]);
      } else {
        // Try to load Three.js dynamically and upgrade to WebGL viewer
        ensureThree().then(() => upgradeToThree(v)).catch(() => {
          // keep procedural preview silently
          setGeometry('icosahedron');
        });
      }
    });
  }

  // Dynamically load Three.js and its extras if missing
  function ensureThree(){
    if (window.THREE && THREE.OBJLoader && THREE.OrbitControls) return Promise.resolve();
    function load(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r155';
    const tasks = [];
    if (!window.THREE) tasks.push(load(base + '/three.min.js'));
    return Promise.all(tasks).then(()=>{
      const more=[];
      if (!THREE.OrbitControls) more.push(load(base + '/examples/js/controls/OrbitControls.min.js'));
      if (!THREE.OBJLoader) more.push(load(base + '/examples/js/loaders/OBJLoader.min.js'));
      return Promise.all(more);
    });
  }

  // Upgrade current viewer to Three.js and load the requested asset
  function upgradeToThree(value){
    // Clear fallback canvas and instantiate a minimal Three viewer
    container.innerHTML = '';
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e131a);
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth/container.clientHeight, 0.1, 1000);
    camera.position.set(1.8, 1.4, 2.2);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.06; controls.enablePan = false; controls.minDistance = 0.5; controls.maxDistance = 8;
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); const dir = new THREE.DirectionalLight(0xffffff, 0.9); dir.position.set(2.5,3,2); scene.add(dir);
    const root = new THREE.Group(); scene.add(root);

    function centerAndScale(object){
      const box = new THREE.Box3().setFromObject(object); const size = new THREE.Vector3(); box.getSize(size); const center = new THREE.Vector3(); box.getCenter(center);
      const maxDim = Math.max(size.x,size.y,size.z) || 1; const scale = 1.0/maxDim; object.position.sub(center); object.scale.setScalar(scale*1.6);
    }
    function applyBasicMaterial(object){
      object.traverse((child)=>{ if (child.isMesh){ if (child.geometry && child.geometry.isBufferGeometry && !child.geometry.attributes.normal){ child.geometry.computeVertexNormals(); }
        if (!child.material || !child.material.isMeshStandardMaterial){ child.material = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.15, roughness: 0.6, side: THREE.DoubleSide }); } else { child.material.side = THREE.DoubleSide; } } });
    }
    function setWireframe(enabled){ root.traverse((c)=>{ if (c.isMesh && c.material){ if (Array.isArray(c.material)) c.material.forEach(m=>m.wireframe=enabled); else c.material.wireframe=enabled; } }); }

    function render(){ controls.update(); renderer.render(scene,camera); requestAnimationFrame(render); }
    render();

    function loadOBJ(path){ root.clear(); const loader = new THREE.OBJLoader(); loader.load(path, (obj)=>{ applyBasicMaterial(obj); centerAndScale(obj); root.add(obj); }, undefined, ()=>{} ); }
    function loadProcedural(kind){ root.clear(); let geo; if (kind==='octahedron') geo = new THREE.OctahedronGeometry(0.85,0); else if (kind==='tetrahedron') geo = new THREE.TetrahedronGeometry(0.95,0); else if (kind==='torusKnot') geo = new THREE.TorusKnotGeometry(0.6, 0.22, 220, 20, 2, 3); else geo = new THREE.IcosahedronGeometry(0.8,0); const mat = new THREE.MeshStandardMaterial({ color:0xb0c4de, metalness:0.3, roughness:0.45 }); root.add(new THREE.Mesh(geo,mat)); controls.target.set(0,0,0); }

    if (value && !value.startsWith('proc:')) loadOBJ(value); else loadProcedural('icosahedron');
  }
})();
