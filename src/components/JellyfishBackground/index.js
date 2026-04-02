import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './JellyfishBackground.scss';

function createJellyfish(scene, config) {
  const group = new THREE.Group();

  // Bell (dome)
  const bellGeo = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const bellMat = new THREE.MeshPhysicalMaterial({
    color: 0xdde8f5,
    transparent: true,
    opacity: 0.15,
    roughness: 0,
    transmission: 0.92,
    thickness: 0.4,
    side: THREE.DoubleSide,
  });
  const bell = new THREE.Mesh(bellGeo, bellMat);
  group.add(bell);

  // Inner glow layer
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8daf5,
    transparent: true,
    opacity: 0.1,
    emissive: 0x99bbee,
    emissiveIntensity: 0.12,
    side: THREE.BackSide,
  });
  group.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.88, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      innerMat
    )
  );

  // Oral arms
  const armMat = new THREE.MeshPhysicalMaterial({
    color: 0xc0d4ee,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.015, 0.7, 5),
      armMat
    );
    const a = (i / 4) * Math.PI * 2;
    arm.position.set(Math.cos(a) * 0.28, -0.5, Math.sin(a) * 0.28);
    group.add(arm);
  }

  // Tentacles
  const tentacles = [];
  const tenMat = new THREE.MeshPhysicalMaterial({
    color: 0xaac8e8,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 12; i++) {
    const len = 1.6 + Math.random() * 1.8;
    const ten = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.003, len, 4),
      tenMat
    );
    const a = (i / 12) * Math.PI * 2;
    ten.position.set(Math.cos(a) * 0.88, -len / 2 - 0.08, Math.sin(a) * 0.88);
    group.add(ten);
    tentacles.push(ten);
  }

  group.position.copy(config.origin);
  group.scale.setScalar(config.scale);
  scene.add(group);

  return { group, bell, tentacles, ...config };
}

export default function JellyfishBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xd0e4ff, 1.0);
    dir.position.set(3, 5, 5);
    scene.add(dir);

    const jellies = [
      createJellyfish(scene, {
        origin: new THREE.Vector3(-3, 1, 0),
        scale: 1.4,
        speed: 0.22,
        pulseSpeed: 1.8,
        offset: 0,
      }),
      createJellyfish(scene, {
        origin: new THREE.Vector3(3.2, -0.5, -2),
        scale: 0.9,
        speed: 0.17,
        pulseSpeed: 2.2,
        offset: 2.1,
      }),
      createJellyfish(scene, {
        origin: new THREE.Vector3(0.5, 2.2, -1),
        scale: 0.55,
        speed: 0.3,
        pulseSpeed: 2.5,
        offset: 4.3,
      }),
    ];

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let raf;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      jellies.forEach((j, i) => {
        j.group.position.x =
          j.origin.x + Math.sin(t * j.speed + j.offset) * 1.8;
        j.group.position.y =
          j.origin.y + Math.sin(t * j.speed * 0.6 + j.offset) * 0.9;
        j.group.rotation.y = Math.sin(t * 0.25 + i) * 0.12;

        const pulse = 1 + Math.sin(t * j.pulseSpeed + j.offset) * 0.055;
        j.bell.scale.set(pulse, 1 - (pulse - 1) * 0.4, pulse);

        j.tentacles.forEach((ten, ti) => {
          ten.rotation.z =
            Math.sin(t * 1.1 + ti * 0.9 + j.offset) * 0.1;
        });
      });

      // Soft parallax
      camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.25 - camera.position.y) * 0.025;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="jellyfish-bg" />;
}
