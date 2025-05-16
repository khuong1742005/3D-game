import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import * as skills from "./skills/skills.js";

// ========== Biến toàn cục ==========
let scene, camera, renderer, controls;
let soldierModel;
let mixers = [];
let soldiers = [];
let roads = [];
let houses = [];
let walls = [];
let bullets = [];
let monsterModels = [];
let mixerMonsters = [];
let portalModel = [];
let plusPortalModel = [];
let numberPoint = [];
let numberPointPortal = [];
let numberPointPlusPortal = [];
let loadedFont;
let isMoving = true;
let point = 0;
let HP = 100;
let moveLeft = false,
  moveRight = false;
let shootingInterval = null; // Biến lưu interval bắn đạn
let startedshoot = false; // Cờ kiểm soát đã start bắn chưa

var numMonsters;
const moveSpeed = 0.038;
const clock = new THREE.Clock();

// Biến kỹ năng
export let multiDamage = 1;
export let shootingSpeed = 200;

// ========== 1. Khởi tạo Scene, Camera, Renderer, Ánh sáng ==========
function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.28, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 4;
  controls.enablePan = false;
  controls.update();

  // Skybox
  const loader = new THREE.TextureLoader();
  let materialArray = [
    new THREE.MeshBasicMaterial({
      map: loader.load("./src/scenes/skyboxes/xpos.png"),
    }), // phải
    new THREE.MeshBasicMaterial({
      map: loader.load("./src/scenes/skyboxes/xneg.png"),
    }), // trái
    new THREE.MeshBasicMaterial({
      map: loader.load("./src/scenes/skyboxes/ypos.png"),
    }), // trên
    new THREE.MeshBasicMaterial({
      map: loader.load("./src/scenes/skyboxes/yneg.png"),
    }), // dưới
    new THREE.MeshBasicMaterial({
      map: loader.load("./src/scenes/skyboxes/zpos.png"),
    }), // trước
    new THREE.MeshBasicMaterial({
      map: loader.load("./src/scenes/skyboxes/zneg.png"),
    }), // sau
  ];
  materialArray.forEach((mat) => (mat.side = THREE.BackSide));
  let skybox = new THREE.Mesh(
    new THREE.BoxGeometry(300, 300, 300),
    materialArray
  );
  scene.add(skybox);

  // Ánh sáng
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.normalBias = 0.05;
  scene.add(dirLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(10, 20, 10);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.1;
  spotLight.decay = 2;
  spotLight.distance = 50;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 100;
  dirLight.shadow.bias = -0.0005;
  scene.add(spotLight);

  // Sàn
  const planeGeometry = new THREE.PlaneGeometry(250, 250);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
}

// ========== 2. Tải đường và nhà, tường ==========
function loadRoads() {
  const loader = new GLTFLoader();
  loader.load(
    "./src/assets/houses/nha1.glb",
    (gltf) => {
      const houseCount = 5;
      for (let i = 0; i < houseCount; i++) {
        const house = gltf.scene.clone();
        house.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        let multiplier = 1.7;

        house.scale.set(0.18457 * multiplier, 0.17 * multiplier, 0.20 * multiplier);
        house.position.set(0, 0.11, -i * 19.68);
        house.rotation.y = Math.PI / 2;
        scene.add(house);
        houses.push(house);
      }
    },
    undefined,
    (error) => console.error("❌ Lỗi khi tải houses:", error)
  );
}

function loadWalls() {
  const loader = new GLTFLoader();
  loader.load(
    "./src/assets/walls/lancan1.glb",
    (gltf) => {
      const wallCount = 25;
      for (let i = 0; i < wallCount; i++) {
        const wall = gltf.scene.clone();
        wall.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        wall.scale.set(0.18457, 0.18, 0.18);
        wall.position.set(0, 0.11, -i * 1.98);
        wall.rotation.y = Math.PI / 2;
        scene.add(wall);
        walls.push(wall);
      }
    },
    undefined,
    (error) => console.error("❌ Lỗi khi tải houses:", error)
  );
}

// ========== 3. Tải Soldier ==========
function loadSoldier(x, y, z) {
  const loader = new GLTFLoader();
  loader.load("./src/assets/Soldier.glb", (gltf) => {
    soldierModel = gltf.scene;
    soldierModel.position.set(x, y, z);
    soldierModel.scale.set(0.17, 0.153, 0.153);
    scene.add(soldierModel);

    soldierModel.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const mixer = new THREE.AnimationMixer(soldierModel);
    const runAction = mixer.clipAction(gltf.animations[1]); // index 1: Run
    runAction.play();

    mixers.push(mixer);
    soldiers.push(soldierModel);

    // Gọi hàm bắn
    startShooting(soldierModel);
  });
}

