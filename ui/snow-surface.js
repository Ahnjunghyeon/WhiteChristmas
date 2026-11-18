// Stable rounded mounds: varied widths and positions, with no frame-to-frame noise.
const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function mound(x,spacing,seed){
 const cell=Math.floor(x/spacing);let value=0;
 for(let i=cell-2;i<=cell+2;i++){
  const center=(i+.2+.6*hash(i+seed))*spacing;
  const radius=spacing*(.17+.18*hash(i+seed+19));
  value=Math.max(value,Math.exp(-.5*((x-center)/radius)**2)*(.55+.45*hash(i+seed+43)));
 }
 return value;
}
export function snowContour(depth,x,width,overhang=true){
 if(depth<=.05)return {top:0,bottom:0};
 const fullness=Math.min(1,depth/14);
 const edge=Math.min(1,Math.max(0,x)/10,Math.max(0,width-x)/10);
 const crown=mound(x,83,5)*7.0+mound(x,31,29)*1.6;
 // A connected shallow layer, with occasional broader drooping lobes.
 const lip=(.8+4.8*mound(x,64,71))*fullness*edge;
 return {top:-depth-fullness*crown,bottom:overhang?Math.min(6,lip,depth*.45):0};
}
export function sampleDepth(profile,x,column){
 const position=x/column-.5,i=Math.floor(position),t=position-i;
 const at=j=>profile[Math.max(0,Math.min(profile.length-1,j))]||0;
 const a=(at(i-1)+at(i)*2+at(i+1))/4,b=(at(i)+at(i+1)*2+at(i+2))/4;
 return a+(b-a)*t;
}

// Cache shape coefficients once per width; depth remains fully dynamic.
export function createContourSampler(width,step=2){
 const shape=[];for(let x=0;x<width;x+=step){const c=snowContour(14,x,width,true);shape.push({crown:-c.top-14,lip:c.bottom});}
 return (depth,x,overhang=true)=>{
  if(depth<=.05)return {top:0,bottom:0};
  const c=shape[Math.max(0,Math.min(shape.length-1,Math.floor(x/step)))];
  const f=Math.min(1,depth/14);return {top:-depth-c.crown*f,bottom:overhang?Math.min(6,c.lip*f,depth*.45):0};
 };
}
