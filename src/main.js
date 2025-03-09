import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';



const clock = new THREE.Clock();

// Tạo scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Màu trắng


// Tạo camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-0.024520517567958474, 0.6795618807394173, 4.070773647272994);

// Tạo renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid helper
// const size = 10;
// const divisions = 10;
// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

// Light
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Màu trắng, cường độ 0.5
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(5, 10, 5);
// scene.add(directionalLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
// dirLight.position.set(- 3, 10, - 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

// const pointLight = new THREE.PointLight(0xffffff, 1, 50); // Màu trắng, cường độ 1, phạm vi 50
// pointLight.position.set(0, 5, 0);
// scene.add(pointLight);



// Camera helper
// const helper = new THREE.CameraHelper(camera);
// scene.add(helper);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Road
const roads = []; // Mảng chứa các đoạn đường
const roadCount = 1000; // Số lượng đoạn đường

const loader = new GLTFLoader();
loader.load('./src/assets/road.glb', function (gltf) {
    for (let i = 0; i < roadCount; i++) {
        const road = gltf.scene.clone(); // Nhân bản model
        road.position.set(0, 0, -i * 2); // Xếp theo trục Z (cách nhau 10 đơn vị)
        scene.add(road);
        roads.push(road);
    }
}, undefined, function (error) {
    console.error("❌ Lỗi khi tải model:", error);
});

// Soldier
let soldierModel;
let mixer, runAction;
let moveLeft = false, moveRight = false;
const moveSpeed = 0.005;
loader.load('./src/assets/Soldier.glb', function (gltf) {

    soldierModel = gltf.scene;
    soldierModel.position.set(0, 0.1, 3);
    soldierModel.scale.set(0.14, 0.13, 0.13);
    scene.add(soldierModel);

    soldierModel.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
    });

    const animations = gltf.animations;

    mixer = new THREE.AnimationMixer(soldierModel);

    runAction = mixer.clipAction(animations[1]);  // Run

    runAction.play();

    startShooting();
});


// Obstacle
const obstacleModel = [];
const obstacleCount = 10;
loader.load('./src/assets/chai.glb', function (gltf) {
    for (let i = 0; i < obstacleCount; i++) {
        const obstacle = gltf.scene.clone();
        const randomX = Math.random() < 0.5
            ? 0.3
            : -0.3

        obstacle.position.set(randomX, 0.2, -i * 2);
        obstacle.scale.set(0.1, 0.1, 0.07);
        obstacle.rotation.y = Math.PI / 2;
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff4169e1,
            transparent: true,
            opacity: 0.5,
            emissive: 0xff4169e1, // Màu phát sáng (trắng)
            emissiveIntensity: 1.5,
            transmission: 0.9, // Độ xuyên thấu (hiệu ứng kính)
            metalness: 0.2, // Một chút kim loại để phản chiếu
        });
        obstacle.traverse((child) => {
            if (child.isMesh) {
                child.material = glassMaterial;
            }
        });
        scene.add(obstacle);
        obstacleModel.push(obstacle);
    }
});

const numberPoint = [];
const fontLoader = new FontLoader();
let loadedFont;
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    loadedFont = font;
    obstacleModel.forEach((o, i) => {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const textGeometry = new TextGeometry(`${randomNumber}`, {
            font: font,
            size: 0.1,
            height: 0.01,
        });

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textMesh.position.set(o.position.x - 0.03, o.position.y - 0.07, o.position.z);
        textMesh.userData.textValue = randomNumber;
        scene.add(textMesh);
        numberPoint.push(textMesh);
    });
});

// Event
let isMoving = true;
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isMoving = !isMoving; // Đảo trạng thái
    }
});

document.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") moveLeft = true;
    if (event.code === "ArrowRight") moveRight = true;
});

document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") moveLeft = false;
    if (event.code === "ArrowRight") moveRight = false;
});

// Bullets
const bullets = []; // Mảng chứa các viên đạn

