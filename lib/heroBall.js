
import * as THREE from "three";
const GOLD = "rgba(199,164,86,0.88)";
const GOLD_SOFT = "rgba(199,164,86,0.55)";

/** Draws a single filled 5-point star */
function drawStar(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();

  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;

    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws text along an arc.
 */
function drawArcText(ctx, cx, cy, text, radius, opts = {}) {
  const { flip = false, spacing = 1 } = opts;

  ctx.save();

  ctx.translate(cx, cy);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const charWidths = [...text].map(
    (ch) => ctx.measureText(ch).width * spacing
  );

  const totalAngle =
    charWidths.reduce((a, w) => a + w, 0) / radius;

  let angle = -totalAngle / 2;

  for (let i = 0; i < text.length; i++) {
    const da = charWidths[i] / radius;
    const a = angle + da / 2;

    const baseAngle = flip
      ? Math.PI / 2 + a
      : -Math.PI / 2 + a;

    const x = Math.cos(baseAngle) * radius;
    const y = Math.sin(baseAngle) * radius;

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(
      baseAngle +
        Math.PI / 2 +
        (flip ? Math.PI : 0)
    );

    ctx.fillText(text[i], 0, 0);

    ctx.restore();

    angle += da;
  }

  ctx.restore();
}

/**
 * Foil-stamped maker's mark.
 */
function drawShieldStamp(ctx, cx, cy, seedOffset) {
  ctx.save();

  ctx.translate(cx, cy);

  ctx.fillStyle = GOLD;

  // BOUNCER
  ctx.font = "700 22px Arial, sans-serif";

  drawArcText(
    ctx,
    0,
    -6,
    "BOUNCER",
    78,
    {
      spacing: 1.15,
    }
  );

  // SF
  ctx.font = "800 40px Arial, sans-serif";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("SF", 0, 4);

  drawStar(ctx, -58, -2, 7);
  drawStar(ctx, 58, -2, 7);

  // STANFORD
  ctx.font = "700 19px Arial, sans-serif";

  ctx.fillText("STANFORD", 0, 34);

  // Weight
  ctx.font = "600 13px Arial, sans-serif";

  ctx.fillText("156g", 0, 56);

  ctx.restore();

  // ALUM TANNED HIDE
  ctx.save();

  ctx.translate(cx, cy);

  ctx.fillStyle = GOLD_SOFT;

  ctx.font = "600 13px Arial, sans-serif";

  drawArcText(
    ctx,
    0,
    0,
    "ALUM TANNED HIDE",
    96,
    {
      flip: true,
      spacing: 1.1,
    }
  );

  ctx.restore();

  void seedOffset;
}

/**
 * Draws faint scratches.
 */
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

    ctx.lineWidth =
      0.6 + Math.random() * 0.8;

    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.lineTo(
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len
    );

    ctx.stroke();
  }
}

/**
 * Creates the cricket ball color texture.
 */
