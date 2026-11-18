import test from 'node:test';import assert from 'node:assert/strict';
import {brushSnow} from '../ui/snow-brush.js';
const make=()=>({rect:{left:0,right:180,top:100},profile:new Float32Array(30).fill(12)});
test('hover brush scatters exactly the removed snow and keeps the profile nonnegative',()=>{
 const p=make();let emitted=0,n=0;const before=p.profile.reduce((a,b)=>a+b,0);
 const removed=brushSnow(p,{x:10,y:94},{x:170,y:94},.02,6,(x,y,d,vx,vy)=>{emitted+=d;n++;assert.ok(vy<0);},()=>true,()=>.5);
 assert.ok(n>0);assert.equal(removed,emitted);assert.ok(Math.abs(before-p.profile.reduce((a,b)=>a+b,0)-emitted)<.001);
 assert.ok(p.profile.every(d=>d>=0));
});
test('dragging, teleporting and covered snow do not trigger brushing',()=>{
 for(const [from,to,visible]of [[{x:10,y:94,pressed:true},{x:170,y:94},()=>true],[{x:-1000,y:94},{x:170,y:94},()=>true],[{x:10,y:94},{x:170,y:94},()=>false]]){
  const p=make();assert.equal(brushSnow(p,from,to,.02,6,()=>assert.fail(),visible),0);assert.ok(p.profile.every(d=>d===12));
 }
});
