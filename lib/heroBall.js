import * as THREE from "three";

const GOLD = "rgba(199,164,86,0.88)";
const GOLD_SOFT = "rgba(199,164,86,0.55)";

/**
 * Foil-stamped maker's crest: "WATER PROOFED / SNAPWRITOO / GENUINE ALL HIDE"
 * inside a restrained shield, with a curved "HAND STITCHED" mark above it.
 * Rendered with slight per-glyph jitter so it reads as stamped into leather
 * rather than a crisp, floating digital logo.
 */
function drawShieldStamp(ctx, cx, cy, seedOffset) {
  const jitter = (n) => (Math.sin(n * 12.9898 + seedOffset) * 43758.5453) % 1;

  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-42, -30);
  ctx.lineTo(42, -30);
  ctx.lineTo(42, 8);
  ctx.quadraticCurveTo(42, 40, 0, 54);
  ctx.quadraticCurveTo(-42, 40, -42, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "rgba(199,164,86,0.35)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = "600 12px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.translate(0, -16 + jitter(1) * 0.6);
  ctx.fillText("WATER PROOFED", 0, 0);
  ctx.restore();

  ctx.font = "700 26px Georgia, serif";
  ctx.save();
  ctx.translate(0, 6 + jitter(2) * 0.5);
  ctx.fillText("SNAPWRITOO", 0, 0);
  ctx.restore();

  ctx.font = "600 8.5px Georgia, serif";
  ctx.save();
  ctx.translate(0, 28 + jitter(3) * 0.5);
  ctx.fillText("GENUINE  ALL HIDE", 0, 0);
  ctx.restore();

  ctx.restore();

  // curved "HAND STITCHED" maker's mark, arced above the crest
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = GOLD_SOFT;
  ctx.font = "600 9.5px Georgia, serif";
  const word = "H A N D   S T I T C H E D";
  const r = 84;
  const total = word.length;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1) - 0.5;
    const a = t * 2.0 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(word[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * A handwritten "SnapWritoo" autograph, layered with a few faded, slightly
 * offset strokes to mimic ink soaking unevenly into leather rather than a
 * single crisp digital line.
 */
function drawAutograph(ctx, cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.055);

  const passes = [
    { dx: 0, dy: 0, alpha: 0.95, blur: 1.5 },
    { dx: 0.6, dy: 0.4, alpha: 0.18, blur: 3.5 },
    { dx: -0.5, dy: 0.3, alpha: 0.12, blur: 4 },
  ];
  for (const p of passes) {
    ctx.save();
    ctx.translate(p.dx, p.dy);
    ctx.fillStyle = `rgba(238,228,206,${p.alpha})`;
    ctx.font = 'italic 44px "Segoe Script", "Brush Script MT", cursive';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = p.blur;
    ctx.fillText("SnapWritoo", 0, 0);
    ctx.restore();
  }

  // thin underline flourish, with a faint ink-bleed halo beneath it
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(238,228,206,0.16)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-90, 21);
  ctx.quadraticCurveTo(0, 33, 94, 17);
  ctx.stroke();
  ctx.strokeStyle = "rgba(238,228,206,0.65)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-90, 20);
  ctx.quadraticCurveTo(0, 32, 94, 16);
  ctx.stroke();
  ctx.restore();
}

/** A handful of faint scratch strokes, catching the light at odd angles. */
function drawScratches(ctx, width, height, count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const len = 8 + Math.random() * 26;
    const angle = Math.random() * Math.PI;
    const light = Math.random() > 0.5;
    ctx.strokeStyle = light
      ? `rgba(240,205,180,${0.05 + Math.random() * 0.08})`
      : `rgba(35,7,4,${0.06 + Math.random() * 0.09})`;
    ctx.lineWidth = 0.6 + Math.random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
}

