import { snowContour } from './snow-surface.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function moveSurfaceSnow(pile,previous,next,dt,column,emit,rng=Math.random){
  if(next.taskbar)return;
  dt=clamp(dt,.008,.08);
  const dx=next.left-previous.left,dy=next.top-previous.top;
  if(Math.abs(dx)+Math.abs(dy)<.5)return;
  const vx=clamp(dx/dt,-1400,1400),vy=clamp(dy/dt,-1400,1400);
  const speed=Math.hypot(vx,vy);
  const shift=clamp(-vx*dt*.5/column,-2,2);
  const groups=[];
  let group;
  const chooseGroup = index => {
    group={end:index+2+Math.floor(rng()*9),active:rng()<.72,
      looseness:.35+rng()*1.3,jitterX:(rng()-.5)*column*1.8,
      jitterVx:(rng()-.5)*90,jitterVy:-rng()*55};
    groups.push(group);
  };
  const collect=(x,y,depth,vx,vy)=>{
    if(!group.depth)Object.assign(group,{x,y,depth,vx,vy});
    else {const total=group.depth+depth;for(const k of ['x','y','vx','vy'])group[k]=(group[k]*group.depth+({x,y,vx,vy})[k]*depth)/total;group.depth=total;}
  };
  const original=pile.profile,transported=new Float32Array(original.length);
  for(let i=0;i<original.length;i++){
    if(!group||i>=group.end)chooseGroup(i);
    const depth=original[i];if(depth<=0)continue;
    // A downward movement removes support; shaking also loosens a small fraction.
    const detached=group.active?depth*clamp((Math.max(0,vy)*dt*.018+Math.max(0,speed-160)*dt*.0015)*group.looseness,0,.8):0;
    if(detached>0)collect(previous.left+(i+.5)*column,previous.top-depth*.5,detached,-vx*.25,Math.min(-12,vy*.15));
    const target=i+shift,lo=Math.floor(target),fraction=target-lo;
    for(const [j,weight]of [[lo,1-fraction],[lo+1,fraction]]){
      const amount=(depth-detached)*weight;if(amount<=0)continue;
      if(j>=0&&j<original.length)transported[j]+=amount;
      else collect(j<0?next.left-2:next.right+2,next.top-depth*.5,amount,-vx*.45,-24);
    }
  }
  for(const p of groups)if(p.depth>0)emit(p.x+p.jitterX,p.y,p.depth,p.vx+p.jitterVx,p.vy+p.jitterVy);
  pile.profile=transported;pile.raster=undefined;
}

export function snowLip(rect,depth,x,width){return snowContour(depth,x,width,rect.id!=='ground'&&!rect.taskbar).bottom;}
export function snowCrown(depth,x){return depth<=.05?0:-snowContour(depth,x,1e9,false).top;}
