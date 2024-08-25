// Import file
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {cube , Sphere, plane, gridHelper} from './player';

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



//Scene
const scene = new THREE.Scene();


//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);





// // Thêm axesHelper vào scene
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper)






scene.add(gridHelper);






const controls = new OrbitControls(camera, renderer.domElement);


//cube
scene.add(cube)



// Loop
function animate() {
    requestAnimationFrame(animate);

    // Cập nhật controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);

   cube.rotation.x += 0.21
   cube.rotation.y += 0.21
   cube.rotation.z += 0.21

   //camera.lookAt(cube.position)
  
}
animate();







// Hàm cập nhật khi cửa sổ thay đổi kích thước
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hàm animate và render

camera.lookAt(0, 1, 5);
camera.position.set(30, 20, 30);











//-----------------------------------------------------------------------------------------------------------------------------------------------

scene.add(plane);






scene.add(Sphere);



export { camera, renderer, scene, animate };

//remđerer
renderer.render(scene, camera)