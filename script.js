var views=["menu","about","contact","jeu"];
function show(){
 var h=(location.hash||"#menu").slice(1);if(views.indexOf(h)<0)h="menu";
 views.forEach(function(v){document.getElementById("v-"+v).classList.toggle("on",v===h)});
 document.querySelectorAll("nav a").forEach(function(a){a.setAttribute("aria-current",a.getAttribute("href")==="#"+h)});
 if(h!=="jeu")stop();if(h==="menu")fit();if(h==="jeu"&&window.sizeG)sizeG();
}
addEventListener("hashchange",show);show();

/* Carrousel */
var caps=["Compose ton dessert","Glaces et Ovni Waffle","Smoothies et boissons"],cur=0;
var tr=document.getElementById("tr"),dots=document.getElementById("dots");
[].slice.call(tr.children).forEach(function(m){var d=document.createElement("div");d.className="sl";tr.insertBefore(d,m);d.appendChild(m)});
caps.forEach(function(c,i){var b=document.createElement("button");b.setAttribute("aria-label","Page "+(i+1));b.onclick=function(){go(i)};dots.appendChild(b)});
function go(i){cur=(i+3)%3;fit();tr.style.transform="translateX(-"+cur*100+"%)";
 [].forEach.call(dots.children,function(d,k){d.setAttribute("aria-current",k===cur)});
 document.getElementById("cap").textContent=(cur+1)+" / 3 – "+caps[cur]}
document.getElementById("pv").onclick=function(){go(cur-1)};
document.getElementById("nx").onclick=function(){go(cur+1)};
var sx=null,car=document.getElementById("car");
car.addEventListener("pointerdown",function(e){sx=e.clientX});
var lb=document.getElementById("lb");
car.addEventListener("pointerup",function(e){if(sx!==null&&Math.abs(e.clientX-sx)>40)go(cur+(e.clientX<sx?1:-1));else if(sx!==null&&e.target.tagName==="IMG"&&!document.getElementById("v-menu").classList.contains("rot")){lb.firstChild.src=e.target.src;lb.hidden=false;lb.scrollLeft=0}sx=null});
lb.onclick=function(){lb.hidden=true};
addEventListener("keydown",function(e){if(e.key==="Escape")lb.hidden=true});
var rotOff=false;
function fit(){if(!tr||!car)return;
 var vm=document.getElementById("v-menu"),imgs=tr.querySelectorAll("img"),pt=matchMedia("(orientation:portrait)").matches,on=false;[].forEach.call(imgs,function(m){if(!m.dataset.l)m.dataset.l=m.getAttribute("src");var s=pt&&m.dataset.p?m.dataset.p:m.dataset.l;if(m.getAttribute("src")!==s)m.setAttribute("src",s)});
 vm.classList.toggle("rot",on);
 if(on){var w=car.clientWidth,h=Math.max(280,innerHeight-document.querySelector("header").offsetHeight-130);
  car.style.height=h+"px";[].forEach.call(imgs,function(m){m.style.width=(h-6)+"px";m.style.height=w+"px"});return}
 [].forEach.call(imgs,function(m){m.style.width="";m.style.height=""});
 var im=tr.children[cur];if(im.clientHeight)car.style.height=(im.clientHeight+6)+"px"}

[].forEach.call(tr.querySelectorAll("img"),function(m){m.onload=fit});addEventListener("resize",fit);
go(0);
try{screen.orientation.lock("portrait").catch(function(){})}catch(e){}

/* Contact */
document.getElementById("send").onclick=function(){
 var n=document.getElementById("n").value.trim(),e=document.getElementById("e").value.trim(),m=document.getElementById("m").value.trim(),o=document.getElementById("ok");
 o.style.display="block";
 if(!n||!e||!m||e.indexOf("@")<1){o.textContent="Remplis ton nom, un email valide et ton message.";return}
 o.textContent="Merci "+n+" ! Ton message est bien noté, on te répond vite.";
 ["n","e","m"].forEach(function(i){document.getElementById(i).value=""});
};

