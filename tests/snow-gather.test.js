import test from 'node:test';import assert from 'node:assert/strict';import {gatherSnow}from '../ui/snow-gather.js';
import {renderQuality}from '../ui/render-quality.js';
test('gathering moves snow into a ridge and conserves the amount absorbed by the ball',()=>{
 const p=new Float32Array(100).fill(12),before=p.reduce((a,b)=>a+b,0)*6;
 const absorbed=gatherSnow(p,40,4,10,12,34,1);
 assert.ok(absorbed>0);assert.ok(p[45]>12);assert.ok(p.every(v=>v>=0));assert.ok(Math.abs(before-p.reduce((a,b)=>a+b,0)*6-absorbed)<.001);
});
test('size limit never deletes snow and edge gathering stays finite',()=>{
 const p=new Float32Array(30).fill(20),before=p.slice();assert.equal(gatherSnow(p,29,5,100,34,34,1),0);assert.deepEqual(p,before);
 const mass=p.reduce((a,b)=>a+b,0)*6,absorbed=gatherSnow(p,29,5,100,33.9,34,1);
 assert.ok(absorbed<=(34*34-33.9*33.9)/.85+.001);assert.ok(Math.abs(mass-p.reduce((a,b)=>a+b,0)*6-absorbed)<.001);
});
test('full HD and Windows high DPI are no longer reduced to a million pixels',()=>{
 assert.ok(renderQuality(1920,1080,1,'high').sceneScale>=1);assert.equal(renderQuality(1920,1080,2,'high').sceneScale,2);
});