function shootBullet() {
    if (!soldierModel) return;

    // Tạo viên đạn (hình cầu nhỏ)
    const bulletGeometry = new THREE.SphereGeometry(0.1, 1, 1);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    // Lấy vị trí hiện tại của soldier
    bullet.position.set(soldierModel.position.x, soldierModel.position.y + 0.1, soldierModel.position.z - 0.02);

    // Xác định hướng bắn (hướng nhìn của soldier)
    const direction = new THREE.Vector3();
    soldierModel.getWorldDirection(direction); // Lấy hướng từ model
    direction.negate();

    bullets.push({ mesh: bullet, direction: direction });
    scene.add(bullet);
}

function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];

        // Cập nhật vị trí viên đạn
        bullet.mesh.position.add(bullet.direction.clone().multiplyScalar(0.2));

        // Xóa viên đạn nếu bay quá xa
        if (bullet.mesh.position.z < -10) {
            scene.remove(bullet.mesh);
            bullets.splice(i, 1);
            i--;
        }
    }
}
function startShooting() {
    setInterval(() => {
        if (soldierModel) { // Kiểm tra xem model đã có chưa
            shootBullet();
        }
    }, 100); // Bắn mỗi 100ms (0.1 giây)
}

function checkCollision() {
    if (!obstacleModel || !soldierModel || !bullets) return;

    for (let i = obstacleModel.length - 1; i >= 0; i--) {
        const o = obstacleModel[i];
        const obstacleBox = new THREE.Box3().setFromObject(o);
        const soldierBox = new THREE.Box3().setFromObject(soldierModel);
        obstacleBox.expandByScalar(-0.06); // Giảm kích thước box 20%
        soldierBox.expandByScalar(-0.03);

        // Kiểm tra va chạm với từng viên đạn
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bulletBox = new THREE.Box3().setFromObject(bullets[j].mesh);
            bulletBox.expandByScalar(0.03);

            if (bulletBox.intersectsBox(obstacleBox)) {
                numberPoint[i].userData.textValue--;
                if (numberPoint[i]) { // Kiểm tra trước khi xóa
                    console.log(numberPoint[i].userData.textValue);
                    scene.remove(bullets[j].mesh);
                    bullets.splice(j, 1); // Xóa viên đạn khỏi mảng

                    scene.remove(numberPoint[i]); // Xóa số cũ
                    const newTextGeometry = new TextGeometry(`${numberPoint[i].userData.textValue}`, {
                        font: loadedFont,
                        size: 0.1,
                        height: 0.01,
                    });
                    numberPoint[i].geometry = newTextGeometry; // Gán lại geometry mới
                    scene.add(numberPoint[i]);

                    if (numberPoint[i].userData.textValue == 0) {
                        scene.remove(o);
                        obstacleModel.splice(i, 1); // Xóa chướng ngại vật khỏi mảng
                        scene.remove(numberPoint[i]);
                        numberPoint.splice(i, 1);
                        break;
                    }
                }
                break; // Thoát vòng lặp khi đã xóa
            }
        }

        // Kiểm tra va chạm giữa soldier và chướng ngại vật
        if (obstacleBox.intersectsBox(soldierBox)) {
            isMoving = false;
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (isMoving) {
        roads.forEach(road => {
            road.position.z += 0.01; // Di chuyển về phía trước
        });
        obstacleModel.forEach(ob => {
            ob.position.z += 0.01; // Di chuyển về phía trước
        });
        numberPoint.forEach(np => {
            np.position.z += 0.01; // Di chuyển về phía trước
        });
        if (soldierModel) {
            if (moveLeft) {
                if (soldierModel.position.x < -0.5) soldierModel.position.x -= 0;
                else soldierModel.position.x -= moveSpeed;
            }
            if (moveRight) {
                if (soldierModel.position.x > 0.5) soldierModel.position.x -= 0;
                else soldierModel.position.x += moveSpeed;
            }
        }
        checkCollision();
        updateBullets();
        renderer.render(scene, camera);
    }
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
}
animate();