// ========== 4. Dynamic Import Map (load quái, portal, v.v..) ==========

//================== Load vị trí của Monster ==================
function loadRandomMonsters() {
  const random = Math.floor(Math.random() * 2) + 1;
  return import(`./maps/monsters/monsters${random}.js`)
    .then(({ loadMonster }) => loadMonster(scene))
    .then(({ mixerMonsters: mm, monsterModels: md }) => {
      mixerMonsters = mm;
      monsterModels = md;
    });
}

function addMixers() {
  mixers.push(...mixerMonsters);
}
//================== Load vị trí của Portal hình sin ==================
function loadRandomPortals() {
  const random = Math.floor(Math.random() * 2) + 1;
  return import(`./maps/portals/portals${random}.js`).then(({ loadPortal }) => {
    const { portalModel: pm } = loadPortal(scene);
    portalModel = pm;
  });
}
//================== Load vị trí của Portal có dấu cộng ==================
function loadRandomPlusPortals() {
  const random = Math.floor(Math.random() * 1) + 1;
  return import(`./maps/plusPortals/plusPortals${random}.js`).then(
    ({ loadPlusPortal }) => {
      const { plusPortalModel: pm } = loadPlusPortal(scene);
      plusPortalModel = pm;
    }
  );
}

// ========== 5. Tải Font và tạo text cho quái, portal ==========
function loadFontAndSetupText() {
  const fontLoader = new FontLoader();
  fontLoader.load("../src/fonts/helvetiker_regular.typeface.json", (font) => {
    loadedFont = font;
    setTimeout(() => {
      setupPortalText();
      setupMonsterText();
      setupPlusPortalText();
      numMonsters = monsterModels.length;
    }, 500);
  });
}

