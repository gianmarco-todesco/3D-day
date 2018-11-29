var canvas,engine,scene,camera,light,boxes;
var n = 50;
    
window.addEventListener("DOMContentLoaded", function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera('cam',0,0,20, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(1,20,-10), scene);
    light.parent = camera;
    


    createModel();
    


    engine.runRenderLoop(function() { 
        animate();
        scene.render(); 
    });
    window.addEventListener('resize', function() { engine.resize(); });
    
});

function createModel() {
    boxes = [];
    var material = new BABYLON.StandardMaterial("bm", scene);
    material.diffuseColor.copyFromFloats(0.8,0.2,0.1);
    material.ambientColor.copyFromFloats(0.8,0.2,0.1);

    for(var i=0;i<n;i++) {
        var pair = new BABYLON.Mesh("b",scene);
        var box = BABYLON.MeshBuilder.CreateBox('s', {height: 0.5, width: 0.5, depth: 2}, scene);
        box.material = material;
        box.parent = pair;
        box.position.z = 1;

        box = BABYLON.MeshBuilder.CreateBox('s', {height: 0.5, width: 0.5, depth: 2}, scene);
        box.material = material;
        box.parent = pair;
        box.position.z = -1;

        boxes.push(pair);
    }
}

function animate() {
    var psi = performance.now()*0.0001;
    var psi2 = psi * 11;
    for(var i=0;i<n;i++) {
        var box = boxes[i];
        var phi = Math.PI*2*i/n + performance.now()*0.001;
        box.rotationQuaternion = new BABYLON.Quaternion();
        box.rotate(BABYLON.Axis.X, phi*0.5 + psi, BABYLON.Space.WORLD);
        box.rotate(BABYLON.Axis.Y, -phi + Math.PI/2, BABYLON.Space.WORLD);
        box.position.copyFromFloats(5*Math.cos(phi), 0, 5*Math.sin(phi));

        var theta = psi2;
        var child = box.getChildren()[0];
        child.position.copyFromFloats(0, Math.sin(theta), 1.1*Math.cos(theta)*1);
        child = box.getChildren()[1];
        child.position.copyFromFloats(0, -Math.sin(theta), -1.1*Math.cos(theta)*1);
        

    }
}
