import * as THREE from 'https://cdn.skypack.dev/three@v0.133.1';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/environments/RoomEnvironment.js';
var mixers = [];
var buildings = [];
var INSPECTED;
var model;
var controls;
var hover = false;
const clock = new THREE.Clock()
const scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var d = 20;
const camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 0.01, 1000 );
camera.position.set( 15, 15,15 );
camera.lookAt( scene.position ); 
var openModal = false;

//diplay block modal
window.addEventListener("load", function(){
    document.getElementById("modal").style.display = "flex";
});

//pencahayaan
// const hemiLight = new THREE.HemisphereLight( 0xffffff,0.5);
// hemiLight.position.set( 0, 3, 0 );
// scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( -3, 22, 12 );
dirLight.intensity = 1;
dirLight.castShadow = true;
var side = 20;
dirLight.shadow.camera.top = side;
dirLight.shadow.camera.bottom = -side;
dirLight.shadow.camera.left = side;
dirLight.shadow.camera.right = -side;
dirLight.shadow.camera.far = 1000;

scene.add( dirLight );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// const fog = new THREE.Fog( 0x3f7b9d, 0, 60 );
// scene.fog = fog;

//uncomment jika ingin menampilkan helper bagian mana saja yang terkena bayangan
// var shadowHelper = new THREE.CameraHelper( dirLight.shadow.camera );
// scene.add( shadowHelper );


//background scene dan setting render
const renderer = new THREE.WebGLRenderer({
    antialias: true
})
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor( 0xffffff, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const pmremGenerator = new THREE.PMREMGenerator( renderer );
scene.background = new THREE.Color( 0xffffff );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
renderer.setSize( window.innerWidth, window.innerHeight );


//control camera (dragable di layar)
controls = new OrbitControls( camera, renderer.domElement );
controls.enableRotate = false;
controls.enablePan = true;
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN };
// controls.touches = {
//     ONE: THREE.TOUCH.DOLLY_PAN
// }
scene.add( camera );
if(controls){
    controls.update();
}

//append hasil render ke elemen html
document.getElementById('model-3d').appendChild( renderer.domElement );

//pengecekan loading model
const manager = new THREE.LoadingManager();
manager.onLoad = function ( ) {

    //menghilangkan loading jika model berhasil di load
    document.getElementById('loading').style.display = "none";

    //tambahkan event untuk hover dan click
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    gsap.to("#model-3d canvas", {duration: 1, opacity:1});

};

const loader = new GLTFLoader(manager);

//meload model kota
loader.load( 'model/city_iso.gltf', function ( gltf ) {
    model = gltf.scene;

    //pengeckan mesh apakah termauk gedung atau tidak dan pemberian bayangan jika termasuk gedung
    model.traverse( function ( object ) {
        if(object.isMesh){
            var name = object.material.name;
            if((name == "ground" || name == "road" || name == "white")){
                object.receiveShadow = true;
            } else {
                object.receiveShadow = true;
                if(name == "tree" || name == "tree_leaf"){
                    
                } else {
                    buildings.push(object);
                }
                object.castShadow = true;
            }
        }
            

    } );

    //menjalankan semua animasi yang ada di model
    var animations = gltf.animations;
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        mixers.push( new THREE.AnimationMixer(model) );
        
        var action = mixers[mixers.length-1].clipAction( animation); // access first animation clip
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
        
    }
    
    scene.add(model);
    
}, undefined, function ( error ) {

    console.error( error );

} );


//load model mobil
loader.load( 'model/mobil_iso.gltf', function ( gltf ) {
    
    // gltf.scene.position.set(0,0,0);
    gltf.scene.traverse( function ( object ) {
        if(object.isMesh){
            object.receiveShadow = true;
            object.castShadow = true;
        }
            

    } );

    //menjalankan animasi mobil
    var animations = gltf.animations;
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        mixers.push( new THREE.AnimationMixer(gltf.scene) );
        
        var action = mixers[mixers.length-1].clipAction( animation); // access first animation clip
        // action.loop = THREE.LoopOnce;
        // action.clampWhenFinished = true;
        action.play();
    
        
    }
    
    scene.add(gltf.scene);
    
}, undefined, function ( error ) {

    console.error( error );

} );


