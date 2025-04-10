import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

  //=========================================PORTAL===============================================================
export function loadPlusPortal(scene) {
  const loader = new GLTFLoader();
  const plusPortalModel = [];
  const ArandomX = [-0.3, -0.9];
  loader.load("./src/assets/Portal.glb", function (gltf) {
    const maxPortals = 4;
    // Tạo danh sách vị trí hợp lệ
    for (let i = 0; i < maxPortals; i++) {
      // const randomX = Math.random() < 0.5 ? 0.3 : -0.3;
      const randomIndex = Math.floor(Math.random() * ArandomX.length);
      const randomX = ArandomX[randomIndex];
    //   randomX = -0.3;
      const randomZ = -i; // Giữ khoảng cách trên trục Z

      // Tạo Box3 giả định cho portal
      const tempPortal = new THREE.Object3D();
      tempPortal.position.set(randomX, 0.1, randomZ);

      const portal = gltf.scene.clone();
      portal.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      portal.position.set(randomX, 0.1, randomZ - 5);
      portal.scale.set(0.07, 0.07, 0.05);
      portal.rotation.y = Math.PI / 2;

      // Áp dụng material
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xfaccff00,
        transparent: true,
        opacity: 0.9,
        emissive: 0xffccff00,
        emissiveIntensity: 1.5,
      });

      portal.traverse((child) => {
        if (child.isMesh) {
          child.material = glassMaterial;
        }
      });

      scene.add(portal);
      plusPortalModel.push(portal);
    }
  });

  return { plusPortalModel };
}
