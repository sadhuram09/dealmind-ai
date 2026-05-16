import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function NeuralCore() {
  const mesh = useRef();
  const wire = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.15;
    mesh.current.rotation.x = Math.sin(t * 0.1) * 0.3;
    wire.current.rotation.y = -t * 0.08;
    wire.current.rotation.z = t * 0.05;
  });

  return (
    <>
      {/* Distorted glowing sphere */}
      <Sphere ref={mesh} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#8B5CF6"
          distort={0.35}
          speed={2.5}
          roughness={0.1}
          metalness={0.8}
          emissive="#4C1D95"
          emissiveIntensity={0.4}
        />
      </Sphere>

      {/* Wireframe outer shell */}
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial color="#3B82F6" wireframe opacity={0.25} transparent />
      </mesh>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.015, 8, 100]} />
        <meshBasicMaterial color="#8B5CF6" opacity={0.4} transparent />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.5, 0.010, 8, 100]} />
        <meshBasicMaterial color="#10B981" opacity={0.25} transparent />
      </mesh>
    </>
  );
}

function OrbitalDots() {
  const group = useRef();
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.25;
  });

  const count = 12;
  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = 2.8;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle * 0.5) * 0.6, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#3B82F6' : '#10B981'}
              emissive={i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#3B82F6' : '#10B981'}
              emissiveIntensity={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function NeuralSphere({ height = 500 }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#8B5CF6" />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#3B82F6" />
        <pointLight position={[0, 5, -5]} intensity={0.6} color="#10B981" />
        <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />
        <NeuralCore />
        <OrbitalDots />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}
