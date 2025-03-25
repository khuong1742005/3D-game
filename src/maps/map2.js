import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Hàm load quái vật
export function loadMonsters(scene) {
  // Mảng lưu trữ để truy cập sau này (nếu cần trả về)
  const mixerMonsters = [];
  const monsterModels = [];

  const loader = new GLTFLoader();
  const totalGroups = 25;        // Số nhóm quái
  const monstersPerGroup = 5;  // Số quái trong mỗi nhóm

  loader.load('./src/assets/monter_run1.glb', function (gltf) {
    for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
      // Xác định vị trí cơ bản của nhóm trên trục Z
      const baseZ = -5;

      for (let i = 0; i < monstersPerGroup; i++) {
        // Tạo vị trí ngẫu nhiên trong phạm vi nhất định
        const randomX = Math.random() - 0.5;
        const randomZ = baseZ + -13 * i + (Math.random() - 0.5) * 12 - 5;

        // Clone model bằng SkeletonUtils
        const model = SkeletonUtils.clone(gltf.scene);

        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        
        const randomScale = Math.random() * (0.3 - 0.1) + 0.1;
        model.scale.set(randomScale, randomScale, randomScale);
        model.position.set(randomX, 0.1, randomZ);
        scene.add(model);

        // Lưu lại model để di chuyển sau
        monsterModels.push(model);

        // Tạo AnimationMixer cho monster này và lưu vào mảng
        const mixer = new THREE.AnimationMixer(model);
        mixerMonsters.push(mixer);

        const clips = gltf.animations;
        if (clips.length > 0) {
          const action = mixer.clipAction(clips[0]);
          action.play();
        }
      }
    }
  });

  const portalModel = [];

loader.load("./src/assets/Portal.glb", function (gltf) {
    
  const maxPortals = 2;
  // Tạo danh sách vị trí hợp lệ
  for (let i = 0; i < maxPortals; i++) {
    // const randomX = Math.random() < 0.5 ? 0.3 : -0.3;
    const randomX = -0.3;
    const randomZ = -i; // Giữ khoảng cách trên trục Z

    // Tạo Box3 giả định cho portal
    const tempPortal = new THREE.Object3D();
    tempPortal.position.set(randomX, 0.1, randomZ);

    const portal = gltf.scene.clone();
    portal.position.set(randomX, 0.1, randomZ + 1.5);
    portal.scale.set(0.07, 0.07, 0.05);
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
  }
});

  // Nếu muốn lấy mixerMonsters và monsterModels ở nơi khác, ta return
  return { mixerMonsters, monsterModels, portalModel };
}
