// Use pointer capture to distinguish a normal click from a whole-widget drag.
export function installWidgetDrag(root,bridge,{closed,onDragged=()=>{}}){
 let press,scheduled;
 const sendMove=()=>{scheduled=undefined;if(press?.dragging)bridge('move');};
 root.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  if(!closed()&&e.target.closest('input,select,textarea,button:not(#logo-toggle):not(#toggle)'))return;
  press={id:e.pointerId,x:e.screenX,y:e.screenY,dragging:false};bridge('start');
  // Capture on the initial target so a click still reaches its button.
  press.target=e.target;press.target.setPointerCapture?.(e.pointerId);
 });
 root.addEventListener('pointermove',e=>{
  if(!press||press.id!==e.pointerId)return;
  if(!press.dragging&&Math.hypot(e.screenX-press.x,e.screenY-press.y)>=5)press.dragging=true;
  if(press.dragging){e.preventDefault();if(!scheduled)scheduled=requestAnimationFrame(sendMove);}
 });
 const finish=e=>{
  if(!press||press.id!==e.pointerId)return;
  if(scheduled){cancelAnimationFrame(scheduled);scheduled=undefined;}
  if(press.dragging){bridge('move');onDragged();}
  bridge('end');press=undefined;
 };
 root.addEventListener('pointerup',finish);root.addEventListener('pointercancel',finish);
 root.addEventListener('lostpointercapture',e=>{if(press)finish(e);});
}
