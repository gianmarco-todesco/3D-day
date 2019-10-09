var canvas, engine, scene, camera, light;

window.onload = function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.ambientColor.set(1,1,1);
    camera = new BABYLON.ArcRotateCamera('cam',0,0,10, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(0,0,0), scene);
    
    // sun
    var sun = BABYLON.MeshBuilder.CreateSphere('sun', {diameter:3}, scene);
    sun.material = new BABYLON.StandardMaterial("sunmat",scene);
    sun.material.ambientColor.set(1,1,0);
    
    // earth
    var earth = BABYLON.MeshBuilder.CreateSphere('earth', {diameter:1}, scene);
    earth.material = new BABYLON.StandardMaterial("earthmat",scene);
    earth.material.diffuseColor.set(0,1,1);
    earth.material.ambientColor.set(0,.2,.2);
    earth.parent = sun;
    
    // moon
    var moon = BABYLON.MeshBuilder.CreateSphere('moon', {diameter:0.5}, scene);
    moon.material = new BABYLON.StandardMaterial("moonmat",scene);
    moon.material.diffuseColor.set(0.8,0.8,0.8);
    moon.material.ambientColor.set(.6,.6,.6);
    moon.parent = earth;

    // render loop
    engine.runRenderLoop(function() { 
        var time = performance.now() * 0.0001;

        var phi,dist;
        // animate earth
        phi = 2*Math.PI*time;
        dist = 3;
        earth.position.set(dist*Math.cos(phi),0,dist*Math.sin(phi));

        // animate moon
        phi = 7*Math.PI*time;
        dist = 1;
        moon.position.set(dist*Math.cos(phi),0,dist*Math.sin(phi));

        scene.render(); 
    });
}

