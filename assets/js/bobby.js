/* Bobby interactivo a partir de renders (el modelo 3D nunca sale del computador).
   window.BOBBY = {
     poses:  ['assets/bobby/pose/0001.webp', ...],      // secuencia que avanza con el scroll
     mirada: { cols:7, rows:5, frames:['assets/bobby/mirada/r1_c1.webp', ...] } // cuadrícula: filas de arriba a abajo, columnas de izquierda a derecha
   };
   Si no hay renders todavía, se dibuja un astronauta provisional que hace lo mismo. */
(function(){
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v));};
  var lerp=function(a,b,t){return a+(b-a)*t;};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function load(list){ return (list||[]).map(function(src){ var im=new Image(); im.decoding='async'; im.src=src; return im; }); }

  window.mountBobby=function(canvas, getProgress){
    var cfg=window.BOBBY||{}, poses=load(cfg.poses), M=cfg.mirada||null, look=M?load(M.frames):[];
    var ctx=canvas.getContext('2d'), W=0,H=0,dpr=1, mx=.5,my=.45, gx=0,gy=0, t0=performance.now();
    function size(){ dpr=Math.min(window.devicePixelRatio||1,2); var r=canvas.getBoundingClientRect(); W=r.width;H=r.height; canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr); }
    window.addEventListener('resize',size); size();
    window.addEventListener('pointermove',function(e){ var r=canvas.getBoundingClientRect(); mx=(e.clientX-r.left)/r.width; my=(e.clientY-r.top)/r.height; },{passive:true});

    function drawImg(im){
      if(!im||!im.complete||!im.naturalWidth) return false;
      var s=Math.min(W/im.naturalWidth,H/im.naturalHeight), w=im.naturalWidth*s, h=im.naturalHeight*s;
      ctx.drawImage(im,(W-w)/2,(H-h)/2,w,h); return true;
    }
    function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
    function limb(x,y,len,ang,wid){ ctx.save(); ctx.translate(x,y); ctx.rotate(ang); rr(-wid/2,0,wid,len,wid/2); ctx.fill(); ctx.stroke(); ctx.restore(); }

    /* provisional astronaut, drawn in code */
    function astronaut(t,p){
      var u=Math.min(W,H)/11, cx=W*.5, cy=H*.56+Math.sin(t*1.3)*u*.18-p*u*.6;
      var wave=p<.33?0:(p<.66?1:2);
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(gx*.08+Math.sin(t*.7)*.03+(p-.5)*.12);
      ctx.lineWidth=u*.07; ctx.strokeStyle='#0A0A0A';
      ctx.fillStyle='#BDBDBD'; rr(-1.45*u,-.6*u,2.9*u,2.5*u,.5*u); ctx.fill(); ctx.stroke(); // backpack
      ctx.fillStyle='#F4F4F2';
      limb(-.6*u,1.6*u,1.7*u,.12+Math.sin(t*1.3)*.05,.85*u); limb(.6*u,1.6*u,1.7*u,-.12-Math.sin(t*1.3)*.05,.85*u); // legs
      var aL=wave===2?2.7+Math.sin(t*5)*.25:.35+Math.sin(t*1.1)*.08;
      var aR=wave>=1?-2.6+Math.sin(t*6)*.35:-.35-Math.sin(t*1.1)*.08;
      limb(-1.15*u,-.1*u,1.6*u,aL,.72*u); limb(1.15*u,-.1*u,1.6*u,aR,.72*u); // arms
      rr(-1.25*u,-.5*u,2.5*u,2.4*u,.7*u); ctx.fill(); ctx.stroke(); // torso
      ctx.fillStyle='#CC0A5E'; rr(-.55*u,.25*u,1.1*u,.6*u,.15*u); ctx.fill(); // chest panel
      ctx.fillStyle='#1F8991'; ctx.beginPath(); ctx.arc(.25*u,.55*u,.13*u,0,7); ctx.fill();
      // helmet
      var hx=gx*.25*u, hy=-2.05*u+gy*.15*u;
      ctx.fillStyle='#F4F4F2'; ctx.beginPath(); ctx.arc(hx,hy,1.85*u,0,7); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#0A0A0A'; ctx.beginPath(); ctx.ellipse(hx+gx*.42*u,hy+gy*.3*u,1.3*u,1.0*u,gx*.12,0,7); ctx.fill();
      var gr=ctx.createLinearGradient(hx-u,hy-u,hx+u,hy+u); gr.addColorStop(0,'rgba(204,10,94,.55)'); gr.addColorStop(1,'rgba(31,137,145,.55)');
      ctx.fillStyle=gr; ctx.beginPath(); ctx.ellipse(hx+gx*.42*u,hy+gy*.3*u,1.3*u,1.0*u,gx*.12,0,7); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=u*.12; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(hx+gx*.42*u-.35*u,hy+gy*.3*u-.25*u,.6*u,3.6,4.5); ctx.stroke();
      ctx.strokeStyle='#0A0A0A'; ctx.lineWidth=u*.07;
      ctx.beginPath(); ctx.moveTo(hx+.9*u,hy-1.6*u); ctx.lineTo(hx+1.2*u,hy-2.4*u); ctx.stroke();
      ctx.fillStyle='#1F8991'; ctx.beginPath(); ctx.arc(hx+1.22*u,hy-2.48*u,.2*u+Math.sin(t*4)*.03*u,0,7); ctx.fill();
      ctx.restore();
    }

    (function frame(){
      requestAnimationFrame(frame);
      var r=canvas.getBoundingClientRect(); if(r.bottom<-50||r.top>window.innerHeight+50) return;
      var t=(performance.now()-t0)/1000, p=clamp(getProgress?getProgress():0,0,1);
      var tx=reduce?0:clamp((mx-.5)*2.2,-1,1), ty=reduce?0:clamp((my-.42)*2.2,-1,1);
      gx+=(tx-gx)*.08; gy+=(ty-gy)*.08;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
      var lookPhase=poses.length? p>=.62 : true, done=false;
      if(poses.length && !lookPhase){ done=drawImg(poses[Math.round(clamp(p/.62,0,1)*(poses.length-1))]); }
      if(!done && look.length && lookPhase){
        var c=Math.round((gx+1)/2*(M.cols-1)), rw=Math.round((gy+1)/2*(M.rows-1));
        done=drawImg(look[rw*M.cols+c]);
      }
      if(!done && poses.length) done=drawImg(poses[poses.length-1]);
      if(!done) astronaut(t,p);
    })();
  };
})();
