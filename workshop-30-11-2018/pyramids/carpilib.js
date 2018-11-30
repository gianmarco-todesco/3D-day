var canvas;
var engine;
var scene;
var camera;
var Vector3 = BABYLON.Vector3;
var Color4 = BABYLON.Color4;

//
// createGrid()
//
// crea un LineSystem con i tre assi e 
// una griglia che rappresenta
// il piano xz
//
function createGrid() {    
    var m = 50;
    var r = 5;
    var pts = [];
    var colors = [];
    var c1 = new Color4(0.7,0.7,0.7,0.5);
    var c2 = new Color4(0.5,0.5,0.5,0.25);
    var cRed   = new Color4(0.8,0.1,0.1);
    var cGreen = new Color4(0.1,0.8,0.1);
    var cBlue  = new Color4(0.1,0.1,0.8);
    
    var color = c1;
    function line(x0,y0,z0, x1,y1,z1) { 
        pts.push([new Vector3(x0,y0,z0), new Vector3(x1,y1,z1)]); 
        colors.push([color,color]); 
    }
    
    for(var i=0;i<=m;i++) {
        if(i*2==m) continue;
        color = (i%5)==0 ? c1 : c2;
        var x = -r+2*r*i/m;        
        line(x,0,-r, x,0,r);
        line(-r,0,x, r,0,x);
    }
    
    var r1 = r + 1;
    var a1 = 0.2;
    var a2 = 0.5;
    
    // x axis
    color = cRed;
    line(-r1,0,0, r1,0,0); 
    line(r1,0,0, r1-a2,0,a1);
    line(r1,0,0, r1-a2,0,-a1);
        
    // z axis
    color = cBlue;
    line(0,0,-r1, 0,0,r1); 
    line(0,0,r1, a1,0,r1-a2);
    line(0,0,r1,-a1,0,r1-a2);
    
    // y axis
    color = cGreen;
    line(0,-r1,0, 0,r1,0); 
    line(0,r1,0, a1,r1-a2,0);
    line(0,r1,0,-a1,r1-a2,0);
    line(0,r1,0, 0,r1-a2,a1);
    line(0,r1,0, 0,r1-a2,-a1);
    
    ppts = pts;
    ccolors = colors;
    lines = BABYLON.MeshBuilder.CreateLineSystem(
        "lines", {
                lines: pts,
                colors: colors,
                
        }, 
        scene);
    return lines;    
}


function createSimpleMaterial(r,g,b) {
    var material = new BABYLON.StandardMaterial();
    material.diffuseColor = new BABYLON.Color3(r,g,b);
    material.backFaceCulling=false;
    material.twoSidedLighting=true;
    return material;
}


function createDynamicTextureMaterial() {
    var texture = new BABYLON.DynamicTexture(
        "dynamic texture", {width:512, height:512}, scene);   	
	var material = new BABYLON.StandardMaterial("Mat", scene);    
	material.diffuseTexture = texture;
    material.opacityTexture = texture;
    material.backFaceCulling=false;
    material.twoSidedLighting=true;
    return material;
}

function createPlane(r) {
    r = r || 4;
    var plane = BABYLON.MeshBuilder.CreatePlane('plane', { size : r}, scene);
    plane.material = createDynamicTextureMaterial();
    var texture = plane.material.diffuseTexture;
    // texture.hasAlpha = true;
    var ctx = texture.getContext();
    ctx.fillStyle='rgba(150,250,250,0.5)';
    ctx.fillRect(0,0,512,512);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.rect(0,0,512,512);
    ctx.stroke();
    ctx.fillStyle='rgba(200,200,200,0.5)';
    for(var i=0;i<16;i++) {
        for(var j=0;j<16;j++) {
            ctx.fillRect(32*i+8,32*j+8,16,16);
        }
    }
    texture.update();
    return plane;
}


function createPolyhedron(data) {    
    var mesh = new BABYLON.Mesh("custom", scene);
    var positions = [];
    var indices = [];
    var uvs = [];
    var m = 0;
    for(var i=0; i<data.faces.length; i++) {
        var face = data.faces[i];
        var n = face.indices.length;
        for(var j=0; j<n; j++) {
            for(var k=0;k<3;k++) 
                positions.push(data.pts[face.indices[j]*3+k]);
        }
        for(var j=0; j<2*n; j++) uvs.push(face.uv[j]);
        for(var j=2; j<n; j++) {
            indices.push(m);
            indices.push(m+j);
            indices.push(m+j-1);
        }
        m += n;
    }    
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.uvs = uvs;
    // vertexData.normals = normals; //Assignment of normal to vertexData added

    vertexData.applyToMesh(mesh);
    
    /*
    mesh.material = createDynamicTextureMaterial();
    var texture = mesh.material.diffuseTexture;
    var ctx = texture.getContext();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.rect(0,0,256,256);
    ctx.stroke();
    texture.update();
    return mesh;
    */
    mesh.material = createSimpleMaterial(0.2,0.6,0.6);
    

    return mesh;
}


function onClick(cb) {
    var cameraLocked = false;
    scene.onPointerObservable.add (function(evt) {
        if(evt.type == BABYLON.PointerEventTypes.POINTERDOWN && evt.pickInfo.hit)  {
            if(cb(evt)) {
                camera.detachControl(canvas);        
                cameraLocked = true;
                // createSphere(evt.pickInfo.pickedPoint, 0.2);                
            }
        }
        if(evt.type == BABYLON.PointerEventTypes.POINTERUP) {
            if(cameraLocked) { 
                camera.attachControl(canvas, false); 
                cameraLocked = false; 
            }
        }
    },BABYLON.PointerEventTypes.POINTERDOWN | BABYLON.PointerEventTypes.POINTERUP)      
}

window.onload = function() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.2,0.2,0.2);
    camera = new BABYLON.ArcRotateCamera(
        "camera1", 0.0 ,1.0,10, 
        new BABYLON.Vector3(0, 0,0), 
        scene);
    camera.attachControl(canvas, false);
    var light = new BABYLON.PointLight(
        "light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .9;
    light.parent = camera;
    if(window.createScene) window.createScene();
    
    createGrid();
    
    engine.runRenderLoop(function () {
        scene.render();
    });   
    window.addEventListener('resize', function(){
        engine.resize();
    });   

    
}
