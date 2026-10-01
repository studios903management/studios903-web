/* Orby: el robot compañero de Bobby que acompaña al usuario por la página.
   - Sin modelo: se dibuja una versión provisional (esfera + anillos).
   - Con modelo: define window.ORBY_MODELO = 'assets/models/orby.glb' antes de cargar este archivo.
   - Recorrido: cada sección con data-orby="x,y" (fracciones de la pantalla, 0 a 1) le dice a Orby dónde ubicarse
     mientras esa sección está en pantalla. data-orby-orbit="#selector" hace que orbite alrededor de ese elemento. */
(function(){
  if(!window.THREE) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v));};
  var lerp=function(a,b,t){return a+(b-a)*t;};
  var smooth=function(t){return t*t*(3-2*t);};

  var SIZE=function(){return window.innerWidth<760?78:124;};
  var cv=document.createElement('canvas');
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;left:0;top:0;z-index:45;pointer-events:none;opacity:0;transition:opacity .6s ease;will-change:transform';
  document.body.appendChild(cv);
  var renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping;
  var scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(32,1,.1,50); cam.position.set(0,0,6.2);
  scene.add(new THREE.AmbientLight(0xffffff,.45));
  var key=new THREE.DirectionalLight(0xffffff,1.6); key.position.set(-3,4,5); scene.add(key);
  var rimM=new THREE.DirectionalLight(0xCC0A5E,2.4); rimM.position.set(4,1,-3); scene.add(rimM);
  var rimT=new THREE.DirectionalLight(0x1F8991,2.4); rimT.position.set(-4,-2,-3); scene.add(rimT);

  var root=new THREE.Group(); scene.add(root);
  var body=new THREE.Group(); root.add(body);
  var rings=[], eye=null;

  function provisional(){
    var shell=new THREE.MeshStandardMaterial({color:0xEDEDED,roughness:.32,metalness:.35});
    var dark=new THREE.MeshStandardMaterial({color:0x101010,roughness:.25,metalness:.6});
    var glow=new THREE.MeshBasicMaterial({color:0x37C9D3});
    var sphere=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),shell); body.add(sphere);
    var visor=new THREE.Mesh(new THREE.SphereGeometry(1.006,48,32,Math.PI/2-0.66,1.32,1.02,1.08),dark); body.add(visor);
    eye=new THREE.Group();
    var pupil=new THREE.Mesh(new THREE.CircleGeometry(.17,32),glow); pupil.position.z=1.012; eye.add(pupil);
    body.add(eye);
    var ringMat=new THREE.MeshStandardMaterial({color:0xFFFFFF,roughness:.3,metalness:.5});
    [[1.55,.045,-0.42,0.25],[1.32,.03,0.9,-0.5]].forEach(function(r){
      var g=new THREE.Group(), t=new THREE.Mesh(new THREE.TorusGeometry(r[0],r[1],12,96),ringMat);
      t.rotation.x=Math.PI/2; g.add(t); g.rotation.z=r[2]; g.rotation.x=r[3]; root.add(g); rings.push(g);
    });
  }
  provisional();

  if(window.ORBY_MODELO){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    s.onload=function(){
      new THREE.GLTFLoader().load(window.ORBY_MODELO,function(gltf){
        while(body.children.length) body.remove(body.children[0]);
        rings.forEach(function(r){root.remove(r);}); rings=[]; eye=null;
        var m=gltf.scene, box=new THREE.Box3().setFromObject(m), c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3());
        m.position.sub(c); var holder=new THREE.Group(); holder.add(m); holder.scale.setScalar(3.1/Math.max(sz.x,sz.y,sz.z)); body.add(holder);
        m.traverse(function(o){ if(/ring|anillo/i.test(o.name)) rings.push(o); });
      });
    };
    document.head.appendChild(s);
  }

  var size=0;
  function resize(){ size=SIZE(); renderer.setSize(size,size,false); cv.style.width=size+'px'; cv.style.height=size+'px'; }
  window.addEventListener('resize',resize); resize();

  /* ---- path along the page ---- */
  var stops=[];
  function collect(){
    stops=[].slice.call(document.querySelectorAll('[data-orby]')).map(function(el){
      var v=el.getAttribute('data-orby').split(',').map(parseFloat), r=el.getBoundingClientRect();
      var top=r.top+window.scrollY, h=el.offsetHeight;
      return {el:el,x:v[0],y:v[1],a:top-window.innerHeight*.5,b:top+h-window.innerHeight*.5,orbit:el.getAttribute('data-orby-orbit')};
    });
  }
  window.addEventListener('resize',collect); window.addEventListener('load',collect); collect();
  setInterval(collect,2500);

  var mx=.5,my=.5;
  window.addEventListener('pointermove',function(e){mx=e.clientX/window.innerWidth;my=e.clientY/window.innerHeight;},{passive:true});

  var px=window.innerWidth*.9, py=window.innerHeight*.4, vx=0, vy=0, lastY=window.scrollY, vel=0, t0=performance.now();
  var start=parseFloat(document.documentElement.getAttribute('data-orby-start')||'0.7');
  function target(t){
    var vh=window.innerHeight, W=window.innerWidth, y=window.scrollY+vh*.5, Z=vh*.35;
    if(!stops.length) return [W*.9,vh*.4,null];
    var cur=stops[0], nxt=null, k=0;
    for(var i=0;i<stops.length;i++){
      var s=stops[i], top=s.a+vh*.5, bot=s.b+vh*.5;
      if(y>=top || i===0) cur=s;
      if(i<stops.length-1){ var B=bot; if(y>=B-Z && y<=B+Z){ cur=s; nxt=stops[i+1]; k=smooth(clamp((y-(B-Z))/(2*Z))); break; } }
      if(y<bot) break;
    }
    function posOf(s){
      if(s.orbit){ var el=document.querySelector(s.orbit); if(el){ var r=el.getBoundingClientRect(); if(r.width){
        var cx=r.left+r.width/2, cy=r.top+r.height*.42, R=Math.min(r.width,r.height)*.55;
        return [cx+Math.cos(t*.55)*R, cy+Math.sin(t*.55)*R*.36, Math.sin(t*.55)]; } } }
      return [W*s.x, vh*s.y, null];
    }
    var A=posOf(cur);
    if(!nxt) return A;
    var Bp=posOf(nxt);
    return [lerp(A[0],Bp[0],k), lerp(A[1],Bp[1],k), k<.5?A[2]:Bp[2]];
  }

  function frame(ms){
    requestAnimationFrame(frame);
    var t=(ms-t0)/1000, k=reduce?0:1;
    vel=vel*.9+(window.scrollY-lastY)*.1; lastY=window.scrollY;
    var vis=window.scrollY>window.innerHeight*start;
    cv.style.opacity=vis?'1':'0';
    var T=target(t), tx=T[0], ty=T[1];
    /* spring toward the target with a lazy, floaty feel */
    vx=(vx+(tx-px)*.012)*.88; vy=(vy+(ty-py)*.012)*.88;
    px+=vx; py+=vy;
    var bob=k*Math.sin(t*1.6)*8;
    cv.style.transform='translate('+(px-size/2).toFixed(1)+'px,'+(py-size/2+bob).toFixed(1)+'px)';
    /* orbiting behind something: shrink a little when going "back" */
    var depth=T[2]===null?1:lerp(.82,1.08,(T[2]+1)/2);
    root.scale.setScalar(depth);
    /* tilt with motion, look at the pointer */
    root.rotation.z=clamp(-vx*.02,-.5,.5);
    root.rotation.x=clamp(vy*.015+vel*.004,-.6,.6);
    var lx=(mx*window.innerWidth-px)/window.innerWidth, ly=(my*window.innerHeight-py)/window.innerHeight;
    body.rotation.y+=((clamp(lx*2.2,-.9,.9))-body.rotation.y)*.08;
    body.rotation.x+=((clamp(ly*1.8,-.6,.6))-body.rotation.x)*.08;
    rings.forEach(function(r,i){ r.rotation.y+=(i?-.012:.018)*(1+Math.abs(vel)*.05)*(k||.2); });
    renderer.render(scene,cam);
  }
  requestAnimationFrame(frame);
})();
