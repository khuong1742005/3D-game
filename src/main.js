import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { cube, Sphere, plane, gridHelper, ambientLight, geometry, material } from './player.js';

import * as dat from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

//World with physics


// const groundGeo = new THREE.PlaneGeometry


// const groundMesh = new THREE.Mesh(groundGeo, groundMat)


// //ammo ---------------------------------------------------------------------------------------------------------------------------------------
// Ammo().then( function ( AmmoLib ) {

//   Ammo = AmmoLib;

//  animate();

// } );


//Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

// pic or mp4 for scene
//night
const video = document.createElement('video');
video.src = '../src/mp4/night.mp4';
video.loop = true;
video.muted = true; 
video.play();

//sun
const Sunvideo = document.createElement('video');
Sunvideo.src = '../src/mp4/SunSurface.mp4';
Sunvideo.loop = true;
Sunvideo.muted = true; 
Sunvideo.play();



const videoTexture = new THREE.VideoTexture(video);
const SunVideoTexture = new THREE.VideoTexture(Sunvideo);

//scene.background = videoTexture;
//night
const Sungeometry = new THREE.SphereGeometry(100000, 60, 40);
Sungeometry.scale(-1, 1, 1); // Đảo ngược mặt ngoài của hình cầu
const Sunmaterial = new THREE.MeshBasicMaterial({
   map: videoTexture,
 // emissive: new THREE.Color(0xFFFF00), // Màu phát sáng (vàng)
  //emissiveIntensity: 50
   });
const sphere = new THREE.Mesh(Sungeometry, Sunmaterial);
scene.add(sphere);

const light = new THREE.PointLight(0x000000, 10, 700); // Ánh sáng điểm màu vàng
light.position.set(-50, 50, 50);
scene.add(light);


//sun
const SunGeometry = new THREE.SphereGeometry(40);
SunGeometry.scale(-1, 1, 1);
const SunMaterial = new THREE.MeshBasicMaterial({map: SunVideoTexture})
const Sun = new THREE.Mesh(SunGeometry, SunMaterial);
Sun.position.set(-1000, 500, 1000);
scene.add(Sun)

//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);


scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

//add obj and some effect-----------------------------------------------------------------------------------------------------------------------------------------------

scene.add(plane);

//physic--------------------------------------------------------------------------------------------
plane.receiveShadow = true;
const world = new CANNON.World();
world.gravity.set(0, -9.82 , -5)

const groundPhysMat = new CANNON.Material

const groundBody = new CANNON.Body({
  shape: new CANNON.Plane(),
  //shape: new CANNON.Box(new CANNON.Vec3(40,40,0.1)),
  //mass: 10
  type: CANNON.Body.STATIC,
  material: groundPhysMat
});



function PhysicWorld(){
  world.step(timeStep * 4)
  plane.position.copy(groundBody.position);
  plane.quaternion.copy(groundBody.quaternion);

  //  BoxBody.position.copy(cube.position);
  // BoxBody.quaternion.copy(cube.quaternion);

  cube1.position.copy(BoxBody.position);
  cube1.quaternion.copy(BoxBody.quaternion);


  Sphere.position.copy(SphereBody.position);
  Sphere.quaternion.copy(SphereBody.quaternion);

}

world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

const spherePhysMat = new CANNON.Material();

const SphereBody = new CANNON.Body({
  mass: 400,
  shape: new CANNON.Sphere(4),
  position: new CANNON.Vec3(0,280,0),
  material: spherePhysMat
})

const groundSphereContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  spherePhysMat,
  {
  //  friction: 0.04, 
    restitution: 0.9 
  }
);

world.addContactMaterial(groundSphereContactMat)

world.addBody(SphereBody);

SphereBody.linearDamping = 0.21

const BoxBody = new CANNON.Body({
  mass: 10,
  shape : new CANNON.Box(new CANNON.Vec3(50, 50, 50)),
  position: new CANNON.Vec3(0, 50, -140),
  friction: 0.4
})



world.addBody(BoxBody);

const timeStep = 1 / 60;
//----------------------------------------------------------------------------------

