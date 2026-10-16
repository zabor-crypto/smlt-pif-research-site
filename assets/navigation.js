/* Local navigation context: allowlisted scene IDs and same-directory index only. */
(() => {
 'use strict';
 const scenes=['problem','team','hypotheses','assets','data','risk','states','episode','decision','engine','results','conclusion'];
 const anchors=[...scenes,'materials'];
 const pages=new Set(['index.html','team.html','demo-rebalancing.html','engineering.html','appendix.html','readme.html']);
 const here=new URL(location.href),index=new URL('index.html',here),isIndex=here.pathname===index.pathname;
 const key='smlt.visual.return.v1';
 const getStored=()=>{try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}};
 const store=v=>{try{sessionStorage.setItem(key,JSON.stringify(v))}catch{}};
 function clean(v){if(!v||!anchors.includes(v.scene)||!['browse','present'].includes(v.mode))return null;const seconds=Number(v.t);if(!Number.isInteger(seconds)||seconds<0||seconds>86400)return null;return {scene:v.scene,mode:v.mode==='present'&&scenes.includes(v.scene)?'present':'browse',t:seconds,was:v.was==='1'?'1':'0'};}
 function read(url){return clean(Object.fromEntries(['scene','mode','t','was'].map(k=>[k,url.searchParams.get(k)])));}
 function route(ctx){const u=new URL(index);u.search='';u.searchParams.set('scene',ctx.scene);u.searchParams.set('mode',ctx.mode);u.searchParams.set('t',String(ctx.t));u.searchParams.set('was',ctx.was);u.hash=ctx.scene;return 'index.html'+u.search+u.hash;}
 function trustedReturn(raw){if(!raw||raw.length>800)return null;try{const u=new URL(raw,here);if(u.protocol!==index.protocol||u.host!==index.host||u.pathname!==index.pathname||u.username||u.password)return null;return read(u);}catch{return null}}
 let origin=trustedReturn(here.searchParams.get('return'));
 function visibleScene(){const hash=decodeURIComponent(location.hash.slice(1));if(anchors.includes(hash))return hash;const candidates=scenes.map(id=>document.getElementById(id)).filter(Boolean);const picked=candidates.find(x=>{const r=x.getBoundingClientRect();return r.top<=innerHeight*.45&&r.bottom>innerHeight*.45})||candidates[0];return picked?.id||'problem';}
 function capture(link){const p=window.smltPresenter?.capture();const source=link?.closest('.chapter')?.id;return clean({scene:p?.mode==='present'?p.scene:anchors.includes(source)?source:visibleScene(),mode:p?.mode||'browse',t:p?.t||0,was:p?.running?'1':'0'});}
 function remember(ctx){store({...ctx,index:index.href});try{history.replaceState({...history.state,smltReturn:ctx},'',route(ctx));}catch{try{history.replaceState({...history.state,smltReturn:ctx},'')}catch{}}}
 function restore(){if(!isIndex)return;let ctx=read(new URL(location.href))||clean(history.state?.smltReturn);if(!ctx){const saved=getStored();if(saved?.index===index.href&&saved.scene===location.hash.slice(1))ctx=clean(saved);}if(ctx){window.smltPresenter?.restore(ctx);try{history.replaceState({...history.state,smltReturn:ctx},'',route(ctx))}catch{}}}
 function updateLinks(){document.querySelectorAll('a[href]').forEach(a=>{
  if(a.dataset.sceneReturn!==undefined)return;
  const raw=a.getAttribute('href');if(!raw||raw.startsWith('#'))return;let u;try{u=new URL(raw,here)}catch{return;}
  if(u.protocol!==here.protocol||u.host!==here.host||new URL('.',u).pathname!==new URL('.',here).pathname||!pages.has(u.pathname.split('/').pop()))return;
  if(!isIndex&&u.pathname!==index.pathname&&origin){u.searchParams.set('return',route(origin));a.href=u.pathname.split('/').pop()+u.search+u.hash;}
  if(!isIndex&&u.pathname===index.pathname&&origin){const target=u.hash.slice(1);a.href=route({...origin,scene:anchors.includes(target)?target:origin.scene});}
 });}
 if(!isIndex){const bar=document.createElement('div');bar.className='return-context';const a=document.createElement('a');a.className='scene-return';a.dataset.sceneReturn='';a.href=origin?route(origin):'index.html';const n=origin?scenes.indexOf(origin.scene)+1:0;a.textContent=origin?(n?'← Вернуться к сцене '+n:'← Вернуться к материалам'):'← К основному рассказу';if(origin?.mode==='browse')a.setAttribute('aria-label',a.textContent+' · обычный просмотр');bar.append(a);document.querySelector('main')?.prepend(bar);a.addEventListener('click',ev=>{ev.preventDefault();location.replace(a.href);});updateLinks();}
 document.addEventListener('click',ev=>{
  const a=ev.target.closest('a[href]');if(!a||a.dataset.sceneReturn!==undefined||ev.button!==0||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey||a.download||a.target==='_blank')return;
  let target;try{target=new URL(a.href,here)}catch{return;}
  if(target.protocol!==here.protocol||target.host!==here.host||new URL('.',target).pathname!==new URL('.',here).pathname||!pages.has(target.pathname.split('/').pop()))return;
  if(isIndex&&target.pathname!==index.pathname){const ctx=capture(a);remember(ctx);window.smltPresenter?.pause();target.searchParams.set('return',route(ctx));a.href=target.pathname.split('/').pop()+target.search+target.hash;}
 });
 if(isIndex){['presentBtn','exitPresent','prevSection','nextSection'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>remember(capture())));document.addEventListener('keydown',ev=>{if(['Escape','ArrowRight','ArrowLeft','PageDown','PageUp'].includes(ev.key))remember(capture());});}
 window.addEventListener('pageshow',restore);restore();
})();
