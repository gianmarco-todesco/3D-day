var canvas;
var engine;
var scene;
var star;
var spinning = true;
var running = false;
var meter;

function renderLoop() {
    if(window.meter) meter.tickStart();
    tick();
    scene.render();
    slideTick();
    if(window.meter) meter.tick();
}

window.addEventListener('DOMContentLoaded', function() {
    meter = createMeter();
    canvas = document.getElementById('renderCanvas');
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);

    initializeScene();
        

    
    defineSlide('stars',
        function() { engine.runRenderLoop(renderLoop);},
        function() { engine.stopRenderLoop(renderLoop);});
    


    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });            
    
    window.addEventListener("keydown", function(e) {                
        console.log(e.keyCode);
        if(e.keyCode == 49) paramAnimator.targetValue = -0.31; 
        else if(e.keyCode == 50) paramAnimator.targetValue = 0.12; 
        else if(e.keyCode == 51) paramAnimator.targetValue = 1.0; 

        else if(e.keyCode == 80) spinning = !spinning;
    });

    var mouseDown = false;
    var oldx, oldy;
        
    /*
    scene.onPointerDown = function(e) {
        if(e.button == 0) { 1
            mouseDown = true;
            camera.detachControl(canvas);
            oldx = e.offsetX;
            oldy = e.offsetY;            
        }
    };
    
     scene.onPointerUp = function(e) {
        console.log(e, mouseDown);
        if(mouseDown) {
            camera.attachControl(canvas, false);
            mouseDown = false;                
        }
    };
    
    scene.onPointerMove = function(e) {
        if(mouseDown) {
            var dx = e.offsetX - oldx; oldx = e.offsetX;
            var dy = e.offsetY - oldy; oldy = e.offsetY;
            stage.setTime(stage.t + dx*0.01);
            console.log(dx,dy);
        }
    };
    */

});

function ValueController(getter, setter, maxSpeed) {
    this.setter = setter;
    this.getter = getter;
    this.maxSpeed = maxSpeed;
}

ValueController.prototype.tick = function() {
    var t = performance.now(); 
    if(!this.oldTime) { this.oldTime = t; return; }
    var dt = (t - this.oldTime)*0.001;
    this.oldTime = t;
    if(this.targetValue === undefined) return;
    var targetValue = this.targetValue;
    var currentValue = this.getter();
    if(currentValue == targetValue) return;
    var d = targetValue - currentValue;
    var stop;
    var speed = 0.5;
    if(targetValue > currentValue) {currentValue += dt * speed; stop = currentValue>=targetValue; }
    else  {currentValue -= dt * speed; stop = currentValue<=targetValue; }
    if(stop) currentValue = targetValue;
    this.setter(currentValue);
    xx = currentValue;
}

var paramAnimator;
var tickables = [];
function tick() {
    tickables.forEach(function(tickable) { tickable.tick(); });
}




function initializeScene() {

    camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI/2, Math.PI/2, 4, new BABYLON.Vector3(0, 0, 0), scene);
    camera.lowerRadiusLimit = 2;
    camera.wheelPrecision = 30;
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(0,0,0), scene);
    light.parent = camera;

    // light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(3,-1,-30), scene);
    
    // createAxes() ;
    star = createModel();
    star.setParam(0.12);
    
    paramAnimator = new ValueController(function() { return star.param; }, function(v) { star.setParam(v); }, 0.1);
    tickables.push(paramAnimator);
    
    tickables.push({
        nextTime : 1,
        tick : function() {
            /*
            var t = performance.now() * 0.001;
            if(t>this.nextTime) {
                this.nextTime = t + 1.0 + Math.random() * 4.0;
                if(star.param>0.0) paramAnimator.targetValue = -0.34; 
                else paramAnimator.targetValue = -0.34; 
                if(Math.random()>0.8) paramAnimator.targetValue = 1.2;
            }
            */
           if(spinning) {
                star.rotation.x += 0.01;
                star.rotation.y += 0.012;
                star.rotation.z += 0.0065;
           }
            
        }
    });
    
}


function createEdge(scene, p0,p1) {
    var distance = BABYLON.Vector3.Distance(p0, p1);
    var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", distance, 0.05, 0.05, 36, scene, true);    
    cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, distance / 2, 0)); 

    var dx = p0.x-p1.x;
    var dz = p0.z-p1.z;
    var r2 = dx*dx+dz*dz;
    
    var v1 = p1.subtract(p0);
    v1.normalize();
    if(r2<0.001)
    {
        if(p1.y>p0.y) cylinder.position = p0;
        else cylinder.position = p1;
    }
    else                
    {
        var v2 = new BABYLON.Vector3(0, 1, 0);                    
        var axis = BABYLON.Vector3.Cross(v2, v1);
        axis.normalize();

        var angle = Math.acos(BABYLON.Vector3.Dot(v1, v2));
        cylinder.position = p0;
        cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
    }
    return cylinder;           
}


