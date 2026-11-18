// Displaced snow is split between the ball and a small ridge ahead of it.
export function gatherSnow(profile,index,reach,travel,size,maximum,direction,column=6){
 if(size>=maximum||travel<=0)return 0;
 let budget=(maximum*maximum-size*size)/.85,columnMass=0,pushed=0;
 const ahead=Math.max(0,Math.min(profile.length-1,index+direction*(reach+1)));
 for(let i=Math.max(0,index-reach);i<=Math.min(profile.length-1,index+reach);i++){
  const distance=Math.abs(i-index)/(reach+1),weight=(1-distance)**2;
  const removed=Math.min(profile[i],travel*.16*weight,budget/column);
  const ridge=Math.min(removed*.2,Math.max(0,24-profile[ahead]-pushed));
  profile[i]-=removed;pushed+=ridge;
  columnMass+=removed-ridge;budget-=(removed-ridge)*column;
 }
 profile[ahead]+=pushed;
 // Relax steep cut edges by moving mass, rather than deleting it.
 for(let i=Math.max(0,index-reach-1);i<Math.min(profile.length-1,index+reach+1);i++){
  const difference=profile[i]-profile[i+1];
  if(Math.abs(difference)>3){const transfer=(Math.abs(difference)-3)*.12;
   if(difference>0){profile[i]-=transfer;profile[i+1]+=transfer;}else{profile[i]+=transfer;profile[i+1]-=transfer;}}
 }
 return columnMass*column;
}
