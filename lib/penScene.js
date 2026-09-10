import * as THREE from "three";

const GOLD = "rgba(214,178,90,0.95)";

/** Small canvas texture band with the SnapWritoo mark, wrapped around the barrel. */
function createBarrelTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#3a0f16";
  ctx.fillRect(0, 0, 512, 128);

  // subtle resin swirl highlights
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 128;
    const r = 10 + Math.random() * 30;
    ctx.fillStyle = `rgba(120,30,40,${0.06 + Math.random() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(256, 64);
  ctx.rotate(-0.03);
  ctx.fillStyle = GOLD;
  ctx.font = 'italic 34px "Segoe Script", "Brush Script MT", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SnapWritoo", 0, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds the three.js scene/camera/renderer/pen for the poetry reveal panel.
 * Mirrors the API of createHeroScene so the same generic canvas wrapper can
 * mount either one.
 * @param {HTMLCanvasElement} canvas
 */
export function createPenScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

camera.position.set(0.6, 0.15, 7.7);
camera.lookAt(0, 0, 0);

  const penGroup = new THREE.Group();
  const disposables = [];
  function track(geo) {
    disposables.push(geo);
    return geo;
  }

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a0f16,
    map: createBarrelTexture(),
    roughness: 0.28,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
  });
  disposables.push(bodyMat, bodyMat.map);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xcaa456,
    roughness: 0.28,
    metalness: 0.9,
  });
  disposables.push(goldMat);

  // barrel (main body)
  const barrelGeo = track(new THREE.CylinderGeometry(0.16, 0.17, 2.5, 32));
  const barrel = new THREE.Mesh(barrelGeo, bodyMat);
  barrel.position.y = 0.2;
  penGroup.add(barrel);

  // cap, sitting just above the barrel
  const capGeo = track(new THREE.CylinderGeometry(0.19, 0.19, 1.1, 32));
  const cap = new THREE.Mesh(capGeo, bodyMat);
  cap.position.y = 1.95;
  penGroup.add(cap);

  // cap finial
  const finialGeo = track(new THREE.SphereGeometry(0.1, 16, 16));
  const finial = new THREE.Mesh(finialGeo, goldMat);
  finial.position.y = 2.53;
  penGroup.add(finial);

  // gold bands
  const bandGeo = track(new THREE.TorusGeometry(0.175, 0.02, 10, 32));
  [1.38, 1.42, -0.98].forEach((y) => {
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.y = y;
    band.rotation.x = Math.PI / 2;
    penGroup.add(band);
  });

  // tapered section down to the nib
  const taperGeo = track(new THREE.CylinderGeometry(0.17, 0.06, 0.55, 32));
  const taper = new THREE.Mesh(taperGeo, bodyMat);
  taper.position.y = -1.02;
  penGroup.add(taper);

  // nib
  const nibGeo = track(new THREE.ConeGeometry(0.06, 0.42, 20));
  const nib = new THREE.Mesh(nibGeo, goldMat);
  nib.position.y = -1.5;
  penGroup.add(nib);

  // pocket clip
  const clipGeo = track(new THREE.BoxGeometry(0.045, 1.0, 0.03));
  const clip = new THREE.Mesh(clipGeo, goldMat);
  clip.position.set(0.2, 1.55, 0);
  penGroup.add(clip);

  penGroup.rotation.z = 1.05;
  penGroup.rotation.x = 0.15;
  scene.add(penGroup);

  scene.add(new THREE.AmbientLight(0xfff1de, 0.5));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.3);
  key.position.set(3, 3.4, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffcda0, 0.4);
  fill.position.set(-4, 0.6, 2.6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8fae76, 0.45);
  rim.position.set(-3.6, -1.2, -2.4);
  scene.add(rim);

  // fine drifting particles, like settling ink dust
  const dustGeo = track(new THREE.BufferGeometry());
  const dustCount = 90;
  const positions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xcaa456,
    size: 0.012,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  disposables.push(dustMat);
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  function resize(wrapEl) {
    const w = wrapEl.clientWidth;
    const h = wrapEl.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    disposables.forEach((d) => d?.dispose?.());
    renderer.dispose();
  }

  return { renderer, scene, camera, object: penGroup, resize, dispose };
}
