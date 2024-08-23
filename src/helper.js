import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { scene, camera, renderer } from './main.js';

const controls = new OrbitControls(camera, renderer.domElement)
scene.add(new THREE.GridHelper(100, 10, 0x00ff00, 0x444444))

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
