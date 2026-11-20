import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import{readFileSync}from'node:fs';
const src=readFileSync(new URL('../ui/overlay.js',import.meta.url),'utf8');
test('new tracked window starts with zero snow instead of a prefilled cap',()=>{
 const box={performance:{now:()=>100},lastDesktopSample:undefined,rectangles:[],taskbars:[],mouse:{},updatePointer(){},settings:{enabled:true,paused:false,taskbar:true},piles:new Map(),height:1080,column:6};vm.createContext(box);
 const fn=src.slice(src.indexOf('function desktop(frame)'),src.indexOf('  for (const [id, pile] of piles)'))+'}';
 vm.runInContext(fn+';desktop({rectangles:[{id:"window",top:200,left:20,right:620}],mouse:{}})',box);
 assert.equal(box.piles.size,1);assert.ok([...box.piles.get('window').profile].every(d=>d===0));
});
test('first snowfall tick does not seed flakes across the desktop',()=>{
 const box={snowRenderer:true,settings:{paused:false,intensity:65},snowReady:false,fraction:0,particles:[],width:1920};vm.createContext(box);
 const fn=src.slice(src.indexOf('function updateParticles(dt)'),src.indexOf('  const byId =',src.indexOf('function updateParticles(dt)')))+'}';
 vm.runInContext(fn+';updateParticles(0)',box);assert.equal(box.particles.length,0);assert.equal(box.snowReady,true);
});