//load model kapal terbang
loader.load( 'model/kapal_terbang_iso.gltf', function ( gltf ) {
    
    // gltf.scene.position.set(0,0,0);
    gltf.scene.traverse( function ( object ) {
        if(object.isMesh){
            object.castShadow = true;
        }
        buildings.push(object);
            

    } );

    //menjalankan animasi mobil
    var animations = gltf.animations;
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        mixers.push( new THREE.AnimationMixer(gltf.scene) );
        
        var action = mixers[mixers.length-1].clipAction( animation); // access first animation clip
        // action.loop = THREE.LoopOnce;
        // action.clampWhenFinished = true;
        action.play();
    
        
    }
    
    scene.add(gltf.scene);
    
}, undefined, function ( error ) {

    console.error( error );

} );


//animasi perframe
function animate() {
    requestAnimationFrame( animate );
    
    var delta = clock.getDelta();
    for (let i = 0; i < mixers.length; i++) {
        const mixer = mixers[i];
        if ( mixer ) mixer.update( delta );
        
    }


    //jika mouse tidak lagi hover ke gedung,ukuran akan di kembalikan seperti semula
    scene.traverse( function ( object ) {
        
        if(!hover){
            if(object.scale.x > 1){
                object.scale.x -= 0.05;
                object.scale.y -= 0.05;
                object.scale.z -= 0.05;
                if(INSPECTED != null){
                    INSPECTED.scale.x -= 0.05;
                    INSPECTED.scale.y -= 0.05;
                    INSPECTED.scale.z -= 0.05;
                }
            }
        } else {
            if(INSPECTED.name != object.name && object.scale.x > 1){
                object.scale.x -= 0.05;
                object.scale.y -= 0.05;
                object.scale.z -= 0.05;
            }
        }

        

    } );
    
    if(controls){
        controls.update();
    }
    renderer.render( scene, camera );
    
}
animate();



function scaleUp(){
    
    if(INSPECTED.scale.x < 1.2 && hover){
        requestAnimationFrame( scaleUp );
        INSPECTED.scale.x += 0.01;
        INSPECTED.scale.y += 0.01;
        INSPECTED.scale.z += 0.01;
    } else {
        return;
    }
}



function onDocumentMouseMove(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2();
    mouse.x =( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.linePrecision = 0.1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    
    if(intersects.length > 0) {
        hover = false;
        for ( var i = 0;  intersects.length > 0 && i < intersects.length; i++)
        {   
            
            if(intersects[0].object && !openModal)
            {   
                var find = false;
                buildings.forEach(b => {
                    if(intersects[0].object.name == b.name){
                       
                        INSPECTED = intersects[0].object.parent;
                        if(INSPECTED != undefined){
                            find = true;
                           
                            
                            scaleUp();
                            
                        }
                    }
                });
                hover = find;

            }
                
    
        }

        if(hover){
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
        
    } else {
        hover = false;
        document.body.style.cursor = 'default';
    }

}

function onDocumentMouseDown(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2();
    mouse.x =( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.linePrecision = 0.1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    
    if(intersects.length > 0) {
        
        for ( var i = 0;  intersects.length > 0 && i < intersects.length; i++)
        {   
            
            if(intersects[0].object)
            {   
                buildings.forEach(b => {
                    if(intersects[0].object.name == b.name){
                        //mengganti data di modal berdasarkan jenis bangunan (building/house)
                        if(intersects[0].object.parent.name.includes("building")){
                            document.getElementById("image").src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80";
                            document.getElementById("content").innerHTML = "Di jual perkantoran Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus quam eligendi voluptatibus aspernatur quas, optio reiciendis rem autem. Et tenetur illum sapiente non exercitationem aspernatur distinctio ipsum molestiae amet odio.";
                        } else if(intersects[0].object.parent.name.includes("kapal_terbang")){
                            document.getElementById("image").src = "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80";
                            document.getElementById("content").innerHTML = "Diskon akhir tahun Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus quam eligendi voluptatibus aspernatur quas, optio reiciendis rem autem. Et tenetur illum sapiente non exercitationem aspernatur distinctio ipsum molestiae amet odio.";
                            
                        }else {
                            document.getElementById("image").src = "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1578&q=80";
                            document.getElementById("content").innerHTML = "Di jual rumah Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus quam eligendi voluptatibus aspernatur quas, optio reiciendis rem autem. Et tenetur illum sapiente non exercitationem aspernatur distinctio ipsum molestiae amet odio.";
                        }
                        document.getElementById("modal").classList.add("show");
                        openModal = true;
                    }
                });
                

            }
                
    
        }
        
    }

}

document.getElementById("close-modal").addEventListener("click", function(){
    document.getElementById("modal").classList.remove("show");
    openModal = false;
});