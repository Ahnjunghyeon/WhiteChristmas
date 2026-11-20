import test from'node:test';import assert from'node:assert/strict';import vm from'node:vm';import{readFileSync}from'node:fs';import{settingsLayout}from'../ui/widget-bounds.js';
const source=readFileSync(new URL('../ui/overlay.js',import.meta.url),'utf8');
test('right-edge expansion preserves screen logo x with a usable content width',()=>{const anchor={x:1640,y:80},l=settingsLayout(anchor,{width:1000,height:590},{x:0,y:0,width:1920,height:1080});assert.equal(l.bounds.width,360);assert.equal(l.bounds.x+l.logoX,anchor.x);assert.equal(l.bounds.x+l.bounds.width,1920);});
test('ground deposits cap at six pixels',()=>{const fn=source.slice(source.indexOf('function addPile('),source.indexOf('\nfunction spawnFlake'));const box={settings:{},column:6,piles:new Map(),ground:{profile:new Float32Array(100)}};vm.createContext(box);vm.runInContext(fn+`;for(let i=0;i<100;i++)addPile({rect:{id:'ground',left:0},x:300},100);globalThis.peak=Math.max(...ground.profile);`,box);assert.equal(box.peak,6);});
test('release from rolling preserves horizontal momentum and clears rolling state',()=>{
 const fn=source.slice(source.indexOf('function updateBallPointer('),source.indexOf('\nfunction paintSnowProps'));
 const rect={id:'window',left:0,right:600,top:400};const ball={x:300,y:380,size:20,vx:140,vy:0,rolling:{id:'window',rect}};
 const box={pendingSnow:undefined,balls:[ball],grabbed:ball,piles:new Map([['window',{rect}]]),mouse:{x:300,y:380,pressed:true},snowAt:()=>null,supportMoved:()=>false,capturePointer(){},findDecoration:()=>null,Math};vm.createContext(box);vm.runInContext(fn+`;updateBallPointer({x:300,y:380,pressed:false},.016);`,box);
 assert.equal(ball.support,'window');assert.equal(ball.vx,140);assert.equal(ball.y,380);assert.equal(ball.rolling,undefined);assert.equal(box.grabbed,undefined);
});