function breakCube1() {
  // Loại bỏ cube1 khỏi cảnh và thế giới vật lý
  scene.remove(cube1);
  world.removeBody(BoxBody);

  // Số lượng mảnh vỡ
  const fragmentCount = 10;

  // Kích thước của mỗi mảnh
  const fragmentSize = cube1.scale.x / fragmentCount;

  for (let i = 0; i < fragmentCount; i++) {
    for (let j = 0; j < fragmentCount; j++) {
      for (let k = 0; k < fragmentCount; k++) {
        // Tạo hình học và vật liệu cho từng mảnh vỡ
        const fragmentGeometry = new THREE.BoxGeometry(fragmentSize, fragmentSize, fragmentSize);
        const fragmentMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
        
        // Vị trí của từng mảnh vỡ
        fragment.position.set(
          cube1.position.x + (i - fragmentCount / 2) * fragmentSize,
          cube1.position.y + (j - fragmentCount / 2) * fragmentSize,
          cube1.position.z + (k - fragmentCount / 2) * fragmentSize
        );
        
        // Thêm mảnh vỡ vào cảnh
        scene.add(fragment);

        // Tạo body cho mỗi mảnh vỡ
        const fragmentBody = new CANNON.Body({
          mass: 1,  // Đặt khối lượng cho mỗi mảnh nhỏ
          shape: new CANNON.Box(new CANNON.Vec3(fragmentSize / 2, fragmentSize / 2, fragmentSize / 2)),
          position: new CANNON.Vec3(
            fragment.position.x,
            fragment.position.y,
            fragment.position.z
          )
        });
        
        // Đẩy các mảnh vỡ ra khỏi vị trí ban đầu
        const force = new CANNON.Vec3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        );
        fragmentBody.applyImpulse(force, fragmentBody.position);
        
        // Thêm các mảnh vỡ vào thế giới vật lý
        world.addBody(fragmentBody);
      }
    }
  }
}

// world.addEventListener('postStep', function() {
//   // Kiểm tra va chạm giữa cube1 và các vật thể khác
//   if (/* logic kiểm tra va chạm giữa BoxBody và vật thể khác */) {
//     breakCube1();
//   }
// });
//------------------------------------------------------------------------------------------
scene.add(Sphere);
Sphere.castShadow = true;
Sphere.receiveShadow = true;


scene.add(cube);
cube.castShadow = true;
cube.receiveShadow = true;

const cube1 = new THREE.Mesh(geometry, material)
scene.add(cube1)
//cube1.position.set(0, 20, 20);
cube1.scale.set(10, 10, 10)
cube1.castShadow = true;
cube1.receiveShadow = true;

scene.add(ambientLight);
const assetLoader = new GLTFLoader();

const SlingShot = new URL('../src/3D object/nhap.glb', import.meta.url) ;
assetLoader.load(SlingShot.href, function(gltf){
  const model = gltf.scene;
  scene.add(model);
  model.castShadow = true
  model.scale.set(2,2,2)
  model.position.set(0,0,20)
  
  model.traverse(function(child) {
    if (child.isMesh) {
      child.castShadow = true;  
      child.receiveShadow = true;
    }
  });

}, undefined, function(error) {
  console.error(error)
})




//breakCube1();



//directional light
const directionalLight = new THREE.DirectionalLight(0xfcfcfc, 1.5);
scene.add(directionalLight)

directionalLight.position.set(-200,200,200)
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -200
directionalLight.shadow.camera.top = 200
directionalLight.shadow.camera.left = -200
directionalLight.shadow.camera.right = 200
directionalLight.intensity = 0.6
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;


//directionalLight.target.add(0,-10,0)
//directionalLight.target(0,1000,-10);
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.8);
// scene.add(dLightHelper);

// const dLightShadowHepler = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHepler);

//spot light
// const spotLight = new THREE.SpotLight(0xffffff);
// scene.add(spotLight);
// spotLight.position.set(-1500, 500, 1500);

// spotLight.angle = 0.99; // Góc hẹp hơn để tập trung ánh sáng
// spotLight.intensity = 2000; // Cường độ sáng hợp lý
// spotLight.penumbra = 0.2; // Làm mềm cạnh bóng một chút
// spotLight.decay = 0.7; // Giảm cường độ ánh sáng theo khoảng cách thực tế hơn
// spotLight.castShadow = true;

// spotLight.shadow.mapSize.width = 8048; // Tăng độ phân giải bản đồ bóng
// spotLight.shadow.mapSize.height = 8048;

