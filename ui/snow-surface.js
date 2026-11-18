// Deterministic contours: no random shape changes between animation frames.
export function snowContour(depth,x,width,overhang=true){
 if(depth<=.05)return {top:0,bottom:0};
 const fullness=Math.min(1,depth/12);
 const edge=Math.min(1,Math.max(0,x)/14,Math.max(0,width-x)/14);
 const puff=(1-Math.cos(x*.11+Math.sin(x*.027)))*.55+(1-Math.cos(x*.047+1))*.45;
 return {top:-depth-fullness*puff*1.3,
 bottom:overhang?Math.min(3,depth*.18)*edge*(.6+.4*(.5+.5*Math.sin(x*.083+Math.sin(x*.029)))):0};
}
export function sampleDepth(profile,x,column){
 const position=x/column-.5,i=Math.floor(position),t=position-i;
 const at=j=>profile[Math.max(0,Math.min(profile.length-1,j))]||0;
 const a=(at(i-1)+at(i)*2+at(i+1))/4,b=(at(i)+at(i+1)*2+at(i+2))/4;
 return a+(b-a)*t;
}
