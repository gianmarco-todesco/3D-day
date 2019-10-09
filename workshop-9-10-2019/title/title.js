var canvas,engine,scene,camera;
var light, emilight;
var moebius, cylinder;

//-----------------------------------------------------------------------------

function RoundRectFunction(w,h,r) {
    this.w = w;
    this.h = h;
    this.r = r;
    this.x0 = -w/2;
    this.x1 = this.x0 + r;
    this.x3 = w/2;
    this.x2 = this.x3 - r;
    this.y0 = -h/2;
    this.y1 = this.y0 + r;
    this.y3 = h/2;
    this.y2 = this.y3 - r;    
    var c = 0.5*Math.PI*r;
    this.s0 = this.x2-this.x1;
    this.s1 = this.s0 + c;
    this.s2 = this.s1 + this.y2 - this.y1;
    this.s3 = this.s2 + c;
}

// t => (x,y)
RoundRectFunction.prototype.crv = function(t) {
    t = t - Math.floor(t);
    var sgn = 1;
    if(t>=0.5) { t-=0.5; sgn = -1; }
    var s = t*2*this.s3;
    var x,y,nrmx,nrmy;
    if(s<this.s0) { 
        x = this.x1 + s;
        y = this.y3; 
        nrmx = 0; 
        nrmy = 1;
    }
    else if(s<this.s1) { 
        var phi = (s-this.s0)/this.r;
        var cs = Math.cos(phi), sn = Math.sin(phi);
        x = this.x2 + sn * this.r;
        y = this.y2 + cs * this.r; 
        nrmx = sn; 
        nrmy = cs;
    } else if(s<this.s2) { 
        x = this.x3; 
        y = this.y2 - (s-this.s1); 
        nrmx = 1;
        nrmy = 0;
    } else {
        var phi = (s-this.s2)/this.r;
        var cs = Math.cos(phi), sn = Math.sin(phi);
        x = this.x2 + cs * this.r;
        y = this.y1 - sn * this.r; 
        nrmx = cs; 
        nrmy = -sn;
    }
    return { x : sgn * x, y : sgn*y, nrmx : sgn*nrmx, nrmy : sgn*nrmy };    
}

//-----------------------------------------------------------------------------

function Shape(params) {
    params = params || {};
    this.n = params.n || 30;
    this.m = params.m || 30;
    this.compute = params.compute;
	this.rep = params.rep || 1;
	
    this.build();
}

Shape.prototype.build = function() {
    var positions = this.positions = [];
    var normals = this.normals = [];
    var uvs = [];
    var indices = [];
    var n=this.n, m=this.m;
    for(var i=0;i+1<n;i++)
    {
        for(var j=0;j+1<m;j++)
        {
            var k = i*m+j;
            indices.push(k,k+m,k+1+m, k,k+1+m,k+1);
        }
    }
    for(var i=0;i<n;i++)
    {
        var u = i/(n-1) * this.rep;
        for(var j=0;j<m;j++)
        {
            var v = j/(m-1);
            uvs.push(u,v);
            positions.push(0,0,0);
            normals.push(0,0,0);            
        }
    }
    this.compute(n,m,positions,normals);

    var mesh = new BABYLON.Mesh("moebius", scene);
    var mat = mesh.material = new BABYLON.StandardMaterial("moebiusMat", scene);
    mat.diffuseColor.set(0.8,0.8,0.8);
	mat.ambientColor.set(0.4,0.4,0.4);
    mat.specularColor.set(0.8,0.8,0.8);
    mat.roughness = 0.001;    
    	
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    vertexData.indices = indices;
    vertexData.applyToMesh(mesh, true);
    this.mesh = mesh;
}

Shape.prototype.updateVertices = function() {
    this.compute(this.n,this.m,this.positions,this.normals);
    this.mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);
}

//-----------------------------------------------------------------------------

function MoebiusFunction(w,h,r) {
    this.sectionFun = new RoundRectFunction(w,h,r);
    this.r0 = 3;
    this.offx = 0;
    this.offy = 0;
    this.rep = 1;
    
}

MoebiusFunction.prototype.setPhi = function(phi) {
    this.phi = phi;
    var theta = this.theta = phi*0.5;
    this.cosPhi = Math.cos(phi);
    this.sinPhi = Math.sin(phi);
    this.cosTheta = Math.cos(theta);
    this.sinTheta = Math.sin(theta);
}

MoebiusFunction.prototype.mapPoint = function(x,y) {
    x += -this.offx;
    y += this.offy;
    var x1 = -x * this.cosTheta - y * this.sinTheta + this.r0;
    var y1 = -x * this.sinTheta + y * this.cosTheta;
    return { 
        x : x1 * this.cosPhi,
        y : y1,
        z : x1 * this.sinPhi
    };
}

