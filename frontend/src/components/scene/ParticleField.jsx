import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  particleVertexShader,
  particleFragmentShader,
} from '@/shaders/cyberShaders';

// 400 floating micro-quads. Colors alternate cyan/magenta; positions swayed
// via a Perlin-like noise driven by u_time in the vertex shader.
const PARTICLE_COUNT = 400;

export default function ParticleField({ range = { x: 12, y: 6, z: 8 } }) {
  const pointsRef = useRef();

  const { positions, seeds, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const cyan = new THREE.Color('#00f0ff');
    const magenta = new THREE.Color('#ff0055');
    const violet = new THREE.Color('#8D00FF');
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * range.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * range.y + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * range.z - 1;
      seeds[i] = Math.random();
      const roll = Math.random();
      const c = roll < 0.55 ? cyan : roll < 0.85 ? magenta : violet;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, seeds, colors };
  }, [range.x, range.y, range.z]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_size: { value: 1.6 },
    }),
    []
  );

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-a_seed"
          count={PARTICLE_COUNT}
          array={seeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-a_color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