function createAxes() {
 
    var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 0.1, scene);            
    var edge;

    edge = createEdge(scene, new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(1,0,0));
    edge.material = new BABYLON.StandardMaterial("redAxisMat", scene);
    edge.material.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);

    edge = createEdge(scene, new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,1,0));
    edge.material = new BABYLON.StandardMaterial("greenAxisMat", scene);
    edge.material.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);

    edge = createEdge(scene, new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,0,1));
    edge.material = new BABYLON.StandardMaterial("blueAxisMat", scene);
    edge.material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.8);

}


// n.b. circumscribed sphere radius = 2.0;

function PolyhedronData(srcData) {
    this.centers = [];
    this.matrices = [];
    this.rotations = [];
    var data = srcData;
    var pts = this.pts = [];
    for(var i=0; i<data.pts.length; i++) {
        var c = data.pts[i];
        pts.push(new BABYLON.Vector3(c[0],c[1],c[2]));
    }    
    var factor = 2.0/pts[0].length(); 
    for(var i=0; i<pts.length; i++) pts[i].scaleInPlace(factor);
    
    for(var i=0; i<data.faces.length; i++) {
        var f = data.faces[i];
        var c = new BABYLON.Vector3(0,0,0);
        for(var j=0;j<f.length;j++) c.addInPlace(pts[f[j]]);
        c.scaleInPlace(1.0/f.length);
        this.centers.push(c);
        
        var e0 = new BABYLON.Vector3().copyFrom(pts[f[0]]).subtract(c).normalize();
        var e2 = new BABYLON.Vector3().copyFrom(c).normalize();
        var e1 = BABYLON.Vector3.Cross(e2,e0).normalize();
        
        var matrix = BABYLON.Matrix.FromValues(e0.x,e0.y,e0.z,0, e1.x,e1.y,e1.z,0, e2.x,e2.y,e2.z,0, c.x,c.y,c.z,1);
        this.matrices.push(matrix); 
        var sc = new BABYLON.Vector3(), pos = new BABYLON.Vector3(), rot = new BABYLON.Quaternion();
        matrix.decompose(sc,rot,pos);
        this.rotations.push(rot);
    }
    this.faceCount = data.faces.length;
    this.vertexPerFace = data.faces[0].length;
    
    this.faceRadius = this.centers[0].subtract(pts[data.faces[0][0]]).length();    
    var p = new BABYLON.Vector3().copyFrom(pts[data.faces[0][0]]).add(pts[data.faces[0][1]]).scaleInPlace(0.5);
    this.faceInRadius = this.centers[0].subtract(p).length();  

    this.inRadius = this.centers[0].length();
    this.foldAngle = Math.PI - Math.atan(this.inRadius/this.faceInRadius)*2;
}
        
var polyhedraData = {
    dod : new PolyhedronData({
        pts : [
            [0.607062,0,0.794654], [0.982247,0,0.187592], [0.187592,0.57735,0.794654], [0.303531,0.934172,0.187592],
            [-0.491124,0.356822,0.794654], [-0.794655,0.57735,0.187592], [-0.491123,-0.356822,0.794654], [-0.794654,-0.577351,0.187592], 
            [0.187593,-0.57735,0.794654], [0.303532,-0.934172,0.187592], [-0.303532,0.934172,-0.187592], [-0.187593,0.57735,-0.794654], 
            [0.794654,0.577351,-0.187592], [0.491123,0.356822,-0.794654], [0.794655,-0.57735,-0.187592], [0.491124,-0.356822,-0.794654], 
            [-0.303531,-0.934172,-0.187592], [-0.187592,-0.57735,-0.794654], [-0.982247,0,-0.187592], [-0.607062,0,-0.794654]],
        faces : [
            [0,2,4,6,8], [2,0,1,12,3], [0,8,9,14,1], [8,6,7,16,9], [6,4,5,18,7], [4,2,3,10,5], 
            [3,12,13,11,10], [1,14,15,13,12], [9,16,17,15,14], [7,18,19,17,16], [5,10,11,19,18], [11,13,15,17,19]]
    }),
    
    
    ico : new PolyhedronData({
        pts : [
            [-0.525731,-0.850651,0], [0.525731,-0.850651,0], [-0.525731,0.850651,0], [0.525731,0.850651,0], 
            [-0.850651,0,-0.525731], [-0.850651,0,0.525731], [0.850651,0,-0.525731], [0.850651,0,0.525731], 
            [0,-0.525731,-0.850651], [0,0.525731,-0.850651], [0,-0.525731,0.850651], [0,0.525731,0.850651]],
        faces : [
            [3,9,2], [6,9,3], [8,9,6], [4,9,8], [2,9,4], [1,10,0], [0,10,5], [5,10,11], [10,7,11], [7,10,1],
            [2,5,11], [3,11,7], [1,6,7], [0,8,1], [4,0,5], [2,11,3], [3,7,6], [6,1,8], [4,8,0],[2,4,5]]
    }),

    oct : new PolyhedronData({
        pts : [[0,0,-1], [0,0,1], [0,-1,0], [0,1,0], [-1,0,0], [1,0,0]],
        faces : [[0,3,5], [0,4,3], [0,2,4], [0,5,2], [1,5,3], [1,3,4], [1,4,2], [1,2,5]]
    }),

    cube : new PolyhedronData({
        pts : [
            [-0.57735,-0.57735,-0.57735], [0.57735,-0.57735,-0.57735], [-0.57735,0.57735,-0.57735], [0.57735,0.57735,-0.57735], 
            [-0.57735,-0.57735,0.57735], [0.57735,-0.57735,0.57735], [-0.57735,0.57735,0.57735], [0.57735,0.57735,0.57735]],
        faces : [[0,2,3,1], [1,5,4,0], [3,7,5,1], [2,6,7,3], [0,4,6,2], [4,5,7,6]],
    }),
    
    tet : new PolyhedronData({
        pts : [[-0.57735,-0.57735,-0.57735], [0.57735,0.57735,-0.57735], [0.57735,-0.57735,0.57735], [-0.57735,0.57735,0.57735]],
        faces : [[0,1,2], [1,0,3], [2,1,3], [0,2,3]],    
    }),
};        
  