/* Jeux Waffle&Co */
var CONFIG={leaderboardUrl:null}; /* plus tard : adresse de l’API du classement avec lots */
var $=function(i){return document.getElementById(i)},cv=$("g"),cx=cv.getContext("2d"),W=360,H=540;
var GM=null,S={},run=false,raf=0,last=0,paused=false,mute=false,pname="",AC=null;
try{pname=localStorage.getItem("wc_name")||""}catch(e){}$("pn").value=pname;
var EM=["","🍓","🍌","🍬","🥞","🧇","🍦","🧁","🍰","🍩","🏆","👑"],PAL=["#fff","#ffb3c7","#fff3a0","#ffc2f0","#ffd9a0","#ffe28a","#c8f0ff","#e6c8ff","#ffb3b3","#ffcf9e","#ffe066","#ffd23f"],IN=["🍫","🍓","🍌","🍯","🍦","🍬"];
function beep(f,d,ty){if(mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type=ty||"sine";o.frequency.value=f;g.gain.value=.06;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
$("mu").onclick=function(){mute=!mute;$("mu").textContent=mute?"🔇":"🔊"};
function loadLB(id){try{return JSON.parse(localStorage.getItem("wc_lb_"+id)||"[]")}catch(e){return[]}}
function saveScore(id,n,s){var e={g:id,n:n,s:s,d:new Date().toISOString().slice(0,10)},a=loadLB(id);a.push(e);a.sort(function(x,y){return y.s-x.s});a=a.slice(0,10);
 try{localStorage.setItem("wc_lb_"+id,JSON.stringify(a))}catch(x){}
 if(CONFIG.leaderboardUrl){try{fetch(CONFIG.leaderboardUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(function(){})}catch(x){}}}
function showOv(t,d,b,nm){$("ot").textContent=t;$("od").innerHTML=d;$("go").textContent=b;$("pn").style.display=nm?"block":"none";$("sh").hidden=!(!nm&&!paused&&navigator.share);
 var o=$("top5");o.innerHTML="";loadLB(GM.id).slice(0,5).forEach(function(e){var l=document.createElement("li");l.textContent=e.n+" – "+e.s;o.appendChild(l)});$("ov").style.display="flex"}
function sizeG(){if(!GM||!cv)return;var v=$("v-jeu"),g=$("gw"),t=g.getBoundingClientRect().top+scrollY,aw=v.clientWidth-8,ah=Math.max(280,innerHeight-t-14),s=Math.min(aw/W,ah/H);if(!(s>0))return;
 var d=Math.min(2,devicePixelRatio||1);cv.style.width=W*s+"px";cv.style.height=H*s+"px";cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);GM.drw()}
addEventListener("resize",sizeG);
function ui(){$("sc").textContent=S.score;$("cb").textContent=S.lives!=null?"❤".repeat(Math.max(0,S.lives)):""}
function newO(){var k=S.n<5?2:3;S.o=IN.slice().sort(function(){return Math.random()-.5}).slice(0,k);S.got=[];S.tmax=Math.max(3,8-S.n*.3);S.tm=S.tmax}
function lose(){S.lives--;beep(120,.3,"sawtooth");if(S.lives<=0)S.dead=1;else newO();ui()}
function addT(){var e=[];S.g.forEach(function(v,i){if(!v)e.push(i)});if(e.length)S.g[e[Math.floor(Math.random()*e.length)]]=Math.random()<.9?1:2}
function slide(l){var a=l.filter(Boolean),r=[],sc=0;for(var i=0;i<a.length;i++){if(a[i]===a[i+1]){r.push(a[i]+1);sc+=Math.pow(2,a[i]+1);i++}else r.push(a[i])}while(r.length<4)r.push(0);return[r,sc]}
function can(){var g=S.g;for(var i=0;i<16;i++){if(!g[i])return 1;if(i%4<3&&g[i]===g[i+1])return 1;if(i<12&&g[i]===g[i+4])return 1}return 0}
function mv4(d){var g=S.g,n=g.slice(),ch=0,tot=0;
 for(var k=0;k<4;k++){var ix=[0,1,2,3].map(function(j){return d<2?k*4+j:j*4+k});if(d%2)ix.reverse();var r=slide(ix.map(function(i){return g[i]}));ix.forEach(function(i,j){if(n[i]!==r[0][j])ch=1;n[i]=r[0][j]});tot+=r[1]}
 if(ch){S.g=n;S.score+=tot;addT();beep(300+tot*8,.1);ui();if(!can())S.dead=1}}
var C4=["#ff6fb5","#ffd23f","#5ad1f0","#b57bff"];
function T(s,x,y,f){cx.font=f;cx.fillText(s,x,y)}
var GAMES=[
{id:"stack",n:"Empile ta glace",e:"🍦",d:"Touche l’écran pour poser chaque étage pile sur le précédent. Plus tu es précis, plus la pile reste large !",
 init:function(){S={score:0,bl:[{x:80,w:200}],mx:0,mw:200,dir:1,sp:150,cam:0}},
 upd:function(dt){S.mx+=S.dir*S.sp*dt;if(S.mx<0){S.mx=0;S.dir=1}if(S.mx+S.mw>W){S.mx=W-S.mw;S.dir=-1}S.cam+=(Math.max(0,S.bl.length-8)*30-S.cam)*Math.min(1,dt*6)},
 dn:function(){var t=S.bl[S.bl.length-1],l=Math.max(t.x,S.mx),o=Math.min(t.x+t.w,S.mx+S.mw)-l;if(o<=0){S.dead=1;beep(150,.4,"sawtooth");return}
  if(Math.abs(S.mx-t.x)<6){l=t.x;o=t.w}S.bl.push({x:l,w:o});S.mw=o;S.score++;S.sp=Math.min(380,150+S.score*9);S.mx=S.dir>0?0:W-o;ui();beep(500+S.score*15,.1)},
 drw:function(){var m=S.cam;cx.lineWidth=3;cx.strokeStyle="#000";cx.fillStyle="#c68642";cx.fillRect(-5,H-52+m,W+10,80);cx.strokeRect(-5,H-52+m,W+10,80);
  S.bl.forEach(function(b,i){cx.fillStyle=C4[i%4];var y=H-80-i*30+m;cx.fillRect(b.x,y,b.w,28);cx.strokeRect(b.x,y,b.w,28)});
  var n=S.bl.length,y=H-80-n*30+m;cx.fillStyle=C4[n%4];cx.fillRect(S.mx,y,S.mw,28);cx.strokeRect(S.mx,y,S.mw,28);cx.textAlign="center";cx.textBaseline="middle";T("🍦",S.mx+S.mw/2,y-14,"26px serif")}},
{id:"m2048",n:"Waffle 2048",e:"🧇",d:"Glisse le doigt pour faire fusionner deux gourmandises identiques. Arriveras-tu à l’Ovni Waffle 👑 ?",
 init:function(){S={score:0,g:new Array(16).fill(0),dx:0,dy:0};addT();addT()},upd:function(){},
 dn:function(x,y){S.dx=x;S.dy=y},up:function(x,y){var a=x-S.dx,b=y-S.dy;if(Math.max(Math.abs(a),Math.abs(b))<20)return;mv4(Math.abs(a)>Math.abs(b)?(a<0?0:1):(b<0?2:3))},
 key:function(k){var d=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].indexOf(k);if(d>=0)mv4(d)},
 drw:function(){var X=(W-344)/2+3,Y=110;cx.textAlign="center";cx.textBaseline="middle";cx.lineWidth=3;cx.strokeStyle="#000";cx.fillStyle="#2a1024";T("Glisse pour fusionner 2 identiques",W/2,60,"700 16px Nunito,sans-serif");
  S.g.forEach(function(v,i){var x=X+(i%4)*86,y=Y+(i>>2)*86;cx.fillStyle=v?PAL[Math.min(v,11)]:"#ffffff88";cx.fillRect(x,y,80,80);cx.strokeRect(x,y,80,80);if(v){cx.fillStyle="#000";T(EM[Math.min(v,11)],x+40,y+42,"42px serif")}})}},
{id:"flap",n:"Waffle Flap",e:"🪽",d:"Touche l’écran pour faire sauter la gaufre entre les barres de chocolat. Ne touche rien !",
 init:function(){S={score:0,y:250,vy:0,p:[],t:.3}},
 upd:function(dt){S.vy+=900*dt;S.y+=S.vy*dt;S.t-=dt;if(S.t<=0){S.p.push({x:W+30,g:70+Math.random()*(H-300),d:0});S.t=1.5}
  S.p.forEach(function(p){p.x-=140*dt;if(!p.d&&p.x<70){p.d=1;S.score++;ui();beep(700,.08)}if(Math.abs(p.x-90)<42&&(S.y-14<p.g||S.y+14>p.g+150))S.dead=1});
  S.p=S.p.filter(function(p){return p.x>-40});if(S.y>H-14||S.y<10)S.dead=1},
 dn:function(){S.vy=-320;beep(400,.05)},
 drw:function(){cx.fillStyle="#7b4a2b";cx.strokeStyle="#000";cx.lineWidth=3;S.p.forEach(function(p){var b=p.g+150;cx.fillRect(p.x-30,-5,60,p.g+5);cx.strokeRect(p.x-30,-5,60,p.g+5);cx.fillRect(p.x-30,b,60,H-b+5);cx.strokeRect(p.x-30,b,60,H-b+5)});cx.textAlign="center";cx.textBaseline="middle";T("🧇",90,S.y,"34px serif")}},
{id:"order",n:"Commande express",e:"🧑‍🍳",d:"Un client arrive ! Touche vite les bons ingrédients avant la fin du temps. Une erreur = une vie en moins.",
 init:function(){S={score:0,lives:3,n:0};newO()},upd:function(dt){S.tm-=dt;if(S.tm<=0)lose()},
 dn:function(x,y){var c=Math.floor((x-30)/100),r=Math.floor((y-300)/110);if(c<0||c>2||r<0||r>1||(x-30)%100>90||(y-300)%110>95)return;var g=IN[r*3+c];
  if(S.o.indexOf(g)>=0&&S.got.indexOf(g)<0){S.got.push(g);beep(600+S.got.length*100,.08);if(S.got.length===S.o.length){S.score+=10+Math.ceil(S.tm*2);S.n++;newO();ui();beep(900,.2)}}else lose()},
 drw:function(){cx.textAlign="center";cx.textBaseline="middle";cx.lineWidth=3;cx.strokeStyle="#000";T("🙋",W/2,45,"56px serif");cx.fillStyle="#2a1024";T("Je voudrais…",W/2,98,"800 18px Nunito,sans-serif");
  S.o.forEach(function(g,i){cx.globalAlpha=S.got.indexOf(g)>=0?.25:1;T(g,W/2+(i-(S.o.length-1)/2)*70,150,"50px serif")});cx.globalAlpha=1;
  var f=Math.max(0,S.tm/S.tmax);cx.fillStyle=f>.4?"#5ad1f0":"#ff5a5a";cx.fillRect(30,205,(W-60)*f,14);cx.strokeRect(30,205,W-60,14);
  IN.forEach(function(g,i){var x=30+(i%3)*100,y=300+(i>2?1:0)*110;cx.fillStyle="#fff";cx.fillRect(x,y,90,95);cx.strokeRect(x,y,90,95);cx.fillStyle="#000";T(g,x+45,y+48,"46px serif")})}}
];
function hub(){var h=$("hub");h.innerHTML="";GAMES.forEach(function(g,i){var b=document.createElement("button"),s=loadLB(g.id)[0];b.className="gc";b.type="button";
 b.innerHTML="<span></span><b></b><small></small>";b.children[0].textContent=g.e;b.children[1].textContent=g.n;b.children[2].textContent=s?"Record : "+s.s:"Pas encore joué";b.onclick=function(){pick(g)};h.appendChild(b)})}
function pick(g){GM=g;paused=false;run=false;$("hub").hidden=true;$("stage").hidden=false;g.init();ui();sizeG();showOv(g.n,g.d,"Jouer",true)}
function begin(){run=true;paused=false;$("ov").style.display="none";last=performance.now();raf=requestAnimationFrame(loop)}
function loop(t){if(!run)return;var dt=Math.min(.04,(t-last)/1000);last=t;GM.upd(dt);if(S.dead){over();return}cx.clearRect(0,0,W,H);GM.drw();raf=requestAnimationFrame(loop)}
function start(){var n=$("pn").value.trim().slice(0,12);if(n){pname=n;try{localStorage.setItem("wc_name",n)}catch(e){}}GM.init();ui();begin();beep(600,.1)}
function over(){run=false;cx.clearRect(0,0,W,H);GM.drw();var b=loadLB(GM.id)[0],rec=S.score>0&&(!b||S.score>b.s);if(S.score>0)saveScore(GM.id,pname||"Invité",S.score);beep(200,.5,"triangle");
 showOv("Perdu !","Score : <b>"+S.score+"</b>"+(rec?"<br>🎉 Nouveau record !":""),"Rejouer",false)}
function pauseG(){if(!run)return;run=false;cancelAnimationFrame(raf);paused=true;showOv("Pause","Score : <b>"+S.score+"</b>","Reprendre",false)}
function stop(){pauseG()}
document.addEventListener("visibilitychange",function(){if(document.hidden)pauseG()});
$("go").onclick=function(){if(paused)begin();else start()};
$("bk").onclick=function(){run=false;cancelAnimationFrame(raf);paused=false;GM=null;$("stage").hidden=true;$("hub").hidden=false;hub()};
$("sh").onclick=function(){try{navigator.share({title:GM.n,text:"J’ai fait "+S.score+" points à « "+GM.n+" » chez Waffle&Co ! Viens battre mon score.",url:location.href.split("#")[0]})}catch(e){}};
function cp(e){var r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
cv.addEventListener("pointerdown",function(e){if(run&&GM.dn){var p=cp(e);GM.dn(p[0],p[1])}});
cv.addEventListener("pointerup",function(e){if(run&&GM.up){var p=cp(e);GM.up(p[0],p[1])}});
addEventListener("keydown",function(e){var k=e.key;if(location.hash==="#jeu"&&run&&GM.key){e.preventDefault();GM.key(k)}
 if(!location.hash||location.hash==="#menu"){if(k==="ArrowLeft")go(cur-1);if(k==="ArrowRight")go(cur+1)}});
hub();
