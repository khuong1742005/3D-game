import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

// ========== Biến toàn cục ==========
let scene, camera, renderer, controls;
let soldierModel, mixer;            // Soldier
let roads = [];                     // Đường
let bullets = [];                   // Đạn
let monsterModels = [];             // Quái
let mixerMonsters = [];             // AnimationMixer của quái
let portalModel = [];               // Portal
let numberPoint = [];               // Text hiển thị máu quái
let numberPointPortal = [];         // Text hiển thị x2/x3
let loadedFont;                     // Font
let isMoving = true;                // Dùng để tạm dừng game
let point = 0;                      // Điểm
let multiDamage = 1;                // Hệ số damage
var numMonsters;                    // Số quái tổng (sẽ gán sau)
let moveLeft = false, moveRight = false;
const moveSpeed = 0.023;
const clock = new THREE.Clock();

// ========== 1. Khởi tạo Scene, Camera, Renderer, Ánh sáng ==========
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-0.02, 0.68, 4.07);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Ánh sáng
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);
}

// ========== 2. Tải đường ==========
function loadRoads() {
  const loader = new GLTFLoader();
  const roadCount = 1000;
  loader.load(
    "./src/assets/road.glb",
    (gltf) => {
      for (let i = 0; i < roadCount; i++) {
        const road = gltf.scene.clone();
        road.position.set(0, 0, -i * 2);
        scene.add(road);
        roads.push(road);
      }
    },
    undefined,
    (error) => console.error("❌ Lỗi khi tải road:", error)
  );
}

// ========== 3. Tải Soldier ==========
function loadSoldier() {
  const loader = new GLTFLoader();
  loader.load("./src/assets/Soldier.glb", (gltf) => {
    soldierModel = gltf.scene;
    soldierModel.position.set(0, 0.1, 3);
    soldierModel.scale.set(0.1, 0.09, 0.09);
    scene.add(soldierModel);

    soldierModel.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = true;
    });

    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(soldierModel);
    const runAction = mixer.clipAction(animations[1]); // index 1: Run
    runAction.play();

    startShooting(soldierModel);
  });
}

// ========== 4. Dynamic Import Map (load quái, portal) ==========
function loadRandomMap() {
  // Random mapIndex = 1..2 (hoặc 1..3 tuỳ bạn)
  const mapIndex = Math.floor(Math.random() * 2) + 1;
  return import(`./maps/map${mapIndex}.js`).then(({ loadMonsters }) => {
    // Gọi hàm loadMonsters
    const { mixerMonsters: mm, monsterModels: md, portalModel: pm } = loadMonsters(scene);

    mixerMonsters = mm;
    monsterModels = md;
    portalModel = pm;

  });
}

// ========== 5. Tải Font và tạo text cho quái, portal ==========
function loadFontAndSetupText() {
  const fontLoader = new FontLoader();
  fontLoader.load("../src/fonts/helvetiker_regular.typeface.json", (font) => {
    loadedFont = font;

    // Đợi 0.5s để chắc chắn quái & portal đã được push (vì GLTFLoader bất đồng bộ)
    setTimeout(() => {
      setupPortalText();
      setupMonsterText();
      numMonsters = monsterModels.length;  
    }, 500);
  });
}

