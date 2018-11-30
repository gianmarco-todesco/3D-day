var ph;
var updateMesh;
var shadowGenerator;

var foo;
var cubes;
var meter;


window.addEventListener('DOMContentLoaded', function() {
    meter = createMeter();
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);
    var scene = new BABYLON.Scene(engine);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    // var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 
        -Math.PI/2, Math.PI/2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 50;
    camera.attachControl(canvas, false);

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1, -2, 0.5), scene);
	light.position = new BABYLON.Vector3(10, 40, -10);

    light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0,0,0), scene);
    light2.intensity = 0.3;
    light2.parent = camera;

    var ground = BABYLON.Mesh.CreateGround("ground", 20, 20, 1, scene, false);
	var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
	groundMaterial.diffuseTexture = new BABYLON.Texture("ground.jpg", scene);
	groundMaterial.diffuseTexture.uScale = 3;
	groundMaterial.diffuseTexture.vScale = 3;
	groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	ground.position.y = -4.0;
	ground.material = groundMaterial;


    shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
	shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 8;
	ground.receiveShadows = true;


    ph = new BABYLON.Mesh("fiveCubes", scene);

    var q = Math.PI/4 - Math.asin(1.0/(Math.tan(2*Math.PI/5)*Math.sqrt(2)));


    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(i/6, 0, (i+1)/6, 1/4);
    }
    
    const rgb = [[.9,.1,0.1],[.9,.45,0.1],[.9,.9,0.1],[.2,.9,0.1],[.1,.8,0.9],[.1,.1,.9] ];
    cubes = [];
    var rot = [];
    for(var i=0;i<5;i++) {
        var box = BABYLON.MeshBuilder.CreateBox("box1", {size:2}, scene);
        //box.enableEdgesRendering();
        //box.edgesWidth = 4.0;
        //box.edgesColor = new BABYLON.Color4(0, 0, 1, 1);     
        
        var material = new BABYLON.StandardMaterial("cubeMat", scene);
        material.diffuseTexture = new BABYLON.Texture("cube-texture.png", scene);
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        material.diffuseColor = new BABYLON.Color3(rgb[i][0], rgb[i][1], rgb[i][2] );

        box.material = material;
        box.rotate(new BABYLON.Vector3(0,1,0), 2*Math.PI*i/5);
        box.rotate(new BABYLON.Vector3(1,0,0), q);
        cubes.push(box);
        rot.push(box.rotationQuaternion.clone());
        box.status = 0;
        box.t = 0;
        shadowGenerator.getShadowMap().renderList.push(box);	
        // box.receiveShadows = true;
        
    }


    foo = function() {

        for(var i=0;i<5;i++) {
            var box = cubes[i];
            if(box.status==0 && box.t==0.0 || box.status==1 && box.t==1.0) continue;
            if(box.status==1) {box.t+=0.01; if(box.t>1.0)box.t=1.0; }
            else {box.t-=0.01; if(box.t<0.0)box.t=0.0; }
            var t = box.t;
            var p0 = new BABYLON.Vector3(0,0,0);
            var p1 = new BABYLON.Vector3((i-2)*3,-3,0);
            // cubes[i].position = BABYLON.Vector3.Lerp(p0,p1,t);
            var p = cubes[i].position;
            p.y = -3 * (1-Math.cos(Math.PI*0.5*t));
            var d = 5*Math.sin(Math.PI*0.5*t);
            var phi = Math.PI * i/4;
            p.x = d * Math.cos(phi);
            p.z = d * Math.sin(phi);
            

            cubes[i].rotationQuaternion = BABYLON.Quaternion.Slerp(
                rot[i],
                BABYLON.Quaternion.RotationYawPitchRoll(phi, 0, 0), 
                t);

      }
    }


    scene.registerBeforeRender(function () {
        foo();
    } );

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    //var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);


    var startMousePos;

    canvas.addEventListener("mousedown", function (evt) {
        startMousePos = { x: evt.clientX, y : evt.clientY };
        console.log("mousedown ", startMousePos);
    });
    canvas.addEventListener("mouseup", function (evt) {
        console.log("mouseup ", startMousePos, evt);
   
        
      });

      canvas.addEventListener("pointerdown", onPointerDown, false);
      canvas.addEventListener("pointerup", onPointerUp, false);

      scene.onDispose = function() {
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointerup", onPointerUp);
      }

      function onPointerDown(e) {
          startMousePos = { x: e.clientX, y : e.clientY };
      }
      function onPointerUp(e) {
        if(!startMousePos) return;        
        var dx = e.clientX - startMousePos.x;
        var dy = e.clientY - startMousePos.y;   
        if(dx*dx+dy*dy>10) return;

         // We try to pick an object
         var pickResult = scene.pick(e.clientX, e.clientY);
         // console.log(pickResult,evt.clientX, evt.clientY);
         if(pickResult.pickedMesh != null) {
             var box = pickResult.pickedMesh;
             box.status = 1-box.status;
             e.preventDefault();
             return false;
         }          
      }


/*
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);

    scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
    }
*/

    var running = false;

    defineSlide('5cubes',
        function() { 
            if(!running) {
                running = true;
                console.log("=============> start ", running);
                engine.runRenderLoop(function() { 
                    if(window.meter) meter.tickStart();
                    scene.render(); 
                    slideTick(); 
                    if(window.meter) meter.tick();
                })
            }
        },
        function() {
            if(running) { 
                console.log("=============> stop ", running);
                running=false; 
                engine.stopRenderLoop();
            }            
        });

    
    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });
});

