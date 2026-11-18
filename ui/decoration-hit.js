export function decorationAt(point, trees, garlands, gifts, resolve) {
  for(let i=gifts.length-1;i>=0;i--){const g=gifts[i];if(Math.abs(point.x-g.x)<14&&point.y>g.y-18&&point.y<g.y+12)return {list:gifts,item:g};}
  for(let i=trees.length-1;i>=0;i--){const tree=trees[i],p=resolve(tree.anchor);if(!p)continue;const h=p.y-point.y;if(h>=0&&h<=115&&Math.abs(p.x-point.x)<Math.max(10,42*(1-h/122)))return {list:trees,item:tree};}
  for(let i=garlands.length-1;i>=0;i--){const g=garlands[i];if(!resolve(g.a)||!resolve(g.b))continue;const nodes=g.rope?.nodes??[];for(let j=1;j<nodes.length;j++){const a=nodes[j-1],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(point.x-a.x-dx*t,point.y-a.y-dy*t)<10)return {list:garlands,item:g};}}
  return null;
}
export function removeDecoration(target){const i=target.list.indexOf(target.item);if(i>=0)target.list.splice(i,1);return i>=0;}
