
import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const TradingAnimation: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Create candlestick chart elements
    const createCandlestick = (x: number, height: number, isPositive: boolean) => {
      const color = isPositive ? 0x4ade80 : 0xef4444;
      const material = new THREE.MeshBasicMaterial({ color });
      
      // Body
      const bodyGeometry = new THREE.BoxGeometry(0.6, height, 0.6);
      const body = new THREE.Mesh(bodyGeometry, material);
      body.position.set(x, 0, 0);
      
      // Wick
      const wickGeometry = new THREE.BoxGeometry(0.1, height + 2, 0.1);
      const wick = new THREE.Mesh(wickGeometry, material);
      wick.position.set(x, 0, 0);
      
      const group = new THREE.Group();
      group.add(body);
      group.add(wick);
      
      return group;
    };

    // Create line graph elements
    const createLineGraph = (points: THREE.Vector3[]) => {
      const material = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, material);
    };

    // Create particles
    const createParticles = () => {
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 1000;
      
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * 40;
        positions[i + 1] = (Math.random() - 0.5) * 40;
        positions[i + 2] = (Math.random() - 0.5) * 40;
        
        // Color
        colors[i] = Math.random() * 0.5 + 0.5; // More blue
        colors[i + 1] = Math.random() * 0.3;
        colors[i + 2] = Math.random() * 0.8 + 0.2;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });
      
      return new THREE.Points(particlesGeometry, particlesMaterial);
    };

    // Create floating numbers
    const createFloatingNumber = (x: number, y: number, z: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.fillStyle = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 0.8)`;
        context.font = "40px Arial";
        context.fillText(`$${(Math.random() * 1000).toFixed(2)}`, 10, 50);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(x, y, z);
      sprite.scale.set(3, 1.5, 1);
      
      return sprite;
    };

    // Create 3D objects
    const candlesticks = new THREE.Group();
    for (let i = -10; i < 10; i += 1.5) {
      const height = Math.random() * 3 + 1;
      const isPositive = Math.random() > 0.5;
      const candlestick = createCandlestick(i, height, isPositive);
      candlesticks.add(candlestick);
    }
    scene.add(candlesticks);

    // Create line graph
    const linePoints = [];
    for (let i = -15; i <= 15; i += 0.5) {
      const y = Math.sin(i * 0.5) * 3 + (Math.random() - 0.5) * 2;
      linePoints.push(new THREE.Vector3(i, y + 6, 0));
    }
    const lineGraph = createLineGraph(linePoints);
    scene.add(lineGraph);

    // Create particles
    const particles = createParticles();
    scene.add(particles);

    // Create floating numbers
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 10;
      const number = createFloatingNumber(x, y, z);
      scene.add(number);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Rotate the scene
      candlesticks.rotation.y += 0.002;
      lineGraph.rotation.y += 0.001;
      particles.rotation.y += 0.0005;
      
      // Gentle floating motion
      candlesticks.position.y = Math.sin(Date.now() * 0.001) * 0.5;
      lineGraph.position.y = Math.sin(Date.now() * 0.0012) * 0.3;
      
      // Update particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.01;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      
      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default TradingAnimation;
