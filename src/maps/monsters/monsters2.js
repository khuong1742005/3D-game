import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

//=========================================MONSTER===============================================================
export async function loadMonster(scene) {
  const mixerMonsters = [];
  const monsterModels = [];

  const loader = new GLTFLoader();
  const totalGroups = 3; // Số nhóm quái
  const monstersPerGroup = 5; // Số quái trong mỗi nhóm
  const gltf = await loader.loadAsync("./src/assets/monter_run1.glb");
    for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
      // Xác định vị trí cơ bản của nhóm trên trục Z
      const baseZ = -5;

      for (let i = 0; i < monstersPerGroup; i++) {
        // Tạo vị trí ngẫu nhiên trong phạm vi nhất định
        const randomX = Math.random() * (0.5 - 0.1) + 0.1;

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
        model.Health = Math.floor(randomScale * 10) * (i + 8);
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


  return { mixerMonsters, monsterModels };
}
