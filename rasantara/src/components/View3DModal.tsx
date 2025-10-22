"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface View3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  foodName: string;
}

export default function View3DModal({
  isOpen,
  onClose,
  modelUrl,
  foodName,
}: View3DModalProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    // Validate model URL
    if (!modelUrl || modelUrl.trim() === "") {
      setError("Model URL is empty or invalid");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log("Attempting to load model:", modelUrl);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Enable transparency
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;

    // Load model
    const loader = new GLTFLoader();
    
    // Use proxy for external URLs to avoid CORS issues
    const proxyUrl = modelUrl.startsWith('http') 
      ? `/api/proxy-model?url=${encodeURIComponent(modelUrl)}`
      : modelUrl;
    
    console.log("Loading model from:", proxyUrl);
    
    loader.load(
      proxyUrl,
      (gltf) => {
        const model = gltf.scene;

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;
        model.scale.multiplyScalar(scale);

        model.position.sub(center.multiplyScalar(scale));

        scene.add(model);
        setLoading(false);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log("Loading progress:", percent.toFixed(2) + "%");
        }
      },
      (error) => {
        console.error("Error loading model:", error);
        setError("Failed to load 3D model. Please check if the URL is valid.");
        setLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      // Cleanup renderer
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.warn("Renderer already removed");
        }
      }
      
      // Dispose resources
      renderer.dispose();
      controls.dispose();
      
      // Clear scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
      scene.clear();
    };
  }, [isOpen, modelUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-5xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7C3E2A] to-[#5C2E1A] px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{foodName}</h2>
            <p className="text-sm text-gray-200 mt-1">3D Model Preview</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 3D Viewer */}
        <div className="relative w-full h-[calc(100%-80px)] bg-gradient-to-br from-gray-50 to-gray-100">
          <div ref={mountRef} className="w-full h-full" />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#7C3E2A] mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold">Loading 3D Model...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="text-center max-w-lg px-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-600 font-bold text-lg mb-2">Failed to load 3D model</p>
                <p className="text-gray-600 text-sm mb-3">{error}</p>
                
                <div className="bg-gray-100 rounded-lg p-3 mb-4 text-left">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Model URL:</p>
                  <p className="text-xs font-mono text-gray-800 break-all">{modelUrl}</p>
                </div>

                {modelUrl.includes('example.com') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      ⚠️ This appears to be a demo/example URL. Please upload a real 3D model file (.glb) to view it here.
                    </p>
                  </div>
                )}
                
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-[#7C3E2A] text-white rounded-lg hover:bg-[#5C2E1A] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Controls Info */}
          {!loading && !error && (
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
              <p className="text-xs text-gray-600 font-semibold mb-2">Controls:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>🖱️ Left click + drag to rotate</li>
                <li>🖱️ Right click + drag to pan</li>
                <li>🖱️ Scroll to zoom</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