function createBallColorMap() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");

  // deep crimson-to-burgundy base, uneven top-to-bottom like real hide dye
  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, "#b8341f");
  base.addColorStop(0.32, "#9c2818");
  base.addColorStop(0.62, "#7e2014");
  base.addColorStop(1, "#5e160e");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);

  // soft directional sheen band (kept subtle — semi-matte, not glossy)
  const sheen = ctx.createLinearGradient(0, 130, 0, 250);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,200,175,0.07)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 1024, 512);

  // large mottled dye/wear blotches — uneven pigmentation
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = 16 + Math.random() * 50;
    const dark = Math.random() > 0.45;
    ctx.fillStyle = dark
      ? `rgba(35,7,4,${0.05 + Math.random() * 0.08})`
      : `rgba(215,130,95,${0.03 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      r,
      r * (0.5 + Math.random() * 0.4),
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // faint scuffs/scratches — match-used character, kept restrained
  drawScratches(ctx, 1024, 512, 70);

  // fine leather grain speckle
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(25,5,3,${Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 512, 1, 1);
  }

  // subtle dirt accumulation toward the lower edge, like grass/pitch grime
  const grime = ctx.createRadialGradient(512, 480, 20, 512, 480, 260);
  grime.addColorStop(0, "rgba(35,30,10,0.10)");
  grime.addColorStop(1, "rgba(35,30,10,0)");
  ctx.fillStyle = grime;
  ctx.fillRect(0, 0, 1024, 512);

  drawShieldStamp(ctx, 256, 244, 11);
  drawShieldStamp(ctx, 768, 244, 47);
  drawAutograph(ctx, 512, 398);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Grayscale bump map: pores, fine creases, and compression marks so the
 * leather reads as grained hide under light rather than a smooth CGI sphere.
 */
function createLeatherBumpMap() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 1024, 512);

  // broad compression/wrinkle patches
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = 5 + Math.random() * 22;
    const v = 92 + Math.random() * 68;
    ctx.fillStyle = `rgba(${v},${v},${v},0.32)`;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      r,
      r * (0.35 + Math.random() * 0.5),
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // thin crease lines
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const len = 10 + Math.random() * 30;
    const angle = Math.random() * Math.PI;
    const v = 70 + Math.random() * 30;
    ctx.strokeStyle = `rgba(${v},${v},${v},0.4)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // fine pore-level grain — the bulk of the "leather, not plastic" read
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const v = 105 + Math.random() * 55;
    ctx.fillStyle = `rgba(${v},${v},${v},0.55)`;
    ctx.fillRect(x, y, 1, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * A roughness map to match the bump map: pores and worn patches read as
 * slightly less specular than the smoother surrounding leather, avoiding a
 * uniform, procedural-looking sheen.
 */
function createLeatherRoughnessMap() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 8;
    const v = 120 + Math.random() * 90;
    ctx.fillStyle = `rgba(${v},${v},${v},0.25)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a raised seam wrapping a full great circle: two clearly separated
 * cords sitting proud of the leather, dark AO shadow beneath them, narrow
 * herringbone stitches crossing the gap, and tiny dark stitch-hole dots so
 * each stitch casts a believable little shadow into the leather.
 */
function buildSeam(seamMat, shadowMat, holeMat, ballRadius) {
  const seamGroup = new THREE.Group();
  const surface = ballRadius + 0.003;
  const innerR = surface + 0.008;
  const outerR = innerR + 0.068;
  const midR = (innerR + outerR) / 2;

  // faint AO shadow band sitting just under the seam, like accumulated dirt
  const shadowSegments = 220;
  const shadowDotGeo = new THREE.SphereGeometry(0.05, 6, 6);
  for (let i = 0; i < shadowSegments; i += 3) {
    const t = (i / shadowSegments) * Math.PI * 2;
    const shadowDot = new THREE.Mesh(shadowDotGeo, shadowMat);
    shadowDot.scale.set(1, 1, 0.15);
    shadowDot.position.set(
      surface * 0.999 * Math.cos(t),
      surface * 0.999 * Math.sin(t),
      0,
    );
    shadowDot.lookAt(shadowDot.position.clone().multiplyScalar(2));
    seamGroup.add(shadowDot);
  }

  // the two raised cords themselves, packed tight for a continuous thread look
  const cordSegments = 220;
  const cordDotGeo = new THREE.SphereGeometry(0.016, 6, 6);
  const holeGeo = new THREE.SphereGeometry(0.006, 5, 5);
  for (let i = 0; i < cordSegments; i++) {
    const t = (i / cordSegments) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const inner = new THREE.Mesh(cordDotGeo, seamMat);
    inner.position.set(innerR * cos, innerR * sin, 0);
    seamGroup.add(inner);
    const outer = new THREE.Mesh(cordDotGeo, seamMat);
    outer.position.set(outerR * cos, outerR * sin, 0);
    seamGroup.add(outer);

    // occasional tiny dark stitch-hole dimple where thread pierces the hide
    if (i % 4 === 0) {
      const holeInner = new THREE.Mesh(holeGeo, holeMat);
      holeInner.position.set((innerR - 0.006) * cos, (innerR - 0.006) * sin, 0);
      seamGroup.add(holeInner);
      const holeOuter = new THREE.Mesh(holeGeo, holeMat);
      holeOuter.position.set((outerR - 0.006) * cos, (outerR - 0.006) * sin, 0);
      seamGroup.add(holeOuter);
    }
  }

  // narrow herringbone stitches crossing the gap between the two cords
  const stitchCount = 76;
  const stitchGeo = new THREE.BoxGeometry(0.02, outerR - innerR + 0.006, 0.013);
  for (let i = 0; i < stitchCount; i++) {
    const t = (i / stitchCount) * Math.PI * 2;
    const stitch = new THREE.Mesh(stitchGeo, seamMat);
    stitch.position.set(midR * Math.cos(t), midR * Math.sin(t), 0);
    const tiltSign = i % 2 === 0 ? 1 : -1;
    stitch.rotation.z = t + Math.PI / 2 + tiltSign * 0.3;
    seamGroup.add(stitch);
  }

  return { seamGroup, cordDotGeo, stitchGeo, shadowDotGeo, holeGeo };
}

/**
 * Builds the three.js scene/camera/renderer/ball for the hero canvas.
 * Returns handles the caller needs to animate and dispose the scene.
 * @param {HTMLCanvasElement} canvas
 */
export function createHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

  camera.position.set(0.6, 0.15, 5.2);
  camera.lookAt(0, 0, 0);
  const ballRadius = 1.35;
  const geo = new THREE.SphereGeometry(ballRadius, 128, 128);
  const colorMap = createBallColorMap();
  const bumpMap = createLeatherBumpMap();
  const roughnessMap = createLeatherRoughnessMap();
  const mat = new THREE.MeshPhysicalMaterial({
    map: colorMap,
    bumpMap,
    bumpScale: 0.03,
    roughnessMap,
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
  });
  const ball = new THREE.Mesh(geo, mat);
  scene.add(ball);

  // Seam group: two cords + herringbone stitches + AO shadow + stitch holes.
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0xede2c8,
    roughness: 0.82,
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x150502,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x1a0a06 });
  const { seamGroup, cordDotGeo, stitchGeo, shadowDotGeo, holeGeo } = buildSeam(
    seamMat,
    shadowMat,
    holeMat,
    ballRadius,
  );
  seamGroup.rotation.x = 0.55;
  seamGroup.rotation.z = 0.3;
  ball.add(seamGroup);

  // Cinematic studio lighting: warm key upper-front-right, warm fill
  // opposite side, cool/olive rim from behind — as specified.
  scene.add(new THREE.AmbientLight(0xfff1de, 0.42));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.5);
  key.position.set(3.2, 3.6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffcda0, 0.38);
  fill.position.set(-4, 0.6, 2.6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8fae76, 0.5);
  rim.position.set(-3.6, -1.2, -2.4);
  scene.add(rim);

  // subtle atmospheric dust drifting around the ball
  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 140;
  const positions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xfff1de,
    size: 0.014,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
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
    geo.dispose();
    mat.dispose();
    colorMap.dispose();
    bumpMap.dispose();
    roughnessMap.dispose();
    cordDotGeo.dispose();
    stitchGeo.dispose();
    shadowDotGeo.dispose();
    holeGeo.dispose();
    shadowMat.dispose();
    holeMat.dispose();
    seamMat.dispose();
    dustGeo.dispose();
    dustMat.dispose();
    renderer.dispose();
  }

  return { renderer, scene, camera, ball, object: ball, dust, resize, dispose };
}
