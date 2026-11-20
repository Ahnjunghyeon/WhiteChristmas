import test from'node:test';import assert from'node:assert/strict';
import{installWidgetDrag}from'../ui/widget-drag.js';import{pinnedWidgetBounds}from'../ui/widget-bounds.js';
function harness(){const handlers=new Map(),messages=[];let dragged=0;const root={addEventListener(n,f){handlers.set(n,f)}};const target={closest:()=>false,setPointerCapture(){}};installWidgetDrag(root,p=>messages.push(p),{closed:()=>true,onDragged:()=>dragged++});return{send(n,x,y){handlers.get(n)({button:0,pointerId:1,screenX:x,screenY:y,target,preventDefault(){}});},messages,get dragged(){return dragged;}};}
test('click preserves click semantics; dragging any collapsed surface signals movement and suppresses click',()=>{
 const oldRaf=globalThis.requestAnimationFrame,oldCancel=globalThis.cancelAnimationFrame;globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
 try{const click=harness();click.send('pointerdown',100,100);click.send('pointerup',101,100);assert.deepEqual(click.messages,['start','end']);assert.equal(click.dragged,0);
 const drag=harness();drag.send('pointerdown',100,100);drag.send('pointermove',112,105);drag.send('pointerup',112,105);assert.deepEqual(drag.messages,['start','move','end']);assert.equal(drag.dragged,1);
 }finally{globalThis.requestAnimationFrame=oldRaf;globalThis.cancelAnimationFrame=oldCancel;}
});
test('expansion retains logo position even at screen right and bottom edges',()=>{
 const rect=pinnedWidgetBounds({x:1800,y:900},{width:1000,height:590},{x:0,y:0,width:1920,height:1080});assert.deepEqual(rect,{x:1800,y:900,width:120,height:180});
 const normal=pinnedWidgetBounds({x:300,y:100},{width:1000,height:590},{x:0,y:0,width:1920,height:1080});assert.equal(normal.x,300);assert.equal(normal.y,100);assert.equal(normal.width,1000);
});
