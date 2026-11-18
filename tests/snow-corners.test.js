import test from 'node:test';import assert from 'node:assert/strict';import{createPowderPainter}from'../ui/powder-snow.js';
test('both window ends draw below the ledge outside its width, and disappear when cleared',()=>{
 const calls=[],outline=[],ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(...p){outline.push(p)},closePath(){},clip(){},fillRect(...a){calls.push(a)},createLinearGradient(){return{addColorStop(){}}},drawImage(){}};
 const painter=createPowderPainter({image:{}}),profile=new Float32Array(40).fill(20);
 painter.paint(ctx,profile,240,6,50,{overhang:true});
 assert.ok(outline.some(c=>c[0]<0&&c[1]>50));assert.ok(outline.some(c=>c[0]>240&&c[1]>50));
 calls.length=0;profile.fill(0);painter.paint(ctx,profile,240,6,50,{overhang:true});assert.equal(calls.length,0);
});