// spotLight.shadow.camera.near = 200; // Điều chỉnh cho phù hợp với vị trí đèn
// spotLight.shadow.camera.far = 4600; // Đảm bảo vùng chiếu bóng đủ rộng
// spotLight.shadow.camera.left = -500;
// spotLight.shadow.camera.right = 500;
// spotLight.shadow.camera.top = 500;
// spotLight.shadow.camera.bottom = -500;
//  //spotLight.shadow.bias = -0.001;
//  //spotLight.distance = 400
// const sLighthelper = new THREE.SpotLightHelper(spotLight)
// scene.add(sLighthelper)


//option for gui-----------------------------------------------------------
 const option = {
    sphereColor: '#ff0404',
    wireframe: false,
    speed: 0.144,

  };
    let step = 0;
   




// Điều chỉnh các thuộc tính của OrbitControls để đạt được hiệu ứng mong muốn
//controls.enableDamping = true; // Cho phép làm mượt chuyển động // góc nhìn kịch tính
controls.dampingFactor = 0.05; // Điều chỉnh độ mượt
controls.enableZoom = true; // Cho phép phóng to/thu nhỏ
controls.minDistance = 0; // Khoảng cách tối thiểu khi zoom
controls.maxDistance = 180; // Khoảng cách tối đa khi zoom
controls.maxPolarAngle = Math.PI * 2; // Giới hạn góc nhìn xuống dưới

//control keys
const keysPressed = {}
const KeyDisplayQueue = {
  down(key) {},
  up(key) {}
}


let originalPosition = cube.position.clone(); 


const canvas = renderer.domElement;



// pointer lock---------------------------------------------------------------------------------------------------------------------------------------------
// Hàm yêu cầu pointer lock
function requestPointerLock() {
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
  canvas.requestPointerLock();
}

// Hàm thoát khỏi pointer lock
function exitPointerLock() {
  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
  document.exitPointerLock();
}

// Xử lý sự kiện khi pointer lock được yêu cầu
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    console.log('Pointer lock is enabled');
  } else {
    console.log('Pointer lock is disabled');
  }
});

// Xử lý sự kiện khi nhấn nút chuột phải hoặc một phím để yêu cầu pointer lock
document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') { // Nút chuột trái
    requestPointerLock();
  }
}, false);

// Xử lý sự kiện để thoát pointer lock khi nhấn phím Escape
document.addEventListener('keydown', (event) => {
  if (event.key === 'Esc') {
    exitPointerLock();
  }
}, false);

document.addEventListener('keydown', (event) => {
  KeyDisplayQueue.down(event.key);
  if (!event.shiftKey)  keysPressed[event.key.toLowerCase()] = true;
}, false);


document.addEventListener('keyup', (event) => {
  KeyDisplayQueue.up(event.key);
  keysPressed[event.key.toLowerCase()] = false;
}, false);
//---------------------------------------------------------------------------------------------------------------

const jumpHeight = 30; // Chiều cao nhảy
const jumpDuration = 500; // Thời gian nhảy (0.5 giây)
let jumpStartTime = null;
let isJumping = false;
let velocity = 0;
const gravity = 0.98;


// jump-----------------
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping) {
    isJumping = true;
    jumpStartTime = performance.now();
    velocity = Math.sqrt(2 * gravity * jumpHeight);
  }
});



let movein = 2;

