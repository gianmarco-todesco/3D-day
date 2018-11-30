var canvas,engine,scene,camera,light,ground;
var shadowGenerator;
var n = 8;

var box;
var boxes = [];

window.addEventListener("DOMContentLoaded", function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(0.3,0.3,0.3);
    camera = new BABYLON.ArcRotateCamera('cam',0,1.3,30, new BABYLON.Vector3(0,0,0), scene);
    camera.upperBetaLimit = 1.3
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(1,20,-10), scene);
    light.parent = camera;

    shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.setDarkness(0.5);
    shadowGenerator.usePoissonSampling = true;
    
    ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 30, height: 30, subdivsions: 4}, scene);
    ground.material = new BABYLON.StandardMaterial("m",scene);
    ground.material.diffuseColor.copyFromFloats(.3,.5,0.6);
    ground.material.ambientColor.copyFromFloats(.3,.5,0.6);

    for(var i=0; i<n; i++) {
        box = BABYLON.MeshBuilder.CreateBox("b", {size:2}, scene);
        box.material = new BABYLON.StandardMaterial("m",scene);
        box.material.diffuseColor.copyFromFloats(0.8,0.7,.1);
        box.material.ambientColor.copyFromFloats(0.8,0.7,.1);
        box.position.y = 1;
    
        boxes.push(box);
        shadowGenerator.addShadowCaster(box);
    }

    
    ground.receiveShadows = true;

    engine.runRenderLoop(function() { 
        animate();
        scene.render(); 
    });
    window.addEventListener('resize', function() { engine.resize(); });
    
});

function rollx(box, x) {
    var i = Math.floor(x);
    var f = x - i;
    box.setPivotPoint(new BABYLON.Vector3(1,-1,0));        
    box.rotation.z = -(x-i)*Math.PI/2;
    box.position.x = 2*i;
}
function rollz(box, z) {
    var i = Math.floor(z);
    var f = z - i;
    box.setPivotPoint(new BABYLON.Vector3(0,-1,1));        
    box.rotation.x = (z-i)*Math.PI/2;
    box.position.z = 2*i;
}

function tour(box, d, t) {
    t -= Math.floor(t);
    t = t*d;
    var i = Math.floor(t);
    t = t-i;
    if(i==0) { box.position.z = 0; box.rotation.copyFromFloats(0,0,0); rollx(box,t*d); }
    else if(i==1) { box.position.x = d*2; box.rotation.copyFromFloats(0,0,0); rollz(box, t*d); }
    else if(i==2) { box.position.z = d*2; box.rotation.copyFromFloats(0,0,0); rollx(box,(1-t)*d); }
    else { box.position.x = 0; box.rotation.copyFromFloats(0,0,0); rollz(box,(1-t)*d); }
}

function animate() {
    var t = performance.now()*0.00006;

    for(var i=0;i<n;i++)
      tour(boxes[i],4,t + i/n);
    
}