function setupPortalText() {
  if (!portalModel) return;
  portalModel.forEach((portal) => {
    const text = Math.random() < 0.5 ? "x2" : "x3";
    portal.text = text;
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

function setupPlusPortalText() {
  if (!plusPortalModel) return;
  plusPortalModel.forEach((portal) => {
    const text = (-Math.floor(Math.random() * 100)).toString();
    portal.text = text;
    const textGeometry = new TextGeometry(text, {
      font: loadedFont,
      size: 0.1,
      height: 0.01,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(
      portal.position.x - 0.1,
      portal.position.y + 0.14,
      portal.position.z
    );
    textMesh.userData.textValue = text;
    scene.add(textMesh);
    numberPointPlusPortal.push(textMesh);
  });
}

function setupMonsterText() {
  if (!monsterModels) return;
  monsterModels.forEach((monster) => {
    const randomNumber = monster.Health;
    const textGeometry = new TextGeometry(`${randomNumber}`, {
      font: loadedFont,
      size: 0.1,
      height: 0.01,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x7cff00 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(
      monster.position.x - 0.07,
      monster.scale.y * (monster.position.y + 1.5) + 0.3,
      monster.position.z
    );
    textMesh.userData.textValue = randomNumber;
    scene.add(textMesh);
    numberPoint.push(textMesh);
  });
}

// ========== 6. Bắn đạn ==========
// Hàm khởi tạo bắn liên tục
function startShooting(model) {
  // Gắn trạng thái bắn vào chính model
  if (model.userData.startedshoot) {
    clearInterval(model.userData.shootingInterval);
  }

  const interval = setInterval(() => {
    if (model) {
      shootBullet(model, 0, "soldier");
    }
  }, shootingSpeed);

  // Lưu thông tin bắn vào model
  model.userData.shootingInterval = interval;
  model.userData.startedshoot = true;
}

let loadedBullet = null;
const bulletLoader = new GLTFLoader();
bulletLoader.load(
  "./src/assets/bullet.glb",
  (gltf) => {
    loadedBullet = gltf.scene;
    loadedBullet.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    // Nếu soldierModel đã load xong, có thể gọi startShooting(soldierModel) ở đây
    // (Nhưng hiện tại ta gọi ngay khi loadSoldier xong)
  },
  undefined,
  (error) => {
    console.error("Lỗi khi load bullet.glb:", error);
  }
);

function shootBullet(model, posZ, name) {
  if (!model || !loadedBullet) return;

  const bullet = loadedBullet.clone();
  bullet.rotation.y = Math.PI;
  bullet.scale.set(0.015, 0.015, 0.015);

  bullet.position.set(
    model.position.x - posZ < -0.88 ? -0.88 : model.position.x - posZ,
    model.position.y + (name === "soldier" ? 0.1 : Math.random() * 0.2),
    model.position.z - 0.24
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

// ========== 6,5. Xử lý tạo đa nhân vật =======
function multiSoldier(model, multiValue) {
  if (soldiers.length < 1 || !model) return;
  if (multiValue > 0) {
    for (let i = 1; i <= multiValue / 2; ++i) {
      loadSoldier(
        model.position.x + Math.random() * 0.2,
        model.position.y,
        model.position.z + Math.random() * 0.2
      );
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
  if (!monsterModels || !soldierModel || !bullets || !portalModel) return;
  bullet_monster();
  soldier_Monster();
  bullet_portal();
  soldier_Portal();
  check_lengthOfModels();
}

function bullet_portal() {
  //=======================================Portal X==========================================
  for (let i = portalModel.length - 1; i >= 0; i--) {
    const portal = portalModel[i];
    const portalBox = new THREE.Box3()
      .setFromObject(portal)
      .expandByScalar(0.0001);

    // Đạn chạm portal => bắn thêm x2/x3
    for (let j = 0; j < bullets.length; j++) {
      const bulletBox = new THREE.Box3()
        .setFromObject(bullets[j].mesh)
        .expandByScalar(0.01);

      if (bulletBox.intersectsBox(portalBox)) {
        scene.remove(bullets[j].mesh);
        multiBullet(bullets[j].mesh, portal.text);
        bullets.splice(j, 1);
      }
    }
  }

  //=======================================Portal +==========================================
  for (let i = plusPortalModel.length - 1; i >= 0; i--) {
    const portal = plusPortalModel[i];
    const portalBox = new THREE.Box3()
      .setFromObject(portal)
      .expandByScalar(0.0001);

    for (let j = 0; j < bullets.length; j++) {
      const bulletBox = new THREE.Box3()
        .setFromObject(bullets[j].mesh)
        .expandByScalar(0.01);

      if (bulletBox.intersectsBox(portalBox)) {
        scene.remove(bullets[j].mesh);
        bullets.splice(j, 1);
        scene.remove(numberPointPlusPortal[i]);
        numberPointPlusPortal[i].userData.textValue++;
        const newTextGeometry = new TextGeometry(
          `${numberPointPlusPortal[i].userData.textValue}`,
          {
            font: loadedFont,
            size: 0.1,
            height: 0.01,
          }
        );
        numberPointPlusPortal[i].geometry = newTextGeometry;
        scene.add(numberPointPlusPortal[i]);
      }
    }
  }
}

function bullet_monster() {
  for (let i = monsterModels.length - 1; i >= 0; i--) {
    const monster = monsterModels[i];
    const obstacleBox = new THREE.Box3()
      .setFromObject(monster)
      .expandByVector(new THREE.Vector3(0.1, 0.5, 0.1));

    if (monster.position.z >= 3.2) {
      scene.remove(monster);
      monsterModels.splice(i, 1);
      scene.remove(numberPoint[i]);
      numberPoint.splice(i, 1);
      HP -= 5;
      document.getElementById("HP").textContent = HP;
    }

    for (let j = 0; j < bullets.length; j++) {
      const bulletBox = new THREE.Box3()
        .setFromObject(bullets[j].mesh)
        .expandByScalar(0.05);

      if (bulletBox.intersectsBox(obstacleBox)) {
        numberPoint[i].userData.textValue -= multiDamage;

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
          numMonsters -= point;
          scene.remove(monster);
          monsterModels.splice(i, 1);

          scene.remove(numberPoint[i]);
          numberPoint.splice(i, 1);
          break;
        }
        break;
      }
    }

    // Soldier đụng quái => trừ máu, máu = 0 => end game
    if (numMonsters === point || HP <= 0) {
      isMoving = false;
      document.querySelector(".replay").style.display = "flex";
      document.getElementById("score").textContent = point;
    }
  }
}

function soldier_Monster() {
  for (let j = 0; j < soldiers.length; ++j) {
    const soldierBox = new THREE.Box3()
      .setFromObject(soldiers[j])
      .expandByScalar(-0.03);
    for (let i = monsterModels.length - 1; i >= 0; i--) {
      const monster = monsterModels[i];
      const monsterBox = new THREE.Box3()
        .setFromObject(monster)
        .expandByVector(new THREE.Vector3(0.1, 0.5, 0.1));

      if (monsterBox.intersectsBox(soldierBox)) {
        // HP -= 5;
        scene.remove(monster);
        monsterModels.splice(i, 1);
        scene.remove(numberPoint[i]);
        numberPoint.splice(i, 1);

        clearInterval(soldiers[j].userData.shootingInterval);
        scene.remove(soldiers[j]);
        soldiers.splice(j, 1);
        

        // stop game
        // isMoving = false;
        // document.querySelector(".replay").style.display = "flex";
        // document.getElementById("score").textContent = point;
      }
    }
  }
}

function soldier_Portal() {
  // Soldier & đạn va chạm portal +
  for (let i = plusPortalModel.length - 1; i >= 0; i--) {
    const portal = plusPortalModel[i];
    const portalBox = new THREE.Box3()
      .setFromObject(portal)
      .expandByScalar(0.0001);
    // Soldier chạm portal => +2
    for (let j = 0; j < soldiers.length; j++) {
      const soldier = soldiers[j];
      if (soldier.userData.hasSpawned) continue;

      const soldierBox = new THREE.Box3()
        .setFromObject(soldier)
        .expandByScalar(0.0001);
      if (soldierBox.intersectsBox(portalBox)) {
        multiSoldier(soldier, numberPointPlusPortal[i].userData.textValue);

        //=======delete chữ và cổng====================
        scene.remove(plusPortalModel[i]);
        plusPortalModel.splice(i, 1);
        scene.remove(numberPointPlusPortal[i]);
        numberPointPlusPortal.splice(i, 1);
        // Đặt cờ đã sinh
        soldier.userData.hasSpawned = true;

        // Sau 2 giây thì cho phép sinh lại
        setTimeout(() => {
          soldier.userData.hasSpawned = false;
        }, 2000);

        break;
      }
    }
  }
}

function check_lengthOfModels() {
  if (monsterModels.length === 0 || HP <= 0 || soldiers.length === 0) {
    isMoving = false;
    document.querySelector(".replay").style.display = "flex";
    document.getElementById("score").textContent = point;
  }
}
// ========== 9. Vòng lặp animate ==========
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));

  if (isMoving) {
    const elapsedTime = clock.getElapsedTime();
    if (portalModel) {
      portalModel.forEach((portal, index) => {
        const speed = 1.5;
        const amplitude = 0.88;
        portal.position.x = Math.sin(elapsedTime * speed + index) * amplitude;
      });
    }

    if (plusPortalModel) {
      plusPortalModel.forEach((portal) => {
        portal.position.z += 0.02;
      });
    }

    if (numberPointPortal) {
      numberPointPortal.forEach((portal, index) => {
        const speed = 1.5;
        const amplitude = 0.88;
        portal.position.x = Math.sin(elapsedTime * speed + index) * amplitude;
      });
    }

    if (numberPointPlusPortal) {
      numberPointPlusPortal.forEach((np) => {
        np.position.z += 0.02;
      });
    }

    if (monsterModels) {
      monsterModels.forEach((monster) => {
        monster.position.z += 0.02;
      });
    }
    if (numberPoint) {
      numberPoint.forEach((np) => {
        np.position.z += 0.02;
      });
    }

    // Soldier di chuyển
    if (soldierModel) {
      if (moveLeft && soldierModel.position.x > -0.8) {
        for (let i = 0; i < soldiers.length; i++)
          soldiers[i].position.x -= moveSpeed;
      }
      if (moveRight && soldierModel.position.x < 0.8) {
        for (let i = 0; i < soldiers.length; i++)
          soldiers[i].position.x += moveSpeed;
      }
    }

    // Cập nhật va chạm + đạn
    checkCollision();
    updateBullets();
  }

  renderer.render(scene, camera);
}

// ========== 10. Khởi chạy game ==========
function startGame() {
  initScene();
  initEvents();
  loadRoads();
  loadWalls();
  loadSoldier(0, 0.1, 3);

  // Dynamic import map -> khi xong thì load font & animate
  Promise.all([
    loadRandomMonsters(),
    loadRandomPortals(),
    loadRandomPlusPortals(),
  ]).then(() => {
    addMixers();
    loadFontAndSetupText();
    animate();
  });

  // Tạo các skill định kỳ
  // Skill 1 (x2damage) mỗi 20-25 giây
  setInterval(() => {
    // addSkill1();
  }, getRandomInt(20000, 25000));

  // Skill 2 (fastBullet) mỗi 5-10 giây
  setInterval(() => {
    // addSkill2();
  }, getRandomInt(2000, 3000));
}

// Tạo hàm random tiện dụng
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== Hàm skill ==========
function addSkill1() {
  skills.x2damage(multiDamage);
  multiDamage *= 2;
  document.getElementById("DM").textContent = multiDamage;
}

function addSkill2() {
  skills.fastBullet(shootingSpeed);
  shootingSpeed *= 0.8;

  if (soldierModel) {
    startShooting(soldierModel);
  }
}

// Gọi hàm khởi chạy
startGame();
