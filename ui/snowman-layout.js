// The body pieces are clipped to the existing physics circles. Accessories
// follow their own circle, so unequal snowballs do not stretch a full-body image.
export function snowmanSections(head,middle,base){
 const m=middle.size/280;
 return [
  {source:[140,900,760,548],target:[base.x-base.size*1.04,base.y-base.size,base.size*2.08,base.size*2],circle:base},
  {source:[65,550,960,380],target:[middle.x-middle.size*1.72,middle.y-middle.size,middle.size*3.44,middle.size*2],circle:middle},
  {source:[85,480,250,240],target:[middle.x-458*m,middle.y-260*m,250*m,240*m]},
  {source:[780,480,230,240],target:[middle.x+237*m,middle.y-260*m,230*m,240*m]},
  {source:[290,0,500,500],target:[head.x-head.size*1.16,head.y-head.size*1.8,head.size*2.32,head.size*2.8]},
  {source:[325,490,440,100],target:[middle.x-middle.size*.82,middle.y-middle.size-2,middle.size*1.64,middle.size*.4]},
 ];
}
