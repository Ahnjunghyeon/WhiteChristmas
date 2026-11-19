import test from'node:test';import assert from'node:assert/strict';import{snowPixelHit}from'../ui/snow-hit.js';
test('pixel readback is lazy, bounded and reused until raster invalidation',()=>{
 let reads=0;const pixels=new Uint8Array(1600);pixels[(10*20+8)*4+3]=255;
 const raster={canvas:{width:20,height:20,getContext:()=>({getImageData:()=>{reads++;return{data:pixels};}})},padding:0,scale:2,baseline:5},rect={left:10,top:100};
 assert.equal(snowPixelHit(raster,rect,{x:900,y:900}),false);assert.equal(reads,0);
 assert.equal(snowPixelHit(raster,rect,{x:14,y:100}),true);assert.equal(reads,1);
 snowPixelHit(raster,rect,{x:14,y:100});assert.equal(reads,1);
 raster.hitData=undefined;snowPixelHit(raster,rect,{x:14,y:100});assert.equal(reads,2);
});
test('only visible opaque snow pixels capture clicks, not transparent window area',()=>{const raster={canvas:{width:20,height:20},padding:0,scale:2,baseline:5,hitData:new Uint8Array(1600)},rect={left:10,top:100};raster.hitData[(10*20+8)*4+3]=255;assert.equal(snowPixelHit(raster,rect,{x:14,y:100}),true);assert.equal(snowPixelHit(raster,rect,{x:15,y:100}),false);assert.equal(snowPixelHit(raster,rect,{x:14,y:110}),false);assert.equal(snowPixelHit(undefined,rect,{x:14,y:100}),false);});