function createBallColorMap() {
  const c = document.createElement("canvas");

  c.width = 1024;
  c.height = 512;

  const ctx = c.getContext("2d");

  // -----------------------------------------
  // BASE LEATHER COLOR
  // -----------------------------------------

  const base = ctx.createLinearGradient(
    0,
    0,
    0,
    512
  );

  base.addColorStop(0, "#a92c1a");
  base.addColorStop(0.32, "#8f2416");
  base.addColorStop(0.62, "#711c11");
  base.addColorStop(1, "#4e120b");

  ctx.fillStyle = base;

  ctx.fillRect(
    0,
    0,
    1024,
    512
  );

  // -----------------------------------------
  // SOFT SHEEN
  // -----------------------------------------

  const sheen = ctx.createLinearGradient(
    0,
    130,
    0,
    250
  );

  sheen.addColorStop(
    0,
    "rgba(255,255,255,0)"
  );

  sheen.addColorStop(
    0.5,
    "rgba(255,200,175,0.07)"
  );

  sheen.addColorStop(
    1,
    "rgba(255,255,255,0)"
  );

  ctx.fillStyle = sheen;

  ctx.fillRect(
    0,
    0,
    1024,
    512
  );

  // -----------------------------------------
  // MOTTLED DYE / WEAR
  // -----------------------------------------

  for (let i = 0; i < 130; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;

    const r =
      16 + Math.random() * 50;

    const dark =
      Math.random() > 0.45;

    ctx.fillStyle = dark
      ? `rgba(30,6,3,${0.08 + Math.random() * 0.12})`
      : `rgba(225,145,105,${0.05 + Math.random() * 0.07})`;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      r,
      r * (0.5 + Math.random() * 0.4),
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // -----------------------------------------
  // SCRATCHES
  // -----------------------------------------

  drawScratches(
    ctx,
    1024,
    512,
    70
  );

  // -----------------------------------------
  // LEATHER GRAIN
  // -----------------------------------------

  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle =
      `rgba(25,5,3,${Math.random() * 0.07})`;

    ctx.fillRect(
      Math.random() * 1024,
      Math.random() * 512,
      1,
      1
    );
  }

  // -----------------------------------------
  // DIRT / GRIME
  // -----------------------------------------

  const grime = ctx.createRadialGradient(
    512,
    480,
    20,
    512,
    480,
    260
  );

  grime.addColorStop(
    0,
    "rgba(35,30,10,0.10)"
  );

  grime.addColorStop(
    1,
    "rgba(35,30,10,0)"
  );

  ctx.fillStyle = grime;

  ctx.fillRect(
    0,
    0,
    1024,
    512
  );

  // -----------------------------------------
  // EXISTING STAMPS
  // -----------------------------------------

  drawShieldStamp(
    ctx,
    256,
    244,
    11
  );

  drawShieldStamp(
    ctx,
    768,
    244,
    47
  );

  // -----------------------------------------
  // MAHI AUTOGRAPH
  // -----------------------------------------

  ctx.save();

  ctx.fillStyle =
    "rgba(255,255,255,0.92)";

  ctx.font =
    'italic 29px "Brush Script MT", "Segoe Script", cursive';

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Signature position
  ctx.translate(140, 270);

  // Slight handwritten tilt
  ctx.rotate(-0.32);

  // Mahi signature
  ctx.fillText(
    "M S Dhoni",
    0,
    0
  );

  ctx.restore();

  // -----------------------------------------
  // CREATE TEXTURE
  // -----------------------------------------

  const tex =
    new THREE.CanvasTexture(c);

  tex.needsUpdate = true;

  return tex;
}

/**
 * Creates leather bump map.
 */
function createLeatherBumpMap() {
  const c = document.createElement("canvas");

  c.width = 1024;
  c.height = 512;

  const ctx = c.getContext("2d");

  ctx.fillStyle = "#808080";

  ctx.fillRect(
    0,
    0,
    1024,
    512
  );

  // Compression patches
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;

    const r =
      5 + Math.random() * 22;

    const v =
      92 + Math.random() * 68;

    ctx.fillStyle =
      `rgba(${v},${v},${v},0.32)`;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      r,
      r * (0.35 + Math.random() * 0.5),
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Creases
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;

    const len =
      10 + Math.random() * 30;

    const angle =
      Math.random() * Math.PI;

    const v =
      70 + Math.random() * 30;

    ctx.strokeStyle =
      `rgba(${v},${v},${v},0.4)`;

    ctx.lineWidth = 0.7;

    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.lineTo(
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len
    );

    ctx.stroke();
  }

  // Fine grain
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;

    const v =
      105 + Math.random() * 55;

    ctx.fillStyle =
      `rgba(${v},${v},${v},0.55)`;

    ctx.fillRect(
      x,
      y,
      1,
      1
    );
  }

  const tex =
    new THREE.CanvasTexture(c);

  tex.needsUpdate = true;

  return tex;
}

/**
 * Creates leather roughness map.
 */
function createLeatherRoughnessMap() {
  const c = document.createElement("canvas");

  c.width = 512;
  c.height = 256;

  const ctx = c.getContext("2d");

  ctx.fillStyle = "#8a8a8a";

  ctx.fillRect(
    0,
    0,
    512,
    256
  );

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;

    const r =
      2 + Math.random() * 8;

    const v =
      120 + Math.random() * 90;

    ctx.fillStyle =
      `rgba(${v},${v},${v},0.25)`;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      r,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  const tex =
    new THREE.CanvasTexture(c);

  tex.needsUpdate = true;

  return tex;
}

/**
 * Builds the stitched seam.
 */
