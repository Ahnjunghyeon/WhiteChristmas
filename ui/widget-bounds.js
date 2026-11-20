export function widgetBounds(anchor,size,area){
 const width=Math.min(size.width,area.width),height=Math.min(size.height,area.height);
 return {x:Math.max(area.x,Math.min(anchor.x,area.x+area.width-width)),y:Math.max(area.y,Math.min(anchor.y,area.y+area.height-height)),width,height};
}

// Preserve the actual top-left; reduce available content size at screen edges.
export function pinnedWidgetBounds(anchor,size,area){
 return {x:anchor.x,y:anchor.y,width:Math.max(1,Math.min(size.width,area.x+area.width-anchor.x)),height:Math.max(1,Math.min(size.height,area.y+area.height-anchor.y))};
}

export function settingsLayout(anchor,size,area){
 const minimum=Math.min(360,area.width);
 const available=area.x+area.width-anchor.x;
 const width=Math.min(size.width,Math.max(minimum,available));
 const x=Math.max(area.x,Math.min(anchor.x,area.x+area.width-width));
 const height=Math.max(96,Math.min(size.height,area.y+area.height-anchor.y));
 return {bounds:{x,y:anchor.y,width,height},logoX:anchor.x-x};
}
