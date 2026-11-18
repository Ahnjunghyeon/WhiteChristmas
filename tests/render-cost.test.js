import test from 'node:test';import assert from 'node:assert/strict';import{createContourSampler,snowContour}from'../ui/snow-surface.js';import vm from'node:vm';import{readFileSync}from'node:fs';
test('cached contours preserve the drawn shape across accumulation depths',()=>{const sample=createContourSampler(960,2);for(const d of [0,1,7,14,28])for(let x=0;x<960;x+=2){const actual=sample(d,x),expected=snowContour(d,x,960);assert.ok(Math.abs(actual.top-expected.top)<1e-8);assert.ok(Math.abs(actual.bottom-expected.bottom)<1e-8);}});
test('snowball sprite is a clean sphere with no dot texture',()=>{
 let ellipses=0;const ctx={scale(){},createRadialGradient(){return{addColorStop(){}}},beginPath(){},ellipse(){ellipses++},fill(){},save(){},translate(){},rotate(){},drawImage(){},restore(){}};
 const src=readFileSync(new URL('../ui/snow-art.js',import.meta.url),'utf8');const box={document:{createElement:()=>({getContext:()=>ctx})},ctx};vm.createContext(box);vm.runInContext(src.slice(0,src.indexOf('export function makeSnowGrain')).replaceAll('export ','')+';drawBall(ctx,20,20,80);drawBall(ctx,30,20,90);',box);assert.equal(ellipses,1);
});
