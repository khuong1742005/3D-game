import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

export async function loadMonster(scene) {
  const mixerMonsters = [];
  const monsterModels = [];

  const loader = new GLTFLoader();
  // loadAsync trả về Promise<GLTF>
  const gltf = await loader.loadAsync("./src/assets/monter_run1.glb");

  const totalGroups = 3;
  const monstersPerGroup = 5;

  for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
    for (let i = 0; i < monstersPerGroup; i++) {
      const randomX = Math.random() * (0.5 - 0.1) + 0.1;
      const randomZ = -5 + -13 * i + (Math.random() - 0.5) * 12 - 5;

      const model = SkeletonUtils.clone(gltf.scene);
      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      const randomScale = Math.random() * (0.3 - 0.1) + 0.1;
      model.Health = Math.floor(randomScale * 10) * 5;
      model.scale.set(randomScale, randomScale, randomScale);
      model.position.set(randomX, 0.1, randomZ);
      scene.add(model);

      monsterModels.push(model);

      const mixer = new THREE.AnimationMixer(model);
      mixerMonsters.push(mixer);

      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
    }
  }

  // Chỉ resolve sau khi đã clone, tạo mixer xong
  return { mixerMonsters, monsterModels };
}
