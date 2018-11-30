var canvas;
var engine;
var scene;
var star;
var spinning = true;
var running = false;

window.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('c');
    engine = new BABYLON.Engine(canvas, true);

    scene = createScene();
        
    engine.runRenderLoop(function() {scene.render(); });
    scene.registerBeforeRender(tick);

    window.addEventListener('resize', function(){ engine.resize(); });            
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

function setSmallStellatedDod() {
    paramAnimator.targetValue = -0.31; 
}
function setGreatStellatedDod() {
    paramAnimator.targetValue = 0.12; 
}
function setTwelveStars() {
    paramAnimator.targetValue = 1.0; 
}


function createScene() {
    var scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI/2, Math.PI/2, 4, new BABYLON.Vector3(0, 0, 0), scene);
    camera.lowerRadiusLimit = 2;
    camera.wheelPrecision = 30;
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    light = new BABYLON.PointLight('light1', new BABYLON.Vector3(0,0,0), scene);
    light.parent = camera;

    star = createModel();
    star.setParam(0.12);
    
    paramAnimator = new ValueController(function() { return star.param; }, function(v) { star.setParam(v); }, 0.1);
    tickables.push(paramAnimator);
    
    tickables.push({
        nextTime : 1,
        tick : function() {
           if(spinning) {
                star.rotation.x += 0.01;
                star.rotation.y += 0.012;
                star.rotation.z += 0.0065;
           }
            
        }
    });
    return scene;    
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
