import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { PROJECTS, IDLE_SCREEN } from '@/data/data2';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';
import { useAudio } from '@/hooks/useAudio';

// A futuristic cyberdeck that replaces the "laptop" object. The angled screen
// is a CanvasTexture that renders live terminal text — the text updates when
// the user hovers a project in the projects list.
export default function TerminalDeck({ position = [-1.5, 0.5, 0.3] }) {
  const groupRef = useRef();
  const screenRef = useRef();
  const emissiveRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { state, hoveredProjectId, activeProjectId, goProjects } = useSceneState();
  const { click } = useAudio();

  // A canvas texture that we redraw whenever the "screen content" changes.
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 320;
    return c;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }, [canvas]);

  const drawScreen = (lines, accent = '#00f0ff') => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#050612';
    ctx.fillRect(0, 0, w, h);

    // Chromatic vertical bar (right edge)
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(w - 6, 0, 2, h);
    ctx.fillStyle = accent;
    ctx.fillRect(w - 3, 0, 2, h);

    // Header bar
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = accent;
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText('handrian.deck // v3.11', 14, 22);
    ctx.fillStyle = '#707090';
    ctx.fillText('cpu 34%   mem 1.2G   net ●', w - 190, 22);

    // Body lines
    ctx.font = '15px "JetBrains Mono", monospace';
    let y = 68;
    lines.forEach((line, idx) => {
      ctx.fillStyle = idx === 0 ? accent : '#E0E0FF';
      ctx.fillText(line, 18, y);
      y += 24;
    });

    // Cursor caret
    const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
    if (blinkOn) {
      ctx.fillStyle = accent;
      ctx.fillRect(18, y - 12, 10, 16);
    }

    // scanlines
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000';
    for (let sy = 0; sy < h; sy += 3) {
      ctx.fillRect(0, sy, w, 1);
    }
    ctx.globalAlpha = 1;

    texture.needsUpdate = true;
  };

  // Redraw on hover/active/state changes + keep caret blinking
  useEffect(() => {
    const src = hoveredProjectId || activeProjectId;
    const project = PROJECTS.find((p) => p.id === src);
    const lines = project ? project.screen : IDLE_SCREEN;
    const accent = project ? project.accent : '#00f0ff';
    drawScreen(lines, accent);
    const int = setInterval(() => drawScreen(lines, accent), 480);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredProjectId, activeProjectId]);

  // Rotate deck +45deg when entering projects state
  useEffect(() => {
    if (!groupRef.current) return;
    const targetY = state === SCENE_STATES.PROJECTS_LIST || state === SCENE_STATES.PROJECT_DETAIL ? Math.PI / 6 : 0;
    const targetScale = state === SCENE_STATES.PROJECT_DETAIL ? 1.15 : 1.0;
    gsap.to(groupRef.current.rotation, { y: targetY, duration: 1.2, ease: 'power3.inOut' });
    gsap.to(groupRef.current.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 1.2, ease: 'power3.inOut' });
  }, [state]);

  useFrame(({ clock, mouse }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.05;
      // subtle mouse parallax
      groupRef.current.rotation.z = mouse.x * 0.03;
    }
    if (emissiveRef.current) {
      emissiveRef.current.material.emissiveIntensity =
        0.9 + Math.sin(clock.getElapsedTime() * 3.4) * 0.15 + (hovered ? 0.6 : 0);
    }
  });

  // Cursor pointer feedback on hover
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (hovered && state === SCENE_STATES.HOME) {
      document.body.setAttribute('data-scene-hover', 'deck');
    } else {
      // Only clear our own attribute
      if (document.body.getAttribute('data-scene-hover') === 'deck') {
        document.body.removeAttribute('data-scene-hover');
      }
    }
    return () => {
      if (document.body.getAttribute('data-scene-hover') === 'deck') {
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
          click({ freq: 520, dur: 0.11, gain: 0.08 });
          goProjects();
        }
      }}
    >
      {/* Base pedestal */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 0.2, 32]} />
        <meshStandardMaterial color="#0d0e1a" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Deck body (base) */}
      <mesh position={[0, -0.05, 0.1]}>
        <boxGeometry args={[1.35, 0.08, 0.9]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.35} />
      </mesh>

      {/* Modular wires along the sides — small torus */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, -0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.014, 8, 16]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.4}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Keyboard array */}
      <group position={[0, 0.005, 0.28]}>
        {[...Array(4)].map((_, r) =>
          [...Array(9)].map((_, c) => (
            <mesh key={`k-${r}-${c}`} position={[-0.48 + c * 0.12, 0.001, -0.15 + r * 0.09]}>
              <boxGeometry args={[0.09, 0.025, 0.07]} />
              <meshStandardMaterial
                color="#12132a"
                emissive={r === 0 ? '#ff0055' : '#0a1a2a'}
                emissiveIntensity={r === 0 ? 0.7 : 0.25}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Hinge + screen backplate — angled toward camera */}
      <mesh position={[0, 0.44, -0.36]} rotation={[-0.32, 0, 0]}>
        <boxGeometry args={[1.35, 0.94, 0.05]} />
        <meshStandardMaterial color="#0a0b18" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Screen with terminal texture — sits in front of backplate */}
      <mesh ref={screenRef} position={[0, 0.44, -0.33]} rotation={[-0.32, 0, 0]}>
        <planeGeometry args={[1.22, 0.82]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Emissive underglow bar */}
      <mesh ref={emissiveRef} position={[0, -0.1, 0.56]}>
        <boxGeometry args={[1.22, 0.008, 0.02]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
