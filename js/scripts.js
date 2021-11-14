import * as THREE from 'https://cdn.skypack.dev/three@v0.133.1';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/environments/RoomEnvironment.js';

(function() {
    var mixers = [];
    var mixerLoops = [];
    var buildingScene,carScene,shipScene;
    var animationBuilding,animationCar,animationShip;
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
    var openModal,mulai = false;

    //diplay flex modal
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modal-menu").style.display = "flex";

    //pencahayaan
    const hemiLight = new THREE.HemisphereLight( 0xffffff,0.5);
    hemiLight.position.set( 0, 10, 0 );
    scene.add( hemiLight );

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
        antialias: true,
        alpha: true
    })
    renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.setClearColor( 0x8fffff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setSize( window.innerWidth, window.innerHeight );


    //control camera (dragable di layar)
    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN };
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
        // document.getElementById('loading').style.display = "none";
        gsap.to("#loading", {duration: 1, opacity:0,display:"none"});

        //tambahkan event untuk hover dan click
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );

        

    };

    document.getElementById('cloud-button').addEventListener('click', function(e){
        
        gsap.to(".move-left", {duration: 2, transform:"translateX(-250%)"});
        gsap.to(".move-right", {duration: 2, transform:"translateX(250%)"});
        gsap.to(".move-down", {duration: 2, transform:"translateY(100vh)"});
        gsap.to(".move-up", {duration: 2, transform:"translateY(-100vh)"});
        gsap.to("#model-3d", {duration: 3, opacity:1});
        gsap.to("#menu", {duration: 3, opacity:1});
        mulai = true;
        gsap.to("#cloud-wrapper", {duration: 2,display:"none" });
        gsap.to("#cloud-button", {duration: 2, opacity:0,display:"none"});
        

        setTimeout(function(){
            
            for (let i = 0; i < animationBuilding.length; i++) {
                const animation = animationBuilding[i];
                mixers.push( new THREE.AnimationMixer(buildingScene) );
                
                var action = mixers[mixers.length-1].clipAction( animation);
                action.loop = THREE.LoopOnce;
                action.clampWhenFinished = true;
                action.play();
                
            }

            for (let i = 0; i < animationCar.length; i++) {
                const animation = animationCar[i];
                mixerLoops.push( new THREE.AnimationMixer(carScene) );
                var action = mixerLoops[mixerLoops.length-1].clipAction( animation);
                action.play(); 
            }

            for (let i = 0; i < animationShip.length; i++) {
                const animation = animationShip[i];
                mixerLoops.push( new THREE.AnimationMixer(shipScene) );
                var action = mixerLoops[mixerLoops.length-1].clipAction( animation);
                action.play(); 
            }
        },1000)
    });

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
        animationBuilding = gltf.animations;
        buildingScene = gltf.scene;
        buildingScene.scale.set(0.5,0.5,0.5);
        //menjalankan semua animasi yang ada di model
        // var animations = gltf.animations;
        // for (let i = 0; i < animations.length; i++) {
        //     const animation = animations[i];
        //     mixerLoops.push( new THREE.AnimationMixer(model) );
            
        //     var action = mixers[mixers.length-1].clipAction( animation); // access first animation clip
        //     action.loop = THREE.LoopOnce;
        //     action.clampWhenFinished = true;
        //     action.play();
            
        // }
        
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
        animationCar =  gltf.animations;
        carScene = gltf.scene;
        carScene.scale.set(0.5,0.5,0.5);
        
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
        animationShip =  gltf.animations;
        shipScene = gltf.scene;
        //menjalankan animasi mobil
        // var animations = gltf.animations;
        // for (let i = 0; i < animations.length; i++) {
        //     const animation = animations[i];
        //     mixers.push( new THREE.AnimationMixer(gltf.scene) );
            
        //     var action = mixers[mixers.length-1].clipAction( animation); // access first animation clip
        //     action.play();
        
            
        // }
        
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

        for (let i = 0; i < mixerLoops.length; i++) {
            const mixer = mixerLoops[i];
            if ( mixer ) mixer.update( delta );
            
        }


        //jika mouse tidak lagi hover ke gedung,ukuran akan di kembalikan seperti semula
        scene.traverse( function ( object ) {
            
            if(!hover){
                if(object.scale.x > 1 && object.scale.x > 0){
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
                if(INSPECTED.name != object.name && object.scale.x > 1 && object.scale.x > 0){
                    object.scale.x -= 0.05;
                    object.scale.y -= 0.05;
                    object.scale.z -= 0.05;
                    
                }
                
            }

        } );
        
        if(controls){
            controls.update();
        }
        if(mulai){
            
            
            if(buildingScene.scale.x < 1){
                buildingScene.scale.x += 0.01;
                buildingScene.scale.y += 0.01;
                buildingScene.scale.z += 0.01;
                carScene.scale.x += 0.01;
                carScene.scale.y += 0.01;
                carScene.scale.z += 0.01;
                if(buildingScene.scale.x >= 1){
                    mulai = false;
                    buildingScene.scale.x = 1;
                    buildingScene.scale.y = 1;
                    buildingScene.scale.z = 1;
                    carScene.scale.x  = 1;
                    carScene.scale.y  = 1;
                    carScene.scale.z  = 1;
                }
                
            } else {
                mulai = false;
                buildingScene.scale.x = 1;
                buildingScene.scale.y = 1;
                buildingScene.scale.z = 1;
                carScene.scale.x  = 1;
                    carScene.scale.y  = 1;
                    carScene.scale.z  = 1;
            }
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
        hover = false;
        if(intersects.length > 0) {
            for ( var i = 0;  intersects.length > 0 && i < intersects.length; i++)
            {   
                
                if(intersects[0].object && !openModal && document.getElementById("model-3d").style.opacity == 1)
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
                        if(intersects[0].object.name == b.name && !openModal){
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

    const menuDom = document.getElementById("menu");
    const sceneMenu = new THREE.Scene();
    const cameraMenu = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );

    const rendererMenu = new THREE.WebGLRenderer({
        alpha: true
    });
    
    rendererMenu.setSize( 150, 150 );
    menuDom.appendChild( rendererMenu.domElement );


    cameraMenu.position.z = 5;
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, 0, 1 );
    directionalLight.intensity = 1;
    directionalLight.castShadow = true;
    var side = 20;
    directionalLight.shadow.camera.top = side;
    directionalLight.shadow.camera.bottom = -side;
    directionalLight.shadow.camera.left = side;
    directionalLight.shadow.camera.right = -side;
    directionalLight.shadow.camera.far = 1000;
    sceneMenu.add( directionalLight );

    const light2 = new THREE.AmbientLight( 0x404040 ); // soft white light
    sceneMenu.add( light2 );

    rendererMenu.outputEncoding = THREE.sRGBEncoding;
    // renderer.setClearColor( 0x8fffff, 1);
    rendererMenu.shadowMap.enabled = true;
    rendererMenu.shadowMap.type = THREE.PCFSoftShadowMap;

    const loaderMenu = new GLTFLoader();

    //meload model kota
    var menuObject;
    loaderMenu.load( 'model/balon_udara.gltf', function ( gltf ) {
        menuObject = gltf.scene;
        menuObject.position.set(0,-1,0)
        menuObject.rotation.set(0,1.5,0)
        sceneMenu.add(menuObject);
        document.addEventListener( 'mousedown', onDocumentMenuMouseDown, false );
        
    }, undefined, function ( error ) {

        console.error( error );

    } );

    function animateMenu() {
        requestAnimationFrame( animateMenu );
       
        if(menuObject){
            menuObject.rotation.y += 0.01;
        }
        rendererMenu.render( sceneMenu, cameraMenu );
    }
    animateMenu();
    
    // document.getElementById('menu').addEventListener('click', function(e){
    //     document.getElementById("modal-menu").style.display = "flex";
    // });

    function onDocumentMenuMouseDown(event) {
        var rect = rendererMenu.domElement.getBoundingClientRect();
        var mouse = new THREE.Vector2();
        mouse.x =( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
        mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 0.1;
        raycaster.setFromCamera( mouse, cameraMenu );
        var intersects = raycaster.intersectObjects( sceneMenu.children );
        
        if(intersects.length > 0) {
            
            for ( var i = 0;  intersects.length > 0 && i < intersects.length; i++)
            {   
               
                if(!openModal){
                    document.getElementById("modal-menu").classList.add("show");
                    openModal = true;
                }
            }
            
        }

    }

    document.getElementById("close-modal-menu").addEventListener("click", function(){
        document.getElementById("modal-menu").classList.remove("show");
        openModal = false;
       
    });
 })();
