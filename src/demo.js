var scene, camera, controls, stats, renderer;
var meshMoon, meshSun, meshFloor, materialSun;
var materials = [], parameters;
var crate, crateTexture, createNormalMap, crateBumpMap;
var dirLightMoon, dirLightSun, ambientLigth, daylight;
var keyboard = {}
var player = { height: 5, speed: 0.2, turnSpeed: Math.PI * 0.02 }
var USE_WIREFRAME = false
var SCREEN = {
    width: window.innerWidth - 10,
    height: window.innerHeight - 10
}

var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000),
    box: new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x4444ff })),
    circle: new THREE.Mesh(
        new THREE.CircleGeometry(1, 32),
        new THREE.MeshBasicMaterial({ color: 0x4444ff })
    )
}

var ISDAY = false, active_keyboard = false, texturesun = true;

var moonScale = 1;
var moonPosition = {
    x: -20,
    y: 30,
    z: -45
};

var sunPosition = {
    x: -20,
    y: 30,
    z: -65
};

var assets = {
    LIGHT: {
        point: null
    },
    OBJ: {
        house: {
            // obj: "src/images/STL/house/house.obj",
            // mtl: "src/images/STL/house/house.mtl",
            // obj: "src/images/MTLOBJ/house/house.obj",
            // mtl: "src/images/MTLOBJ/house/house.mtl",

            obj: "src/images/MTLOBJ/pirate/Models/OBJ/tower.obj",
            mtl: "src/images/MTLOBJ/pirate/Models/OBJ/tower.mtl",
            mesh: null,
            fullmesh: null
        },
        pine: {
            obj: "src/images/MTLOBJ/nature/OBJ/tree_pine_tallSquare_detailed.obj",
            mtl: "src/images/MTLOBJ/nature/OBJ/tree_pine_tallSquare_detailed.mtl",
            mesh: null
        },
        campfire: {
            obj: "src/images/MTLOBJ/lamp/lamp.obj",
            mtl: "src/images/MTLOBJ/lamp/lamp.mtl",
            mesh: null
        }
    },
    PNG: {
        fire: {

        }
    }
}

var meshes = {}

var isLoaded = false
var loadingManager = null
var clock = new THREE.Clock();

