export function drawPlacementHint(ctx,mouse,width){
 const label='클릭하면 놓을 수 있어요 :)';
 ctx.save();ctx.font='12px "Malgun Gothic",sans-serif';ctx.textAlign='left';
 const boxWidth=Math.ceil(ctx.measureText(label).width)+20;
 const x=Math.max(4,Math.min(mouse.x+12,width-boxWidth-4)),y=Math.max(4,mouse.y-38);
 ctx.fillStyle='#fff8eb';ctx.fillRect(x,y,boxWidth,26);
 ctx.fillStyle='#806b58';ctx.fillText(label,x+10,y+17);ctx.restore();
}
