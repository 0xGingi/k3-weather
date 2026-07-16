import { useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '../../lib/geo';

/** Lat/lon reference grid hugging the surface. */
export function Graticule({ step = 15, radius = 1.002 }: { step?: number; radius?: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const seg = (a: THREE.Vector3, b: THREE.Vector3) => {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    };
    for (let lon = -180; lon < 180; lon += step) {
      for (let lat = -90; lat < 90; lat += 3) {
        seg(latLonToVec3(lat, lon, radius), latLonToVec3(lat + 3, lon, radius));
      }
    }
    for (let lat = -75; lat <= 75; lat += step) {
      for (let lon = -180; lon < 180; lon += 3) {
        seg(latLonToVec3(lat, lon, radius), latLonToVec3(lat, lon + 3, radius));
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [step, radius]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#7dd3fc" transparent opacity={0.13} depthWrite={false} />
    </lineSegments>
  );
}