function animate() {

  PhysicWorld();
  
  directionalLight.target.position.copy(cube.position);
  directionalLight.position.set(cube.position.x, cube.position.y+70, cube.position.z+70)
  scene.add(directionalLight.target);

  
  requestAnimationFrame(animate);

 
  movein += 2;
      
  controls.target.copy(cube.position);
  controls.update();

  renderer.render(scene, camera);
  const distance = cube.position.distanceTo(camera.position);

  //physics-------------------------------------------------------------
 




  // góc quay Euler không bị giới hạn bởi biên độ
  const cameraQuaternion = new THREE.Quaternion().setFromEuler(camera.rotation);
  
  // Lấy góc quay y từ quaternion của camera

  const cameraEuler = new THREE.Euler().setFromQuaternion(cameraQuaternion, 'YXZ');
  if (document.pointerLockElement === canvas) cube.rotation.y = cameraEuler.y;


  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const moveDistance = 2.5;

  const moveVector = new THREE.Vector3(direction.x, 0, direction.z).normalize();



 //movement----------------------------------------------------- 
  function lerpRotation(current, target, alpha) {
    let delta = target - current;
    delta = (delta + Math.PI) % (2 * Math.PI) - Math.PI;
    let result = current + delta * alpha;
    return (result + Math.PI) % (2 * Math.PI) - Math.PI;
}

if (keysPressed['w']) {
    cube.position.add(moveVector.multiplyScalar(moveDistance));
    camera.position.add(moveVector.multiplyScalar(moveDistance / 2.5));
    if (document.pointerLockElement !== canvas)
    cube.rotation.y = lerpRotation(cube.rotation.y, cameraEuler.y, 0.15);
}

if (keysPressed['s']) {
    cube.position.add(moveVector.multiplyScalar(-moveDistance));
    camera.position.add(moveVector.multiplyScalar(moveDistance / 2.5));
    if (document.pointerLockElement !== canvas)
    cube.rotation.y = lerpRotation(cube.rotation.y, cameraEuler.y + Math.PI, 0.15);
}

if (keysPressed['a']) {
    const left = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
    cube.position.add(left.multiplyScalar(moveDistance));
    camera.position.add(left.multiplyScalar(moveDistance / 2.5));
    if (document.pointerLockElement !== canvas)
    cube.rotation.y = lerpRotation(cube.rotation.y, cameraEuler.y + Math.PI / 2, 0.15);
}

if (keysPressed['d']) {
    const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
    cube.position.add(right.multiplyScalar(moveDistance));
    camera.position.add(right.multiplyScalar(moveDistance / 2.5));
    if (document.pointerLockElement !== canvas)
    cube.rotation.y = lerpRotation(cube.rotation.y, cameraEuler.y - Math.PI / 2, 0.15);
}



// jump---------------------------------------------------

const initialCameraDistance = new THREE.Vector3().copy(camera.position).sub(cube.position);


if (isJumping) {
  const elapsedTime = performance.now() - jumpStartTime;
  const time = elapsedTime / 50; // Điều chỉnh tốc độ nhảy nếu cần
  const jumpProgress = velocity * time - 0.5 * gravity * time * time;

  // Cập nhật vị trí của cube
  cube.position.y = originalPosition.y + jumpProgress;

  // Cập nhật vị trí của camera theo khoảng cách cố định
  const targetCameraPosition = new THREE.Vector3().copy(initialCameraDistance);
  camera.position.copy(cube.position).add(targetCameraPosition)
  if (jumpProgress <= 0) {
    isJumping = false;
  }

} 



  // Cập nhật vị trí Sphere (chỉ để ví dụ)
  // step += option.speed;
  // Sphere.position.y = 20 * Math.abs(Math.sin(step));
  // Sphere.position.x = 20 * (Math.cos(step));


 
}

// Đặt vị trí ban đầu của camera
camera.position.set(-120, 120, 120);

// loop
animate();


//Sentivity của góc nhìn thứ 3

let yaw = 0; // Góc quay theo trục Y (trái/phải)
let pitch = 0; // Góc quay theo trục X (lên/xuống)
const yawSpeed = 0.005; // Tốc độ quay theo trục Y
const pitchSpeed = 0.005; // Tốc độ quay theo trục X
//const radius = 50;

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === canvas) {
    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;

    // Cập nhật góc quay của camera
    yaw -= movementX * yawSpeed; // Di chuyển trái/phải
    pitch -= movementY * pitchSpeed; // Di chuyển lên/xuống

    // Giới hạn góc nhìn lên/xuống để tránh lật ngược camera
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    const length = Math.sqrt(Math.pow(cube.position.x - camera.position.x , 2) + Math.pow(cube.position.y - camera.position.y , 2) + Math.pow(cube.position.z - camera.position.z , 2))

    // Tính toán vị trí mới của camera
    const x =  cube.position.x + length * Math.cos(pitch) * Math.sin(yaw);
    const y = cube.position.y - length * Math.sin(pitch);
    const z = cube.position.z + length * Math.cos(pitch) * Math.cos(yaw);

    camera.position.set(x, y, z);


  }
}, false);





// Hàm cập nhật khi cửa sổ thay đổi kích thước
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});






// gui
const gui = new dat.GUI()



gui.addColor(option, 'sphereColor').onChange(function(e){
  Sphere.material.color.set(e)
});

gui.add(option, 'wireframe').onChange(function(e){
Sphere.material.wireframe = e;
});

gui.add(option, 'wireframe').onChange(function(e){
  Sphere.material.wireframe = e;
  });

gui.add(option, 'speed', 0, 5);



//export
export { camera, renderer, scene, animate, };

//remđerer
renderer.render(scene, camera);