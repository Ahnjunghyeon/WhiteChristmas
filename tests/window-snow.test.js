import test from 'node:test';import assert from 'node:assert/strict';
import {moveSurfaceSnow,snowLip,snowCrown}from '../ui/window-snow.js';
const seed=()=>{let n=42;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);};
test('moving window sheds irregular chunks while conserving snow',()=>{
 const rect={id:'window',left:0,right:960,top:100},p={rect,profile:new Float32Array(160).fill(12)},chunks=[];
 moveSurfaceSnow(p,rect,{...rect,left:25,right:985,top:110},.02,6,(...a)=>chunks.push(a),seed());
 assert.ok(chunks.length>3);const total=p.profile.reduce((a,b)=>a+b,0)+chunks.reduce((a,b)=>a+b[2],0);assert.ok(Math.abs(total-1920)<.003);
 assert.ok(new Set(chunks.slice(1).map((a,i)=>Math.round(a[0]-chunks[i][0]))).size>3);
});
test('stationary window and taskbar do not shed snow; lip is bounded and disappears when empty',()=>{
 const rect={id:'window',left:0,right:120,top:100},p={rect,profile:new Float32Array(20).fill(12)};
 moveSurfaceSnow(p,rect,rect,.02,6,()=>assert.fail());moveSurfaceSnow(p,rect,{...rect,taskbar:true,left:50},.02,6,()=>assert.fail());
 for(let x=0;x<120;x++){assert.ok(snowLip(rect,12,x,120)>=0&&snowLip(rect,12,x,120)<=5);assert.equal(snowLip(rect,0,x,120),0);assert.equal(snowLip({...rect,taskbar:true},12,x,120),0);}
});

test('crown remains stable and disappears with the gathered snow',()=>{for(let x=0;x<400;x++){assert.equal(snowCrown(0,x),0);assert.equal(snowCrown(12,x),snowCrown(12,x));assert.ok(snowCrown(12,x)>=12&&snowCrown(12,x)<18);assert.ok(snowLip({id:'window'},1,x,400)<.31);}});
