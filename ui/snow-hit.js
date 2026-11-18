export function snowPixelHit(raster,rect,point){
 if(!raster?.hitData)return false;
 const x=Math.floor((point.x-rect.left+raster.padding)*raster.scale);
 const y=Math.floor((point.y-rect.top+raster.baseline)*raster.scale);
 if(x<0||y<0||x>=raster.canvas.width||y>=raster.canvas.height)return false;
 return raster.hitData[(y*raster.canvas.width+x)*4+3]>=96;
}
