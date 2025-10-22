"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }: { url: string }) {
  useGLTF.preload(url);
  const { scene } = useGLTF(url);
  return (
    <>
      <primitive object={scene} scale={1} />
      <Environment preset="studio" />
    </>
  );
}

interface ModelViewerProps {
  url: string;
}

export default function ModelViewer({ url }: ModelViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 1, 3], fov: 45 }}
      className="w-full h-[360px] bg-gray-900 rounded-lg"
    >
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        <Model url={url} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
