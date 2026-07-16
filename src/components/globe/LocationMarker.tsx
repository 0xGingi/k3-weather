import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { latLonToVec3 } from '../../lib/geo';

/** Pulsing beacon pinned to the selected location. */
export function LocationMarker() {
  const selected = useStore((s) => s.selected);
  const ringRef = useRef<THREE.Mesh>(null);

  const anchor = useMemo(() => {
    if (!selected) return null;
    const pos = latLonToVec3(selected.lat, selected.lon, 1.005);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize(),
    );
    return { pos, quaternion };
  }, [selected]);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3);
    ringRef.current.scale.setScalar(1 + 0.35 * pulse);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.85 - 0.5 * pulse;
  });

  if (!anchor) return null;

  return (
    <group position={anchor.pos} quaternion={anchor.quaternion}>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.0075, 16, 16]} />
        <meshBasicMaterial color="#7ef9e1" />
      </mesh>
      <mesh ref={ringRef} rotation-x={Math.PI / 2} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.014, 0.0175, 48]} />
        <meshBasicMaterial
          color="#7ef9e1"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.0012, 0.0012, 0.05, 6]} />
        <meshBasicMaterial color="#7ef9e1" transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </group>
  );
}
