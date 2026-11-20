import test from'node:test';import assert from'node:assert/strict';import{snowmanSections}from'../ui/snowman-layout.js';
test('snowman body masks follow unequal physics circles, with independently scaled accessories',()=>{
 const head={x:110,y:80,size:16},middle={x:110,y:122,size:28},base={x:110,y:195,size:47};
 const p=snowmanSections(head,middle,base);assert.equal(p[0].circle,base);assert.equal(p[1].circle,middle);assert.equal(p.length,6);
 for(const part of p){assert.ok(part.source.every(Number.isFinite));assert.ok(part.target.every(Number.isFinite));assert.ok(part.target[2]>0&&part.target[3]>0);}
 const shifted=snowmanSections({...head,x:130},{...middle,x:130},{...base,x:130});p.forEach((part,i)=>assert.ok(Math.abs(shifted[i].target[0]-part.target[0]-20)<1e-9));
});
