var canvas,engine,scene,camera,light,grid;
    
window.onload = function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera('cam',-1.3,1.3,10, new BABYLON.Vector3(0,0,0), scene);
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

var box1, box2

function createModel() {
    var side = 1.9;
    box1 = BABYLON.MeshBuilder.CreateBox('s', {height: 0.1, width: side, depth: side}, scene);
    box2 = BABYLON.MeshBuilder.CreateBox('s', {height: 0.1, width: side, depth: side}, scene);
    box2.parent = box1;
    box2.setPivotPoint(new BABYLON.Vector3(-1,0,0));
    box2.position.x = 2;
}

function animate() {
    box2.rotation.z = Math.PI/2 * (0.5+0.5*Math.cos(performance.now()*0.001));
}
