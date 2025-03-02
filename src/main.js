import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';



//game stats
let point = 0;
let multiDamage = 1;




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
const moveSpeed = 0.035;
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
        obstacle.rotation.x = Math.PI / 2 ;
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

const portalModel = [];
const portalCount = 10;

loader.load('./src/assets/Portal.glb', function (gltf) {
    const maxPortals = 2;
    let generatedPortals = 0;
    let validPositions = [];

    // Tạo danh sách vị trí hợp lệ
    for (let i = 0; i < maxPortals * 5; i++) { // Tăng số lần thử để đảm bảo có đủ vị trí
        const randomX = Math.random() < 0.5 ? 0.3 : -0.3;
        const randomZ = -i; // Giữ khoảng cách trên trục Z

        let isValid = true;

        // Tạo Box3 giả định cho portal
        const tempPortal = new THREE.Object3D();
        tempPortal.position.set(randomX, 0.1, randomZ);
        const portalBox = new THREE.Box3().setFromObject(tempPortal);

        // Kiểm tra không chạm vào obstacleModel
        for (const obstacle of obstacleModel) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            if (portalBox.intersectsBox(obstacleBox)) {
                isValid = false;
                break;
            }
        }

        // Kiểm tra không chạm với các portal đã chọn trước đó
        for (const pos of validPositions) {
            const existingBox = new THREE.Box3().setFromObject(new THREE.Object3D());
            existingBox.setFromCenterAndSize(new THREE.Vector3(pos.x, 0.1, pos.z), new THREE.Vector3(0.1, 0.1, 0.07));
            if (portalBox.intersectsBox(existingBox)) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            validPositions.push({ x: randomX, z: randomZ });
            if (validPositions.length >= maxPortals) break; // Đủ vị trí thì dừng
        }
    }

    // Tạo portal từ danh sách vị trí hợp lệ
    validPositions.forEach(pos => {
        const portal = gltf.scene.clone();
        portal.position.set(pos.x, 0.1, pos.z);
        portal.scale.set(0.1, 0.1, 0.07);
        portal.rotation.y = Math.PI / 2;

        // Áp dụng material
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff4169e1,
            transparent: true,
            opacity: 0.9,
            emissive: 0xff4169e1,
            emissiveIntensity: 1.5,
        });

        portal.traverse((child) => {
            if (child.isMesh) {
                child.material = glassMaterial;
            }
        });

        scene.add(portal);
        portalModel.push(portal);
    });
});


const numberPoint = [];
const fontLoader = new FontLoader();
let loadedFont;
fontLoader.load('../src/fonts/helvetiker_regular.typeface.json', function (font) {
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
    portalModel.forEach((o, i) => {
        const randomNumber = -Math.floor(Math.random() * 150) + 1;
        const textGeometry = new TextGeometry(`${randomNumber}`, {
            font: font,
            size: 0.1,
            height: 0.01,
        });
        

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textMesh.position.set(o.position.x - 0.03, o.position.y + 0.2, o.position.z);
        textMesh.userData.textValue = randomNumber;
        scene.add(textMesh);
        numberPoint.push(textMesh);
    });
});

//font for Portal
// fontLoader.load('../src/fonts/helvetiker_regular.typeface.json', function (font) {
//     loadedFont = font;
//     portalModel.forEach((o, i) => {
//         const randomNumber = -Math.floor(Math.random() * 150) + 1;
//         const textGeometry = new TextGeometry(`${randomNumber}`, {
//             font: font,
//             size: 0.1,
//             height: 0.01,
//         });
        

//         const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//         const textMesh = new THREE.Mesh(textGeometry, textMaterial);

