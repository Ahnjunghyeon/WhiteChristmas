export function snowPixelHit(raster,rect,point){
 if(!raster?.canvas)return false;
 const x=Math.floor((point.x-rect.left+raster.padding)*raster.scale);
 const y=Math.floor((point.y-rect.top+raster.baseline)*raster.scale);
 if(x<0||y<0||x>=raster.canvas.width||y>=raster.canvas.height)return false;
 // Read one pixel only; never transfer an entire window's snow texture.
 if(raster.hitData)return raster.hitData[(y*raster.canvas.width+x)*4+3]>=96;
 const key=y*raster.canvas.width+x;
 if(!raster.hitSamples)raster.hitSamples=new Map();
 if(raster.hitSamples.has(key))return raster.hitSamples.get(key);
 const hit=raster.canvas.getContext('2d').getImageData(x,y,1,1).data[3]>=96;
 if(raster.hitSamples.size>=64)raster.hitSamples.clear();
 raster.hitSamples.set(key,hit);return hit;
}
