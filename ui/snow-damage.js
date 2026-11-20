// Include neighbouring columns used by depth interpolation, then align damage
// to reusable 128px regions. A cleared region must also be returned.
export function snowDamage(profile,previous,width,column=6){
 if(!previous||profile.length!==previous.length)return {left:0,right:width};
 let left=Infinity,right=-Infinity;
 for(let i=0;i<profile.length;i++)if(Math.round(profile[i]*4)!==Math.round(previous[i]*4)){
  left=Math.min(left,(i-3)*column);right=Math.max(right,(i+4)*column);
 }
 return left===Infinity?null:{left:Math.max(0,Math.floor(left/128)*128),right:Math.min(width,Math.ceil(right/128)*128)};
}
