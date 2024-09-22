import * as THREE from 'three';
<<<<<<< HEAD
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import sky from './assets/Sky.jpg';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



// Base ----------------------------------------------------------------
// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
//scene
const scene = new THREE.Scene();
//render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Light ----------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
scene.add(directionalLight);
directionalLight.position.set(-30, 30, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom += -20;
directionalLight.shadow.camera.top += 20;


// Helper----------------------------------------------------------------
// Camera helper
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

// Plane helper
const planeGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

// Gird helper
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

// Foog helper
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

// Background -------------------------------------------------------------
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load(
    [
        sky, sky, sky, sky, sky, sky
    ]
);


// Object ----------------------------------------------------------------
const Sparrow = new THREE.Group();
scene.add(Sparrow);
const SlingShot = new URL('../src/assets/SlingShot.glb', import.meta.url);
const SlingShotLoader = new GLTFLoader();
SlingShotLoader.load(SlingShot.href, function (gltf) {
    const model = gltf.scene;
    Sparrow.add(model);
    model.scale.set(0.3, 0.3, 0.3)
    model.rotation.set(0, -1.5, 0)
});

const Dayy = new URL('../src/assets/Day.glb', import.meta.url);
const DayLoader = new GLTFLoader();
DayLoader.load(Dayy.href, function (gltf) {
    const model = gltf.scene;
    Sparrow.add(model);
    model.scale.set(0.1, 0.2, 0.1)
    model.position.set(0, -0.5, -0.3)
    model.rotation.set(0, 1.5, 0)
});

Sparrow.position.set(5, 0, 0)

const createArrow = () => {
    const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Màu đỏ
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.y = 1;
    return arrow;
};

const arrows = [];
for (let i = 0; i < 10; i++) {
    const arrow = createArrow();
    scene.add(arrow);
    arrows.push(arrow);
    arrow.visible = false;
}
let arrowIndex = 0;
const shootArrow = () => {
    const arrow = arrows[arrowIndex];
    if (arrow) {
        arrow.position.set(Sparrow.position.x, Sparrow.position.y + 7, Sparrow.position.z);
        arrow.visible = true;
        arrowIndex = (arrowIndex + 1) % arrows.length;
    }
};

// Xử lý kéo dây
let isDragging = false; // Kéo?
let dragStart = { x: 0 }; // Bắt đầu
let initialBowX = Sparrow.position.x; // Position before drag of bow
let initialStringX = Sparrow.position.x; // Position before drag of day

window.addEventListener('mousedown', (event) => {
    if (isDragging == false) {
        isDragging = true;
        dragStart = { x: event.clientX }; // get start position
    }
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaX = event.clientX - dragStart.x;
        Sparrow.position.x = initialBowX + deltaX * 0.01;
        Sparrow.position.x = initialStringX + deltaX * 0.01;
    }
});
window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        shootArrow();
        Sparrow.position.x = initialBowX; // reset
        Sparrow.position.x = initialStringX; // reset 
    }
});

