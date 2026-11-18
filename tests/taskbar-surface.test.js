import test from 'node:test';import assert from 'node:assert/strict';import {normalizeBottomTaskbar}from '../ui/taskbar-surface.js';import {snowContour}from '../ui/snow-surface.js';
test('bottom taskbar uses work area edge without duplicate DWM surfaces',()=>{
 const window={id:'app',left:10,right:500,top:80,bottom:900},bar={id:'old',left:0,right:1920,top:1042,bottom:1080,taskbar:true};
 const result=normalizeBottomTaskbar([window,bar],1920,1080,1032);assert.equal(result[0].top,1032);assert.equal(result.filter(r=>r.taskbar).length,1);assert.equal(result[1],window);
 assert.deepEqual(normalizeBottomTaskbar([window],1920,1080,1080),[window]);
});
test('rounded overhang is continuous, irregular, bounded and follows remaining snow',()=>{
 const lobes=[];for(let x=20;x<800;x++){const c=snowContour(20,x,800);assert.ok(c.bottom>0&&c.bottom<=6);lobes.push(Math.round(c.bottom*10));assert.equal(snowContour(0,x,800).bottom,0);assert.equal(snowContour(20,x,800,false).bottom,0);}
 assert.ok(new Set(lobes).size>20);
});
