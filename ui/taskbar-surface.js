// Electron workArea is already in display-relative DIP, matching the overlays.
export function normalizeBottomTaskbar(rectangles,width,height,workBottom){
 if(!(workBottom>height*.5&&workBottom<height-1))return rectangles;
 const remaining=rectangles.filter(r=>!(r.taskbar&&r.top>height*.5&&r.right-r.left>width*.5));
 return [{id:'taskbar-floor',left:0,right:width,top:workBottom,bottom:height,taskbar:true},...remaining];
}
