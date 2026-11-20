import test from 'node:test';import assert from 'node:assert/strict';
import{widgetBounds}from'../ui/widget-bounds.js';import{snowDamage}from'../ui/snow-damage.js';
test('widget grows from its top-left and only shifts when it would leave the screen',()=>{
 const a={x:300,y:80},area={x:0,y:0,width:1920,height:1080};
 assert.deepEqual(widgetBounds(a,{width:1000,height:590},area),{x:300,y:80,width:1000,height:590});
 const edge={x:1800,y:1000};const expanded=widgetBounds(edge,{width:1000,height:590},area);
 assert.deepEqual(expanded,{x:920,y:490,width:1000,height:590});
 const smallArea={x:-1280,y:0,width:800,height:600};const small=widgetBounds({x:-1200,y:30},{width:1000,height:590},smallArea);
 assert.deepEqual(small,{x:-1280,y:10,width:800,height:590});
});
test('gathering and plough clearing invalidate only the changed region with interpolation margins',()=>{
 const prev=new Float32Array(320).fill(20),next=prev.slice();
 assert.equal(snowDamage(next,prev,1920),null);next[100]=0;
 const d=snowDamage(next,prev,1920);assert.ok(d.left<=582&&d.right>=624);assert.ok(d.right-d.left<=256);
 next.fill(0);assert.deepEqual(snowDamage(next,prev,1920),{left:0,right:1920});
});
