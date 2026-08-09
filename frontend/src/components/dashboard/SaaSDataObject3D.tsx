import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const SaaSDataObject3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      // WebGL Availability Check
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }

      // Prefers Reduced Motion Check
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Dimensions
      const width = container.clientWidth || 300;
      const height = container.clientHeight || 260;

      // Scene Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 4.5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 10);
      pointLight1.position.set(2, 2, 2);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x22d3ee, 2, 10);
      pointLight2.position.set(-2, -2, -1);
      scene.add(pointLight2);

      // Group for mouse parallax
      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // Outer Translucent Wireframe Icosahedron
      const outerGeo = new THREE.IcosahedronGeometry(1.2, 1);
      const outerMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      mainGroup.add(outerMesh);

      // Inner Glowing Core Sphere
      const innerGeo = new THREE.SphereGeometry(0.55, 32, 32);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.6,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      mainGroup.add(innerMesh);

      // Orbiting Data Node Points
      const nodesGroup = new THREE.Group();
      mainGroup.add(nodesGroup);

      const nodeGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      const nodePositions = [
        [1.4, 0.3, 0.2],
        [-1.2, -0.6, 0.4],
        [0.2, 1.5, -0.3],
        [-0.4, -1.3, -0.5],
        [0.8, -0.8, 1.1],
      ];

      nodePositions.forEach(([x, y, z]) => {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(x, y, z);
        nodesGroup.add(node);
      });

      // Mouse Parallax Interaction
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        targetX = x * 0.4;
        targetY = y * 0.4;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (!prefersReducedMotion) {
          outerMesh.rotation.y += 0.005;
          outerMesh.rotation.x += 0.003;
          innerMesh.rotation.y -= 0.007;
          nodesGroup.rotation.y += 0.008;
        }

        // Smooth mouse parallax interpolation
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        mainGroup.rotation.y = mouseX;
        mainGroup.rotation.x = mouseY;

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      // Handle Resize
      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (renderer && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // WebGL Fallback CSS Visual
  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B5CF6]/30 to-[#22D3EE]/30 animate-pulse-glow blur-xl" />
          <div className="w-28 h-28 rounded-2xl border border-[#8B5CF6]/40 bg-[#12151C]/80 backdrop-blur-md flex items-center justify-center rotate-45 animate-float-slow shadow-glow-primary">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] blur-sm opacity-80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[220px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      title="Interactive 3D Data Node Scene"
    />
  );
};