function buildSeam(
  seamMat,
  shadowMat,
  holeMat,
  ballRadius
) {
  const seamGroup =
    new THREE.Group();

  // Seam height
  const protrusion = 0.012;

  const R =
    ballRadius + protrusion;

  // Smaller value keeps white lines closer
  const delta = 0.025;

  const cosD =
    Math.cos(delta);

  const sinD =
    Math.sin(delta);

  // -----------------------------------------
  // SHADOW
  // -----------------------------------------

  const shadowSegments = 220;

  const shadowDotGeo =
    new THREE.SphereGeometry(
      0.05,
      6,
      6
    );

  for (
    let i = 0;
    i < shadowSegments;
    i += 3
  ) {
    const t =
      (i / shadowSegments) *
      Math.PI *
      2;

    const shadowDot =
      new THREE.Mesh(
        shadowDotGeo,
        shadowMat
      );

    shadowDot.scale.set(
      1,
      1,
      0.15
    );

    shadowDot.position.set(
      ballRadius *
        0.999 *
        Math.cos(t),

      ballRadius *
        0.999 *
        Math.sin(t),

      0
    );

    shadowDot.lookAt(
      shadowDot.position
        .clone()
        .multiplyScalar(2)
    );

    seamGroup.add(
      shadowDot
    );
  }

  // -----------------------------------------
  // WHITE THREAD
  // -----------------------------------------

  const cordSegments = 220;

  const cordDotGeo =
    new THREE.SphereGeometry(
      0.012,
      6,
      6
    );

  const holeGeo =
    new THREE.SphereGeometry(
      0.005,
      5,
      5
    );

  for (
    let i = 0;
    i < cordSegments;
    i++
  ) {
    const t =
      (i / cordSegments) *
      Math.PI *
      2;

    const cosT =
      Math.cos(t);

    const sinT =
      Math.sin(t);

    const innerPos =
      new THREE.Vector3(
        R *
          cosD *
          cosT,

        R *
          cosD *
          sinT,

        R *
          sinD
      );

    const outerPos =
      new THREE.Vector3(
        R *
          cosD *
          cosT,

        R *
          cosD *
          sinT,

        -R *
          sinD
      );

    // Inner white row
    const inner =
      new THREE.Mesh(
        cordDotGeo,
        seamMat
      );

    inner.position.copy(
      innerPos
    );

    seamGroup.add(
      inner
    );

    // Outer white row
    const outer =
      new THREE.Mesh(
        cordDotGeo,
        seamMat
      );

    outer.position.copy(
      outerPos
    );

    seamGroup.add(
      outer
    );

    // Stitch holes
    if (i % 4 === 0) {
      const holeInner =
        new THREE.Mesh(
          holeGeo,
          holeMat
        );

      holeInner.position.copy(
        innerPos
      );

      holeInner.position.multiplyScalar(
        0.995
      );

      seamGroup.add(
        holeInner
      );

      const holeOuter =
        new THREE.Mesh(
          holeGeo,
          holeMat
        );

      holeOuter.position.copy(
        outerPos
      );

      holeOuter.position.multiplyScalar(
        0.995
      );

      seamGroup.add(
        holeOuter
      );
    }
  }

  // -----------------------------------------
  // HERRINGBONE STITCHES
  // -----------------------------------------

  const stitchCount = 76;

  const gapWidth =
    2 * R * sinD;

  const stitchGeo =
    new THREE.BoxGeometry(
      0.02,
      gapWidth + 0.006,
      0.013
    );

  for (
    let i = 0;
    i < stitchCount;
    i++
  ) {
    const t =
      (i / stitchCount) *
      Math.PI *
      2;

    const midPos =
      new THREE.Vector3(
        R *
          cosD *
          Math.cos(t),

        R *
          cosD *
          Math.sin(t),

        0
      );

    const stitch =
      new THREE.Mesh(
        stitchGeo,
        seamMat
      );

    stitch.position.copy(
      midPos
    );

    stitch.up.set(
      0,
      0,
      1
    );

    stitch.lookAt(
      midPos
        .clone()
        .multiplyScalar(2)
    );

    const tiltSign =
      i % 2 === 0
        ? 1
        : -1;

    stitch.rotateZ(
      tiltSign * 0.3
    );

    seamGroup.add(
      stitch
    );
  }

  return {
    seamGroup,
    cordDotGeo,
    stitchGeo,
    shadowDotGeo,
    holeGeo,
  };
}

/**
 * Creates the Three.js cricket ball scene.
 */
