import * as THREE from "three";

const GOLD = "rgba(214,178,90,0.95)";

/* ─────────────────────────────────────────────
   SnapWritoo badge
───────────────────────────────────────────── */
function createBadgeTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;

  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  ctx.save();
  ctx.translate(512, 256);

  ctx.fillStyle = GOLD;
  ctx.font = '600 72px Georgia, serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SnapWritoo", 0, 0);

  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  return tex;
}

/* ─────────────────────────────────────────────
   Rounded box helper
───────────────────────────────────────────── */
function roundedBox(width, height, depth, radius = 0.08) {
  const shape = new THREE.Shape();

  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);

  shape.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  );

  shape.lineTo(
    x + width,
    y + height - radius
  );

  shape.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  shape.lineTo(
    x + radius,
    y + height
  );

  shape.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  );

  shape.lineTo(
    x,
    y + radius
  );

  shape.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  );

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: radius * 0.35,
    bevelThickness: radius * 0.35,
  });

  geo.center();

  return geo;
}

/* ─────────────────────────────────────────────
   Camera Scene
───────────────────────────────────────────── */
export function createCameraScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();

  /* ─────────────────────────────────────────
     Camera
  ───────────────────────────────────────── */

  const camera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    100
  );

  // Perfectly centered camera
  camera.position.set(0, 0, 5.3);
  camera.lookAt(0, 0, 0);

  /* ─────────────────────────────────────────
     Main camera group
  ───────────────────────────────────────── */

  const camGroup = new THREE.Group();

  const disposables = [];

  function track(resource) {
    disposables.push(resource);
    return resource;
  }

  /* ─────────────────────────────────────────
     Materials
  ───────────────────────────────────────── */

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x171513,
    roughness: 0.48,
    metalness: 0.12,
    clearcoat: 0.3,
    clearcoatRoughness: 0.35,
  });

  const leatherMat = new THREE.MeshPhysicalMaterial({
    color: 0x25201b,
    roughness: 0.72,
    metalness: 0.02,
    clearcoat: 0.08,
  });

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xcaa456,
    roughness: 0.25,
    metalness: 0.9,
    clearcoat: 0.45,
  });

  const darkMetalMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b342c,
    roughness: 0.32,
    metalness: 0.85,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x071317,
    roughness: 0.04,
    metalness: 0.45,
    transmission: 0.15,
    transparent: true,
    opacity: 0.94,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
  });

  disposables.push(
    bodyMat,
    leatherMat,
    metalMat,
    darkMetalMat,
    glassMat
  );

  /* ─────────────────────────────────────────
     Camera body
  ───────────────────────────────────────── */

  const bodyGeo = track(
    roundedBox(1.95, 1.22, 0.72, 0.12)
  );

  const body = new THREE.Mesh(
    bodyGeo,
    bodyMat
  );

  camGroup.add(body);

  /* Leather front panel */

  const leatherGeo = track(
    roundedBox(1.48, 0.82, 0.035, 0.07)
  );

  const leather = new THREE.Mesh(
    leatherGeo,
    leatherMat
  );

  leather.position.set(
    0,
    -0.02,
    0.375
  );

  camGroup.add(leather);

  /* ─────────────────────────────────────────
     Top metallic plate
  ───────────────────────────────────────── */

  const plateGeo = track(
    roundedBox(1.92, 0.12, 0.74, 0.035)
  );

  const plate = new THREE.Mesh(
    plateGeo,
    metalMat
  );

  plate.position.y = 0.65;

  camGroup.add(plate);

  /* ─────────────────────────────────────────
     Viewfinder
  ───────────────────────────────────────── */

  const finderBaseGeo = track(
    roundedBox(0.42, 0.22, 0.38, 0.06)
  );

  const finderBase = new THREE.Mesh(
    finderBaseGeo,
    darkMetalMat
  );

  finderBase.position.set(
    0.02,
    0.82,
    -0.05
  );

  camGroup.add(finderBase);

  const finderGlassGeo = track(
    new THREE.BoxGeometry(
      0.24,
      0.1,
      0.02
    )
  );

  const finderGlass = new THREE.Mesh(
    finderGlassGeo,
    glassMat
  );

  finderGlass.position.set(
    0.02,
    0.84,
    0.15
  );

  camGroup.add(finderGlass);

  /* ─────────────────────────────────────────
     Top dials
  ───────────────────────────────────────── */

  const dialGeo = track(
    new THREE.CylinderGeometry(
      0.14,
      0.14,
      0.09,
      32
    )
  );

  const dial1 = new THREE.Mesh(
    dialGeo,
    metalMat
  );

  dial1.position.set(
    0.7,
    0.72,
    0
  );

  camGroup.add(dial1);

  const dial2 = new THREE.Mesh(
    dialGeo,
    darkMetalMat
  );

  dial2.position.set(
    -0.72,
    0.72,
    0
  );

  camGroup.add(dial2);

  /* Dial center */

  const dialCenterGeo = track(
    new THREE.CylinderGeometry(
      0.065,
      0.065,
      0.105,
      24
    )
  );

  const dialCenter1 = new THREE.Mesh(
    dialCenterGeo,
    darkMetalMat
  );

  dialCenter1.position.set(
    0.7,
    0.72,
    0
  );

  camGroup.add(dialCenter1);

  /* ─────────────────────────────────────────
     Lens system
  ───────────────────────────────────────── */

  const lensBaseGeo = track(
    new THREE.CylinderGeometry(
      0.49,
      0.43,
      0.16,
      48
    )
  );

  const lensBase = new THREE.Mesh(
    lensBaseGeo,
    darkMetalMat
  );

  lensBase.rotation.x = Math.PI / 2;

  lensBase.position.set(
    0,
    -0.04,
    0.49
  );

  camGroup.add(lensBase);

  /* Lens barrel */

  const barrelGeo = track(
    new THREE.CylinderGeometry(
      0.38,
      0.42,
      0.3,
      48
    )
  );

  const barrel = new THREE.Mesh(
    barrelGeo,
    bodyMat
  );

  barrel.rotation.x = Math.PI / 2;

  barrel.position.set(
    0,
    -0.04,
    0.65
  );

  camGroup.add(barrel);

  /* Gold lens ring */

  const lensRingGeo = track(
    new THREE.CylinderGeometry(
      0.39,
      0.39,
      0.065,
      48
    )
  );

  const lensRing = new THREE.Mesh(
    lensRingGeo,
    metalMat
  );

  lensRing.rotation.x = Math.PI / 2;

  lensRing.position.set(
    0,
    -0.04,
    0.83
  );

  camGroup.add(lensRing);

  /* Inner black ring */

  const innerRingGeo = track(
    new THREE.CylinderGeometry(
      0.33,
      0.33,
      0.07,
      48
    )
  );

  const innerRing = new THREE.Mesh(
    innerRingGeo,
    darkMetalMat
  );

  innerRing.rotation.x = Math.PI / 2;

  innerRing.position.set(
    0,
    -0.04,
    0.87
  );

  camGroup.add(innerRing);

  /* Glass */

  const glassGeo = track(
    new THREE.CylinderGeometry(
      0.275,
      0.275,
      0.045,
      48
    )
  );

  const glass = new THREE.Mesh(
    glassGeo,
    glassMat
  );

  glass.rotation.x = Math.PI / 2;

  glass.position.set(
    0,
    -0.04,
    0.91
  );

  camGroup.add(glass);

  /* ─────────────────────────────────────────
     Lens reflection ring
  ───────────────────────────────────────── */

  const reflectionGeo = track(
    new THREE.TorusGeometry(
      0.205,
      0.012,
      8,
      48
    )
  );

  const reflection = new THREE.Mesh(
    reflectionGeo,
    metalMat
  );

  reflection.position.set(
    0,
    -0.04,
    0.94
  );

  camGroup.add(reflection);

  /* ─────────────────────────────────────────
     Strap lugs
  ───────────────────────────────────────── */

  const lugGeo = track(
    new THREE.TorusGeometry(
      0.075,
      0.018,
      10,
      24
    )
  );

  const lug1 = new THREE.Mesh(
    lugGeo,
    metalMat
  );

  lug1.position.set(
    0.99,
    0.28,
    0
  );

  lug1.rotation.y = Math.PI / 2;

  camGroup.add(lug1);

  const lug2 = new THREE.Mesh(
    lugGeo,
    metalMat
  );

  lug2.position.set(
    -0.99,
    0.28,
    0
  );

  lug2.rotation.y = Math.PI / 2;

  camGroup.add(lug2);

  /* ─────────────────────────────────────────
     SnapWritoo badge
  ───────────────────────────────────────── */

  const badgeGeo = track(
    new THREE.PlaneGeometry(
      0.72,
      0.36
    )
  );

  const badgeTexture = createBadgeTexture();

  const badgeMat = new THREE.MeshBasicMaterial({
    map: badgeTexture,
    transparent: true,
    depthWrite: false,
  });

  disposables.push(
    badgeMat,
    badgeTexture
  );

  const badge = new THREE.Mesh(
    badgeGeo,
    badgeMat
  );

  badge.position.set(
    -0.35,
    -0.29,
    0.397
  );

  camGroup.add(badge);

  /* ─────────────────────────────────────────
     Tiny gold accent line
  ───────────────────────────────────────── */

  const accentGeo = track(
    new THREE.BoxGeometry(
      0.38,
      0.018,
      0.018
    )
  );

  const accent = new THREE.Mesh(
    accentGeo,
    metalMat
  );

  accent.position.set(
    0.48,
    -0.34,
    0.397
  );

  camGroup.add(accent);

  /* ─────────────────────────────────────────
     Camera orientation
  ───────────────────────────────────────── */

  camGroup.rotation.y = -0.42;
  camGroup.rotation.x = 0.08;
  camGroup.rotation.z = -0.015;

  /* ─────────────────────────────────────────
     ⭐ FIXED VISUAL POSITION
  ───────────────────────────────────────── */

  // Center horizontally
  // Slightly raise the camera visually
  camGroup.position.set(
    0,
    0.22,
    0
  );

  scene.add(camGroup);

  /* ─────────────────────────────────────────
     Cinematic lighting
  ───────────────────────────────────────── */

  const ambient = new THREE.AmbientLight(
    0xfff3df,
    0.45
  );

  scene.add(ambient);

  const key = new THREE.DirectionalLight(
    0xfff0d5,
    2.0
  );

  key.position.set(
    3.5,
    4,
    5
  );

  scene.add(key);

  const fill = new THREE.DirectionalLight(
    0xffc77e,
    0.55
  );

  fill.position.set(
    -4,
    1,
    3
  );

  scene.add(fill);

  const rim = new THREE.DirectionalLight(
    0x9aaa78,
    0.65
  );

  rim.position.set(
    -3,
    -1.5,
    -3
  );

  scene.add(rim);

  /* Small warm point light for lens */

  const lensLight = new THREE.PointLight(
    0xffd58a,
    1.1,
    4
  );

  lensLight.position.set(
    0,
    -0.2,
    3
  );

  scene.add(lensLight);

  /* ─────────────────────────────────────────
     Floating dust
  ───────────────────────────────────────── */

  const dustGeo = track(
    new THREE.BufferGeometry()
  );

  const dustCount = 110;

  const positions = new Float32Array(
    dustCount * 3
  );

  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] =
      (Math.random() - 0.5) * 6;

    positions[i * 3 + 1] =
      (Math.random() - 0.5) * 5;

    positions[i * 3 + 2] =
      (Math.random() - 0.5) * 4;
  }

  dustGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  const dustMat = new THREE.PointsMaterial({
    color: 0xfff1de,
    size: 0.012,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });

  disposables.push(dustMat);

  const dust = new THREE.Points(
    dustGeo,
    dustMat
  );

  scene.add(dust);

  /* ─────────────────────────────────────────
     Resize
  ───────────────────────────────────────── */

  function resize(wrapEl) {
    const w = wrapEl.clientWidth;
    const h = wrapEl.clientHeight;

    if (w === 0 || h === 0) return;

    renderer.setSize(
      w,
      h,
      false
    );

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ─────────────────────────────────────────
     Cleanup
  ───────────────────────────────────────── */

  function dispose() {
    disposables.forEach((resource) => {
      resource?.dispose?.();
    });

    renderer.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    object: camGroup,
    resize,
    dispose,
  };
}