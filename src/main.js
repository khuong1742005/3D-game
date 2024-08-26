// Import file
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cube, Sphere, plane, gridHelper, ambientLight } from "./player";
import * as dat from "dat.gui";
import { Sequence } from "three/examples/jsm/libs/tween.module.js";
import night from './mp4/night.mp4'
import sun from './mp4/SunSurface.mp4'

//Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

// pic or mp4 for scene
//night
const video = document.createElement('video');
video.src = night;
video.loop = true;
video.muted = true; 
video.play();

//sun
const Sunvideo = document.createElement('video');
Sunvideo.src = sun;
Sunvideo.loop = true;
Sunvideo.muted = true; 
Sunvideo.play();



const videoTexture = new THREE.VideoTexture(video);
const SunVideoTexture = new THREE.VideoTexture(Sunvideo);

//scene.background = videoTexture;
//night
const geometry = new THREE.SphereGeometry(100000, 60, 40);
geometry.scale(-1, 1, 1); // Đảo ngược mặt ngoài của hình cầu
const material = new THREE.MeshBasicMaterial({
   map: videoTexture,
  emissive: new THREE.Color(0xFFFF00), // Màu phát sáng (vàng)
  emissiveIntensity: 50
   });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
const light = new THREE.PointLight(0xFFFF00, 100, 10000); // Ánh sáng điểm màu vàng
light.position.set(-50, 50, 50);
scene.add(light);


//sun
const SunGeometry = new THREE.SphereGeometry(30);
SunGeometry.scale(-1, 1, 1);
const SunMaterial = new THREE.MeshBasicMaterial({map: SunVideoTexture})
const Sun = new THREE.Mesh(SunGeometry, SunMaterial);
Sun.position.set(-100,100,100);
scene.add(Sun)

//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);

// // Thêm axesHelper vào scene
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper)

scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

//add obj and some effect-----------------------------------------------------------------------------------------------------------------------------------------------

scene.add(plane);
plane.receiveShadow = true;

scene.add(Sphere);
Sphere.castShadow = true;



scene.add(cube);
cube.castShadow = true;

scene.add(ambientLight);

//directional light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
scene.add(directionalLight)
directionalLight.position.set(-30,20,30)
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -14
directionalLight.shadow.camera.top = 24
directionalLight.shadow.camera.left = -14
directionalLight.shadow.camera.right = 34

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.8);
scene.add(dLightHelper);

const dLightShadowHepler = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHepler);

//spot light
const spotLight = new THREE.SpotLight(0xFFFFFF, 100, 10000, 1000, 0,1)
scene.add(spotLight)
spotLight.position.set(-100,100,100)
spotLight.castShadow = true;

const spotLighthelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLighthelper)
//option for gui-----------------------------------------------------------
  const option = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.03,

    angle: 1000,
    penumbra: 0.3,
    intensity: 100,
  };
    let step = 0;
   

// Loop


// Điều chỉnh các thuộc tính của OrbitControls để đạt được hiệu ứng mong muốn
controls.enableDamping = true; // Cho phép làm mượt chuyển động
controls.dampingFactor = 0.05; // Điều chỉnh độ mượt
controls.enableZoom = true; // Cho phép phóng to/thu nhỏ
controls.minDistance = 40; // Khoảng cách tối thiểu khi zoom
controls.maxDistance = 40; // Khoảng cách tối đa khi zoom
controls.maxPolarAngle = Math.PI / 2; // Giới hạn góc nhìn xuống dưới

function animate() {

  
  requestAnimationFrame(animate);
  controls.target.copy(cube.position);
  // Cập nhật controls (giúp camera phản ứng với sự di chuyển của chuột)
  controls.update();

  // Render scene
  renderer.render(scene, camera);
  const distance = camera.position.distanceTo(cube.position);
  console.log('Khoảng cách từ camera đến cube:', distance);
  // Xoay cube
  cube.rotation.x += 0.03;
  cube.rotation.y += 0.03;
  cube.rotation.z += 0.03;

  // Cập nhật vị trí Sphere
  step += option.speed;
  Sphere.position.y = 20 * Math.abs(Math.sin(step));
  Sphere.position.x = 20 * (Math.cos(step));

  // Cập nhật các thuộc tính spotLight
  spotLight.angle = option.angle;
  spotLight.penumbra = option.penumbra;
  spotLight.intensity = option.intensity;
  spotLighthelper.update();
}

// Đặt vị trí ban đầu của camera
camera.position.set(-60, 60, 60);

// Bắt đầu animation loop
animate();

// Hàm cập nhật khi cửa sổ thay đổi kích thước
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hàm camera




// gui
const gui = new dat.GUI()



gui.addColor(option, 'sphereColor').onChange(function(e){
  Sphere.material.color.set(e)
});

gui.add(option, 'wireframe').onChange(function(e){
Sphere.material.wireframe = e;
});

gui.add(option, 'speed', 0, 5);

gui.add(option, 'angle', 0, 3.14);
gui.add(option, 'penumbra', 0, 0.1);
gui.add(option, 'intensity', 0, 2000);

//export
export { camera, renderer, scene, animate };

//remđerer
renderer.render(scene, camera);

