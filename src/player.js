import * as THREE from 'three';
import { scene, camera, renderer } from './main.js';


const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
cube.position.set(0, 10, 0)

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            cube.position.y += 0.1;
            break;
        case 'ArrowDown':
            cube.position.y -= 0.1;
            break;
        case 'ArrowLeft':
            cube.position.x -= 0.1;
            break;
        case 'ArrowRight':
            cube.position.x += 0.1;
            break;
    }
});

scene.add(cube)
export { cube }