function init() {
    //principal scene
    scene = new THREE.Scene()
    //scene.fog = new THREE.FogExp2( 0x000000, 0.008 );
    //scene.fog = new THREE.Fog(0x000000, 2, 15)
    camera = new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000);






    //loading scene



    loadingScreen.box.position.set(0, 0, 5)
    loadingScreen.camera.lookAt(loadingScreen.box.position)
    loadingScreen.scene.add(loadingScreen.box)

    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (item, loaded, total) => {
        console.log(item, loaded, total)
    }

    loadingManager.onLoad = () => {
        isLoaded = true
        onResourcesLoaded();
    }



    //figuras

    //luna
    var geometry = new THREE.SphereGeometry(5, 32, 32);
    var textureLoader = new THREE.TextureLoader(loadingManager);
    var materialMoon = new THREE.MeshLambertMaterial({
        map: textureLoader.load("src/images/textures/moon/moon_1024.jpg"),
        transparent: true,
        opacity: 1
    });

    meshMoon = new THREE.Mesh(geometry, materialMoon);

    meshMoon.position.set(moonPosition.x, moonPosition.y, moonPosition.z);
    meshMoon.scale.set(moonScale, moonScale, moonScale);

    meshMoon.castShadow = true
    scene.add(meshMoon);

    //sol
    var geometry = new THREE.SphereGeometry(5, 80, 80);
    var textureLoader = new THREE.TextureLoader(loadingManager);
    materialSun = new THREE.MeshPhongMaterial({
        map: textureLoader.load("src/images/textures/sun/8k_sun.jpg"),
        transparent: true,
        opacity: 0,
        reflectivity: 1,
        shininess: 30
    });

    meshSun = new THREE.Mesh(geometry, materialSun);

    meshSun.position.set(moonPosition.x, moonPosition.y, moonPosition.z);
    meshSun.scale.set(moonScale, moonScale, moonScale);

    meshSun.castShadow = true
    scene.add(meshSun);



    //piso
    floorLoader = new THREE.TextureLoader(loadingManager);
    textureFloor = floorLoader.load("src/images/textures/floor/Grass.jpg")
    textureFloor.wrapS = THREE.RepeatWrapping;
    textureFloor.wrapT = THREE.RepeatWrapping;
    textureFloor.repeat.set(4, 4);
    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200, 10, 10),
        new THREE.MeshPhongMaterial({ color: 0x999999, map: textureFloor, wireframe: USE_WIREFRAME })
    );

    meshFloor.rotation.x -= (Math.PI / 2);
    meshFloor.receiveShadow = true
    scene.add(meshFloor)


    //luces
    dirLightMoon = new THREE.DirectionalLight(0xffffff, 0.09);//Color, intensidad
    dirLightMoon.position.set(moonPosition.x, moonPosition.y, moonPosition.z).normalize();
    scene.add(dirLightMoon);

    dirLightSunMoon = new THREE.DirectionalLight(0xffffff, 0.7);//Color, intensidad
    dirLightSunMoon.position.set(moonPosition.x, moonPosition.y, moonPosition.z).normalize();
    dirLightSunMoon.target = meshMoon;
    scene.add(dirLightSunMoon)

    dirLightSun = new THREE.DirectionalLight(0xffffff, 0);//Color, intensidad
    dirLightSun.position.set(sunPosition.x, sunPosition.y, sunPosition.z).normalize();
    dirLightSun.target = meshSun;
    scene.add(dirLightSun)

    ambientLigth = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLigth)



    daylight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0);
    scene.add(daylight);



    //Objetos **

    //texturas

    for (var _key in assets.OBJ) {
        (function (key) {
            var mtlLoader = new THREE.MTLLoader(loadingManager);
            mtlLoader.load(assets.OBJ[key].mtl, function (materials) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(loadingManager);
                objLoader.setMaterials(materials);
                objLoader.load(assets.OBJ[key].obj, function (mesh) {

                    mesh.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    })

                    assets.OBJ[key].fullmesh = mesh
                })

                objLoader = new THREE.OBJLoader(loadingManager);
                meshMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                objLoader.load(assets.OBJ[key].obj, function (mesh) {
                    objLoader.setMaterials(meshMaterial);
                    mesh.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    })

                    assets.OBJ[key].mesh = mesh
                })
            })
        })(_key);
    }


    setcamera1rperson();

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(SCREEN.width, SCREEN.height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.BasicShadowMap



    //Particulas

    var geometry = new THREE.BufferGeometry();
    var vertices = [];

    var textureLoader = new THREE.TextureLoader(loadingManager);

    var sprite1 = textureLoader.load('src/images/particles/star_01.png');
    var sprite2 = textureLoader.load('src/images/particles/star_02.png');
    var sprite3 = textureLoader.load('src/images/particles/star_03.png');
    var sprite4 = textureLoader.load('src/images/particles/star_04.png');
    var sprite5 = textureLoader.load('src/images/particles/star_05.png');

    for (var i = 0; i < 10000; i++) {

        var x = Math.random() * 2000 - 1000;
        var y = Math.random() * 2000 - 1000;
        var z = Math.random() * 2000 - 1000;

        vertices.push(x, y, z);

    }

    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    parameters = [
        [[10, 22, -15], sprite2, 20],
        [[0.95, 0.1, 0.5], sprite3, 15],
        [[0.90, 0.05, 0.5], sprite1, 10],
        [[0.85, 0, 0.5], sprite5, 8],
        [[0.80, 0, 0.5], sprite4, 5]
    ];

    for (var i = 0; i < parameters.length; i++) {

        var color = parameters[i][0];
        var sprite = parameters[i][1];
        var size = parameters[i][2];

        materials[i] = new THREE.PointsMaterial({
            size: size,
            map: sprite,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: false
        });
        materials[i].color.setHSL(color[0], color[1], color[2]);

        var particles = new THREE.Points(geometry, materials[i]);

        particles.rotation.x = Math.random() * 16;
        particles.rotation.y = Math.random() * 16;
        particles.rotation.z = Math.random() * -16;

        scene.add(particles);

    }



    //orbitcontrols
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / Math.sqrt(5);

    //stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);


    //GUI

    gui = new dat.GUI();
    guiparameters =
        {
            day: function () { ISDAY = true; },
            night: function () { ISDAY = false },
            orbit: function () { active_keyboard = false },
            keyboard: function () {
                active_keyboard = true;
                setcamera1rperson();
            },
            removetexture: function () {
                texturesun = !texturesun;
                if (!texturesun) {
                    materialSun = meshSun.material.map
                    meshSun.material.map = null;
                    meshSun.material.needsUpdate = true;
                } else {
            
                    meshSun.material.map = materialSun;
                    meshSun.material.needsUpdate = true;
                }
            }
        };

    gui.add(guiparameters, 'day').name("Día");
    gui.add(guiparameters, 'night').name("Noche");
    gui.add(guiparameters, 'orbit').name("Orbitar");
    gui.add(guiparameters, 'keyboard').name("Caminar");
    gui.add(guiparameters, 'removetexture').name("Sol sin textura");
    gui.open();

    document.body.appendChild(renderer.domElement)

    animate()
}

function setcamera1rperson() {

    camera.position.set(12, player.height / 2, 7)
    camera.lookAt(new THREE.Vector3(0, player.height / 2, 0))
}
var startpinepoint = {
    x: -24,
    y: 4
}
var startcampfirepoint = {
    x: -24,
    y: -4
}
var starthousepoint = {
    x: -1,
    y: -10
}

