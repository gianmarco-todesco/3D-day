function createMeter() {

    var meter = new FPSMeter(null, {
        interval:100,
        smoothing:10,
        show: 'fps',
        decimals: 1,
        maxFps: 60,
        threshold: 100,
        
        position: 'absolute',
        zIndex: 10,
        left: '20px',
        top: '20px',
        theme: 'dark',
        heat: 1,
        graph: 1,
        history: 20
    });    
    return meter;    
}

function step(t, a,b) { return t<a?0.0:t>b?1.0:(t-a)/(b-a); }
function smooth(t) { return t*t*(3-2*t); }
function smoothstep(t, a,b) { return smooth(step(t,a,b)); }




let slideTick;

function inIframe() {
    try {
        return window.self !== window.top;
    }
    catch(e) {
        return true;
    }
}

function defineSlide(slideName, startEngines, stopEngines) {

    let frameCount = 0;
    let slideIsRunning = false;
    let startTime = 0;

    slideTick = function() {
        if((++frameCount % 300) == 0) {
            const t = performance.now() - startTime;
            console.log(slideName, "T:", ((t*0.001).toFixed(3)));
        }
    };

    function startSlide() {
        if(slideIsRunning) return;
        slideIsRunning = true;
    
        startEngines();
        console.log(slideName, " started");
        startTime = performance.now();
    }
    
    
    function stopSlide() {
        if(!slideIsRunning) return;
        slideIsRunning = false;

        stopEngines();
        console.log(slideName, " stopped");
    }


    if(inIframe()) {
        window.addEventListener("message", function(e) {
            if(e.data == "slide:start") startSlide();
            else if(e.data == "slide:stop") stopSlide();
        }, false);    
    } else {
        startSlide();
    }

}

