var canvas,engine,scene,camera,light,ground;
var toruses;

window.addEventListener("DOMContentLoaded", function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(0.3,0.3,0.3);
    camera = new BABYLON.ArcRotateCamera('cam',0,0.3,10, 
        new BABYLON.Vector3(0,0,0), scene);
    // camera.upperBetaLimit = 1.3
    camera.wheelPrecision = 50;
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(1,20,-10), scene);
    light.parent = camera;

    createGrid(scene);


    toruses = [];
    var m = 5;
    for(var i=0;i<m;i++) {
        var phi = Math.PI*2*i/m;
        torus = BABYLON.MeshBuilder.CreateTorus("t", {
            diameter:3.5,
            thickness:0.3,
            tessellation : 70,
        }, scene);
        var mat = torus.material = new BABYLON.StandardMaterial("m",scene);
        mat.diffuseColor.copyFromFloats(
            0.5+0.5*Math.cos(phi),
            0.5,
            0.5+0.5*Math.sin(phi)            
        );
        toruses.push(torus);    
    }

    
    scene.registerBeforeRender(animate);
    engine.runRenderLoop(function() { scene.render(); });
    window.addEventListener('resize', function() { engine.resize(); });
    
});

var rr = 2;

function animate() {
    var m = toruses.length;
    var r = rr;
    var psi = performance.now()*0.001;
    for(var i=0;i<m;i++) {
        var phi = Math.PI*2*i/m;
        var torus = toruses[i];
        torus.rotationQuaternion = new BABYLON.Quaternion();
        torus.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.WORLD);    
        // torus.rotate(BABYLON.Axis.Y, -0.3, BABYLON.Space.WORLD);    
        torus.rotate(BABYLON.Axis.Z, 0.5*phi + psi, BABYLON.Space.WORLD);    
        torus.rotate(BABYLON.Axis.Y, -phi, BABYLON.Space.WORLD);    
        torus.position.copyFromFloats(
            r*Math.cos(phi),
            0,
            r*Math.sin(phi)
        );
    
    }
}
