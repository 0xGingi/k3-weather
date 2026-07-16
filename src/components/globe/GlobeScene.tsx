import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useStore } from '../../store';
import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { Graticule } from './Graticule';
import { DataPoints } from './DataPoints';
import { LocationMarker } from './LocationMarker';
import { Controls } from './Controls';

export function GlobeScene() {
  const grid = useStore((s) => s.grid);
  const graticuleOn = useStore((s) => s.graticuleOn);
  const dataOn = useStore((s) => s.dataOn);

  return (
    <div className="globe-canvas">
      <Canvas
        camera={{ position: [0.6, 0.4, 2.8], fov: 40, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#02040a']} />
        <Suspense fallback={null}>
          <Stars radius={90} depth={50} count={5000} factor={4} saturation={0} fade speed={0.6} />
          <Earth />
          <Atmosphere />
          {graticuleOn && <Graticule />}
          {dataOn && grid && <DataPoints points={grid} />}
          <LocationMarker />
        </Suspense>
        <Controls />
      </Canvas>
    </div>
  );
}
