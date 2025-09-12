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

  function message(text, kind = 'info') {
    let el = container.querySelector('.mv-msg');
    if (!el) {
      el = document.createElement('div');
      el.className = 'mv-msg';
      el.style.position = 'absolute';
      el.style.left = '12px';
      el.style.bottom = '12px';
      el.style.padding = '8px 12px';
      el.style.background = 'rgba(20,24,28,0.7)';
      el.style.border = '1px solid rgba(255,255,255,0.08)';
      el.style.borderRadius = '10px';
      el.style.color = '#e6e9ef';
      el.style.pointerEvents = 'none';
      el.style.fontSize = '12px';
      el.style.zIndex = '2';
      container.style.position = 'relative';
      container.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => el && (el.style.opacity = '0'), 2500);
  }

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
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.15, roughness: 0.6 });
        } else if (child.material && child.material.isMaterial) {
          // Keep existing but ensure it responds to lights
          if (!child.material.isMeshStandardMaterial && !child.material.isMeshPhysicalMaterial) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.15, roughness: 0.6 });
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
        message('Loaded model: ' + path.split('/').pop());
      },
      undefined,
      (err) => {
        console.error('Failed to load', path, err);
        message('Could not load OBJ. Falling back to procedural.');
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
    message('Procedural: ' + kind);
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

  // Icosahedron vertices (unit radius approx)
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1],
  ];
  const edges = [
    [0,11],[0,5],[0,1],[0,7],[0,10], [1,5],[1,7],[1,9],[1,8], [2,3],[2,4],[2,10],[2,11],[2,6], [3,4],[3,6],[3,8],[3,9], [4,5],[4,11],[4,3],[5,9],[5,0], [6,7],[6,10],[6,3], [7,8],[7,0], [8,9],[8,1], [9,1],[9,4], [10,11],[10,2],[10,6], [11,0],[11,2],[11,4]
  ];

  // Normalize to radius 1.0
  verts = verts.map(v => { const l = Math.hypot(v[0],v[1],v[2]); return [v[0]/l, v[1]/l, v[2]/l]; });

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
})();
