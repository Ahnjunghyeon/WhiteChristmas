import { sampleDepth } from './snow-surface.js';

export const POWDER_ATLAS = new URL('./assets/snow/soft-snowcap.png', import.meta.url);
export function surfaceVariant(id='') {
  let hash=0; for(const c of String(id)) hash=(hash*31+c.charCodeAt(0))>>>0;
  return hash%3;
}

// Measure only the continuous opaque body. Isolated powder outside the asset
// must not turn into floating pixels or enlarge the mouse hit region.
export function measureSnowBody(data,width,height) {
  const columns=[]; let left=width,right=0,highest=height,lowest=0;
  for(let x=0;x<width;x++) {
    let start=0,run=0,best=0,top=0,bottom=0;
    for(let y=0;y<height;y++) {
      if(data[(y*width+x)*4+3]>=192) {
        if(!run)start=y;
        if(++run>best){best=run;top=start;bottom=y+1;}
      } else run=0;
    }
    columns.push({top,bottom});
    if(best>=height*.04){left=Math.min(left,x);right=x;highest=Math.min(highest,top);lowest=Math.max(lowest,bottom);}
  }
  if(right<=left)return null;
  return {columns,left,right,highest,lowest,height:lowest-highest};
}

export function createPowderPainter({image:suppliedImage,onReady=()=>{},canvasFactory}={}) {
  const image=suppliedImage??new Image(); let body,revision=0;
  const textures=new Map();let texturePixels=0;
  const makeCanvas=canvasFactory??(typeof document!=='undefined'?((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;}):null);
  const measure=()=>{
    if(!image.width||(!canvasFactory&&typeof document==='undefined'))return;
    const c=canvasFactory?canvasFactory(image.width,image.height):document.createElement('canvas');
    c.width=image.width;c.height=image.height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    body=measureSnowBody(ctx.getImageData(0,0,c.width,c.height).data,c.width,c.height);
    revision++;onReady();
  };
  if(suppliedImage)measure();else{image.onload=measure;image.src=POWDER_ATLAS.href;}
  return {
    get revision(){return revision;},get loaded(){return Boolean(body);},
    paint(ctx,profile,width,column,baseline,{overhang=true,taskbar=false,variant=0,bake=false}={}){
      if(!profile.some(d=>d>.05))return;
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const padding=overhang&&!taskbar?4:0;
      const textureScale=.22;
      const span=body?body.right-body.left:1000;
      // Preserve the original corner artwork; reveal a mirrored middle section
      // at fixed density instead of stretching the entire picture with a window.
      const sourceAt=x=>{
        if(x<32)return body.left+Math.max(0,x+padding)/(32+padding)*145;
        const center=span-290,phase=Math.max(0,x-32)/textureScale;
        const tile=Math.floor(phase/center),u=phase%center;
        const middle=body.left+145+(tile%2?center-u:u);
        const t=Math.max(0,Math.min(1,(x-(width-80))/(80+padding)));
        return middle*(1-t*t*(3-2*t))+(body.right-145+145*t)*t*t*(3-2*t);
      };
      const shape=x=>{
        const depth=sampleDepth(profile,x,column);
        if(depth<=.05)return {top:baseline,bottom:baseline,depth:0};
        const sx=body?sourceAt(x):0;
        const b=body?.columns[Math.max(body.left,Math.min(body.right,Math.round(sx)))];
        const relief=b?Math.max(0,Math.min(1,(body.lowest-b.top)/body.height)):.8;
        const outside=Math.max(0,-x,x-width);
        const cap=Math.sqrt(Math.max(0,1-(outside/(padding+.5))**2));
        const fullness=Math.min(1,depth/14);
        const lip=overhang?Math.min(taskbar?4:5,depth*.22)*( .3+.7*relief):0;
        return {top:baseline-(depth*(.15+.85*relief)+fullness*2*relief)*cap,bottom:baseline+lip*cap,depth,sx,b};
      };
      let texture;
      if(body&&makeCanvas&&!bake){
        const key=`${width}:${overhang}:${taskbar}:${variant}`;
        texture=textures.get(key);
        if(!texture){
          const pixels=Math.ceil((width+padding*2)*2)*176;
          while(textures.size&&(texturePixels+pixels>4_000_000||textures.size>=12)){
            const first=textures.keys().next().value;texturePixels-=textures.get(first).width*textures.get(first).height;textures.delete(first);
          }
          texture=makeCanvas(Math.ceil((width+padding*2)*2),176);
          const tc=texture.getContext('2d');tc.scale(2,2);tc.translate(padding,0);
          this.paint(tc,new Float32Array(profile.length).fill(28),width,column,76,{overhang,taskbar,variant,bake:true});
          if(pixels<=4_000_000){textures.set(key,texture);texturePixels+=texture.width*texture.height;}
        }else{textures.delete(key);textures.set(key,texture);}
      }
      const points=[];
      for(let x=-padding;x<=width+padding;x+=(bake?.5:2))points.push({x,...shape(x)});
      ctx.beginPath();ctx.moveTo(points[0].x,points[0].top);
      for(const p of points)ctx.lineTo(p.x,p.top);
      for(let i=points.length-1;i>=0;i--)ctx.lineTo(points[i].x,points[i].bottom);
      ctx.closePath();ctx.clip();
      const gradient=ctx.createLinearGradient(0,baseline-32,0,baseline+5);
      gradient.addColorStop(0,'#fffefd');gradient.addColorStop(.55,'#f6f5fb');gradient.addColorStop(1,'#cecfe6');
      ctx.fillStyle=gradient;ctx.fillRect(-padding,0,width+padding*2,baseline+6);
      if(texture){
        const depth=Math.max(...profile);
        ctx.drawImage(texture,0,92,texture.width,70,-padding,baseline-depth-2,width+padding*2,depth+7);
      }else if(body){
        // Half CSS-pixel slices align with the 2x raster. Sampling the complete
        // body column retains the new artwork's white crown and blue underside.
        for(let x=-padding;x<width+padding;x+=.5){
          const p=shape(x+.25);if(!p.b||p.depth<=.05)continue;
          const h=p.b.bottom-p.b.top;if(h<1)continue;
          ctx.drawImage(image,p.sx,p.b.top,Math.max(1,.5/textureScale),h,
            x,p.top,.5,p.bottom-p.top);
        }
      }
      ctx.restore();
    }
  };
}
