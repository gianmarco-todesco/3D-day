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

var faces = [];

function createModel() {
    var side = 1.9;
    var box = BABYLON.MeshBuilder.CreateBox('s', {height: 0.1, width: side, depth: side}, scene);
    box.material = new BABYLON.StandardMaterial('m',scene);
    box.material.diffuseColor.set(0.2,0.5,0.7);

    function createFace(parent) {
        var joint = new BABYLON.Mesh('a',scene);
        joint.parent = parent;
        var face = box.createInstance('f1');
        face.parent = joint;
        face.setPivotPoint(new BABYLON.Vector3(-1,0,0));
        face.position.x = 2;
        return face;    
    }

    var face;
    for(var i=0; i<4; i++) {
        face = createFace(box);
        face.parent.rotation.y = i * Math.PI/2;
        faces.push(face);    
    }
    face = createFace(faces[0]);
    faces.push(face);
}

function animate() {
    var angle = Math.PI/2 * (0.5+0.5*Math.cos(performance.now()*0.001));
    faces.forEach(face=> { face.rotation.z = angle } );
}
