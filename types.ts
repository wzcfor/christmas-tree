import * as THREE from 'three';

export interface ParticleData {
  id: number;
  treePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color?: THREE.Color;
}

export enum ParticleType {
  NEEDLE = 'NEEDLE',
  ORNAMENT = 'ORNAMENT',
  STAR = 'STAR'
}