var canvas, engine, scene, camera, light;


window.onload = function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.ambientColor.set(1,1,1);
    camera = new BABYLON.ArcRotateCamera('cam',-1.3,1.3,30, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(0,0,0), scene);
    
    // sun
    var sun = BABYLON.MeshBuilder.CreateSphere('sun', {diameter:3}, scene);
    sun.material = new BABYLON.StandardMaterial("sunmat",scene);
    sun.material.ambientColor.set(1,1,0);
    
    createPlanets();

    // render loop
    engine.runRenderLoop(function() { animate(); scene.render(); });
}


function Planet(params) {
    var name = params.name || "planet";
    var radius = params.radius || 1;
    var parent = params.parent;
    this.distance = params.distance || 1;
    this.orbitSpeed = params.orbitSpeed || 0;
    var color = params.color || {r:0.5, g:0.5, b:0.5};

    this.ball = BABYLON.MeshBuilder.CreateSphere(name, {diameter:2*radius}, scene);
    var material = this.ball.material = new BABYLON.StandardMaterial(name + "mat", scene);
    material.diffuseColor.set(color.r, color.g, color.b);
    material.ambientColor.set(color.r*0.5, color.g*0.5, color.b*0.5);    
    if(parent) this.ball.parent = parent;
}

Planet.prototype.orbit = function(time) {
    var phi = time * this.orbitSpeed;
    var d = this.distance;
    this.ball.position.set(d*Math.cos(phi), 0, d*Math.sin(phi));
}


var sun;
var planets = [];

function createPlanets() {
    var sun = BABYLON.MeshBuilder.CreateSphere('sun', {diameter:3}, scene);
    sun.material = new BABYLON.StandardMaterial("sunmat",scene);
    sun.material.ambientColor.set(1,1,0);

    planets.push(new Planet({
        name:"mercury",
        radius: 0.3,
        parent: sun,
        distance: 1.9,
        color: { r: 0.8, g:0.4, b:0.4},
        orbitSpeed: 5,
    }));
    planets.push(new Planet({
        name:"venus",
        radius: 0.8,
        parent: sun,
        distance: 4,
        color: { r: 0.8, g:0.8, b:0.8},
        orbitSpeed: 3,
    }));
    var earth;
    planets.push(earth = new Planet({
        name:"earth",
        radius: 1.0,
        parent: sun,
        distance: 7,
        color: { r: 0.1, g:0.5, b:0.9},
        orbitSpeed: 1,
    }));

    planets.push(new Planet({
        name:"moon",
        radius: 0.3,
        parent: earth.ball,
        distance: 1.5,
        color: { r: 0.5, g:0.5, b:0.5},
        orbitSpeed: 4,
    }));
    
}

function animate() {
    var time = performance.now() * 0.001;
    planets.map(planet => planet.orbit(time));
}
