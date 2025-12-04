import * as THREE from 'three';
import { ParticleData } from '../types';

// Constants for Tree Shape
const TREE_HEIGHT = 14;
const BASE_RADIUS = 5.5;
const SCATTER_RADIUS = 15;

/**
 * Generates data for instances.
 * Uses a Fibonacci spiral on a cone for the tree shape.
 * Uses random spherical distribution for the scattered shape.
 */
export const generateParticles = (count: number, type: 'cone' | 'sphere'): ParticleData[] => {
  const data: ParticleData[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const t = i / count;

    // --- TREE COORDINATES (Cone Spiral) ---
    // We adjust y so 0 is bottom, 1 is top, then shift to center
    const y = t * TREE_HEIGHT - TREE_HEIGHT / 2;
    
    // Radius gets smaller as we go up
    const radius = (1 - t) * BASE_RADIUS;
    
    // Fibonacci Spiral angle
    const theta = i * goldenAngle;

    // Add some organic randomness (Jitter) to the tree radius
    // This makes the tree look fluffy instead of perfectly geometric
    const rJitter = radius + (Math.random() - 0.5) * 1.5; 
    
    const xTree = Math.cos(theta) * rJitter;
    const zTree = Math.sin(theta) * rJitter;
    
    // --- SCATTER COORDINATES (Sphere Cloud) ---
    // Random point in sphere
    const u = Math.random();
    const v = Math.random();
    const thetaScatter = 2 * Math.PI * u;
    const phiScatter = Math.acos(2 * v - 1);
    const rScatter = Math.cbrt(Math.random()) * SCATTER_RADIUS; // cbrt for uniform volume

    const xScatter = rScatter * Math.sin(phiScatter) * Math.cos(thetaScatter);
    const yScatter = rScatter * Math.sin(phiScatter) * Math.sin(thetaScatter);
    const zScatter = rScatter * Math.cos(phiScatter);

    // --- ROTATION ---
    // Random rotation for natural look
    const rot = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // --- SCALE ---
    // Random scale variation
    const scale = 0.5 + Math.random() * 0.5;

    data.push({
      id: i,
      treePos: new THREE.Vector3(xTree, y, zTree),
      scatterPos: new THREE.Vector3(xScatter, yScatter, zScatter),
      rotation: rot,
      scale: scale,
    });
  }

  return data;
};