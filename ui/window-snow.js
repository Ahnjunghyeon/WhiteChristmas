import { snowContour } from './snow-surface.js';
import { resizeProfile } from './snow-profile.js';
export function moveSurfaceSnow(pile,previous,next,dt,column,emit,rng=Math.random){
 if(next.taskbar)return;
 if(Math.abs(next.left-previous.left)+Math.abs(next.top-previous.top)<.5)return;
 const vertical=Math.abs(next.top-previous.top)>.5;
 const result=vertical?{retained:new Float32Array(Math.ceil((next.right-next.left)/column)),detached:Array.from(pile.profile,(depth,i)=>({x:previous.left+(i+.5)*column,depth}))}:resizeProfile(pile.profile,previous,next,column);
 let count=0,group;
 for(const patch of result.detached){
  if(patch.depth<=0)continue;
  if(!group||count<=0){if(group)emit(group.x,group.y,group.depth,(rng()-.5)*8,2+rng()*5);group={x:patch.x,y:previous.top-patch.depth*.5,depth:patch.depth};count=1+Math.floor(rng()*3);}
  else{const total=group.depth+patch.depth;group.x=(group.x*group.depth+patch.x*patch.depth)/total;group.y=(group.y*group.depth+(previous.top-patch.depth*.5)*patch.depth)/total;group.depth=total;}
  count--;
 }
 if(group)emit(group.x,group.y,group.depth,(rng()-.5)*8,2+rng()*5);
 pile.profile=result.retained;pile.displayProfile=undefined;pile.raster=undefined;
}

export function snowLip(rect,depth,x,width){return Math.min(rect.taskbar?5:6,snowContour(depth,x,width,rect.id!=='ground').bottom);}
export function snowCrown(depth,x){return depth<=.05?0:-snowContour(depth,x,1e9,false).top;}

export function supportMoved(previous,next){return Boolean(previous && next && !next.taskbar && next.id!=='ground' && (Math.abs(next.left-previous.left)>=.5 || Math.abs(next.top-previous.top)>=.5));}