// Tạo text x2/x3 cho portal
function setupPortalText() {
  if (!portalModel) return;
  portalModel.forEach((portal) => {
    // Random x2 hoặc x3
    const text = Math.random() < 0.5 ? "x2" : "x3";

    const textGeometry = new TextGeometry(text, {
      font: loadedFont,
      size: 0.1,
      height: 0.01,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(
      portal.position.x - 0.3,
      portal.position.y + 0.14,
      portal.position.z
    );
    textMesh.userData.textValue = text;
    scene.add(textMesh);
    numberPointPortal.push(textMesh);
  });
}

// Tạo text hiển thị máu (1..3) cho monster
function setupMonsterText() {
  if (!monsterModels) return;
  monsterModels.forEach((monster) => {
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    const textGeometry = new TextGeometry(`${randomNumber}`, {
      font: loadedFont,
      size: 0.1,
      height: 0.01,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(
      monster.position.x - 0.07,
      monster.position.y + 0.3,
      monster.position.z
    );
    textMesh.userData.textValue = randomNumber;
    scene.add(textMesh);
    numberPoint.push(textMesh);
  });
}

// ========== 6. Bắn đạn ==========
function startShooting(model) {
  // Bắn đạn định kỳ 300ms
  setInterval(() => {
    if (model) {
      shootBullet(model, 0, "soldier");
    }
  }, 300);
}

function shootBullet(model, posZ, name) {
  if (!model) return;

  const bulletGeometry = new THREE.SphereGeometry(0.1, 1, 1);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  bullet.position.set(
    model.position.x - posZ < -0.5 ? -0.5 : model.position.x - posZ,
    model.position.y + (name === "soldier" ? 0.1 : 0),
    model.position.z - 0.2
  );

  // Hướng bắn (ngược hướng soldier nhìn)
  const direction = new THREE.Vector3();
  soldierModel && soldierModel.getWorldDirection(direction);
  direction.negate();

  bullets.push({ mesh: bullet, direction: direction });
  scene.add(bullet);
}

function multiBullet(model, multiValue) {
  if (!soldierModel || !model) return;

  if (multiValue === "x2") {
    const randomPos = Math.random() * 0.1 - 0.05;
    shootBullet(model, randomPos, "bullet");
    shootBullet(model, -randomPos, "bullet");
  } else if (multiValue === "x3") {
    const randomPos = Math.random() * 0.1 - 0.05;
    shootBullet(model, randomPos, "bullet");
    shootBullet(model, 0, "bullet");
    shootBullet(model, -randomPos, "bullet");
  }
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.mesh.position.add(bullet.direction.clone().multiplyScalar(0.05));

    // Xoá đạn nếu bay quá xa
    if (bullet.mesh.position.z < -10) {
      scene.remove(bullet.mesh);
      bullets.splice(i, 1);
      i--;
    }
  }
}

// ========== 7. Xử lý sự kiện phím ==========
function initEvents() {
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      isMoving = !isMoving;
    }
    if (event.code === "ArrowLeft") moveLeft = true;
    if (event.code === "ArrowRight") moveRight = true;
  });

  document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") moveLeft = false;
    if (event.code === "ArrowRight") moveRight = false;
  });
}

