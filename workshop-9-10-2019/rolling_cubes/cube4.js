var canvas,engine,scene,camera,light,grid;
    
window.onload = function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera('cam',-1.3,1.0,40, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas,true);
    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(0,1,0), scene);
    light.parent = camera;
    // grid = createGrid();

    createModel();

    engine.runRenderLoop(function() { 
        animate();
        scene.render(); 
    });
    window.addEventListener('resize', function() { engine.resize(); });    
};


function RollingCube(side,index, count) {
    this.index = index;
    this.count = count;
    var parent = this.parent = new BABYLON.Mesh("a", scene);
    var box = this.box = BABYLON.MeshBuilder.CreateBox('s', {size: 1.96}, scene);
    var material = box.material = new BABYLON.StandardMaterial('m',scene);
    var psi = 2*Math.PI*index/count;
    material.diffuseColor.set(0.5+0.5*Math.cos(psi),0.5+0.5*Math.sin(psi),0.5);

    box.setPivotPoint(new BABYLON.Vector3(1,-1,0));
    box.position.set(-1,1,0);
    box.parent = parent;    
    parent.rotation.x = Math.PI/2*side;
    var p = [[0,1],[1,0],[0,-1],[-1,0]][side];
    parent.position.z = p[0];
    parent.position.y = p[1];
    parent.position.x = -count/2;
    
    this.animate(0);
}

RollingCube.prototype.animate = function(u) {

    var q = u * 2;

    var m = this.count-1;
    var t = Math.min(1,q) * (m+3);
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
    x += -2*(m+1) * u;
    var xoffset = 0;
    this.box.position.set(x + xoffset,1,0);
    this.box.rotation.z = -Math.PI/2 * s;
} 

var box;
var boxes = [];

function createModel() {
    var N = 20;
    for(var i=0; i<N; i++) {
        box = new RollingCube(i%4,i, N);
        boxes.push(box);    
    }    
}

function frac(x) { return x-Math.floor(x); }

function animate() {
    var t = performance.now() * 0.0001;
    var n = boxes.length;
    for(var i=0; i<n; i++) {
        boxes[i].animate(frac(t+i/n));
    }
}
