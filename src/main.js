// Import file
import * as THREE from 'three';

//Scene
const scene = new THREE.Scene()

//Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(30, 20, 30)
camera.lookAt(0, 0, 0)

// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Loop
function animate() {
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate();

// Import
export { camera, renderer, scene, animate }
