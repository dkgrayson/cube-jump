import * as THREE from 'three';

export function calculateDistance(start, end) {
  return [
    new THREE.Vector2(
      start.x,
      start.z
    ).distanceTo(
      new THREE.Vector2(
        end.x,
        end.z
      )
    ),
    Math.abs(start.y - end.y)
  ];
}

export function getTime(timer) {
  return Math.floor(timer / 60).toString().padStart(2, '0'),
    (timer % 60).toString().padStart(2, '0');
}
