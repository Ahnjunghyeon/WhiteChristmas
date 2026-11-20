import { drawPlacementHint } from './placement-hint.js';
// Original winter props for the Hyeonbit customization of Wintermas.
export const PROP_TYPES = ['lantern', 'snack'];
const sizes = { mobile: [90, 125], lantern: [55, 65], mailbox: [64, 83], snack: [44, 45] };
const names = { mobile: '크리스마스 모빌', lantern: '등불', mailbox: '우체통', snack: '군고구마' };

export function createWinterProps(ctx, host) {
  const images = {};
  for (const name of ['lantern', 'snack']) {
    const img = new Image();
    img.src = new URL(`./assets/${name}.png`, import.meta.url).href;
    img.onerror = () => console.warn('겨울 소품을 불러올 수 없습니다:', name);
    images[name] = img;
  }
  let items = [], held, noticeUntil = 0, serial = 0, menuOpen = false;
  const storageKey = `hyeonbit-winter-simple-props-v1-${host.screenKey}`;
  function restore() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(data)) items = data.filter(p => PROP_TYPES.includes(p.kind) &&
        Number.isFinite(p.x) && Number.isFinite(p.y)).slice(0, 24).map(p => ({
          id: `prop-${++serial}`, kind: p.kind, x: p.x, y: p.y, open: p.open === true, lit: p.lit !== false,
        }));
    } catch { /* Storage is optional. */ }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(items.map(({kind,x,y,open,lit}) =>
      ({kind,x,y,open,lit})))); } catch { /* Keep the current session usable. */ }
  }
  restore();
  const bounds = item => {
    const scale = host.scale();
    const [w,h] = sizes[item.kind];
    return { x: item.x - w * scale / 2, y: item.y - h * scale, w: w * scale, h: h * scale };
  };
  function constrain(item) {
    const b = bounds(item), w = host.width(), h = host.height();
    item.x = Math.max(b.w / 2, Math.min(w - b.w / 2, item.x));
    item.y = Math.max(b.h, Math.min(h, item.y));
  }
  function place(kind, point) {
    if (!PROP_TYPES.includes(kind)) return;
    const item = {id: `prop-${++serial}`, kind, x: point.x, y: point.y, open: false, lit: true};
    constrain(item);
    item.anchor = host.anchorAt(item);
    items.push(item);
    if (items.length > 24) items.shift();
    save();
  }
  function pointer(next, previous) {
    if (held) {
      const item = held.item;
      if (Math.hypot(next.x-held.startX,next.y-held.startY)>5) held.moved=true;
      if (held.moved) {
        item.x=next.x+held.dx; item.y=next.y+held.dy;
        item.anchor=undefined; constrain(item);
      }
      if (!next.pressed) {
        if (!held.moved && item.kind==='mailbox') { item.open=!item.open; noticeUntil=performance.now()+2200; }
        if (!held.moved && item.kind==='lantern') item.lit=!item.lit;
        item.anchor=host.anchorAt(item); held=undefined; host.capture(false); save();
      }
      return true;
    }
    const item = items.findLast(p => {
      const b=bounds(p); return next.x>=b.x && next.x<=b.x+b.w && next.y>=b.y && next.y<=b.y+b.h;
    });
    if (!item) return false;
    host.capture(true);
    if (next.rightPressed && !previous.rightPressed && !menuOpen && host.contextMenu) {
      menuOpen=true;
      Promise.resolve(host.contextMenu(item.id)).then(action=>{
        if(action==='remove'){items=items.filter(candidate=>candidate.id!==item.id);save();}
      }).catch(console.error).finally(()=>{menuOpen=false;host.capture(false);});
      return true;
    }
    if (next.pressed && !previous.pressed) {
      held={item,dx:item.x-next.x,dy:item.y-next.y,startX:next.x,startY:next.y,moved:false};
    }
    return true;
  }
  function draw(item, now, alpha=1) {
    const b=bounds(item);
    ctx.save(); ctx.globalAlpha=alpha;
    if (item.kind==='lantern' && item.lit!==false) {
      const radius=b.h*1.6, cx=item.x, cy=item.y-b.h*.4;
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
      const flicker=.16+Math.sin(now/540)*.025+Math.sin(now/173)*.012;
      glow.addColorStop(0,`rgba(255,186,82,${flicker})`);
      glow.addColorStop(.45,'rgba(255,189,95,.06)');glow.addColorStop(1,'rgba(255,189,95,0)');
      ctx.fillStyle=glow;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
    }
    if(item.kind==='mobile') {
      const swing=Math.sin(now/1100)*.055+(item.swing||0);
      ctx.translate(item.x,item.y-b.h);ctx.rotate(swing);
      ctx.strokeStyle='#a78c60';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,18);ctx.moveTo(-b.w*.4,18);ctx.quadraticCurveTo(0,6,b.w*.4,18);ctx.stroke();
      for(let i=-1;i<=1;i++){
        const x=i*b.w*.32,y=b.h*(i===0?.87:.65);
        ctx.beginPath();ctx.moveTo(x,16);ctx.lineTo(x,y-13);ctx.stroke();
        ctx.fillStyle=i===0?'#d4af65':i<0?'#a95255':'#6b8c73';
        ctx.beginPath();
        if(i===0){for(let n=0;n<10;n++){const a=n*Math.PI/5-Math.PI/2,rr=n%2?6:14;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;n?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();}
        else ctx.arc(x,y,12,0,Math.PI*2);
        ctx.fill();
      }
    }
    const image=images[item.kind==='mailbox' && item.open ? 'mailbox-open' : item.kind];
    if (image?.complete && image.naturalWidth) {
      if (item.kind==='lantern' && item.lit===false) ctx.filter='brightness(.62) saturate(.65)';
      ctx.drawImage(image,b.x,b.y,b.w,b.h);
    }
    ctx.restore();
    if (item.kind==='mailbox' && item.open && now<noticeUntil) {
      ctx.save();ctx.font='12px "Malgun Gothic",sans-serif';ctx.textAlign='center';
      ctx.fillStyle='#fff8eb';ctx.fillRect(item.x-83,b.y-33,166,25);
      ctx.fillStyle='#8a6d54';ctx.fillText('오늘도 따뜻한 하루 보내세요',item.x,b.y-16);ctx.restore();
    }
  }
  function paint(now,dt) {
    for (const item of items) {
      if (held?.item!==item && item.anchor?.id) {
        const point=host.resolveAnchor(item.anchor);
        if (point) { item.swing=Math.max(-.25,Math.min(.25,(item.x-point.x)*.015));item.x=point.x;item.y=point.y; }
        else { item.anchor=undefined;item.vy=20; }
      }
      if (item.vy && held?.item!==item) {
        item.vy+=dt*400;item.y+=item.vy*dt;
        if (item.y>=host.floor(item.x)) { item.y=host.floor(item.x);item.vy=0;save(); }
      }
      item.swing=(item.swing||0)*Math.exp(-dt*4);
      constrain(item);draw(item,now);
    }
  }
  function preview(kind,mouse,now) {
    draw({kind,x:mouse.x,y:mouse.y,lit:true},now,.7);
    drawPlacementHint(ctx,mouse,host.width());
  }
  return {place,pointer,paint,preview,
    clear(){items=[];held=undefined;host.capture(false);save();},
    release(){held=undefined;host.capture(false);},
    get active(){return items.length>0;},get dragging(){return !!held;}};
}