export function createHeroScene(canvas) {
  const renderer =
    new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  const scene =
    new THREE.Scene();

  const camera =
    new THREE.PerspectiveCamera(
      40,
      1,
      0.1,
      100
    );

  camera.position.set(
    0.6,
    0.15,
    5.2
  );

  camera.lookAt(
    0,
    0,
    0
  );

  // -----------------------------------------
  // BALL
  // -----------------------------------------

  const ballRadius = 1.35;

  const geo =
    new THREE.SphereGeometry(
      ballRadius,
      128,
      128
    );

  const colorMap =
    createBallColorMap();

  const bumpMap =
    createLeatherBumpMap();

  const roughnessMap =
    createLeatherRoughnessMap();

  const mat =
    new THREE.MeshPhysicalMaterial({
      map: colorMap,

      bumpMap,

      bumpScale: 0.024,

      roughnessMap,

      roughness: 0.44,

      metalness: 0.0,

      clearcoat: 0.45,

      clearcoatRoughness: 0.28,
    });

  const ball =
    new THREE.Mesh(
      geo,
      mat
    );

  scene.add(ball);

  // Initial ball rotation
  ball.rotation.x =
    THREE.MathUtils.degToRad(-10);

  ball.rotation.y =
    THREE.MathUtils.degToRad(-10);

  // ball.rotation.z =
  //   THREE.MathUtils.degToRad(20);

  // -----------------------------------------
  // SEAM
  // -----------------------------------------

  const seamMat =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
    });

  const shadowMat =
    new THREE.MeshBasicMaterial({
      color: 0x150502,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });

  const holeMat =
    new THREE.MeshBasicMaterial({
      color: 0x1a0a06,
    });

  const seam =
    buildSeam(
      seamMat,
      shadowMat,
      holeMat,
      ballRadius
    );

  // Slight seam tilt
  seam.seamGroup.rotation.x =
    0.05;

  seam.seamGroup.rotation.z =
    0.07;

  ball.add(
    seam.seamGroup
  );

  // -----------------------------------------
  // LIGHTING
  // -----------------------------------------

  scene.add(
    new THREE.AmbientLight(
      0xfff1de,
      0.26
    )
  );

  const key =
    new THREE.DirectionalLight(
      0xfff8ee,
      1.35
    );

  key.position.set(
    3.2,
    3.6,
    4
  );

  scene.add(key);

  const fill =
    new THREE.DirectionalLight(
      0xffcda0,
      0.28
    );

  fill.position.set(
    -4,
    0.6,
    2.6
  );

  scene.add(fill);

  const rim =
    new THREE.DirectionalLight(
      0x8fae76,
      0.45
    );

  rim.position.set(
    -3.6,
    -1.2,
    -2.4
  );

  scene.add(rim);

  // -----------------------------------------
  // DUST
  // -----------------------------------------

  const dustGeo =
    new THREE.BufferGeometry();

  const dustCount = 140;

  const positions =
    new Float32Array(
      dustCount * 3
    );

  for (
    let i = 0;
    i < dustCount;
    i++
  ) {
    positions[i * 3] =
      (Math.random() - 0.5) * 8;

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

  const dustMat =
    new THREE.PointsMaterial({
      color: 0xfff1de,
      size: 0.014,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

  const dust =
    new THREE.Points(
      dustGeo,
      dustMat
    );

  scene.add(dust);

  // -----------------------------------------
  // RESIZE
  // -----------------------------------------

  function resize(wrapEl) {
    const w =
      wrapEl.clientWidth;

    const h =
      wrapEl.clientHeight;

    if (
      w === 0 ||
      h === 0
    ) {
      return;
    }

    renderer.setSize(
      w,
      h,
      false
    );

    camera.aspect =
      w / h;

    camera.updateProjectionMatrix();
  }

  // -----------------------------------------
  // DISPOSE
  // -----------------------------------------

  function dispose() {
    geo.dispose();

    mat.dispose();

    colorMap.dispose();

    bumpMap.dispose();

    roughnessMap.dispose();

    seam.cordDotGeo.dispose();

    seam.stitchGeo.dispose();

    seam.shadowDotGeo.dispose();

    seam.holeGeo.dispose();

    shadowMat.dispose();

    holeMat.dispose();

    seamMat.dispose();

    dustGeo.dispose();

    dustMat.dispose();

    renderer.dispose();
  }

  // -----------------------------------------
  // RETURN
  // -----------------------------------------

  return {
    renderer,
    scene,
    camera,
    ball,
    object: ball,
    dust,
    resize,
    dispose,
  };
}
