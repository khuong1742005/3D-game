import * as THREE from 'three';



// Thêm GridHelper vào scene
const gridHelper = new THREE.GridHelper(100, 10, 0x00ff00, 0x444444);

// add a plane
const Pgeometry = new THREE.PlaneGeometry(4000, 4000);
const Pmaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(Pgeometry, Pmaterial);
plane.rotation.x = Math.PI * -0.5;




// cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

cube.position.set(0, 5, 0)



// create a sphere

const SphereGeometry = new THREE.SphereGeometry(4);
const SphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 , wireframe: false});
const Sphere = new THREE.Mesh(SphereGeometry, SphereMaterial);
Sphere.position.set(20, 30, 20);





// create a ambienlight
const ambientLight = new THREE.AmbientLight(0x333333)





// let arrowW = false;
// let arrowD = false;
// let arrowA = false;
// let arrowS = false;



// document.addEventListener('keydown', (event) => {
//     if (event.key === 'w') arrowW = true;
//     if (event.key === 'd') arrowD = true;
//     if (event.key === 'a') arrowA = true;
//     if (event.key === 's') arrowS = true;

//     switch (true) {
//         case arrowW && arrowD:

//             cube.position.z += 0.6; 
//             cube.position.x += 0.6;
//             break;
//         case arrowS && arrowD:
//             cube.position.z += 0.6; 
//             cube.position.x -= 0.6;
//             break;
//         case arrowS && arrowA:
//             cube.position.z -= 0.6; 
//             cube.position.x -= 0.6;
//             break;  
//         case arrowW && arrowA:
//             cube.position.z -= 0.6; 
//             cube.position.x += 0.6;
//             break;    
//         case arrowW:    
//             cube.position.x += 0.6;
//             break;
//         case arrowD:
//             cube.position.z += 0.6;
//             break;
//         case arrowA:
//             cube.position.z -= 0.6;
//             break;
//         case arrowS:
//             cube.position.x -= 0.6;

//             break;


//     }
// });

// document.addEventListener('keyup', (event) => {
//     if (event.key === 'w') arrowW = false;
//     if (event.key === 'd') arrowD = false;
//     if (event.key === 'a') arrowA = false;
//     if (event.key === 's') arrowS = false;

    

// });

cube.scale.set(15, 5, 5);   //size of cube
//scene.add(cube)
export{cube, Sphere, plane, gridHelper, ambientLight}
