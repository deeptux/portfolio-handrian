import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Cyan point light that tracks the mouse cursor. We project the 2D mouse
// coordinates onto a plane parallel to the camera to determine a 3D location.
export default function CursorLight() {
  const lightRef = useRef();
  const targetPos = useRef(new THREE.Vector3(0, 1.5, 2));
  const { camera } = useThree();

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      // project onto a plane z = 1 (world)
      const vec = new THREE.Vector3(nx, ny, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const distance = (1.4 - camera.position.z) / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      targetPos.current.copy(pos);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [camera]);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.lerp(targetPos.current, 0.12);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      color="#00f0ff"
      intensity={3.2}
      distance={6}
      decay={2}
      position={[0, 1.5, 2]}
    />
  );
}
