import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Synthetic Fuel Vessel — a geometric metallic mug that emits volumetric
// neon-cyan vapor particles upward along Y. Interactive: subtle bobbing +
// vapor intensifies on hover.
export default function FuelVessel({ position = [0.1, 0.36, 0.9] }) {
  const groupRef = useRef();
  const emissiveBandRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  // Vapor particle system
  const VAPOR_COUNT = 240;
  const { positions, seeds, colors } = useMemo(() => {
    const positions = new Float32Array(VAPOR_COUNT * 3);
    const seeds = new Float32Array(VAPOR_COUNT);
    const colors = new Float32Array(VAPOR_COUNT * 3);
    const cyan = new THREE.Color('#00f0ff');
    const magenta = new THREE.Color('#ff0055');
    for (let i = 0; i < VAPOR_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.14;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.random() * 1.4;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      seeds[i] = Math.random();
      const c = Math.random() < 0.85 ? cyan : magenta;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, seeds, colors };
  }, []);

  const vaporRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t * 0.9 + 1.2) * 0.04;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.06;
    }
    if (vaporRef.current) {
      const positionsArr = vaporRef.current.geometry.attributes.position.array;
      const seedsArr = vaporRef.current.geometry.attributes.a_seed.array;
      const t = clock.getElapsedTime();
      const speed = hovered ? 0.02 : 0.008;
      for (let i = 0; i < VAPOR_COUNT; i++) {
        // rise
        positionsArr[i * 3 + 1] += speed + seedsArr[i] * 0.006;
        // sway
        positionsArr[i * 3] += Math.sin(t * 1.3 + seedsArr[i] * 6.28) * 0.0015;
        positionsArr[i * 3 + 2] += Math.cos(t * 0.9 + seedsArr[i] * 6.28) * 0.0015;
        // reset if too high
        if (positionsArr[i * 3 + 1] > 1.6) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.13;
          positionsArr[i * 3] = Math.cos(angle) * r;
          positionsArr[i * 3 + 1] = 0;
          positionsArr[i * 3 + 2] = Math.sin(angle) * r;
        }
      }
      vaporRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (emissiveBandRef.current) {
      emissiveBandRef.current.material.emissiveIntensity =
        1.0 + Math.sin(clock.getElapsedTime() * 4.0) * 0.35;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Vessel body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.28, 0.5, 24, 1, false]} />
        <meshStandardMaterial
          color="#0d0e18"
          metalness={0.95}
          roughness={0.25}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Inner cavity ring */}
      <mesh position={[0, 0.25, 0]}>
        <ringGeometry args={[0.24, 0.30, 32]} />
        <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
      </mesh>

      {/* Liquid surface — dark w/ emissive rim */}
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 32]} />
        <meshStandardMaterial
          color="#040a10"
          emissive="#00f0ff"
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.15}
        />
      </mesh>

      {/* Emissive band */}
      <mesh ref={emissiveBandRef} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.322, 0.322, 0.02, 24]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      {/* Handle — small torus segment */}
      <mesh position={[0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.14, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#12132a" metalness={0.95} roughness={0.3} />
      </mesh>

      {/* Data ring at base */}
      <mesh position={[0, -0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.30, 0.36, 32]} />
        <meshBasicMaterial color="#ff0055" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Vapor particles */}
      <points ref={vaporRef} position={[0, 0.24, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={VAPOR_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-a_seed"
            count={VAPOR_COUNT}
            array={seeds}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={VAPOR_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.045}
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
