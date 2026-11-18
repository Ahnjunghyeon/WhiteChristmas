import { snowLip, snowCrown } from './window-snow.js';
// Button-free brushing of the original snow height profile.
export function brushSnow(pile, from, to, dt, column, emit, visible = () => true, rng = Math.random) {
  if (from.pressed || to.pressed) return 0;
  const dx=to.x-from.x,dy=to.y-from.y,travel=Math.hypot(dx,dy);
  if (!Number.isFinite(travel)||travel<.6||travel>240) return 0;
  const radius=12,rect=pile.rect,profile=pile.profile;
  let total=0;
  for(let i=Math.max(0,Math.floor((Math.min(from.x,to.x)-radius-rect.left)/column));i<Math.min(profile.length,Math.ceil((Math.max(from.x,to.x)+radius-rect.left)/column));i++){
    const depth=profile[i];if(depth<=.05)continue;
    const x=rect.left+(i+.5)*column,y=rect.top-depth*.5;
    const t=Math.max(0,Math.min(1,((x-from.x)*dx+(y-from.y)*dy)/(travel*travel)));
    const px=from.x+dx*t,py=from.y+dy*t;
    const distance=Math.hypot(px-x,Math.max(0,rect.top-snowCrown(depth,x-rect.left)-py,py-rect.top-snowLip(rect,depth,x-rect.left,rect.right-rect.left)));
    if(distance>=radius||!visible(x,py))continue;
    const amount=Math.min(depth,(1-distance/radius)*Math.min(4,travel*.22));
    profile[i]-=amount;total+=amount;
    emit(x+(rng()-.5)*column,y,amount,Math.max(-240,Math.min(240,dx/Math.max(.01,dt)*.24))+(rng()-.5)*55,-25-rng()*75);
  }
  if(total)pile.raster=undefined;
  return total;
}
