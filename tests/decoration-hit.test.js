import test from 'node:test';import assert from 'node:assert/strict';
import {decorationAt,removeDecoration}from '../ui/decoration-hit.js';
const resolve=a=>a;
test('remove only the pointed tree and ignore empty space',()=>{
 const trees=[{anchor:{x:50,y:120}},{anchor:{x:150,y:120}}];const target=decorationAt({x:50,y:70},trees,[],[],resolve);
 assert.equal(target.item,trees[0]);assert.equal(removeDecoration(target),true);assert.equal(trees.length,1);assert.equal(trees[0].anchor.x,150);assert.equal(removeDecoration(target),false);
 assert.equal(decorationAt({x:350,y:50},trees,[],[],resolve),null);
});
test('rope segments and gifts can be selected individually',()=>{
 const rope={a:{x:0,y:0},b:{x:100,y:0},rope:{nodes:[{x:0,y:0},{x:50,y:30},{x:100,y:0}]}},garlands=[rope],gifts=[{x:150,y:100}];
 assert.equal(decorationAt({x:25,y:15},[],garlands,gifts,resolve).item,rope);
 const target=decorationAt({x:150,y:96},[],garlands,gifts,resolve);removeDecoration(target);assert.equal(gifts.length,0);assert.equal(garlands.length,1);
});