/*
function step(t, a,b) { return t<a?0.0:t>b?1.0:(t-a)/(b-a); }
function smooth(t) { return t*t*(3-2*t); }
function smoothstep(t, a,b) { return smooth(step(t,a,b)); }
*/



function createStarFace() {
    var n = 5;
    var h = 0.01;
    var r1 = 1; 
    var r0 = r1 * Math.cos(2*Math.PI/5)/Math.cos(Math.PI/5);    

    var positions = [];
    var normals = [];
    var indices = [];
    var uvs = [];

    // up faces
    positions.push(0,0,h);
    uvs.push(0.5,0.5);
    for(var i=0;i<n;i++) {
        var phi;
        phi = 2*Math.PI*i/n;
        positions.push(r1*Math.cos(phi),r1*Math.sin(phi),h);
        phi = 2*Math.PI*(i+0.5)/n;
        positions.push(r0*Math.cos(phi),r0*Math.sin(phi),h);
        uvs.push(0,1, 0.5,1);
    }
    for(var i=0;i<2*n+1;i++) normals.push(0,0,1);    
    for(var i=0;i<2*n;i++) indices.push(0,1+((i+1)%(2*n)),1+i);
    var k = 2*n+1;
        
    // side faces
    for(var i=0;i<2*n;i++) {
        var i1 = (i+1)%(2*n);
        var j = (i+1)*3;
        positions.push(positions[j], positions[j+1], h);
        positions.push(positions[j], positions[j+1], -h);
        uvs.push(i,0.1,i,0.3);

        j = (i1+1)*3;
        positions.push(positions[j], positions[j+1], h);
        positions.push(positions[j], positions[j+1], -h);
        uvs.push(i+1,0.1,i+1,0.3);

        var phi = Math.PI*(i+(i%2==0 ? 2 : -1))/n;
        var nx = Math.cos(phi), ny = Math.sin(phi);
        for(var j=0;j<4;j++) normals.push(nx,ny,0);
        indices.push(k,k+2,k+1, k+1,k+2,k+3);
        k+=4;
    }
    // console.log(positions.length, normals.length);
    
    // bottom faces
    for(var i=0;i<2*n+1;i++) {        
        var j = i*3;
        positions.push(positions[j], positions[j+1], -positions[j+2]);
        j = i*2;
        uvs.push(uvs[j], uvs[j+1]);
        
    }
    for(var i=0;i<2*n+1;i++) normals.push(0,0,-1);
    for(var i=0;i<2*n;i++) indices.push(k,k+1+i,k+1+((i+1)%(2*n)));
    
    var ph = new BABYLON.Mesh('fiveStarFaceMesh', scene);
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    vertexData.applyToMesh(ph);
    // ph.convertToFlatShadedMesh();

    return ph;
}


function createModel() {

    var pData = polyhedraData.dod;
    
    var mesh = new BABYLON.Mesh('star', scene);
    mesh.isVisible = false;
    var faces = mesh.faces = [];
    
    var face = createStarFace();
    face.material =  new BABYLON.StandardMaterial("fiveStarFaceMaterial", scene);
    face.material.diffuseColor = new BABYLON.Color3(.9,.9,.9);
    face.material.diffuseTexture = new BABYLON.Texture("star-texture.png", scene);
    face.material.specularColor = new BABYLON.Color3(.1,.1,.1);
    faces.push(face);
    for(var i=0;i<11;i++) {
        faces.push(faces[0].createInstance(name + 'fiveStarFaceMesh_inst' + i));
    }
    
    for(var i=0;i<12;i++) {
        var face = faces[i];
        face.parent = mesh;
        face.position.copyFrom(pData.centers[i]);
        face.rotationQuaternion = pData.rotations[i];
    }
    
    mesh.setParam = function(t) {
        mesh.param = t;
        for(var i=0;i<12;i++) {
            var face = faces[i];
            face.position.copyFrom(pData.centers[i]).scaleInPlace(t);
        }
    }
    
    mesh.setParam(0);
    
    return mesh;  
}
  
  