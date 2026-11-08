var views=["menu","about","contact","jeu"];
function show(){
 var h=(location.hash||"#menu").slice(1);if(views.indexOf(h)<0)h="menu";
 views.forEach(function(v){document.getElementById("v-"+v).classList.toggle("on",v===h)});
 document.querySelectorAll("nav a").forEach(function(a){a.setAttribute("aria-current",a.getAttribute("href")==="#"+h)});
 if(h!=="jeu")stop();if(h==="menu")fit();
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
 var vm=document.getElementById("v-menu"),imgs=tr.querySelectorAll("img"),on=!rotOff&&matchMedia("(orientation:portrait)").matches;
 vm.classList.toggle("rot",on);
 if(on){var w=car.clientWidth,h=Math.max(280,innerHeight-document.querySelector("header").offsetHeight-130);
  car.style.height=h+"px";[].forEach.call(imgs,function(m){m.style.width=(h-6)+"px";m.style.height=w+"px"});return}
 [].forEach.call(imgs,function(m){m.style.width="";m.style.height=""});
 var im=tr.children[cur];if(im.clientHeight)car.style.height=(im.clientHeight+6)+"px"}
[].forEach.call(tr.querySelectorAll("img"),function(m){m.onload=fit});addEventListener("resize",fit);
go(0);try{screen.orientation.lock("portrait").catch(function(){})}catch(e){}

/* Contact */
document.getElementById("send").onclick=function(){
 var n=document.getElementById("n").value.trim(),e=document.getElementById("e").value.trim(),m=document.getElementById("m").value.trim(),o=document.getElementById("ok");
 o.style.display="block";
 if(!n||!e||!m||e.indexOf("@")<1){o.textContent="Remplis ton nom, un email valide et ton message.";return}
 o.textContent="Merci "+n+" ! Ton message est bien noté, on te répond vite.";
 ["n","e","m"].forEach(function(i){document.getElementById(i).value=""});
};

/* Jeu */
var cv=document.getElementById("g"),cx=cv.getContext("2d"),W=420,H=520;
var GOOD=["🥞","🧇","🍬"],BAD=["🐝","🐜","🐟"];
var px=W/2,items=[],score=0,lives=3,run=false,raf=0,last=0,spawn=0,best=0,keys={};
try{best=+localStorage.getItem("wc_best")||0}catch(e){}
document.getElementById("bs").textContent=best;
function body(x){
 var y=H-110;
 cx.lineWidth=3;cx.strokeStyle="#000";
 cx.fillStyle="#f2c29b";
 cx.beginPath();cx.arc(x,y-4,22,0,7);cx.fill();cx.stroke();           /* tête */
 cx.fillStyle="#000";cx.beginPath();cx.arc(x-8,y-8,2.5,0,7);cx.arc(x+8,y-8,2.5,0,7);cx.fill();
 cx.beginPath();cx.arc(x,y,9,.2,Math.PI-.2);cx.stroke();               /* sourire */
 cx.fillStyle="#f2c29b";cx.beginPath();cx.ellipse(x,y+68,50,40,0,0,7);cx.fill();cx.stroke(); /* ventre */
 cx.beginPath();cx.arc(x,y+72,3,0,7);cx.stroke();                      /* nombril */
 cx.fillStyle="#111";cx.beginPath();cx.moveTo(x-36,y+22);cx.quadraticCurveTo(x,y+14,x+36,y+22);
 cx.lineTo(x+52,y+58);cx.quadraticCurveTo(x,y+44,x-52,y+58);cx.closePath();cx.fill();cx.stroke(); /* t-shirt court */
 cx.fillStyle="#2FC4EA";cx.fillRect(x-34,y+104,28,22);cx.fillRect(x+6,y+104,28,22);cx.strokeRect(x-34,y+104,28,22);cx.strokeRect(x+6,y+104,28,22);
}
function draw(){
 cx.clearRect(0,0,W,H);
 cx.font="38px serif";cx.textAlign="center";cx.textBaseline="middle";
 items.forEach(function(i){cx.fillText(i.e,i.x,i.y)});
 body(px);
}
function loop(t){
 if(!run)return;
 var dt=Math.min(40,t-last)/1000;last=t;
 if(keys.ArrowLeft)px-=320*dt;if(keys.ArrowRight)px+=320*dt;
 px=Math.max(50,Math.min(W-50,px));
 spawn-=dt;
 if(spawn<=0){var bad=Math.random()<.35,s=bad?BAD:GOOD;
  items.push({x:30+Math.random()*(W-60),y:-20,v:120+Math.random()*80+score*1.2,e:s[Math.floor(Math.random()*3)],bad:bad});
  spawn=Math.max(.35,.9-score/400)}
 items=items.filter(function(i){
  i.y+=i.v*dt;
  var hit=i.y>H-120&&i.y<H-30&&Math.abs(i.x-px)<52;
  if(hit){if(i.bad){lives--}else{score+=10}ui();return false}
  return i.y<H+30});
 if(lives<=0){end();return}
 draw();raf=requestAnimationFrame(loop);
}
function ui(){document.getElementById("sc").textContent=score;document.getElementById("lv").textContent="❤❤❤".slice(0,Math.max(0,lives))||"💔"}
function start(){items=[];score=0;lives=3;spawn=.5;px=W/2;run=true;ui();document.getElementById("ov").style.display="none";last=performance.now();raf=requestAnimationFrame(loop)}
function stop(){run=false;cancelAnimationFrame(raf)}
function end(){
 stop();draw();
 if(score>best){best=score;document.getElementById("bs").textContent=best;try{localStorage.setItem("wc_best",best)}catch(e){}}
 var o=document.getElementById("ov");o.style.display="flex";
 o.children[0].textContent="Aïe, perdu !";o.children[1].innerHTML="Ton score : "+score;o.children[2].textContent="Tu veux retenter ?";
 document.getElementById("go").textContent="Rejouer";
}
document.getElementById("go").onclick=start;
function mv(e){var r=cv.getBoundingClientRect();px=(e.clientX-r.left)*W/r.width}
cv.addEventListener("pointermove",mv);cv.addEventListener("pointerdown",mv);
addEventListener("keydown",function(e){if(e.key==="ArrowLeft"||e.key==="ArrowRight"){keys[e.key]=true;if(location.hash==="#jeu")e.preventDefault()}
 else if(location.hash==="#menu"||!location.hash){}});
addEventListener("keyup",function(e){keys[e.key]=false});
addEventListener("keydown",function(e){if(!location.hash||location.hash==="#menu"){if(e.key==="ArrowLeft")go(cur-1);if(e.key==="ArrowRight")go(cur+1)}});
draw();
