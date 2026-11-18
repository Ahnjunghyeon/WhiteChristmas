import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync}from'node:fs';
import {landing}from'../ui/geometry.js';
test('fullscreen behind a floating window does not intercept snowfall at the screen ceiling',()=>{
 const floating={id:'dialog',left:20,right:300,top:160,bottom:500},full={id:'full',left:0,right:1920,top:0,bottom:1080};
 assert.equal(landing([floating,full],100,-14,100,2,true),null);
 assert.equal(landing([floating,full],100,155,100,165,true)?.rect.id,'dialog');
 const front={id:'front',left:0,right:400,top:80,bottom:600};assert.equal(landing([front,floating,full],100,155,100,165,true),null);
});
test('bottom deposits remain on the screen floor even with a bottom taskbar',()=>{
 const src=readFileSync(new URL('../ui/overlay.js',import.meta.url),'utf8');const fn=src.slice(src.indexOf('function addPile('),src.indexOf('\nfunction spawnFlake('));const box={Math,Float32Array};vm.createContext(box);
 vm.runInContext(`const column=6,settings={taskbar:true,paused:false},piles=new Map();const ground={rect:{id:'ground',left:0,right:120,top:1080},profile:new Float32Array(20)};${fn};addPile({rect:ground.rect,x:60},1.25);globalThis.deposited=ground.profile.some(v=>v>0);globalThis.noRedirect=piles.size===0;`,box);
 assert.ok(box.deposited);assert.ok(box.noRedirect);
});
