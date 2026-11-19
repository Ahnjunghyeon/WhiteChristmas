export function snowPixelHit(raster,rect,point){
 if(!raster?.canvas)return false;
 const x=Math.floor((point.x-rect.left+raster.padding)*raster.scale);
 const y=Math.floor((point.y-rect.top+raster.baseline)*raster.scale);
 if(x<0||y<0||x>=raster.canvas.width||y>=raster.canvas.height)return false;
 if(!raster.hitData){
  const ctx=raster.canvas.getContext('2d');
  raster.hitData=ctx.getImageData(0,0,raster.canvas.width,raster.canvas.height).data;
 }
 return raster.hitData[(y*raster.canvas.width+x)*4+3]>=96;
}
