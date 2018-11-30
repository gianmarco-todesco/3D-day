var canvas;
var engine;
var scene;
var camera;
var Vector3 = BABYLON.Vector3;
var Color4 = BABYLON.Color4;

// le tre piramidi
var pyramids = [];

// l'angolo di rotazione che "chiude" il cubo
var theta = Math.PI/2 - Math.asin(1/Math.sqrt(3));

// velocità dell'animazione: il cubo si apre e si chiude
// ogni 'period' secondi
var period = 5;

//
// createGrid()
//
// crea un LineSystem con i tre assi e 
// una griglia che rappresenta il piano xz
//
function createGrid() {    
    var m = 50;
    var r = 5;
    var pts = [];
    var colors = [];
    // colore linee principali nella griglia 
    var c1 = new Color4(0.8,0.7,0.7,0.5); // (r,g,b,trasparenza)
    // colore linee secondarie nella griglia
    var c2 = new Color4(0.5,0.5,0.5,0.25);
    // gli assi x,y,z sono colorati in rosso,verde e blu
    var cRed   = new Color4(0.8,0.1,0.1);
    var cGreen = new Color4(0.1,0.8,0.1);
    var cBlue  = new Color4(0.1,0.1,0.8);
    
    // colore corrente (usato da line())    
    var color;
    
    // funzione di comodità: aggiunge una linea del colore 'color'
    function line(x0,y0,z0, x1,y1,z1) { 
        pts.push([new Vector3(x0,y0,z0), new Vector3(x1,y1,z1)]); 
        colors.push([color,color]); 
    }
  
    // disegno la griglia   
    for(var i=0;i<=m;i++) {
        // le linee centrali si sovrapporrebbero agli assi X e Z
        if(i*2==m) continue; 
        // scelgo il colore
        color = (i%5)==0 ? c1 : c2;
        // disegno due linee, parallele a Z e X
        var coord = -r+2*r*i/m;        
        line(coord,0,-r, coord,0,r);
        line(-r,0,coord, r,0,coord);
    }

    // disegno gli assi    
    var r1 = r + 1; // sporgono un po' rispetto alla griglia
    // a1,a2 controllano la forma della "freccia" che indica il 
    // verso di ogni asse
    var a1 = 0.2;    
    var a2 = 0.5;
    
    // asse X
    color = cRed;
    line(-r1,0,0, r1,0,0); 
    line(r1,0,0, r1-a2,0,a1);
    line(r1,0,0, r1-a2,0,-a1);
        
    // asse Z
    color = cBlue;
    line(0,0,-r1, 0,0,r1); 
    line(0,0,r1, a1,0,r1-a2);
    line(0,0,r1,-a1,0,r1-a2);
    
    // asse Y 
    color = cGreen;
    line(0,-r1,0, 0,r1,0); 
    line(0,r1,0, a1,r1-a2,0);
    line(0,r1,0,-a1,r1-a2,0);
    line(0,r1,0, 0,r1-a2,a1);
    line(0,r1,0, 0,r1-a2,-a1);
    
    // creo il LineSystem
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
    
    // posiziono il vertice nell'origine
    mesh.position.set(0,0,0);
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
    createGrid();

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



