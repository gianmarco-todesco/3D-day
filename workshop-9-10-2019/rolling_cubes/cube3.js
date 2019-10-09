var canvas,engine,scene,camera,light,grid;
    
window.onload = function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera('cam',-1.3,1.0,20, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(0,1,0), scene);
    light.parent = camera;
    grid = createGrid();

    createModel();

    engine.runRenderLoop(function() { 
        animate();
        scene.render(); 
    });
    window.addEventListener('resize', function() { engine.resize(); });    
};

var box;

function createModel() {
    box = BABYLON.MeshBuilder.CreateBox('s', {size: 2}, scene);
    box.setPivotPoint(new BABYLON.Vector3(1,-1,0));
    box.position.set(-1,1,0);
}

function setPos(t) {
    var m = 5;
    var x=0, s=0;
    if(t<1) { s = -1+t; } 
    else if(t-1<m) {
        i = Math.floor(t-1);
        s = t-1-i;
        x = i*2;
    } else {
        s = Math.min(2, t-1-m);
        x = 2*m;
    }
    box.position.set(-6+x,1,0);
    box.rotation.z = -Math.PI/2 * s;
}

function animate() {
    var t = performance.now() * 0.0001;
    t -= Math.floor(t);
    setPos(t*8);
}
