import test from 'node:test';
import assert from 'node:assert/strict';
import {createWinterProps} from '../ui/winter-props.js';

function fixture() {
  const values=new Map();
  globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  globalThis.Image=class {complete=true;naturalWidth=640;};
  let captured=false, anchorPosition={x:200,y:250};
  const context={save(){},restore(){},drawImage(){},fillRect(){},fillText(){},
    createRadialGradient(){return {addColorStop(){}};}};
  const host={screenKey:'test',width:()=>800,height:()=>600,scale:()=>1,floor:()=>560,
    capture:x=>captured=x,anchorAt:p=>({id:'window',x:p.x,y:p.y}),resolveAnchor:()=>anchorPosition};
  const layer=createWinterProps(context,host);
  const saved=()=>JSON.parse([...values.values()][0]||'[]');
  return {layer,context,host,saved,get captured(){return captured},removeWindow(){anchorPosition=null}};
}
test('lantern click switches its light; removal clears persistent props',()=>{
  const f=fixture();f.layer.place('lantern',{x:200,y:250});
  f.layer.pointer({x:200,y:220,pressed:true},{pressed:false});
  f.layer.pointer({x:200,y:220,pressed:false},{pressed:true});
  assert.equal(f.saved()[0].lit,false);
  f.layer.clear();assert.deepEqual(f.saved(),[]);assert.equal(f.layer.active,false);
});
test('closed support window makes a prop settle onto the taskbar',()=>{
  const f=fixture();f.layer.place('snack',{x:200,y:250});f.removeWindow();
  for(let i=0;i<120;i++)f.layer.paint(i*16,.016);
  assert.equal(f.saved()[0].y,560);
});
test('invalid prop names are ignored and creation is bounded',()=>{
  const f=fixture();f.layer.place('santa',{x:200,y:250});assert.equal(f.layer.active,false);
  for(let i=0;i<30;i++)f.layer.place('snack',{x:200,y:250});
  assert.equal(f.saved().length,24);
});
test('right-click removal affects only the selected prop and persists',async()=>{
 const f=fixture();f.host.contextMenu=async id=>{assert.ok(id.startsWith('prop-'));return 'remove'};
 f.layer.place('lantern',{x:200,y:250});f.layer.place('snack',{x:400,y:250});
 f.layer.pointer({x:200,y:220,rightPressed:true,pressed:false},{rightPressed:false});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.saved().length,1);assert.equal(f.saved()[0].kind,'snack');assert.equal(f.captured,false);
});
test('dismissing the removal menu preserves all props',async()=>{
 const f=fixture();f.host.contextMenu=async()=>null;f.layer.place('lantern',{x:200,y:250});
 f.layer.pointer({x:200,y:220,rightPressed:true},{rightPressed:false});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(f.saved().length,1);
});
