import * as THREE from 'three';

const gridHelper = new THREE.GridHelper(100, 10, 0x00ff00, 0x444444);

// add a plane
const Pgeometry = new THREE.PlaneGeometry(80, 80);
const Pmaterial = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide,
 // wireframe: true
});

const plane = new THREE.Mesh(Pgeometry, Pmaterial);
plane.rotation.x = Math.PI * -0.5;


// cube
const geometry = new THREE.BoxGeometry(4,4,4);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(-25, 10, 30)

// create a sphere

const SphereGeometry = new THREE.SphereGeometry(4);
const SphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 , wireframe: false});
const Sphere = new THREE.Mesh(SphereGeometry, SphereMaterial);
//Sphere.position.set(20, 30, 20);
//Sphere.position.set(0,100,0)
// create a ambienlight
const ambientLight = new THREE.AmbientLight(0x333333)



//cube.scale.set(2, 2, 2);   //size of cube
//scene.add(cube)
export{cube, Sphere, plane, gridHelper, ambientLight}