// ========== 8. Va chạm ==========
function checkCollision() {

  // Nếu chưa load xong map thì return
  if (!monsterModels || !soldierModel || !bullets || !portalModel) return;

  // Box cho soldier
  const soldierBox = new THREE.Box3()
    .setFromObject(soldierModel)
    .expandByScalar(-0.03);

  // 8.1 Kiểm tra va chạm giữa đạn & quái
  for (let i = monsterModels.length - 1; i >= 0; i--) {
    const monster = monsterModels[i];
    const obstacleBox = new THREE.Box3()
      .setFromObject(monster)
      .expandByScalar(0.08);

    for (let j = bullets.length - 1; j >= 0; j--) {
      const bulletBox = new THREE.Box3()
        .setFromObject(bullets[j].mesh)
        .expandByScalar(0.03);

      if (bulletBox.intersectsBox(obstacleBox)) {
        numberPoint[i].userData.textValue -= 1;

        scene.remove(bullets[j].mesh);
        bullets.splice(j, 1);

        // Cập nhật text
        scene.remove(numberPoint[i]);
        const newTextGeometry = new TextGeometry(
          `${numberPoint[i].userData.textValue}`,
          {
            font: loadedFont,
            size: 0.1,
            height: 0.01,
          }
        );
        numberPoint[i].geometry = newTextGeometry;
        scene.add(numberPoint[i]);

        // Nếu quái hết máu
        if (numberPoint[i].userData.textValue <= 0) {
          point++;
          document.getElementById("point").textContent = point;

          scene.remove(monster);
          monsterModels.splice(i, 1);

          scene.remove(numberPoint[i]);
          numberPoint.splice(i, 1);
          break;
        }
        break;
      }
    } 
    // 8.2 Soldier đụng quái => game over
    if (obstacleBox.intersectsBox(soldierBox) || numMonsters === point) {
      isMoving = false;
      document.querySelector(".replay").style.display = "flex";
      document.getElementById("score").textContent = point;
    }
  }

  // 8.3 Soldier & đạn va chạm portal
  for (let i = portalModel.length - 1; i >= 0; i--) {
    const portal = portalModel[i];
    const portalBox = new THREE.Box3()
      .setFromObject(portal)
      .expandByScalar(0.0001);

    // Đạn chạm portal => bắn thêm x2
    for (let j = 0; j < bullets.length; j++) {
      const bulletBox = new THREE.Box3()
        .setFromObject(bullets[j].mesh)
        .expandByScalar(-0.06);

      if (bulletBox.intersectsBox(portalBox)) {
        scene.remove(bullets[j].mesh);
        multiBullet(bullets[j].mesh, "x2");
        bullets.splice(j, 1);
      }
    }

    // Soldier chạm portal => tăng damage
    if (portalBox.intersectsBox(soldierBox)) {
      const textValue = numberPointPortal[i].userData.textValue; // "x2" hoặc "x3"
      // Tăng damage: x2 hay x3
      if (textValue === "x2") multiDamage += 2; 
      if (textValue === "x3") multiDamage += 3;

      // Hiển thị
      document.getElementById("DM").textContent = multiDamage;

      // Xoá portal
      scene.remove(portal);
      portalModel.splice(i, 1);

      scene.remove(numberPointPortal[i]);
      numberPointPortal.splice(i, 1);

      break;
    }
  }
}

// ========== 9. Vòng lặp animate ==========
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  // Cập nhật animation soldier
  if (mixer) mixer.update(delta);

  // Cập nhật animation quái
  if (mixerMonsters && mixerMonsters.length) {
    mixerMonsters.forEach((mx) => mx.update(delta));
  }

  if (isMoving) {
    // Di chuyển road
    roads.forEach((road) => {
      road.position.z += 0.01;
    });

    // Portal lắc lư
    const elapsedTime = clock.getElapsedTime();
    if (portalModel) {
      portalModel.forEach((portal, index) => {
        const speed = 2;
        const amplitude = 0.33;
        portal.position.x = Math.sin(elapsedTime * speed + index) * amplitude;
      });
    }
    if (numberPointPortal) {
      numberPointPortal.forEach((portal, index) => {
        const speed = 2;
        const amplitude = 0.33;
        portal.position.x = Math.sin(elapsedTime * speed + index) * amplitude;
      });
    }

    // Monster & text di chuyển
    if (monsterModels) {
      monsterModels.forEach((monster) => {
        monster.position.z += 0.008;
      });
    }
    if (numberPoint) {
      numberPoint.forEach((np) => {
        np.position.z += 0.008;
      });
    }

    // Soldier di chuyển trái/phải
    if (soldierModel) {
      if (moveLeft) {
        if (soldierModel.position.x > -0.5) {
          soldierModel.position.x -= moveSpeed;
        }
      }
      if (moveRight) {
        if (soldierModel.position.x < 0.5) {
          soldierModel.position.x += moveSpeed;
        }
      }
    }

    // Cập nhật va chạm
    checkCollision();
    // Cập nhật đạn
    updateBullets();
  }

  // Cuối cùng: render
  renderer.render(scene, camera);
}

// ========== 10. Khởi chạy game ==========
function startGame() {
  initScene();
  initEvents();

  loadRoads();
  loadSoldier();

  // Dynamic import map -> khi xong thì load font & animate
  loadRandomMap().then(() => {
    loadFontAndSetupText();
    animate();
  });
}

// Gọi hàm khởi chạy
startGame();
