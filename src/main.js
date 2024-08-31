import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import sky from './assets/Sky.jpg';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



// Base ----------------------------------------------------------------
// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
//scene
const scene = new THREE.Scene();
//render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Light ----------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
scene.add(directionalLight);
directionalLight.position.set(-30, 30, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom += -20;
directionalLight.shadow.camera.top += 20;


// Helper----------------------------------------------------------------
// Camera helper
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

// Plane helper
const planeGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

// Gird helper
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

// Foog helper
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

// Background -------------------------------------------------------------
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load(
    [
        sky, sky, sky, sky, sky, sky
    ]
);


// Object ----------------------------------------------------------------
const Sparrow = new THREE.Group();
scene.add(Sparrow);
const SlingShot = new URL('../src/assets/SlingShot.glb', import.meta.url);
const SlingShotLoader = new GLTFLoader();
SlingShotLoader.load(SlingShot.href, function (gltf) {
    const model = gltf.scene;
    Sparrow.add(model);
    model.scale.set(0.3, 0.3, 0.3)
    model.rotation.set(0, -1.5, 0)
});

const Dayy = new URL('../src/assets/Day.glb', import.meta.url);
const DayLoader = new GLTFLoader();
DayLoader.load(Dayy.href, function (gltf) {
    const model = gltf.scene;
    Sparrow.add(model);
    model.scale.set(0.1, 0.2, 0.1)
    model.position.set(0, -0.5, -0.3)
    model.rotation.set(0, 1.5, 0)
});

Sparrow.position.set(5, 0, 0)

const createArrow = () => {
    const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Màu đỏ
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.y = 1;
    return arrow;
};

const arrows = [];
for (let i = 0; i < 10; i++) {
    const arrow = createArrow();
    scene.add(arrow);
    arrows.push(arrow);
    arrow.visible = false;
}
let arrowIndex = 0;
const shootArrow = () => {
    const arrow = arrows[arrowIndex];
    if (arrow) {
        arrow.position.set(Sparrow.position.x, Sparrow.position.y + 7, Sparrow.position.z);
        arrow.visible = true;
        arrowIndex = (arrowIndex + 1) % arrows.length;
    }
};

// Xử lý kéo dây
let isDragging = false; // Kéo?
let dragStart = { x: 0 }; // Bắt đầu
let initialBowX = Sparrow.position.x; // Position before drag of bow
let initialStringX = Sparrow.position.x; // Position before drag of day

window.addEventListener('mousedown', (event) => {
    if (isDragging == false) {
        isDragging = true;
        dragStart = { x: event.clientX }; // get start position
    }
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaX = event.clientX - dragStart.x;
        Sparrow.position.x = initialBowX + deltaX * 0.01;
        Sparrow.position.x = initialStringX + deltaX * 0.01;
    }
});
window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        shootArrow();
        Sparrow.position.x = initialBowX; // reset
        Sparrow.position.x = initialStringX; // reset
    }
});

// Loop ----------------------------------------------------------------
function animate() {

    arrows.forEach((arrow) => {
        if (arrow.visible) {
            arrow.position.x -= 0.1;
            if (arrow.position.x < -10) {
                arrow.visible = false;
            }
        }

    });
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);