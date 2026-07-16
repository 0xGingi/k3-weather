import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStore } from '../../store';
import { latLonToVec3 } from '../../lib/geo';

const IDLE_MS = 6000;

/** Orbit controls with idle auto-rotation and smooth fly-to on search. */
export function Controls() {
  const ref = useRef<OrbitControlsImpl>(null);
  const lastInteraction = useRef(0);
  const flyTarget = useRef<THREE.Vector3 | null>(null);
  const flyTo = useStore((s) => s.flyTo);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (!flyTo) return;
    flyTarget.current = latLonToVec3(flyTo.lat, flyTo.lon, 1).normalize();
  }, [flyTo]);

  useFrame((_, dt) => {
    const controls = ref.current;
    if (!controls) return;
    controls.autoRotate = performance.now() - lastInteraction.current > IDLE_MS;
    controls.autoRotateSpeed = 0.55;

    if (flyTarget.current) {
      const dist = camera.position.length();
      const desired = flyTarget.current.clone().multiplyScalar(dist);
      camera.position.lerp(desired, 1 - Math.exp(-4 * dt));
      if (camera.position.angleTo(desired) < 0.015) flyTarget.current = null;
    }
    controls.update();
  });

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      minDistance={1.4}
      maxDistance={5}
      onStart={() => {
        lastInteraction.current = performance.now();
        flyTarget.current = null;
      }}
      onEnd={() => {
        lastInteraction.current = performance.now();
      }}
    />
  );
}
