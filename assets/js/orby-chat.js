/* Chat con Orby. Se abre con clic derecho sobre Orby (en celular, tocándolo).
   Habla con /api/chat (functions/api/chat.js). */
(function(){
  var WA='https://wa.me/573158059136';
  var SUGERENCIAS=['¿Qué servicios ofrecen?','Quiero cotizar un proyecto','¿Cómo es el proceso?','¿Qué es Bobby Moon?'];
  var HOLA='¡Hola! Soy Orby, el amigo robot de Bobby Moon. Pregúntame lo que quieras sobre Studios 903 y lo que hacemos.';

  var css=`
#orbyChat{position:fixed;z-index:80;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100dvh - 120px));display:flex;flex-direction:column;background:#FAFAF8;color:#0A0A0A;border-radius:22px;box-shadow:0 40px 90px -30px rgba(0,0,0,.55),0 0 0 1px rgba(10,10,10,.08);overflow:hidden;opacity:0;transform:translateY(18px) scale(.94);transform-origin:var(--ox,100%) var(--oy,0%);pointer-events:none;transition:opacity .35s cubic-bezier(.16,.84,.32,1),transform .5s cubic-bezier(.16,.84,.32,1);font-family:'Kumbh Sans',system-ui,sans-serif}
#orbyChat.open{opacity:1;transform:none;pointer-events:auto}
#orbyChat header{display:flex;align-items:center;gap:12px;padding:16px 16px 14px 20px;background:#0A0A0A;color:#fff}
#orbyChat header b{font:600 22px/1 'Antonio',sans-serif;text-transform:uppercase;letter-spacing:.01em}
#orbyChat header small{display:block;font-size:12px;color:rgba(255,255,255,.62);margin-top:3px}
#orbyChat header .dot{width:10px;height:10px;border-radius:50%;background:#37C9D3;box-shadow:0 0 0 4px rgba(55,201,211,.2);flex:none}
#orbyChat header button{margin-left:auto;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;font-size:20px;line-height:1;cursor:pointer}
#orbyChat header button:hover{background:#CC0A5E;border-color:#CC0A5E}
#ocLog{flex:1;overflow-y:auto;padding:18px 16px 8px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
.ocm{max-width:86%;padding:11px 14px;border-radius:16px;font-size:15px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;animation:ocIn .35s cubic-bezier(.16,.84,.32,1)}
.ocm.bot{align-self:flex-start;background:#fff;border:1px solid rgba(10,10,10,.1);border-bottom-left-radius:5px}
.ocm.me{align-self:flex-end;background:#0A0A0A;color:#fff;border-bottom-right-radius:5px}
.ocm a{color:#CC0A5E;font-weight:700}
.ocm.me a{color:#fff}
@keyframes ocIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.octy{align-self:flex-start;display:flex;gap:5px;padding:14px 16px;background:#fff;border:1px solid rgba(10,10,10,.1);border-radius:16px;border-bottom-left-radius:5px}
.octy i{width:7px;height:7px;border-radius:50%;background:#1F8991;animation:ocB 1s infinite}
.octy i:nth-child(2){animation-delay:.15s;background:#CC0A5E}.octy i:nth-child(3){animation-delay:.3s}
@keyframes ocB{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}
#ocSug{display:flex;flex-wrap:wrap;gap:8px;padding:4px 16px 10px}
#ocSug button{border:1px solid rgba(10,10,10,.16);background:transparent;border-radius:30px;padding:8px 12px;font:500 13px 'Kumbh Sans',sans-serif;cursor:pointer;color:#0A0A0A}
#ocSug button:hover{border-color:#0A0A0A;background:#0A0A0A;color:#fff}
#ocForm{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(10,10,10,.1);background:#fff}
#ocForm input{flex:1;border:0;background:#F1EFEC;border-radius:30px;padding:0 16px;height:46px;font:500 15px 'Kumbh Sans',sans-serif;color:#0A0A0A;min-width:0}
#ocForm input:focus{outline:2px solid #1F8991}
#ocForm button{width:46px;height:46px;border-radius:50%;border:0;background:#CC0A5E;color:#fff;cursor:pointer;font-size:20px;flex:none;transition:transform .3s}
#ocForm button:hover{transform:scale(1.06)}
#ocForm button:disabled{opacity:.4;cursor:default;transform:none}
#ocFoot{font-size:11px;color:rgba(10,10,10,.5);text-align:center;padding:0 12px 10px;background:#fff}
#orbyTip{position:fixed;z-index:79;pointer-events:none;background:#0A0A0A;color:#fff;font:600 13px/1.3 'Kumbh Sans',sans-serif;padding:10px 14px;border-radius:14px;box-shadow:0 14px 30px -12px rgba(0,0,0,.5);opacity:0;transform:translateY(6px);transition:opacity .3s,transform .4s cubic-bezier(.16,.84,.32,1);white-space:nowrap}
#orbyTip.on{opacity:1;transform:none}
#orbyTip::after{content:'';position:absolute;top:50%;right:-6px;margin-top:-6px;border:6px solid transparent;border-right:0;border-left-color:#0A0A0A}
#orbyTip.r::after{right:auto;left:-6px;border:6px solid transparent;border-left:0;border-right-color:#0A0A0A}
@media(max-width:600px){#orbyChat{left:12px!important;right:12px;top:auto!important;bottom:12px;width:auto;height:min(72dvh,560px)}}
@media (prefers-reduced-motion:reduce){#orbyChat{transition:opacity .2s}}
`;
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var box=document.createElement('section');
  box.id='orbyChat'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Chat con Orby'); box.setAttribute('aria-hidden','true');
  box.innerHTML='<header><span class="dot" aria-hidden="true"></span><div><b>Orby</b><small>Asistente de Studios 903</small></div><button type="button" aria-label="Cerrar chat">&#215;</button></header>'+
    '<div id="ocLog" aria-live="polite"></div><div id="ocSug"></div>'+
    '<form id="ocForm" autocomplete="off"><input id="ocIn" maxlength="600" placeholder="Escribe tu pregunta…" aria-label="Tu mensaje"><button type="submit" aria-label="Enviar">&#8594;</button></form>'+
    '<div id="ocFoot">Orby es una IA y puede equivocarse. Para cotizar, escríbenos por <a href="'+WA+'" target="_blank" rel="noopener">WhatsApp</a>.</div>';
  document.body.appendChild(box);
  var tip=document.createElement('div'); tip.id='orbyTip'; tip.setAttribute('aria-hidden','true'); document.body.appendChild(tip);

  var log=box.querySelector('#ocLog'), sug=box.querySelector('#ocSug'), form=box.querySelector('#ocForm'), input=box.querySelector('#ocIn'), sendB=form.querySelector('button');
  var hist=[]; try{hist=JSON.parse(sessionStorage.getItem('orbyChat')||'[]');}catch(e){}
  function save(){try{sessionStorage.setItem('orbyChat',JSON.stringify(hist.slice(-20)));}catch(e){}}
  function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fmt(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');}
  function bubble(role,text){var d=document.createElement('div');d.className='ocm '+(role==='user'?'me':'bot');d.innerHTML=fmt(text);log.appendChild(d);log.scrollTop=log.scrollHeight;return d;}
  function render(){log.innerHTML='';bubble('assistant',HOLA);hist.forEach(function(m){bubble(m.role,m.content);});
    sug.innerHTML=hist.length?'':SUGERENCIAS.map(function(s){return '<button type="button">'+esc(s)+'</button>';}).join('');}
  render();
  sug.addEventListener('click',function(e){var b=e.target.closest('button');if(b)ask(b.textContent);});
  form.addEventListener('submit',function(e){e.preventDefault();var v=input.value.trim();if(v)ask(v);});
  var busy=false;
  function ask(q){
    if(busy) return; busy=true; sendB.disabled=true; input.value=''; sug.innerHTML='';
    hist.push({role:'user',content:q}); bubble('user',q); save();
    var ty=document.createElement('div'); ty.className='octy'; ty.innerHTML='<i></i><i></i><i></i>'; log.appendChild(ty); log.scrollTop=log.scrollHeight;
    fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:hist.slice(-12)})})
      .then(function(r){return r.json().then(function(d){if(!r.ok||!d.reply)throw new Error(d.error||r.status);return d.reply;});})
      .catch(function(){return 'Ahora mismo no puedo conectarme, pero el equipo te responde rápido por WhatsApp: '+WA+' o en el formulario "Cuéntanos tu idea" al final de la página.';})
      .then(function(reply){ty.remove();hist.push({role:'assistant',content:reply});bubble('assistant',reply);save();busy=false;sendB.disabled=false;input.focus();
        if(window.orbyReact) window.orbyReact();});
  }

  function place(){
    var o=window.__orbyPos; if(window.innerWidth<=600||!o){box.style.left='';box.style.top='';return;}
    var W=box.offsetWidth, H=box.offsetHeight, m=16;
    var left=o.x>window.innerWidth/2? o.x-o.size*.5-W-8 : o.x+o.size*.5+8;
    left=Math.max(m,Math.min(window.innerWidth-W-m,left));
    var top=Math.max(84,Math.min(window.innerHeight-H-m,o.y-60));
    box.style.left=left+'px'; box.style.top=top+'px';
    box.style.setProperty('--ox',(o.x>left+W/2?'100%':'0%')); box.style.setProperty('--oy',Math.max(0,Math.min(100,(o.y-top)/H*100))+'%');
    window.__orbyPark={x:(o.x>window.innerWidth/2? left+W+o.size*.42 : left-o.size*.42), y:top+o.size*.45};
    if(window.innerWidth-(left+W)<o.size*.8 && left>o.size) window.__orbyPark.x=left-o.size*.42;
  }
  function open(){ hideTip(); place(); box.classList.add('open'); box.setAttribute('aria-hidden','false'); setTimeout(function(){input.focus({preventScroll:true});},250); }
  function close(){ box.classList.remove('open'); box.setAttribute('aria-hidden','true'); window.__orbyPark=null; }
  box.querySelector('header button').addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('open'))close();});
  window.addEventListener('resize',function(){if(box.classList.contains('open'))place();});
  window.openOrbyChat=function(){ box.classList.contains('open')?close():open(); };

  var tipT=null;
  function showTip(text,ms){ var o=window.__orbyPos; if(!o||box.classList.contains('open'))return; tip.textContent=text;
    var w=tip.offsetWidth, right=o.x<window.innerWidth/2; tip.classList.toggle('r',right);
    tip.style.left=(right?Math.min(window.innerWidth-w-10,o.x+o.size*.45+12):Math.max(10,o.x-o.size*.45-w-12))+'px'; tip.style.top=(o.y-18)+'px'; tip.classList.add('on');
    clearTimeout(tipT); tipT=setTimeout(hideTip,ms||2600); }
  function hideTip(){ tip.classList.remove('on'); }
  window.orbyTip=showTip;
  var touch=window.matchMedia('(hover:none)').matches;
  var greeted=false; try{greeted=sessionStorage.getItem('orbyHola')==='1';}catch(e){}
  setInterval(function(){
    if(greeted||!window.__orbyPos||!window.__orbyPos.visible) return;
    greeted=true; try{sessionStorage.setItem('orbyHola','1');}catch(e){}
    showTip(touch?'¡Hola! Tócame para hablar conmigo':'¡Hola! Clic derecho para hablar conmigo',4200);
  },1500);
})();
