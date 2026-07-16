import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { getSunPosition, vec3ToLatLon } from '../../lib/geo';
import { reverseLookup } from '../../api/geocode';
import { useStore } from '../../store';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 nightColor = texture2D(nightMap, vUv).rgb;
    float d = dot(normalize(vWorldNormal), normalize(sunDirection));
    float mixAmt = smoothstep(-0.12, 0.22, d);
    vec3 color = mix(nightColor * 1.4, dayColor, mixAmt);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Earth() {
  const select = useStore((s) => s.select);
  const [dayMap, nightMap] = useTexture(['/textures/earth-day.jpg', '/textures/earth-night.jpg']);

  useMemo(() => {
    for (const t of [dayMap, nightMap]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  }, [dayMap, nightMap]);

  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
    }),
    [dayMap, nightMap],
  );

  // The sun barely moves per-frame; refresh the terminator once a second.
  const lastSunUpdate = useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastSunUpdate.current < 1) return;
    lastSunUpdate.current = clock.elapsedTime;
    (uniforms.sunDirection.value as THREE.Vector3).copy(getSunPosition().direction);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // orbit-drag, not a click
    e.stopPropagation();
    const { lat, lon } = vec3ToLatLon(e.point);
    select({ lat, lon, name: null });
    void reverseLookup(lat, lon).then((name) => {
      if (name) useStore.getState().select({ lat, lon, name });
    });
  };

  return (
    <mesh onClick={handleClick}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}
