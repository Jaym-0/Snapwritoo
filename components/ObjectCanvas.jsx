"use client";

import { useEffect, useRef } from "react";
import { initBallDrag, prefersReducedMotion } from "@/lib/main";

/**
 * Mounts a three.js scene built by `builder` (createHeroScene, createPenScene,
 * or createCameraScene — anything returning { renderer, scene, camera, object,
 * resize, dispose }), animates it with a gentle idle spin the user can
 * override by dragging, and cleans everything up on unmount.
 */
export default function ObjectCanvas({ builder }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !builder) return;

    const reduceMotion = prefersReducedMotion();
    const { renderer, scene, camera, object, resize, dispose } = builder(canvas);
    const { state: drag, cleanup: cleanupDrag } = initBallDrag(wrap);

    function handleResize() {
      resize(wrap);
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    let rotation = 0;
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      if (!reduceMotion) {
        if (!drag.isDragging) rotation += 0.008;
        object.rotation.y = (object.userData.baseRotY ?? 0) + rotation + drag.dragRotY;
        object.rotation.x = (object.userData.baseRotX ?? object.rotation.x) + drag.dragRotX;
      }
      renderer.render(scene, camera);
    }
    object.userData.baseRotY = object.rotation.y;
    object.userData.baseRotX = object.rotation.x;
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      cleanupDrag();
      dispose();
    };
  }, [builder]);

  return (
    <div className="object-canvas-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}
