import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A floating circular metallic-grid plate that acts as the base stage for the
// hero objects. Grid lines flicker via an emissive noise pattern (canvas
// texture).
export default function Stage({ position = [0, 0, 0], radius = 3.5 }) {
  const glowRef = useRef();
  const stageRef = useRef();
  const sweepRef = useRef();

  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050612';
    ctx.fillRect(0, 0, size, size);

    // radial grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.2;
    const cx = size / 2;
    const cy = size / 2;
    for (let r = 24; r < size / 2; r += 24) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * size / 2, cy + Math.sin(a) * size / 2);
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.15)';
      ctx.stroke();
    }
    // small nodes
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    for (let i = 0; i < 26; i++) {
      const r = 20 + Math.random() * (size / 2 - 20);
      const a = Math.random() * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Alpha-falloff texture for the sweep beam — bright at leading edge, fades
  // to transparent at trailing edge (angular gradient produced on a canvas).
  const sweepTexture = useMemo(() => {
    const w = 512;
    const h = 512;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    // conic-like gradient using radial gradients: fade from center-right
    // (leading) around to center-left (trailing).
    const cx = w / 2;
    const cy = h / 2;
    // Draw many thin wedges with decreasing alpha
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const a0 = -Math.PI / 12 + t * (Math.PI * 0.9);
      const a1 = a0 + (Math.PI * 0.9) / steps + 0.005;
      const alpha = (1 - t) * 0.85;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, w / 2 - 4, a0, a1);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.fill();
    }
    // Bright leading edge line
    ctx.strokeStyle = 'rgba(0, 240, 255, 1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (w / 2 - 4), cy);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.35 + Math.sin(t * 2.4) * 0.08;
    }
    if (stageRef.current) {
      // Rotate around the mesh's LOCAL Z axis. After the mesh's initial
      // [-π/2, 0, 0] rotation this axis maps to world +Y, so the disc spins
      // flat around the vertical axis like a radar sweep instead of panning
      // upward as if tilting on the world X axis.
      stageRef.current.rotation.z = t * 0.05;
    }
    if (sweepRef.current) {
      // Faster radar sweep — this mesh is inside a group that's already
      // -π/2 X-rotated so its local Z axis maps to world +Y (spins flat).
      sweepRef.current.rotation.z = -t * 0.6;
    }
  });

  return (
    <group position={position}>
      {/* Base plate */}
      <mesh receiveShadow position={[0, -0.02, 0]}>
        <cylinderGeometry args={[radius, radius, 0.08, 96]} />
        <meshStandardMaterial
          color="#0a0b18"
          metalness={0.9}
          roughness={0.35}
          emissive="#00121a"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Grid pattern top */}
      <mesh ref={stageRef} position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.96, 96]} />
        <meshBasicMaterial map={gridTexture} transparent opacity={0.9} />
      </mesh>

      {/* Radar sweep beam — inside a flat group so we can spin it around Y */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
        <mesh ref={sweepRef}>
          <circleGeometry args={[radius * 0.94, 96]} />
          <meshBasicMaterial
            map={sweepTexture}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Under-glow disk */}
      <mesh ref={glowRef} position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.9, radius * 1.35, 96]} />
        <meshBasicMaterial color="#ff0055" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Cyan outer ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.98, radius, 128]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