function onResourcesLoaded() {



    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            meshes[`pine${i}${j}`] = assets.OBJ.pine.fullmesh.clone()
            meshes[`pine${i}${j}`].position.set(startpinepoint.x + (i * 10), 0, startpinepoint.y + (j * 10))
            scene.add(meshes[`pine${i}${j}`])
        }
    }

    for (var i = 0; i < 10; i++) {
        for (var j = 1; j < 10; j++) {
            meshes[`pine${i}${j}`] = assets.OBJ.pine.fullmesh.clone()
            meshes[`pine${i}${j}`].position.set((startpinepoint.x + (i * 10)), 0, -(startpinepoint.y + (j * 10)))
            scene.add(meshes[`pine${i}${j}`])
        }
    }

    for (var i = 0; i < 20; i++) {

        meshes[`campfire${i}`] = assets.OBJ.campfire.fullmesh.clone()
        meshes[`campfire${i}`].position.set(startcampfirepoint.x + (i * 5), 0, startcampfirepoint.y)

        scalelamp = 0.2
        meshes[`campfire${i}`].scale.set(scalelamp, scalelamp, scalelamp);
        if (i % 3 == 0) {
            lightfire = new THREE.PointLight(0xffffff, 0.4, 18)
            lightfire.position.set(startcampfirepoint.x + (i * 5), 3, startcampfirepoint.y)
            lightfire.castShadow = true
            lightfire.shadow.camera.near = 0.1

            scene.add(lightfire)
        }
        scene.add(meshes[`campfire${i}`])
    }

    scalehouse = 0.3

    meshes["house"] = assets.OBJ.house.fullmesh.clone()
    meshes["house"].position.set(starthousepoint.x, 0, starthousepoint.y)
    meshes["house"].rotation.y = -Math.PI / 4
    meshes["house"].scale.set(scalehouse, scalehouse, scalehouse);


    scene.add(meshes["house"])
}

var r = 45;
var theta = 0;
var dTheta = 2 * Math.PI / 1000;

var step = 0;

function animate() {

    if (!isLoaded) {
        requestAnimationFrame(animate)
        loadingScreen.box.position.x -= 0.05;
        if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x)
        renderer.render(loadingScreen.scene, loadingScreen.camera)
        return
    }


    requestAnimationFrame(animate)


    stats.update();



    for (var i = 0; i < scene.children.length; i++) {

        var object = scene.children[i];

        if (object instanceof THREE.Points) {

            object.rotation.y = time * (i < 4 ? i + 1 : - (i + 1));

        }

    }

    for (var i = 0; i < materials.length; i++) {

        var color = parameters[i][0];

        var h = (360 * (color[0] + time) % 360) / 360;
        materials[i].color.setHSL(h, color[1], color[2]);
    }

    var delta = clock.getDelta();
    meshMoon.rotation.y += 0.1 * delta;
    meshSun.rotation.y += 0.1 * delta;

    var time = clock.getElapsedTime() * 0.01;
    meshMoon.position.x = Math.cos(time) * 85;
    meshMoon.position.z = Math.sin(time) * -85;


    meshSun.position.x = Math.cos(time) * -85;
    meshSun.position.z = Math.sin(time) * 85;

    dirLightMoon.position.set(meshMoon.position.x, moonPosition.y, meshMoon.position.z).normalize()

    //cambios en la escena si se activa el modo de dia
    if (ISDAY) {
        scene.background = new THREE.Color(0xc6ddff)
        meshSun.material.opacity = 0.8
        meshMoon.material.opacity = 0.1
        ambientLigth.intensity = 0.3
        daylight.intensity = 0.7
        dirLightSun = 1
    } else {

        scene.background = new THREE.Color(0x223317)
        meshSun.material.opacity = 0
        meshMoon.material.opacity = 1
        ambientLigth.intensity = 0.1
        daylight.intensity = 0
        dirLightSun.intensity = 0
    }

    

    if (active_keyboard) {
        controls.enabled = false;
        if (keyboard[37]) {//left arrow
            camera.rotation.y += player.turnSpeed
        }
        if (keyboard[39]) {//rigth arrow
            camera.rotation.y -= player.turnSpeed
        }
        if (keyboard[87]) {//W
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
        }
        if (keyboard[83]) {//S
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y) * player.speed;
        }

        if (keyboard[65]) {//A
            camera.position.x -= Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
        }
        if (keyboard[68]) {//D
            camera.position.x -= Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
        }
    } else {

        controls.update();
        controls.enabled = true;
    }
    renderer.render(scene, camera)
}

function keyDown(event) {
    keyboard[event.keyCode] = true
}

function keyUp(event) {
    keyboard[event.keyCode] = false
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', keyDown)
window.addEventListener('keyup', keyUp)
window.addEventListener('resize', onWindowResize, false);

window.onload = init