//         textMesh.position.set(o.position.x - 0.03, o.position.y + 0.2, o.position.z);
//         textMesh.userData.textValue = randomNumber;
//         scene.add(textMesh);
//         numberPoint.push(textMesh);
//     });
// });

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
    if (!obstacleModel || !soldierModel || !bullets || !portalModel) return;

    const soldierBox = new THREE.Box3().setFromObject(soldierModel).expandByScalar(-0.03);

    // 🔹 Kiểm tra va chạm với obstacleModel
    for (let i = obstacleModel.length - 1; i >= 0; i--) {
        const o = obstacleModel[i];
        const obstacleBox = new THREE.Box3().setFromObject(o).expandByScalar(-0.06);

        // Kiểm tra va chạm với đạn
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bulletBox = new THREE.Box3().setFromObject(bullets[j].mesh).expandByScalar(0.03);
            if (bulletBox.intersectsBox(obstacleBox)) {
                numberPoint[i].userData.textValue-= multiDamage;

                scene.remove(bullets[j].mesh);
                bullets.splice(j, 1);

                scene.remove(numberPoint[i]); // Xóa số cũ
                const newTextGeometry = new TextGeometry(`${numberPoint[i].userData.textValue}`, {
                    font: loadedFont,
                    size: 0.1,
                    height: 0.01,
                });
                numberPoint[i].geometry = newTextGeometry;
                scene.add(numberPoint[i]);

                if (numberPoint[i].userData.textValue <= 0) {
                    point++;
                    document.getElementById("point").textContent = point;
                    scene.remove(o);
                    obstacleModel.splice(i, 1);
                    scene.remove(numberPoint[i]);
                    numberPoint.splice(i, 1);
                    break;
                }
                break;
            }
        }

        // Kiểm tra va chạm giữa soldier và chướng ngại vật
        if (obstacleBox.intersectsBox(soldierBox)) {
            console.log(123)
            isMoving = false;
        }
    }



    // 🔹 Kiểm tra va chạm với portalModel (THÊM XỬ LÝ XÓA SỐ)
    for (let i = portalModel.length - 1; i >= 0; i--) {
        const portal = portalModel[i];
        const portalBox = new THREE.Box3().setFromObject(portal).expandByScalar(0.06);
        // debugBoundingBox(portalBox, 0x00ff00);  // Portal Box: Màu xanh
        // debugBoundingBox(soldierBox, 0xff0000); // Soldier Box: Màu đỏ
        // Kiểm tra va chạm với từng viên đạn
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bulletBox = new THREE.Box3().setFromObject(bullets[j].mesh).expandByScalar(0.03);
            if (bulletBox.intersectsBox(portalBox)) {
                numberPoint[i + obstacleModel.length].userData.textValue+=multiDamage;

                scene.remove(bullets[j].mesh);
                bullets.splice(j, 1);

                scene.remove(numberPoint[i + obstacleModel.length]); // Xóa số cũ
                const newTextGeometry = new TextGeometry(`${numberPoint[i + obstacleModel.length].userData.textValue}`, {
                    font: loadedFont,
                    size: 0.1,
                    height: 0.01,
                });
                numberPoint[i + obstacleModel.length].geometry = newTextGeometry;
                scene.add(numberPoint[i + obstacleModel.length]);

                // if (numberPoint[i + obstacleModel.length].userData.textValue == 0) {
                    // point++;
                    // document.getElementById("point").textContent = point;
                    // scene.remove(portal);
                    // portalModel.splice(i, 1);
                    // scene.remove(numberPoint[i + obstacleModel.length]);
                    // numberPoint.splice(i + obstacleModel.length, 1);
                    // break;
                // }
                // break;
            }
            
        }
        if (portalBox.intersectsBox(soldierBox)) {
            multiDamage += numberPoint[i + obstacleModel.length].userData.textValue;
            multiDamage = Math.max(multiDamage, 1); // Tối đa 100 damage
            document.getElementById("DM").textContent = multiDamage;
            
            scene.remove(portal);
                    portalModel.splice(i, 1);
                    scene.remove(numberPoint[i + obstacleModel.length]);
                    numberPoint.splice(i + obstacleModel.length, 1);
            console.log("Soldier entered the portal!");
            break;
            // Thêm hành động nếu soldier đi qua portal (dịch chuyển, hiệu ứng, v.v.)
        }
        // Kiểm tra va chạm giữa soldier và portal
        
    }
}

function debugBoundingBox(box, color = 0xff0000) {
    const helper = new THREE.Box3Helper(box, color);
    scene.add(helper);
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
        portalModel.forEach(portal => {
            portal.position.z += 0.01; // Di chuyển về phía trước
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


