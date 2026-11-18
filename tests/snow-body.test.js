import test from 'node:test';
import assert from 'node:assert/strict';
import {measureSnowBody} from '../ui/powder-snow.js';
test('snow body excludes detached pixels and follows the continuous material',()=>{
  const w=30,h=100,data=new Uint8ClampedArray(w*h*4);
  for(let x=2;x<28;x++)for(let y=40;y<65;y++)data[(y*w+x)*4+3]=255;
  data[(2*w+10)*4+3]=255;data[(90*w+10)*4+3]=255;
  const body=measureSnowBody(data,w,h);
  assert.equal(body.left,2);assert.equal(body.right,27);
  assert.deepEqual(body.columns[10],{top:40,bottom:65});
  assert.equal(body.height,25);
});
