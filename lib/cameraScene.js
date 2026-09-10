import * as THREE from "three";

const GOLD = "rgba(214,178,90,0.95)";

/** Small canvas texture plate with the SnapWritoo mark, mounted on the body. */
function createBadgeTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 512, 256);

  ctx.save();
  ctx.translate(256, 128);
  ctx.fillStyle = GOLD;
  ctx.font = '600 46px Georgia, serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SnapWritoo", 0, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds the three.js scene/camera/renderer/camera-model for the
 * photography reveal panel. Mirrors the API of createHeroScene so the same
 * generic canvas wrapper can mount any of the three hobby scenes.
 * @param {HTMLCanvasElement} canvas
 */
export function createCameraScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0.5, 0.2, 5.4);

  const camGroup = new THREE.Group();
  const disposables = [];
  function track(geo) {
    disposables.push(geo);
    return geo;
  }

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c1a17,
    roughness: 0.62,
    metalness: 0.15,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
  });
  disposables.push(bodyMat);

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xcaa456,
    roughness: 0.3,
    metalness: 0.85,
  });
  disposables.push(metalMat);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c1a1e,
    roughness: 0.08,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  disposables.push(glassMat);

  // main body
  const bodyGeo = track(new THREE.BoxGeometry(1.9, 1.2, 0.7));
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  camGroup.add(body);

  // top brushed-metal plate
  const plateGeo = track(new THREE.BoxGeometry(1.9, 0.12, 0.72));
  const plate = new THREE.Mesh(plateGeo, metalMat);
  plate.position.y = 0.66;
  camGroup.add(plate);

  // viewfinder hump
  const finderGeo = track(new THREE.BoxGeometry(0.34, 0.2, 0.4));
  const finder = new THREE.Mesh(finderGeo, bodyMat);
  finder.position.set(0, 0.82, -0.05);
  camGroup.add(finder);

  // shutter-speed dial + rewind knob
  const dialGeo = track(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24));
  const dial1 = new THREE.Mesh(dialGeo, metalMat);
  dial1.position.set(0.72, 0.72, 0);
  camGroup.add(dial1);
  const dial2 = new THREE.Mesh(dialGeo, metalMat);
  dial2.position.set(-0.75, 0.72, 0);
  camGroup.add(dial2);

  // lens barrel, protruding from the front face
  const lensOuterGeo = track(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 32));
  const lensOuter = new THREE.Mesh(lensOuterGeo, bodyMat);
  lensOuter.rotation.x = Math.PI / 2;
  lensOuter.position.set(0, -0.02, 0.5);
  camGroup.add(lensOuter);

  const lensRingGeo = track(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 32));
  const lensRing = new THREE.Mesh(lensRingGeo, metalMat);
  lensRing.rotation.x = Math.PI / 2;
  lensRing.position.set(0, -0.02, 0.66);
  camGroup.add(lensRing);

  const glassGeo = track(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 32));
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, -0.02, 0.71);
  camGroup.add(glass);

  // strap lugs
  const lugGeo = track(new THREE.TorusGeometry(0.06, 0.018, 8, 20));
  const lug1 = new THREE.Mesh(lugGeo, metalMat);
  lug1.position.set(0.98, 0.35, 0);
  lug1.rotation.y = Math.PI / 2;
  camGroup.add(lug1);
  const lug2 = new THREE.Mesh(lugGeo, metalMat);
  lug2.position.set(-0.98, 0.35, 0);
  lug2.rotation.y = Math.PI / 2;
  camGroup.add(lug2);

  // brand badge on the front leatherette
  const badgeGeo = track(new THREE.PlaneGeometry(0.7, 0.35));
  const badgeMat = new THREE.MeshBasicMaterial({
    map: createBadgeTexture(),
    transparent: true,
  });
  disposables.push(badgeMat, badgeMat.map);
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.position.set(-0.35, -0.3, 0.356);
  camGroup.add(badge);

  camGroup.rotation.y = -0.4;
  camGroup.rotation.x = 0.08;
  scene.add(camGroup);

  scene.add(new THREE.AmbientLight(0xfff1de, 0.5));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.35);
  key.position.set(3, 3.4, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffcda0, 0.4);
  fill.position.set(-4, 0.6, 2.6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8fae76, 0.45);
  rim.position.set(-3.6, -1.2, -2.4);
  scene.add(rim);

  // fine drifting dust, catching the "studio" light
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
    color: 0xfff1de,
    size: 0.012,
    transparent: true,
    opacity: 0.28,
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

  return { renderer, scene, camera, object: camGroup, resize, dispose };
}
