import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync}from'node:fs';
import{ballSizeLimit}from'../ui/ball-settings.js';import{gatherSnow}from'../ui/snow-gather.js';
test('ball size defaults and invalid persisted values remain bounded',()=>{
 assert.equal(ballSizeLimit(undefined),80);assert.equal(ballSizeLimit(NaN),80);assert.equal(ballSizeLimit(-20),40);assert.equal(ballSizeLimit(1000),120);assert.equal(ballSizeLimit(73.8),74);
});
test('actual rolling function grows to the configured cap and does not shrink existing balls',()=>{
 const source=readFileSync(new URL('../ui/overlay.js',import.meta.url),'utf8');const fn=source.slice(source.indexOf('function rollOnSnow('),source.indexOf('\nfunction updateBallPointer'));
 for(const maximum of [40,80,120]){
  const box={ballSizeLimit,gatherSnow,Math,Float32Array};vm.createContext(box);
  vm.runInContext(`const column=6,settings={maxBallSize:${maximum}},mouse={x:20};const pile={rect:{left:0,right:600,top:500},profile:new Float32Array(100).fill(100000)};const snowAt=()=>({pile,index:50});${fn};const ball={x:300,y:490,size:6};for(let i=0;i<1000;i++)rollOnSnow(ball,{x:300,y:400},100);globalThis.radius=ball.size;settings.maxBallSize=40;const before=pile.profile.slice();rollOnSnow(ball,{x:300,y:400},100);globalThis.after=ball.size;globalThis.same=before.every((v,i)=>v===pile.profile[i]);`,box);
  assert.ok(Math.abs(box.radius-maximum)<.001);assert.equal(box.after,box.radius);assert.ok(box.same);
 }
});
