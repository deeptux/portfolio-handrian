import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  phosphorMatrixVertex,
  phosphorMatrixFragment,
} from '@/shaders/cyberShaders';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';
import { useAudio } from '@/hooks/useAudio';

// Holographic Iris Gate — a vertical ring with 4 concentric apertures that
// slowly rotate counter-clockwise. The interior disc runs the phosphor-matrix
// shader (simulated video feed). When entering ABOUT_STAGE the apertures
// dilate outward + shader intensity climbs to full.
export default function IrisGate({ position = [1.5, 0.7, -0.3] }) {
  const groupRef = useRef();
  const ap0 = useRef();
  const ap1 = useRef();
  const ap2 = useRef();
  const ap3 = useRef();
  const apertureRefs = useMemo(() => [ap0, ap1, ap2, ap3], []);
  const shaderRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { state, goAbout } = useSceneState();
  const { click } = useAudio();

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(600, 600) },
      u_intensity: { value: 0.55 },
    }),
    []
  );

  useEffect(() => {
    const targetIntensity = state === SCENE_STATES.ABOUT_STAGE ? 1.0 : 0.55;
    const targetDilate = state === SCENE_STATES.ABOUT_STAGE ? 1.35 : 1.0;
    gsap.to(uniforms.u_intensity, { value: targetIntensity, duration: 1.2, ease: 'power3.inOut' });
    apertureRefs.forEach((r, i) => {
      if (r.current) {
        gsap.to(r.current.scale, {
          x: targetDilate,
          y: targetDilate,
          z: 1,
          duration: 1.2,
          delay: i * 0.06,
          ease: 'power3.inOut',
        });
      }
    });
  }, [state, uniforms, apertureRefs]);

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.6) * 0.03;
    }
    apertureRefs.forEach((r, i) => {
      if (r.current) {
        r.current.rotation.z -= 0.0025 * (i % 2 === 0 ? 1 : -0.6) * (hovered ? 2.2 : 1);
      }
    });
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (hovered && state === SCENE_STATES.HOME) {
      document.body.setAttribute('data-scene-hover', 'gate');
    } else {
      if (document.body.getAttribute('data-scene-hover') === 'gate') {
        document.body.removeAttribute('data-scene-hover');
      }
    }
    return () => {
      if (document.body.getAttribute('data-scene-hover') === 'gate') {
        document.body.removeAttribute('data-scene-hover');
      }
    };
  }, [hovered, state]);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (state === SCENE_STATES.HOME) {
          click({ freq: 940, dur: 0.14, gain: 0.09, type: 'triangle' });
          goAbout();
        }
      }}
    >
      {/* Outer thick ring */}
      <mesh>
        <torusGeometry args={[1.15, 0.06, 16, 96]} />
        <meshStandardMaterial
          color="#0d0e1a"
          metalness={0.95}
          roughness={0.28}
          emissive="#ff0055"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Inner shader disc — phosphor matrix */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[1.05, 96]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={phosphorMatrixVertex}
          fragmentShader={phosphorMatrixFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4 Concentric aperture rings — segmented via ringGeometry with theta */}
      {[
        { r0: 0.85, r1: 0.95, color: '#00f0ff', opacity: 0.9 },
        { r0: 0.6, r1: 0.72, color: '#ff0055', opacity: 0.7 },
        { r0: 0.35, r1: 0.5, color: '#8D00FF', opacity: 0.8 },
        { r0: 0.14, r1: 0.24, color: '#00f0ff', opacity: 1.0 },
      ].map((r, i) => (
        <mesh key={i} ref={apertureRefs[i]} position={[0, 0, 0.005 + i * 0.001]}>
          <ringGeometry args={[r.r0, r.r1, 64, 1, 0, Math.PI * 1.85]} />
          <meshBasicMaterial
            color={r.color}
            transparent
            opacity={r.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Central iris core dot */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color="#E0E0FF" />
      </mesh>

      {/* Rim highlight — ambient neon halo */}
      <mesh position={[0, 0, -0.02]}>
        <torusGeometry args={[1.25, 0.02, 8, 96]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
