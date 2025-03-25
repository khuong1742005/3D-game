import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

// ========== Biến toàn cục ==========
let scene, camera, renderer, controls;
let soldierModel, mixer; // Soldier
let roads = []; // Đường
let houses = []; // Nhà
let bullets = []; // Đạn
let monsterModels = []; // Quái
let mixerMonsters = []; // AnimationMixer của quái
let portalModel = []; // Portal
let numberPoint = []; // Text hiển thị máu quái
let numberPointPortal = []; // Text hiển thị x2/x3
let loadedFont; // Font
let isMoving = true; // Dùng để tạm dừng game
let point = 0; // Điểm
let HP = 100;
let multiDamage = 1; // Hệ số damage
var numMonsters; // Số quái tổng (sẽ gán sau)
let moveLeft = false,
  moveRight = false;
const moveSpeed = 0.023;
const clock = new THREE.Clock();

// ========== 1. Khởi tạo Scene, Camera, Renderer, Ánh sáng ==========
function initScene() {
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.28, 6);
  // camera.lookAt(new THREE.Vector3(0, 0.1, 7));
  // controls.target.set(0, 0.1, 7);
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

  //skyboxes --------------------------------
  let materialArray = [];

  let texture_rt = new THREE.TextureLoader().load(
    "./src/scenes/skyboxes/zpos.png"
  ); // front
  let texture_lf = new THREE.TextureLoader().load(
    "./src/scenes/skyboxes/zneg.png"
  ); // back
  let texture_up = new THREE.TextureLoader().load(
    "./src/scenes/skyboxes/ypos.png"
  ); // up
  let texture_dn = new THREE.TextureLoader().load(
    "./src/scenes/skyboxes/yneg.png"
  ); // down
  let texture_ft = new THREE.TextureLoader().load(
    "./src/scenes/skyboxes/xpos.png"
  ); // right
  let texture_bk = new THREE.TextureLoader().load(
    "./src/scenes/skyboxes/xneg.png"
  ); // left

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < materialArray.length; i++) {
    materialArray[i].side = THREE.BackSide;
  }
  let skyboxGeo = new THREE.BoxGeometry(300, 300, 300);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);

  // Ánh sáng-----------------------------------------------------
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(5, 10, 5); // Thay đổi vị trí cho hợp lý
  dirLight.castShadow = true;
  dirLight.position.set(5, 10, 5);
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.normalBias = 0.05;
  dirLight.intensity = 3; // Tăng từ 2 lên 3
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  scene.add(dirLight);

  // const dirLightHelper = new THREE.CameraHelper(dirLight.shadow.camera);
  // scene.add(dirLightHelper);

  //spotlight
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

  // Đặt target cho spotlight
  // spotLight.target.position.set(0, 0, 0);
  // scene.add(spotLight.target);

  // Thêm helper để kiểm tra cone của spotlight
  // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);

  // sàn
  const planeGeometry = new THREE.PlaneGeometry(250, 250);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // Tạo hình cầu tạo bóng
  // const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  // const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // sphere.position.set(-3, 2, -5);
  // sphere.castShadow = true;
  // sphere.receiveShadow = true;
  // scene.add(sphere);
}

// ========== 2. Tải đường và nhà ==========
function loadRoads() {
  const loader = new GLTFLoader();
  // const roadCount = 1000;
  // loader.load(
  //   "./src/assets/road.glb",
  //   (gltf) => {
  //     for (let i = 0; i < roadCount; i++) {
  //       const road = gltf.scene.clone();

  //       road.position.set(0, 0, -i * 2);
  //       scene.add(road);
  //       roads.push(road);
  //     }
  //   },
  //   undefined,
  //   (error) => console.error("❌ Lỗi khi tải road:", error)
  // );

  loader.load(
    "./src/assets/houses.glb",
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

        house.scale.set(0.18457, 0.18, 0.18);
        house.position.set(0, 0.11, -i * 11.68);
        house.rotation.y = Math.PI / 2;
        scene.add(house);
        houses.push(house);
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
    soldierModel.scale.set(0.1 * 1.7, 0.09 * 1.7, 0.09 * 1.7);
    scene.add(soldierModel);

    soldierModel.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
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
    const {
      mixerMonsters: mm,
      monsterModels: md,
      portalModel: pm,
    } = loadMonsters(scene);

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
      // console.log("Số quái: ", numMonsters);
    }, 500);
  });
}

// Tạo text x2/x3 cho portal
function setupPortalText() {
  if (!portalModel) return;
  portalModel.forEach((portal) => {
    // Random x2 hoặc x3
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
  }, 100);
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
    if (soldierModel) startShooting(soldierModel);
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
    model.position.x - posZ < -0.5 ? -0.5 : model.position.x - posZ,
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
    // console.log("x3");
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
      .expandByVector(new THREE.Vector3(0.1, 0.5, 0.1));
    // const obstacleBoxHelper = new THREE.Box3Helper(obstacleBox, 0xff0000); // Màu đỏ
    // scene.add(obstacleBoxHelper);

    // console.log(monsterModels[1]);
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
          numMonsters-=point;
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
    if (numMonsters === point || HP <= 0) {
      isMoving = false;
      document.querySelector(".replay").style.display = "flex";
      document.getElementById("score").textContent = point;
    }

    if (obstacleBox.intersectsBox(soldierBox)) {
      HP -= 5;
      scene.remove(monster);
      monsterModels.splice(i, 1);

      scene.remove(numberPoint[i]);
      numberPoint.splice(i, 1);
    }
  }

  // 8.3 Soldier & đạn va chạm portal
  for (let i = portalModel.length - 1; i >= 0; i--) {
    const portal = portalModel[i];
    const portalBox = new THREE.Box3()
      .setFromObject(portal)
      .expandByScalar(0.0001);
    // const portalBoxHelper = new THREE.Box3Helper(portalBox, 0xff0000); // Màu đỏ
    // scene.add(portalBoxHelper);
    // Đạn chạm portal => bắn thêm x2
    for (let j = 0; j < bullets.length; j++) {
      const bulletBox = new THREE.Box3()
        .setFromObject(bullets[j].mesh)
        .expandByScalar(0.01);
      // helper for bullet
      // const bulletBoxHelper = new THREE.Box3Helper(bulletBox, 0xff0000); // Màu đỏ
      // scene.add(bulletBoxHelper);

      if (bulletBox.intersectsBox(portalBox)) {
        scene.remove(bullets[j].mesh);
        multiBullet(bullets[j].mesh, portal.text);
        bullets.splice(j, 1);
      }
    }

    // // Soldier chạm portal => tăng damage
    // if (portalBox.intersectsBox(soldierBox)) {
    //   const textValue = numberPointPortal[i].userData.textValue; // "x2" hoặc "x3"
    //   // Tăng damage: x2 hay x3
    //   if (textValue === "x2") multiDamage += 2;
    //   if (textValue === "x3") multiDamage += 3;

    //   // Hiển thị
    //   document.getElementById("DM").textContent = multiDamage;

    //   // Xoá portal
    //   scene.remove(portal);
    //   portalModel.splice(i, 1);

    //   scene.remove(numberPointPortal[i]);
    //   numberPointPortal.splice(i, 1);

    //   break;
    // }
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
    // roads.forEach((road) => {
    //   road.position.z += 0.01;
    // });

    houses.forEach((house) => {
      house.position.z += 0.01;
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
        monster.position.z += 0.042;
      });
    }
    if (numberPoint) {
      numberPoint.forEach((np) => {
        np.position.z += 0.042;
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
