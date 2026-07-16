import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Stage from './Stage';
import TerminalDeck from './TerminalDeck';
import FuelVessel from './FuelVessel';
import IrisGate from './IrisGate';
import ParticleField from './ParticleField';
import CameraRig from './CameraRig';
import CursorLight from './CursorLight';

// The fixed-viewport R3F canvas that hosts the entire 3D scene. Layered
// beneath the DOM overlay (z-0) with pointer-events routed to the canvas
// except when hovering interactive overlay elements.
export default function SceneCanvas() {
  return (
    <div
      className="fixed inset-0 z-0"
      style={{ background: '#030308' }}
      data-testid="scene-canvas"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 2.5, 7.5], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#030308', 1);
          scene.fog = new THREE.FogExp2('#030308', 0.05);
        }}
      >
        <ambientLight intensity={0.12} color="#0a0b10" />
        <directionalLight
          position={[-4, 5, -3]}
          intensity={1.6}
          color="#ff0055"
        />
        <directionalLight
          position={[6, 3, 4]}
          intensity={0.35}
          color="#00f0ff"
        />
        <hemisphereLight args={['#0a0b18', '#000006', 0.2]} />

        <CursorLight />

        <Suspense fallback={null}>
          <Stage position={[0, 0, 0]} radius={3.6} />
          <TerminalDeck position={[-1.75, 0.35, 0.55]} />
          <FuelVessel position={[0.1, 0.5, 1.15]} />
          <IrisGate position={[1.85, 1.1, -0.4]} />
          <ParticleField />
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
}
