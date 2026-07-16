import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useSceneState, CAMERA_RIGS } from '@/hooks/useSceneState';

gsap.registerPlugin(CustomEase);
CustomEase.create('cyberEase', 'M0,0 C0.25,1 0.2,1 1,1');

// Camera FSM driver — animates position + a lookAt target through GSAP tweens
// each time the scene state changes. Additionally applies a very subtle mouse
// parallax on top of the state camera each frame.
export default function CameraRig() {
  const { camera } = useThree();
  const { state, prefersReducedMotion } = useSceneState();
  const targetRef = useRef(new THREE.Vector3(0, 0.6, 0));
  const basePosRef = useRef(new THREE.Vector3());
  const mouseRef = useRef({ x: 0, y: 0 });

  // Track mouse for parallax
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // On state change — tween camera position + target + fov
  useEffect(() => {
    const rig = CAMERA_RIGS[state];
    if (!rig) return;
    const duration = prefersReducedMotion ? 0 : 1.45;

    // Tween base position (parallax adds on top of it in useFrame)
    gsap.to(basePosRef.current, {
      x: rig.position[0],
      y: rig.position[1],
      z: rig.position[2],
      duration,
      ease: 'cyberEase',
    });
    gsap.to(targetRef.current, {
      x: rig.target[0],
      y: rig.target[1],
      z: rig.target[2],
      duration,
      ease: 'cyberEase',
    });
    gsap.to(camera, {
      fov: rig.fov,
      duration,
      ease: 'cyberEase',
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  }, [state, camera, prefersReducedMotion]);

  // Initialize baseposition from HOME rig
  useEffect(() => {
    const rig = CAMERA_RIGS.HOME;
    basePosRef.current.set(...rig.position);
    targetRef.current.set(...rig.target);
    camera.fov = rig.fov;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    // Apply subtle parallax offset relative to base
    const px = mouseRef.current.x * 0.2;
    const py = -mouseRef.current.y * 0.15;
    camera.position.x = basePosRef.current.x + px;
    camera.position.y = basePosRef.current.y + py;
    camera.position.z = basePosRef.current.z;
    camera.lookAt(targetRef.current);
  });

  return null;
}
