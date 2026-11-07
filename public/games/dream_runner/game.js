import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const $ = (id) => document.getElementById(id);
const video = $("cameraVideo"), cameraBtn = $("cameraBtn"), cameraStatus = $("cameraStatus");
const cameraPlaceholder = $("cameraPlaceholder"), eyeInstruction = $("eyeInstruction");
const centerMessage = $("centerMessage"), finishMessage = $("finishMessage");
const timerEl = $("timer"), progressBar = $("progressBar"), progressText = $("progressText");
const pauseBtn = $("pauseBtn"), durationSelect = $("durationSelect");
let landmarker=null, stream=null, cameraOn=false, gameStarted=false, paused=false, finished=false;
let remaining=180,totalDuration=180,lastFrame=0,lastInference=0,eyesClosed=false;
let audioContext=null,musicTimer=null,soundOn=true,stars=0,closedSeconds=0;
let gameDistance=0, worldTravel=0, runner=null, leftLeg=null,rightLeg=null,leftArm=null,rightArm=null;
let renderer, scene3d, camera3d, clock3d, foliage=[], groundMarks=[], finishArch, fireflies=[];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const formatTime=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.ceil(s%60)).padStart(2,"0")}`;
function setStatus(message,active=false){cameraStatus.lastChild.textContent=" "+message;cameraStatus.classList.toggle("active",active);}

/* --- Real-time 3D world: procedural forest, terrain, character and cinematic lighting --- */
function makeSurfaceTexture(base, accent, seed=1) {
  const c=document.createElement("canvas"); c.width=512; c.height=512;
  const ctx=c.getContext("2d"); ctx.fillStyle=base; ctx.fillRect(0,0,512,512);
  let n=seed>>>0; const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
  for(let i=0;i<18000;i++){
    const x=rand()*512,y=rand()*512,a=.025+rand()*.12;
    ctx.globalAlpha=a;ctx.fillStyle=rand()>.5?accent:"#171b12";
    if(seed===17){ctx.fillRect(x,y,1+rand()*3,8+rand()*36);}
    else ctx.fillRect(x,y,1+rand()*3,1+rand()*3);
  }
  ctx.globalAlpha=1;
  const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}
const barkTex=makeSurfaceTexture("#59432d","#a17a4c",17);
const soilTex=makeSurfaceTexture("#314532","#72804a",23);
const trailTex=makeSurfaceTexture("#9a7953","#d0ad7b",41);
function mat(color, roughness=.88, extra={}) { return new THREE.MeshStandardMaterial({color,roughness,...extra}); }
function addMesh(parent,geometry,material,pos,rot=null,scale=null) {
  const m=new THREE.Mesh(geometry,material); m.position.set(...pos);
  if(rot)m.rotation.set(...rot); if(scale)m.scale.set(...scale);
  m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function makeTree(x,z,s=1,seed=0) {
  const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(s); scene3d.add(g);
  const trunk=new THREE.MeshStandardMaterial({map:barkTex,roughness:1,color:seed%2?"#b0a080":"#ffffff"});
  addMesh(g,new THREE.CylinderGeometry(.16,.32,3.8,8),trunk,[0,1.9,0],[0,0,seed*.1]);
  const greens=["#173f32","#1d5038","#285b3c","#315e3c","#214a36"];
  for(let i=0;i<5;i++){
    const r=1.15-i*.12, y=2.4+i*.58;
    const crown=addMesh(g,new THREE.SphereGeometry(r,16,12),mat(greens[(seed+i)%greens.length]),[(Math.sin(seed+i)*.18),y,(Math.cos(seed*i+1)*.14)]);
    crown.scale.y=1.15;
  }
  // smaller leafy branches for a less geometric silhouette
  for(let i=0;i<4;i++){
    const b=addMesh(g,new THREE.SphereGeometry(.55,14,10),mat(greens[(seed+i+2)%greens.length]),[Math.sin(i*2.4+seed)*.9,2.8+i*.34,Math.cos(i*2.4+seed)*.75]);
    b.scale.set(1.25,.8,1);
  }
  foliage.push(g); return g;
}
function makeCharacter() {
  const group=new THREE.Group(); scene3d.add(group); group.position.set(0,0,2.1);
  const skin=mat("#c98763"), shirt=mat("#d7a45d"), pants=mat("#263c38"), boots=mat("#382b24"), hair=mat("#30251f"), pack=mat("#8c5937");
  // boots and articulated legs
  leftLeg=new THREE.Group(); rightLeg=new THREE.Group();
  for(const [leg,x] of [[leftLeg,-.19],[rightLeg,.19]]) {
    leg.position.set(x,.85,0); group.add(leg);
    addMesh(leg,new THREE.CapsuleGeometry(.105,.55,4,8),pants,[0,-.23,0]);
    addMesh(leg,new THREE.BoxGeometry(.23,.14,.38),boots,[0,-.59,-.09]);
  }
  // torso, neck and head
  addMesh(group,new THREE.CapsuleGeometry(.34,.62,6,12),shirt,[0,1.55,0]);
  addMesh(group,new THREE.CylinderGeometry(.12,.13,.18,10),skin,[0,2.03,0]);
  addMesh(group,new THREE.SphereGeometry(.29,20,16),skin,[0,2.34,-.015]);
  addMesh(group,new THREE.SphereGeometry(.30,16,12),hair,[0,2.52,.025],[0,0,0],[1.04,.55,1]);
  // ears and nose hint
  addMesh(group,new THREE.SphereGeometry(.055,10,8),skin,[-.29,2.34,0]);
  addMesh(group,new THREE.SphereGeometry(.055,10,8),skin,[.29,2.34,0]);
  // backpack visible from behind
  addMesh(group,new THREE.BoxGeometry(.48,.58,.25),pack,[0,1.58,.29],[.08,0,0]);
  addMesh(group,new THREE.BoxGeometry(.34,.13,.08),mat("#bd8750"),[0,1.56,.43]);
  leftArm=new THREE.Group();rightArm=new THREE.Group();
  for(const [arm,x,side] of [[leftArm,-.39,-1],[rightArm,.39,1]]) {
    arm.position.set(x,1.82,0); group.add(arm);
    addMesh(arm,new THREE.CapsuleGeometry(.095,.48,4,8),shirt,[0,-.28,0],[0,0,side*.12]);
    addMesh(arm,new THREE.SphereGeometry(.09,10,8),skin,[0,-.57,-.01]);
  }
  return group;
}
function init3D(){
  const canvas=$("world3d");
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
  scene3d=new THREE.Scene(); scene3d.background=new THREE.Color("#9ab4a6");
  scene3d.fog=new THREE.FogExp2("#9ab4a6",.012);
  camera3d=new THREE.PerspectiveCamera(52,1,.1,180);
  camera3d.position.set(0,4.1,9.5); camera3d.lookAt(0,1.5,-9);
  const hemi=new THREE.HemisphereLight("#dcefe3","#394333",2.0); scene3d.add(hemi);
  const sun=new THREE.DirectionalLight("#ffe0ae",3.2); sun.position.set(-8,15,5); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-18;
  sun.shadow.bias=-.00025; scene3d.add(sun);
  const fill=new THREE.DirectionalLight("#b3d8e7",.85);fill.position.set(8,7,-10);scene3d.add(fill);
  // distant layered hills
  for(let layer=0;layer<3;layer++){
    const hillmat=mat(["#536e5b","#405f4d","#314f40"][layer]);
    const hill=addMesh(scene3d,new THREE.CylinderGeometry(12+layer*2,14+layer*2,5+layer*2,12,1),hillmat,[0,2-layer*.2,-39-layer*13],[0,0,0]);
    hill.scale.x=2.8; hill.scale.z=.65;
  }
  // forest floor and winding earthy path
  const forestFloor=new THREE.MeshStandardMaterial({map:soilTex,roughness:1});
  const floor=addMesh(scene3d,new THREE.PlaneGeometry(150,190),forestFloor,[0,-.12,-65],[-Math.PI/2,0,0]);
  soilTex.repeat.set(12,18);
  const pathShape=new THREE.Shape(); pathShape.moveTo(-1.2,0);pathShape.lineTo(1.2,0);pathShape.lineTo(8,190);pathShape.lineTo(-8,190);
  const pathGeo=new THREE.ShapeGeometry(pathShape);
  trailTex.repeat.set(2,14);
  const path=addMesh(scene3d,pathGeo,new THREE.MeshStandardMaterial({map:trailTex,roughness:1}),[0,.005,20],[-Math.PI/2,0,0]);
  // path edge grasses and stones
  for(let i=0;i<180;i++){
    const z=10-(i/180)*145, side=i%2?1:-1, x=side*(2.1+Math.random()*5.2);
    if(i%3===0){
      const rock=addMesh(scene3d,new THREE.DodecahedronGeometry(.12+Math.random()*.2,0),mat("#65705a"),[x,.02,z]);
      rock.rotation.set(Math.random(),Math.random(),Math.random());
    }else{
      const tuft=addMesh(scene3d,new THREE.ConeGeometry(.07+Math.random()*.08,.45+Math.random()*.4,5),mat(i%2?"#6a8750":"#82935b"),[x,.2,z],[.15,0,side*.18]);
    }
  }
  // dense trees receding in perspective, with irregular scale and placement
  for(let row=0;row<10;row++){
    const z=8-row*14;
    for(let j=0;j<9;j++){
      const side=j<4?-1:1, x=side*(4.5+(j%4)*2.4+Math.random()*1.5);
      makeTree(x,z+(Math.random()-.5)*8,.72+Math.random()*.75,row*11+j);
    }
  }
  // distant pine silhouettes
  for(let i=0;i<28;i++){
    const side=i%2?1:-1,x=side*(10+Math.random()*12),z=-30-Math.random()*80;
    const tree=makeTree(x,z,.5+Math.random()*.5,i+30);
  }
  // glowing dust / fireflies
  const points=[];
  for(let i=0;i<100;i++) points.push((Math.random()-.5)*18,Math.random()*5+.2,-Math.random()*110);
  const pgeo=new THREE.BufferGeometry();pgeo.setAttribute("position",new THREE.Float32BufferAttribute(points,3));
  const pmat=new THREE.PointsMaterial({color:"#f7d99a",size:.055,transparent:true,opacity:.65});
  const dust=new THREE.Points(pgeo,pmat);scene3d.add(dust);fireflies.push(dust);
  // finish arch far down the trail
  finishArch=new THREE.Group();finishArch.position.set(0,0,-118);scene3d.add(finishArch);
  const gold=mat("#d7b77b",.38,{metalness:.35});
  addMesh(finishArch,new THREE.TorusGeometry(1.25,.12,12,32,Math.PI),gold,[0,2.1,0],[0,0,Math.PI]);
  addMesh(finishArch,new THREE.CylinderGeometry(.12,.16,2.5,10),gold,[-1.25,1.2,0]);
  addMesh(finishArch,new THREE.CylinderGeometry(.12,.16,2.5,10),gold,[1.25,1.2,0]);
  runner=makeCharacter();
  resize3D(); window.addEventListener("resize",resize3D);
  clock3d=new THREE.Clock(); render3D();
}
function resize3D(){
  if(!renderer)return;const w=$("scene").clientWidth,h=$("scene").clientHeight;
  renderer.setSize(w,h,false);camera3d.aspect=w/h;camera3d.updateProjectionMatrix();
}
function render3D(){
  requestAnimationFrame(render3D);
  if(!renderer)return;
  const t=performance.now()*.001;
  const running=gameStarted&&!paused&&!finished&&cameraOn&&eyesClosed;
  const stride=running?Math.sin(t*11):Math.sin(t*1.5)*.035;
  if(runner){
    leftLeg.rotation.x=stride*.75;rightLeg.rotation.x=-stride*.75;
    leftArm.rotation.x=-stride*.55;rightArm.rotation.x=stride*.55;
    runner.position.y=running?Math.abs(Math.sin(t*11))*.045:Math.sin(t*1.4)*.012;
    runner.rotation.y=Math.sin(t*.7)*.025;
  }
  // The forest subtly drifts forward only while the player is moving.
  foliage.forEach((tree,i)=>{
    const dz=(worldTravel*.95)%(14);
    tree.position.z=tree.userData.baseZ===undefined?tree.position.z:tree.userData.baseZ+dz;
    if(tree.userData.baseZ===undefined)tree.userData.baseZ=tree.position.z;
    if(tree.position.z>15)tree.position.z-=140;
  });
  if(finishArch)finishArch.position.z=-118+worldTravel*105;
  fireflies.forEach((p,i)=>{p.rotation.y=t*.012;p.position.y=Math.sin(t*.5)*.08;});
  renderer.render(scene3d,camera3d);
}
init3D();

async function setupLandmarker(){
  if(landmarker)return landmarker;
  eyeInstruction.textContent="กำลังเตรียมระบบตรวจจับดวงตา…";
  const vision=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  landmarker=await FaceLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",delegate:"GPU"},runningMode:"VIDEO",numFaces:1,outputFaceBlendshapes:true});
  return landmarker;
}
async function toggleCamera(){
  if(cameraOn){stopCamera();return;}
  try{
    cameraBtn.disabled=true;cameraBtn.textContent="กำลังเปิดกล้อง…";await setupLandmarker();
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}});
    video.srcObject=stream;await video.play();cameraOn=true;video.style.display="block";cameraPlaceholder.style.display="none";
    cameraBtn.textContent="ปิดกล้อง";eyeInstruction.textContent="จัดใบหน้าให้อยู่กลางภาพ แล้วลองหลับตาเบา ๆ";setStatus("กล้องพร้อมแล้ว",true);
  }catch(error){console.error(error);cameraBtn.textContent="ลองเปิดกล้องอีกครั้ง";eyeInstruction.textContent="เปิดกล้องไม่สำเร็จ กรุณาอนุญาตสิทธิ์กล้องและใช้ HTTPS หรือ localhost";setStatus("ยังไม่พร้อม",false);}
  finally{cameraBtn.disabled=false;}
}
function stopCamera(){
  if(stream)stream.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null;video.style.display="none";
  cameraPlaceholder.style.display="flex";cameraOn=false;eyesClosed=false;cameraBtn.textContent="เปิดกล้อง";
  eyeInstruction.textContent="เปิดกล้องเพื่อให้เกมตรวจจับสถานะดวงตา";setStatus("ยังไม่ได้เปิดกล้อง",false);
}
function detectEyes(now){
  if(!cameraOn||!landmarker||video.readyState<2)return;
  if(now-lastInference<80)return;lastInference=now;
  const result=landmarker.detectForVideo(video,now),cats=result.faceBlendshapes?.[0]?.categories;
  if(!cats){eyesClosed=false;setStatus("ไม่พบใบหน้า",false);eyeInstruction.textContent="กรุณาหันหน้าเข้าหากล้อง";return;}
  const score=n=>cats.find(x=>x.categoryName===n)?.score??0;
  eyesClosed=score("eyeBlinkLeft")>.52&&score("eyeBlinkRight")>.52;
  setStatus(eyesClosed?"ตรวจพบว่าหลับตา":"ตรวจพบใบหน้าแล้ว",true);
  eyeInstruction.textContent=eyesClosed?"ดีมาก หายใจสบาย ๆ ตัวละครกำลังเดินทาง":"เมื่อพร้อม ลองหลับตาเบา ๆ ได้เลย";
}
function updateGame(delta){
  if(!gameStarted||paused||finished)return;
  remaining=Math.max(0,remaining-delta);timerEl.textContent=formatTime(remaining);
  if(cameraOn&&eyesClosed){
    gameDistance=clamp(gameDistance+delta/totalDuration,0,1);
    worldTravel+=delta*1.4;stars=Math.min(3,Math.floor(gameDistance*3.01));
    closedSeconds+=delta;$("starsCount").textContent=stars;
  }
  progressBar.style.width=`${gameDistance*100}%`;progressText.textContent=`${Math.round(gameDistance*100)}%`;
  if(remaining<=0)finishGame(gameDistance);
}
function finishGame(distance){
  finished=true;gameStarted=false;stopMusic();$("resultTime").textContent=formatTime(totalDuration);
  $("resultStars").textContent=Math.max(1,Math.round(distance*3));finishMessage.classList.remove("hidden");
  centerMessage.classList.add("hidden");pauseBtn.disabled=true;pauseBtn.textContent="พักเกม";playVictory();
}
function resetGame(showIntro=true){
  gameStarted=false;paused=false;finished=false;remaining=totalDuration;stars=0;closedSeconds=0;gameDistance=0;worldTravel=0;eyesClosed=false;lastFrame=0;
  timerEl.textContent=formatTime(remaining);progressBar.style.width="0%";progressText.textContent="0%";$("starsCount").textContent="0";
  if(runner){runner.position.set(0,0,2.1);runner.rotation.set(0,0,0);}
  foliage.forEach(t=>{if(t.userData.baseZ!==undefined)t.position.z=t.userData.baseZ;});
  if(finishArch)finishArch.position.z=-118;
  finishMessage.classList.add("hidden");centerMessage.classList.toggle("hidden",!showIntro);pauseBtn.disabled=true;pauseBtn.textContent="พักเกม";stopMusic();
}
async function startGame(){
  if(!cameraOn){centerMessage.classList.add("hidden");eyeInstruction.textContent="กรุณาเปิดกล้องก่อนเริ่มเกม";await toggleCamera();if(!cameraOn)return;}
  totalDuration=Number(durationSelect.value);remaining=totalDuration;resetGame(false);totalDuration=Number(durationSelect.value);remaining=totalDuration;
  gameStarted=true;pauseBtn.disabled=false;centerMessage.classList.add("hidden");startMusic();
  eyeInstruction.textContent="หลับตาเบา ๆ เมื่อพร้อม ตัวละครจะค่อย ๆ วิ่ง";requestAnimationFrame(loop);
}
function loop(now){
  if(!gameStarted)return;if(!lastFrame)lastFrame=now;const delta=Math.min((now-lastFrame)/1000,.1);lastFrame=now;
  detectEyes(now);updateGame(delta);if(gameStarted)requestAnimationFrame(loop);
}
function togglePause(){
  if(!gameStarted||finished)return;paused=!paused;pauseBtn.textContent=paused?"เล่นต่อ":"พักเกม";
  if(paused)stopMusic();else startMusic();eyeInstruction.textContent=paused?"พักได้ตามสบาย กดเล่นต่อเมื่อพร้อม":"กลับมาเล่นต่อได้เลย";
  if(!paused){lastFrame=0;requestAnimationFrame(loop);}
}
function tone(freq,start,duration,type="sine",volume=.035){
  if(!audioContext||!soundOn)return;const osc=audioContext.createOscillator(),gain=audioContext.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,start);gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+.04);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain).connect(audioContext.destination);osc.start(start);osc.stop(start+duration+.03);
}
function musicStep(){
  if(!audioContext||!soundOn||!gameStarted||paused)return;const now=audioContext.currentTime;
  const notes=[261.63,329.63,392,493.88,392,329.63,293.66,349.23],i=Math.floor(performance.now()/650)%notes.length;
  tone(notes[i],now,.55,"triangle",.025);if(i%2===0)tone(notes[i]*2,now+.08,.35,"sine",.012);
}
function startMusic(){if(!soundOn)return;if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();stopMusic();musicStep();musicTimer=setInterval(musicStep,650);}
function stopMusic(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;}
function playVictory(){if(!audioContext||!soundOn)return;const now=audioContext.currentTime;[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,now+i*.16,.8,"triangle",.05));}
cameraBtn.addEventListener("click",toggleCamera);
$("startBtn").addEventListener("click",startGame);
$("againBtn").addEventListener("click",()=>{resetGame(true);if(cameraOn)eyeInstruction.textContent="กล้องพร้อมแล้ว กดเริ่มเมื่อพร้อม";});
pauseBtn.addEventListener("click",togglePause);
$("resetBtn").addEventListener("click",()=>resetGame(true));
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundToggle").setAttribute("aria-pressed",String(soundOn));$("soundToggle").innerHTML=soundOn?"♫ <span>เสียงเปิด</span>":"♪ <span>เสียงปิด</span>";if(!soundOn)stopMusic();else if(gameStarted&&!paused)startMusic();});
$("helpBtn").addEventListener("click",()=>$("helpDialog").showModal());
durationSelect.addEventListener("change",()=>{if(!gameStarted){totalDuration=Number(durationSelect.value);remaining=totalDuration;timerEl.textContent=formatTime(remaining);}});
window.addEventListener("beforeunload",()=>{stopMusic();if(stream)stream.getTracks().forEach(t=>t.stop());if(renderer)renderer.dispose();});
resetGame(true);