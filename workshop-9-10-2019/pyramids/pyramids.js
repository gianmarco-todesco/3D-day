var canvas, engine, scene, camera;

var Vector3 = BABYLON.Vector3;
var Color4 = BABYLON.Color4;

var grid;

// le tre piramidi
var pyramids = [];

// l'angolo di rotazione che "chiude" il cubo
var theta = Math.PI/2 - Math.asin(1/Math.sqrt(3));

// velocità dell'animazione: il cubo si apre e si chiude
// ogni 'period' secondi
var period = 5;

// 
// creo l'oggetto piramide 
//
function createPyramid() {
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = [ // coordinate vertici
        -1,-1,-1,  
        1,-1,-1,  
        1,-1,1, 
        -1,-1,1, 
        -1,1,-1
    ];
    vertexData.indices = [ // facce 
        0,2,1, 0,3,2,  // base quadrata (2 triangoli)
        0,1,4,        // facce laterali
        1,2,4,        // ...
        2,3,4,
        3,0,4
    ]; 
    // nota bene: guardando il poliedro i vertici devono
    // essere elencati in senso antiorario
    var mesh = new BABYLON.Mesh("pyramid", scene);    
    vertexData.applyToMesh(mesh);
   
    mesh.material = new BABYLON.StandardMaterial();
    
    // voglio posizionare e ruotare la piramide
    // "tenendola" per il vertice a (1,-1,1)
    mesh.setPivotPoint(new Vector3(1,-1,1));
    
    // posiziono il pivot point nell'origine
    mesh.position.set(-1,1,-1);
    return mesh;    
}


//
// ruota le tre piramidi aprendo e chiudendo il cubo
//
function animate() {
    // t è il numero di secondi dalla partenza del programma
    var t = performance.now()*0.001; 
    // calcolo l'angolo corrente
    // voglio che oscilli fra 0 e theta, facendo un'oscillazione
    // completa ogni 'period' secondi
    var angle = theta * (0.5 + 0.5*Math.sin(t*Math.PI*2/period));
    
    // assegno la rotazione corretta alle tre piramidi
    for(var i=0;i<3;i++) {
        var obj = pyramids[i];
        // parto dalla posizione a riposo
        obj.rotationQuaternion = new BABYLON.Quaternion();
        // ruoto di 45° attorno all'asse verticale
        obj.rotate(BABYLON.Axis.Y, Math.PI/4);
        // ruoto di 'angle' radianti attorno all'asse Z
        obj.rotate(BABYLON.Axis.Z, -angle, BABYLON.Space.WORLD);
        // ruoto in modo da disporre le tre piramidi in 
        // maniera simmetrica attorno all'asse verticale
        obj.rotate(BABYLON.Axis.Y, -Math.PI/4 + 2*Math.PI*i/3,BABYLON.Space.WORLD);
    }    
}

//
// inizializzazione
// creo la scena, la griglia e gli assi, le piramidi, ecc.
// n.b. la funzione viene chiamata quando la pagina è
// stata completamente caricata nel browser ('onload')
window.onload = function() {
    // cerco l'elemento canvas
    canvas = document.getElementById("renderCanvas");
    // creo il componente Babylon che si occupa di disegnare
    // nel canvas usando webgl
    engine = new BABYLON.Engine(canvas, true);
    // creo la scena
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.2,0.2,0.2);
    // la camera (che definisce il punto di vista)
    camera = new BABYLON.ArcRotateCamera(
        "camera1", 0.0 ,1.0,10, 
        new BABYLON.Vector3(0, 0,0), 
        scene);
    // faccio in modo che la camera sia controllabile con il 
    // mouse e la tastiera
    camera.attachControl(canvas, false);
    // creo una luce
    var light = new BABYLON.PointLight(
        "light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .9;
    // attacco la luce alla camera 
    light.parent = camera;

    // creo la griglia
    grid = createGrid();

    // creo le piramidi
    var colors = [
        [1,1,0],
        [1,0,1],
        [0,1,1]
    ];
    for(var i=0;i<3;i++) {
        var obj = createPyramid();
        obj.material.diffuseColor.set(
            colors[i][0],
            colors[i][1],
            colors[i][2]);
        pyramids.push(obj);            
        obj.rotation.y = Math.PI*2*i/3;
    }
    
    engine.onBeginFrameObservable.add(animate);

    engine.runRenderLoop(function () {
        scene.render();
    });   
    window.addEventListener('resize', function(){
        engine.resize();
    });       
}
