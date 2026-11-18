import test from 'node:test';import assert from 'node:assert/strict';
import {moveSurfaceSnow,snowLip,snowCrown,supportMoved}from '../ui/window-snow.js';
const seed=()=>{let n=42;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);};
test('moving window sheds irregular chunks while conserving snow',()=>{
 const rect={id:'window',left:0,right:960,top:100},p={rect,profile:new Float32Array(160).fill(12)},chunks=[];
 moveSurfaceSnow(p,rect,{...rect,left:25,right:985,top:110},.02,6,(...a)=>chunks.push(a),seed());
 assert.ok(chunks.length>3);const total=p.profile.reduce((a,b)=>a+b,0)+chunks.reduce((a,b)=>a+b[2],0);assert.ok(Math.abs(total-1920)<.003);
 assert.ok(chunks.every(c=>Math.abs(c[3])<=4&&c[4]>=0));
});
test('stationary window and taskbar do not shed snow; lip is bounded and disappears when empty',()=>{
 const rect={id:'window',left:0,right:120,top:100},p={rect,profile:new Float32Array(20).fill(12)};
 moveSurfaceSnow(p,rect,rect,.02,6,()=>assert.fail());moveSurfaceSnow(p,rect,{...rect,taskbar:true,left:50},.02,6,()=>assert.fail());
 for(let x=0;x<120;x++){assert.ok(snowLip(rect,12,x,120)>=0&&snowLip(rect,12,x,120)<=6);assert.equal(snowLip(rect,0,x,120),0);assert.ok(snowLip({...rect,taskbar:true},12,x,120)<=5);}
});

test('crown remains stable and disappears with the gathered snow',()=>{for(let x=0;x<400;x++){assert.equal(snowCrown(0,x),0);assert.equal(snowCrown(12,x),snowCrown(12,x));assert.ok(snowCrown(12,x)>=12&&snowCrown(12,x)<21);assert.ok(snowLip({id:'window'},1,x,400)<=.45);}});

test('horizontal move leaves retained snow at its world position; uncovered snow falls gently',()=>{
 const old={id:'window',left:0,right:120,top:100},next={...old,left:12,right:132},p={profile:new Float32Array(20).fill(10)},chunks=[];
 moveSurfaceSnow(p,old,next,.02,6,(...a)=>chunks.push(a),()=>.5);
 assert.equal(p.profile[0],10);assert.equal(p.profile[19],0);assert.equal(p.profile[18],0);
 assert.ok(chunks.every(c=>c[0]<12&&Math.abs(c[3])<=4&&c[4]>=0));
 assert.ok(Math.abs(p.profile.reduce((a,b)=>a+b,0)+chunks.reduce((a,c)=>a+c[2],0)-200)<.001);
});
test('lowering a window drops its snow and releases a snowball or snowman support',()=>{
 const old={id:'window',left:0,right:120,top:100},next={...old,top:160},p={profile:new Float32Array(20).fill(10)},chunks=[];
 moveSurfaceSnow(p,old,next,.02,6,(...a)=>chunks.push(a),()=>.5);assert.ok(p.profile.every(v=>v===0));assert.equal(chunks.reduce((a,c)=>a+c[2],0),200);
 assert.equal(supportMoved(old,next),true);assert.equal(supportMoved(old,{...old,left:20}),true);assert.equal(supportMoved(old,old),false);
});