// Loop ----------------------------------------------------------------
function animate() {

    arrows.forEach((arrow) => {
        if (arrow.visible) {
            arrow.position.x -= 0.1;
            if (arrow.position.x < -10) {
                arrow.visible = false;
            }
        }

    });
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
=======
import Stats from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConvexObjectBreaker } from 'three/addons/misc/ConvexObjectBreaker.js'
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// - Global variables -

		// Graphics variables
		let speed;
		let container, stats;
		let camera, controls, scene, renderer;
		let textureLoader;
		const clock = new THREE.Clock();

		const mouseCoords = new THREE.Vector2();
		const raycaster = new THREE.Raycaster();
		const MoveMouse = new THREE.Vector2();	
		var draggable = new THREE.Object3D();

		const ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

		// Physics variables
		const gravityConstant = 7.8;
		let collisionConfiguration;
		let dispatcher;
		let broadphase;
		let solver;
		let physicsWorld;
		const margin = 0.05;
		const PublicRedPoint = new THREE.Vector3(0, 13, 60)
		const PublicCubeTestPosition = new THREE.Vector3(0, 1.4, 90)

		const convexBreaker = new ConvexObjectBreaker();

		// Rigid bodies include all movable objects
		const rigidBodies = [];

		const pos = new THREE.Vector3();
		const quat = new THREE.Quaternion();
		let transformAux1;
		let tempBtVec3_1;

		const objectsToRemove = [];

		// for ( let i = 0; i < 500; i ++ ) {

		// 	objectsToRemove[ i ] = null;

		// }

		let numObjectsToRemove = 0;

		const impactPoint = new THREE.Vector3();
		const impactNormal = new THREE.Vector3();

		// - Main code -

		Ammo().then( function ( AmmoLib ) {

			Ammo = AmmoLib;

			init();

		} );


		// - Functions -

		function init() {

			initGraphics();

			initPhysics();

			createObjects();

			initInput();

			

		}

			


		function initGraphics() {

			container = document.getElementById( 'container' );

			camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

			scene = new THREE.Scene();
			scene.background = new THREE.Color( 0xbfd1e5 );

			camera.position.set( - 40, 80, 186 );

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.setAnimationLoop( animate );
			renderer.shadowMap.enabled = true;
			container.appendChild( renderer.domElement );

			controls = new OrbitControls( camera, renderer.domElement );
			controls.target.set( 0, 2, 0 );
			controls.update();

			textureLoader = new THREE.TextureLoader();

			const ambientLight = new THREE.AmbientLight( 0xbbbbbb );
			scene.add( ambientLight );
			let Num = 1.2
			const light = new THREE.DirectionalLight( 0xffffff, 0.25 );
			light.position.set( - 100 * Num , 130 * Num , -50 * Num );
			light.castShadow = true;
      		//light.intensity = 0.15;
			const d = 444;
			light.shadow.camera.left = - d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = - d;

			light.shadow.camera.near = 2;
			light.shadow.camera.far = 570;

			light.shadow.mapSize.x = 2024;
			light.shadow.mapSize.y = 2024;

			scene.add( light );

			const CubeTest = new THREE.Mesh(new THREE.SphereGeometry(1.4), new THREE.MeshPhongMaterial({ color: 0x202020 }));
			scene.add(CubeTest);
			CubeTest.position.copy(PublicCubeTestPosition)
			CubeTest.castShadow = true;
			CubeTest.receiveShadow = true;
			CubeTest.name = "CubeTest"
			//CubeTest.visible = false;

			window.addEventListener('keydown', function(event) {
				if (event.key === 'r')  {
				  
				 CubeTest.visible = true;
				 CubeTest.position.set(0, 1.4, 90)
				 
				}
			})



			
			const RedPoint = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial({ color: 0xde0000 }));
			scene.add(RedPoint);
			RedPoint.position.copy(PublicRedPoint)
			RedPoint.castShadow = true;
			RedPoint.receiveShadow = true;


			const DLightHelper = new THREE.DirectionalLightHelper(light);
			scene.add(DLightHelper);

			const DLightShadowHelper = new THREE.CameraHelper(light.shadow.camera);
			scene.add(DLightShadowHelper)

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild( stats.domElement );

			//

			window.addEventListener( 'resize', onWindowResize );

		}

		function initPhysics() {

			// Physics configuration

			collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
			broadphase = new Ammo.btDbvtBroadphase();
			solver = new Ammo.btSequentialImpulseConstraintSolver();
			physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
			physicsWorld.setGravity( new Ammo.btVector3( 0, - gravityConstant, 0 ) );

			transformAux1 = new Ammo.btTransform();
			tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );

		}

		function createObject( mass, halfExtents, pos, quat, material ) {

			const object = new THREE.Mesh( new THREE.BoxGeometry( halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2 ), material );
			object.position.copy( pos );
			object.quaternion.copy( quat );
			convexBreaker.prepareBreakableObject( object, mass, new THREE.Vector3(), new THREE.Vector3(), true );
			createDebrisFromBreakableObject( object );

		}

		function createObjects() {
			
			//SlingShot	
			const assetLoader = new GLTFLoader();
			const SlingShot = new URL('../src/3D object/nhap.glb', import.meta.url) ;
			assetLoader.load(SlingShot.href, function(gltf){
			const model = gltf.scene;
			scene.add(model);
			model.castShadow = true
			model.scale.set(0.5,0.5,0.5)
			model.position.set(0,0,60)
			
			model.traverse(function(child) {
				if (child.isMesh) {
				child.castShadow = true;  
				child.receiveShadow = true;
				}
			});

			}, undefined, function(error) {
			console.error(error)
			})


			//cube
			const CubeMass = 150;
			const CubeHaflExtents = new THREE.Vector3(5, 5, 5);
			pos.set(-35, 0, 0);
			quat.set(0, 0, 0, 1);
			createObject( CubeMass, CubeHaflExtents, pos, quat, createMaterial( 0xB03014 ) );



			// Ground
			pos.set( 0, - 0.5, 0 );
			quat.set( 0, 0, 0, 1 );
			const ground = createParalellepipedWithPhysics( 1000, 1, 1000, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
			ground.receiveShadow = true;
			ground.name = "Ground"
			textureLoader.load( 'textures/grid.png', function ( texture ) {

				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.set( 40, 40 );
				ground.material.map = texture;
				ground.material.needsUpdate = true;

			} );

			// Tower 1
			const towerMass = 800;
			const towerHalfExtents = new THREE.Vector3( 6, 10, 6 );
			pos.set( - 8, 5, 0 );
			quat.set( 0, 0, 0, 1 );
			createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xB03014 ) );

			// Tower 2
			pos.set( 8, 5, 0 );
			quat.set( 0, 0, 0, 1 );
			createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xB03214 ) );

			// Gray Tower 1
			const towerMassGray = 300;
			pos.set( 20, 30.3, 0 );
			quat.set( 0, 0, 0, 1 );
			createObject( towerMassGray, towerHalfExtents, pos, quat, createMaterial( 0x333232 ) );

			// Gray Tower 2
			pos.set( -20, 30.3, 0 );
			quat.set( 0, 0, 0, 1 );
			createObject( towerMassGray, towerHalfExtents, pos, quat, createMaterial( 0x333232 ) );

			//Bridge
			const bridgeMass = 265;
			const bridgeHalfExtents = new THREE.Vector3( 30, 1.2, 6 );
			pos.set( 0, 15.2, 0 );
			quat.set( 0, 0, 0, 1 );
			createObject( bridgeMass, bridgeHalfExtents, pos, quat, createMaterial( 0xB3B865 ) );

			// Stones
			const stoneMass = 120;
			const stoneHalfExtents = new THREE.Vector3( 1, 2, 0.15 );
			const numStones = 45;
			quat.set( 0, 0, 0, 1 );
			for ( let i = 0; i < numStones; i ++ ) {

				pos.set( -17, 3, 35 * ( 0.5 - i / ( numStones + 1 ) ) );

				createObject( stoneMass, stoneHalfExtents, pos, quat, createMaterial( 0xB0B0B0 ) );

			}

			// Mountain
			const mountainMass = 500;
			const mountainHalfExtents = new THREE.Vector3( 90, 100, 90 );
			pos.set( 0, mountainHalfExtents.y * 0.5, - 180 );
			quat.set( 0, 0, 0, 1 );
			const mountainPoints = [];
			mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
			mountainPoints.push( new THREE.Vector3( 0, mountainHalfExtents.y, 0 ) );
			const mountain = new THREE.Mesh( new ConvexGeometry( mountainPoints ), createMaterial( 0xB03814 ) );
			mountain.position.copy( pos );
			mountain.quaternion.copy( quat );
			convexBreaker.prepareBreakableObject( mountain, mountainMass, new THREE.Vector3(), new THREE.Vector3(), true );
			createDebrisFromBreakableObject( mountain );

		}

		function createParalellepipedWithPhysics( sx, sy, sz, mass, pos, quat, material ) {

			const object = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
			const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
			shape.setMargin( margin );

			createRigidBody( object, shape, mass, pos, quat );

			return object;

		}

		function createDebrisFromBreakableObject( object ) {

			object.castShadow = true;
			object.receiveShadow = true;

			const shape = createConvexHullPhysicsShape( object.geometry.attributes.position.array );
			shape.setMargin( margin );

			const body = createRigidBody( object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity );

			// Set pointer back to the three object only in the debris objects
			const btVecUserData = new Ammo.btVector3( 0, 0, 0 );
			btVecUserData.threeObject = object;
			body.setUserPointer( btVecUserData );

		}

		function removeDebris( object ) {

			scene.remove( object );

			physicsWorld.removeRigidBody( object.userData.physicsBody );

		}

		function createConvexHullPhysicsShape( coords ) {

			const shape = new Ammo.btConvexHullShape();

			for ( let i = 0, il = coords.length; i < il; i += 3 ) {

				tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], coords[ i + 2 ] );
				const lastOne = ( i >= ( il - 3 ) );
				shape.addPoint( tempBtVec3_1, lastOne );

			}

			return shape;

		}

		function createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

			if ( pos ) {

				object.position.copy( pos );

			} else {

				pos = object.position;

			}

			if ( quat ) {

				object.quaternion.copy( quat );

			} else {

				quat = object.quaternion;

			}

			const transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
			transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
			const motionState = new Ammo.btDefaultMotionState( transform );

			const localInertia = new Ammo.btVector3( 0, 0, 0 );
			physicsShape.calculateLocalInertia( mass, localInertia );

			const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
			const body = new Ammo.btRigidBody( rbInfo );

			body.setFriction( 0.5 );

			if ( vel ) {

				body.setLinearVelocity( new Ammo.btVector3( vel.x, vel.y, vel.z ) );

			}

			if ( angVel ) {

				body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );

			}

			object.userData.physicsBody = body;
			object.userData.collided = false;

			scene.add( object );

			if ( mass > 0 ) {

				rigidBodies.push( object );

				// Disable deactivation
				body.setActivationState( 4 );

			}

			physicsWorld.addRigidBody( body );

			return body;

		}

		function createRandomColor() {

			return Math.floor( Math.random() * ( 1 << 24 ) );

		}

		function createMaterial( color ) {

			color = color || createRandomColor();
			return new THREE.MeshPhongMaterial( { color: color } );

		}



    function throwball( startPosition ) {
      const ballMass = 400;
      const ballRadius = 1.4;
  
      const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 14, 10), ballMaterial);
      ball.castShadow = true;
      ball.receiveShadow = true;
      const ballShape = new Ammo.btSphereShape(ballRadius);
  
      ballShape.setMargin(margin);
  
      
      
      pos.copy(startPosition); 
  
  
      const targetPosition = PublicRedPoint;
	  
     
      const direction = new THREE.Vector3().subVectors(targetPosition, startPosition);
      direction.normalize(); 
	  const distance = startPosition.distanceTo(targetPosition);
	  //console.log(distance)
    
      quat.set(0, 0, 0, 1);  
      const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);


	  function Run(){
	    speed = distance * 1.5;  
		
		direction.multiplyScalar(speed);  
		ballBody.setLinearVelocity(new Ammo.btVector3(direction.x, direction.y, direction.z));  // Set the velocity in the physics world
	
	  }
	  Run();
      
    
    }



		
		
		function initInput() {
			window.addEventListener('keydown', function(event) {
       

        if (event.key === 'w')  {
          let startPosition = new THREE.Vector3(0, 0, 60);
          throwball( startPosition );
        }

        if (event.key === 's')  {
          let startPosition = new THREE.Vector3(0, 60, -60);
          throwball( startPosition );
        }

        if (event.key === 'd')  {
          let startPosition = new THREE.Vector3(60, 60, 0);
          throwball( startPosition );
        }

    	});
		}


		window.addEventListener('click', event => {
			if (draggable) {
				console.log("dropping draggable")
				if (draggable.name == "CubeTest") {
					//scene.remove(draggable);
					draggable.visible = false;
					let startPosition = new THREE.Vector3(draggable.position.x, 0, draggable.position.z);
          			throwball( startPosition );
					
				}
				draggable = null;
				
				return;
				
			}

			mouseCoords.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouseCoords.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			
			raycaster.setFromCamera( mouseCoords, camera );
			//console.log(raycaste.x)
			const found = raycaster.intersectObjects( scene.children );
			if (found.length > 0 && found[0].object.name == "CubeTest"){
				draggable = found[0].object
				console.log(found[0].object)
				//found[0].object.position.set(0, 0, 0);
				//found[0].object.updateMatrixWorld(true);

			}
		})

		window.addEventListener('mousemove', event => {
			MoveMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			MoveMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			
		})


		function dragObject() {
			if (draggable != null && draggable.name == "CubeTest"){
				raycaster.setFromCamera(MoveMouse, camera)
				const found = raycaster.intersectObjects(scene.children)
				if (found.length > 0) {
					for (let o of found) {
						draggable.position.x = o.point.x;
						draggable.position.z = o.point.z;
						draggable.position.y = 1.4;
					}
					

				



					function CurveCreate() {
						const pointsForCurver = [];
						const amplitude = 5; 
						const frequency = 0.07;  
						const numPoints = 20;  
						
						const ACxyz = Math.sqrt(Math.pow(draggable.position.y - PublicRedPoint.y, 2) + Math.pow(draggable.position.z - PublicRedPoint.z, 2) + Math.pow(draggable.position.x - PublicRedPoint.x, 2));
						const ACxz = Math.sqrt(Math.pow(draggable.position.z - PublicRedPoint.z, 2) + Math.pow(draggable.position.x - PublicRedPoint.x, 2));
						const ACx = Math.sqrt(Math.pow(draggable.position.x - PublicRedPoint.x, 2));
						const ACzx = Math.sqrt(Math.pow(draggable.position.z - PublicRedPoint.z, 2));
						const SpeedDistance = draggable.position.distanceTo(PublicRedPoint);
						const SpeedForce = SpeedDistance * 1.5;
						
					
						const v0x = SpeedForce * (ACx / ACxz) * (ACxyz / SpeedDistance);
						const v0y = SpeedForce * (PublicRedPoint.y / SpeedDistance);
						const v0z = SpeedForce * (ACzx / ACxz) * (ACxyz / SpeedDistance);
						
						for (let i = 0; i <= numPoints; ++i) {
							const t = i;
							
							

							let x
							if (draggable.position.x >= 0)
							    x = -v0x * t + draggable.position.x; else  x = v0x * t + draggable.position.x;
							const y = v0y * t - (0.5 * gravityConstant * t * t) + draggable.position.y;
							
							const z = -v0z * t + draggable.position.z;
							
							pointsForCurver.push(new THREE.Vector3(x, y, z));
						}
						
						const curve = new THREE.CatmullRomCurve3(pointsForCurver);
			
						const points = curve.getPoints( 530 );
			
						const splineObject = new THREE.Line( new THREE.BufferGeometry().setFromPoints( points ), new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
			
						scene.add(splineObject)
						setTimeout(() => {
							scene.remove(splineObject); 
						}, 10);
						
					}
					CurveCreate();
					

				}
			}
		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function animate() {
			//console.log(speed)
			dragObject();
			//CurveCreate();
			render();
			stats.update();

		}

		function render() {

			const deltaTime = clock.getDelta();

			updatePhysics( deltaTime * 3.5 );

			renderer.render( scene, camera );

		}

		function updatePhysics( deltaTime ) {

			// Step world
			physicsWorld.stepSimulation( deltaTime, 10 );

			// Update rigid bodies
			for ( let i = 0, il = rigidBodies.length; i < il; i ++ ) {

				const objThree = rigidBodies[ i ];
				const objPhys = objThree.userData.physicsBody;
				const ms = objPhys.getMotionState();

				if ( ms ) {

					ms.getWorldTransform( transformAux1 );
					const p = transformAux1.getOrigin();
					const q = transformAux1.getRotation();
					objThree.position.set( p.x(), p.y(), p.z() );
					objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

					objThree.userData.collided = false;

				}

			}

			for ( let i = 0, il = dispatcher.getNumManifolds(); i < il; i ++ ) {

				const contactManifold = dispatcher.getManifoldByIndexInternal( i );
				const rb0 = Ammo.castObject( contactManifold.getBody0(), Ammo.btRigidBody );
				const rb1 = Ammo.castObject( contactManifold.getBody1(), Ammo.btRigidBody );

				const threeObject0 = Ammo.castObject( rb0.getUserPointer(), Ammo.btVector3 ).threeObject;
				const threeObject1 = Ammo.castObject( rb1.getUserPointer(), Ammo.btVector3 ).threeObject;

				if ( ! threeObject0 && ! threeObject1 ) {

					continue;

				}

				const userData0 = threeObject0 ? threeObject0.userData : null;
				const userData1 = threeObject1 ? threeObject1.userData : null;

				const breakable0 = userData0 ? userData0.breakable : false;
				const breakable1 = userData1 ? userData1.breakable : false;

				const collided0 = userData0 ? userData0.collided : false;
				const collided1 = userData1 ? userData1.collided : false;

				if ( ( ! breakable0 && ! breakable1 ) || ( collided0 && collided1 ) ) {

					continue;

				}

				let contact = false;
				let maxImpulse = 0;
				for ( let j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++ ) {

					const contactPoint = contactManifold.getContactPoint( j );

					if ( contactPoint.getDistance() < 0 ) {

						contact = true;
						const impulse = contactPoint.getAppliedImpulse();

						if ( impulse > maxImpulse ) {

							maxImpulse = impulse;
							const pos = contactPoint.get_m_positionWorldOnB();
							const normal = contactPoint.get_m_normalWorldOnB();
							impactPoint.set( pos.x(), pos.y(), pos.z() );
							impactNormal.set( normal.x(), normal.y(), normal.z() );

						}

						break;

					}

				}

				// If no point has contact, abort
				if ( ! contact ) continue;

				// Subdivision

				const fractureImpulse = 250;

				if ( breakable0 && ! collided0 && maxImpulse > fractureImpulse ) {

					const debris = convexBreaker.subdivideByImpact( threeObject0, impactPoint, impactNormal, 1, 2, 1.5  );

					const numObjects = debris.length;
					for ( let j = 0; j < numObjects; j ++ ) {

						const vel = rb0.getLinearVelocity();
						const angVel = rb0.getAngularVelocity();
						const fragment = debris[ j ];
						fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
						fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

						createDebrisFromBreakableObject( fragment );

					}

					objectsToRemove[ numObjectsToRemove ++ ] = threeObject0;
					userData0.collided = true;

				}

				if ( breakable1 && ! collided1 && maxImpulse > fractureImpulse ) {

					const debris = convexBreaker.subdivideByImpact( threeObject1, impactPoint, impactNormal, 1, 2, 1.5  );

					const numObjects = debris.length;
					for ( let j = 0; j < numObjects; j ++ ) {

						const vel = rb1.getLinearVelocity();
						const angVel = rb1.getAngularVelocity();
						const fragment = debris[ j ];
						fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
						fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

						createDebrisFromBreakableObject( fragment );

					}

					objectsToRemove[ numObjectsToRemove ++ ] = threeObject1;
					userData1.collided = true;

				}

			}

			for ( let i = 0; i < numObjectsToRemove; i ++ ) {

				removeDebris( objectsToRemove[ i ] );

			}

			numObjectsToRemove = 0;

    }
>>>>>>> 383d28587065b3ee5d87ef0f3c323fc0882ba23b
