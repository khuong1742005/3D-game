import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';




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
const obstacleCount = 1000;
loader.load('./src/assets/chai.glb', function (gltf) {
    for (let i = 0; i < obstacleCount; i++) {
        const obstacle = gltf.scene.clone();
        const randomX = Math.random() < 0.5
            ? 0.3
            : -0.3

        obstacle.position.set(randomX, 0.2, -i * 2);
        obstacle.scale.set(0.1, 0.1, 0.07);
        obstacle.rotation.x = Math.PI / 2;
        // const glassMaterial = new THREE.MeshPhysicalMaterial({
        //     color: 0xff4169e1,
        //     transparent: true,
        //     opacity: 0.5,
        //     emissive: 0xff4169e1, // Màu phát sáng (trắng)
        //     emissiveIntensity: 1.5,
        //     transmission: 0.9, // Độ xuyên thấu (hiệu ứng kính)
        //     metalness: 0.2, // Một chút kim loại để phản chiếu
        // });
        // obstacle.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = glassMaterial;
        //     }
        // });
        scene.add(obstacle);
        obstacleModel.push(obstacle);


    }
});


let mixerMonsters = [];
let monsterModels = [];

let monsters = 10;
loader.load('./src/assets/monter_run1.glb', function(gltf) {
    for (let i = 0; i < monsters; i++) {

        const randomX = Math.random() < 0.5 ? 0.3 : -0.3;
        // Clone model bằng SkeletonUtils để đảm bảo clone đúng skeleton
        const model = SkeletonUtils.clone(gltf.scene);
        model.scale.set(0.24, 0.24, 0.24);
        model.position.set(randomX, 0.1, -4 - i * 2);  // Cách nhau theo trục Z
        scene.add(model);

        // Lưu lại model để di chuyển sau
        monsterModels.push(model);

        // Tạo AnimationMixer cho monster này và lưu vào mảng mixerMonsters
        const mixer = new THREE.AnimationMixer(model);
        mixerMonsters.push(mixer);

        const clips = gltf.animations;
        if (clips.length > 0) {
            const action = mixer.clipAction(clips[0]);
            action.play();
        }
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
        const overlapThreshold = 0.1; // điều chỉnh giá trị này tùy vào kích thước model của bạn

        for (const obstacle of obstacleModel) {
            const dx = Math.abs(randomX - obstacle.position.x);
            const dz = Math.abs(randomZ - obstacle.position.z);

            if (dx < overlapThreshold && dz < overlapThreshold) {
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

    setTimeout(() => {
 //for portal
 
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


    //for monster
    monsterModels.forEach((o, i) => {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const textGeometry = new TextGeometry(`${randomNumber}`, {
            font: font,
            size: 0.1,
            height: 0.01,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textMesh.position.set(o.position.x - 0.03, o.position.y + 0.8, o.position.z);
        textMesh.userData.textValue = randomNumber;
        scene.add(textMesh);
        numberPoint.push(textMesh);
    });

}, 500);
   

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
    if (!monsterModels || !soldierModel || !bullets || !portalModel) return;

    const soldierBox = new THREE.Box3().setFromObject(soldierModel).expandByScalar(-0.03);

    // 🔹 Kiểm tra va chạm với obstacleModel
    for (let i = monsterModels.length - 1; i >= 0; i--) {
        const o = monsterModels[i];
        const obstacleBox = new THREE.Box3().setFromObject(o).expandByScalar(0.08);

        // Kiểm tra va chạm với đạn
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bulletBox = new THREE.Box3().setFromObject(bullets[j].mesh).expandByScalar(0.03);
            if (bulletBox.intersectsBox(obstacleBox)) {
                numberPoint[i + portalModel.length].userData.textValue -= multiDamage;

                scene.remove(bullets[j].mesh);
                bullets.splice(j, 1);

                scene.remove(numberPoint[i + portalModel.length]); // Xóa số cũ
                const newTextGeometry = new TextGeometry(`${numberPoint[i + portalModel.length].userData.textValue}`, {
                    font: loadedFont,
                    size: 0.1,
                    height: 0.01,
                });
                numberPoint[i + portalModel.length].geometry = newTextGeometry;
                scene.add(numberPoint[i + portalModel.length]);

                if (numberPoint[i + portalModel.length].userData.textValue <= 0) {
                    point++;
                    document.getElementById("point").textContent = point;
                    scene.remove(o);
                    monsterModels.splice(i, 1);
                    scene.remove(numberPoint[i + portalModel.length]);
                    numberPoint.splice(i, 1);
                    break;
                }
                break;
            }
        }

        // Kiểm tra va chạm giữa soldier và chướng ngại vật
        if (obstacleBox.intersectsBox(soldierBox) || monsters == point) {
            console.log(monsterModels.length)
            isMoving = false;
            document.querySelector('.replay').style.display = 'flex';
            document.getElementById("score").textContent = point;
            
        }
    }



    // 🔹 Kiểm tra va chạm với portalModel (THÊM XỬ LÝ XÓA SỐ)
    for (let i = portalModel.length - 1; i >= 0; i--) {
        const portal = portalModel[i];
        const portalBox = new THREE.Box3().setFromObject(portal).expandByScalar(0.06);
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bulletBox = new THREE.Box3().setFromObject(bullets[j].mesh).expandByScalar(0.03);
            if (bulletBox.intersectsBox(portalBox)) {
                numberPoint[i].userData.textValue += multiDamage;

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
            }

        }
        if (portalBox.intersectsBox(soldierBox)) {
            multiDamage += numberPoint[i].userData.textValue;
            multiDamage = Math.max(multiDamage, 1); // Tối đa 100 damage
            document.getElementById("DM").textContent = multiDamage;

            scene.remove(portal);
            portalModel.splice(i, 1);
            scene.remove(numberPoint[i]);
            numberPoint.splice(i, 1);
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
        // obstacleModel.forEach(ob => {
        //     ob.position.z += 0.01; // Di chuyển về phía trước
        // });
        portalModel.forEach(portal => {
            portal.position.z += 0.01; // Di chuyển về phía trước
        });

        numberPoint.forEach(np => {
            np.position.z += 0.01; // Di chuyển về phía trước
        });

        monsterModels.forEach(monster => {
            monster.position.z += 0.01;
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

    // Cập nhật mixer của soldier
    if (mixer) mixer.update(delta);

    // Cập nhật mixer của monster
    mixerMonsters.forEach(mixer => mixer.update(delta));

}
animate();


