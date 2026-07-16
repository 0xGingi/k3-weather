import { useMemo } from 'react';
import * as THREE from 'three';
import type { GridPoint } from '../../api/openmeteo';
import { useStore, type LayerId } from '../../store';
import { latLonToVec3 } from '../../lib/geo';
import {
  cloudColor,
  precipitationColor,
  temperatureColor,
  windColor,
  type RGB,
} from '../../lib/colors';

const vertexShader = /* glsl */ `
  attribute vec4 aColor;
  attribute float aSize;
  varying vec4 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (260.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec4 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.3, d);
    gl_FragColor = vec4(vColor.rgb, vColor.a * edge);
  }
`;

/** The live global gridmap — one soft sprite per 15° cell, colored by the active layer. */
export function DataPoints({ points }: { points: GridPoint[] }) {
  const layer = useStore((s) => s.layer);
  const { positions, colors, sizes } = useMemo(() => buildAttributes(points, layer), [points, layer]);

  return (
    <points key={layer}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 4]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={layer === 'precipitation' ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

function buildAttributes(points: GridPoint[], layer: LayerId) {
  const positions = new Float32Array(points.length * 3);
  const colors = new Float32Array(points.length * 4);
  const sizes = new Float32Array(points.length);

  points.forEach((p, i) => {
    const v = latLonToVec3(p.lat, p.lon, 1.008);
    positions.set([v.x, v.y, v.z], i * 3);

    let rgb: RGB;
    let alpha = 0.9;
    let size = 0.11;
    switch (layer) {
      case 'temperature':
        rgb = temperatureColor(p.temperature);
        break;
      case 'precipitation': {
        const c = precipitationColor(p.precipitation);
        rgb = c.color;
        alpha = c.alpha;
        size = 0.1 + Math.min(p.precipitation, 8) * 0.02;
        break;
      }
      case 'cloud': {
        const c = cloudColor(p.cloudCover);
        rgb = c.color;
        alpha = c.alpha;
        break;
      }
      case 'wind':
        rgb = windColor(p.windSpeed);
        size = 0.09 + Math.min(p.windSpeed, 25) * 0.004;
        break;
    }
    colors.set([rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, alpha], i * 4);
    sizes[i] = size;
  });

  return { positions, colors, sizes };
}