MoebiusFunction.prototype.mapNormal = function(x,y) {
    var x1 = -x * this.cosTheta - y * this.sinTheta;
    var y1 = -x * this.sinTheta + y * this.cosTheta;
    return { 
        x : x1 * this.cosPhi,
        y : y1,
        z : x1 * this.sinPhi
    };
}

MoebiusFunction.prototype.compute = function(n,m,positions,normals) {
    var sectionFun = this.sectionFun;
    var section = [];
    for(var j=0; j<m; j++) {
        var q = sectionFun.crv(j/(m-1));
        section.push(q.x,q.y,q.nrmx,q.nrmy);
    }
    var k = 0;
    for(var i=0; i<n; i++) {
        var phi = this.rep * Math.PI*2*i/(n-1);
        this.setPhi(phi);
        var p;
        
        var h = 0
        for(var j=0; j<m; j++) {
            var x = section[h];
            var y = section[h+1];
            var nx = section[h+2];
            var ny = section[h+3];
            h += 4;
            p = this.mapPoint(x,y);
            positions[k] = p.x;
            positions[k+1] = p.y;
            positions[k+2] = p.z;
            p = this.mapNormal(nx,ny);
            normals[k] = p.x;
            normals[k+1] = p.y;
            normals[k+2] = p.z;
            k += 3;
        }
    }
}

//-----------------------------------------------------------------------------

function createMoebius() {
    var foo = new MoebiusFunction(1.0, 0.1, 0.05);    
    var shape = new Shape({
        n:80,
        m:80,
        compute:function(n,m,pp,nn) { return foo.compute(n,m,pp,nn); },
		rep: 2
    });

	var sz = 1024;
	var texture = new BABYLON.DynamicTexture("texture", sz, scene);
	texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
	shape.mesh.material.diffuseTexture = texture;
	var ctx = texture.getContext();
	ctx.fillStyle = "teal";
	ctx.fillRect(0,0,sz,sz);
	ctx.beginPath();
	for(var i=0;i<sz;i+=32) {
		ctx.moveTo(i,0);
		ctx.lineTo(i,sz);
	}
	for(var i=0;i<sz;i+=64) {
		ctx.moveTo(0,i);
		ctx.lineTo(sz,i);
	}
    ctx.strokeStyle = "#000000";
    // ctx.lineWidth = 5;
    ctx.stroke();
	texture.update();
	

    return shape;
}

//-----------------------------------------------------------------------------

function createCylinder() {
	var foo = new MoebiusFunction(1.0, 0.1, 0.05);
	foo.offx = 0;
	foo.offy = 0.5;
	foo.rep = 2;
    
    var orbit = new RoundRectFunction(2.2, 0.3, 0.1);

	var shape = new Shape({
		n:240,
		m:40,
		compute:function(n,m,pp,nn) { 
            var t = performance.now();
            var q = orbit.crv(t*0.0001);
            foo.offx = q.x;
			foo.offy = q.y;                
			return foo.compute(n,m,pp,nn); 
		},
		rep: 4
	});
	shape.theta = 0;
	scene.registerBeforeRender(function() {
		// shape.theta += 0.1;
		shape.updateVertices();
	});
    
	var sz = 1024;
	var texture = new BABYLON.DynamicTexture("texture", sz, scene);
	texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
	shape.mesh.material.diffuseTexture = texture;
	var ctx = texture.getContext();
	ctx.fillStyle = "orange";
	ctx.fillRect(0,0,sz,sz);
	ctx.beginPath();
	for(var i=0;i<sz;i+=32) {
		ctx.moveTo(0,i);
		ctx.lineTo(sz,i);
		ctx.moveTo(i,0);
		ctx.lineTo(i,sz);
	}
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	texture.update();
	
	
	
    return shape;
}

//-----------------------------------------------------------------------------

function showWorldAxis(size) {
    var makeTextPlane = function(text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
    return plane;
     };
    var axisX = BABYLON.Mesh.CreateLines("axisX", [ 
      BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0), 
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0), 
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
};

//-----------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
	scene.ambientColor.set(1,1,1);
    camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 
        0.4,0.8,
        10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    camera.wheelPrecision=50;

    // showWorldAxis(5);
    
    light = new BABYLON.PointLight("l1", new BABYLON.Vector3(0, 0.3, 0), scene);
    light.intensity = 0.4;
    light.parent = camera;

    light = new BABYLON.PointLight("l2", new BABYLON.Vector3(-0.3, 10, -3), scene);
    light.intensity = 0.4;
    
    moebius = createMoebius();
    cylinder = createCylinder();
    
    window.addEventListener('resize', () => engine.resize());
    engine.runRenderLoop(()=>{ scene.render(); });  
});


