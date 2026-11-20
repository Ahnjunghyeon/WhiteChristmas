import {installWidgetDrag} from './widget-drag.js';
const id = name => document.getElementById(name);
const toggle = id('toggle');
const menu = id('menu');
const widget = document.querySelector('.widget');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let transitioning = false;

/* ---- UI polish helpers (frontend only) ---- */
menu.querySelectorAll(':scope > :not(fieldset), #options > *').forEach((el, i) => el.style.setProperty('--i', i));

function paint(key) {
  const el = id(key), min = +el.min, max = +el.max;
  const pct = (el.value - min) / (max - min) * 100;
  const pos = p => `calc(${p}% + ${(.5 - p / 100) * 14}px)`;
  const mid = min < 0 ? 50 : 0;
  el.style.setProperty('--a', mid === 0 ? '0%' : pos(Math.min(mid, pct)));
  el.style.setProperty('--b', pos(Math.max(mid, pct)));
}
function syncSwatch() {
  const swatch = document.querySelector('.swatch'), value = id('lights').value;
  if (value.startsWith('#')) { swatch.dataset.palette = 'custom'; swatch.style.setProperty('--custom', value); }
  else swatch.dataset.palette = value;
}
document.querySelectorAll('.actions button, #hide-widget').forEach(button =>
  button.addEventListener('pointerdown', event => {
    if (button.disabled || button.closest('fieldset:disabled')) return;
    const box = button.getBoundingClientRect(), size = Math.max(box.width, box.height) * 2;
    const dot = document.createElement('span');
    dot.className = 'ripple';
    Object.assign(dot.style, { width: size + 'px', height: size + 'px',
      left: event.clientX - box.left - size / 2 + 'px', top: event.clientY - box.top - size / 2 + 'px' });
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
    button.append(dot);
  }));

async function animateMenu(open) {
 const duration=open?240:220;
 menu.style.opacity=open?'0':'1';
 if(!motion.matches){
  const animations=[widget.animate([{opacity:open?0:1},{opacity:open?1:0}],{duration,pseudoElement:'::before',fill:'both',easing:'ease-in-out'}),menu.animate([{opacity:open?0:1,transform:open?'translateY(-5px)':'none'},{opacity:open?1:0,transform:open?'none':'translateY(-5px)'}],{duration,fill:'both',easing:'ease-in-out'})];
  await Promise.race([Promise.all(animations.map(a=>a.finished.catch(()=>{}))),new Promise(r=>setTimeout(r,350))]);
  widget.style.setProperty('--frame-opacity',open?'1':'0');menu.style.opacity=open?'1':'0';
  animations.forEach(a=>a.cancel());
 }else{widget.style.setProperty('--frame-opacity',open?'1':'0');menu.style.opacity=open?'1':'0';}
}

let collapsed;

async function setOpen(open) {
  if (transitioning || open === !menu.hidden) return;
  transitioning = true;
  try {
    if (open) {
      collapsed = widget.getBoundingClientRect();
      widget.style.setProperty('--frame-opacity','0');menu.style.opacity='0';
      const layout=await wintermas.widget(true);
      widget.style.setProperty('--logo-x',`${layout?.logoX??0}px`);
    }
    if (open) menu.hidden = false;
    else {
      menu.inert = true;
      await animateMenu(false, collapsed);
      menu.hidden = true;
    }
    document.body.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '겨울 설정 닫기' : '겨울 설정 열기');
    if (open) {
      menu.inert = false;
      await animateMenu(true);
    } else {await wintermas.widget(false);widget.style.setProperty('--logo-x','0px');}
  } catch (error) { report(error); }
  finally { transitioning = false; }
}
function report(error) {
  console.error(error);
  id('message').textContent = '처리하지 못했습니다. 다시 시도해주세요.';
}
function show(settings) {
  document.body.classList.toggle('enabled', settings.enabled);
  id('enabled').checked = settings.enabled;
  id('options').disabled = !settings.enabled;
  id('snow').checked = !settings.paused;
  id('taskbar').checked = settings.taskbar;
  for (const key of ['intensity', 'wind', 'maxBallSize']) {
    id(key).value = settings[key];
    id(key + '-value').textContent = key === 'maxBallSize' ? '지름 ' + settings[key] * 2 + 'px' : settings[key] + ' %';
    paint(key);
  }
}
const update = patch => wintermas.update(patch).catch(report);
let suppressClickUntil=0;
installWidgetDrag(widget,phase=>wintermas.widgetDrag(phase),{closed:()=>menu.hidden,onDragged:()=>{suppressClickUntil=performance.now()+300;}});
widget.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
toggle.addEventListener('click', () => setOpen(menu.hidden));
id('minimize').addEventListener('click',()=>setOpen(false));
id('hide-widget').addEventListener('click', async () => {
  if (transitioning) return;
  try {
    await setOpen(false);
    transitioning = true;
    if (motion.matches) await wintermas.hideWidget();
    else {
      const animation = widget.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-5px)' }],
        { duration: 240, easing: 'ease-in-out', fill: 'forwards' });
      try {
        await new Promise(resolve => setTimeout(resolve, 240));
        await wintermas.hideWidget();
      } finally { animation.cancel(); }
    }
  } catch (error) { report(error); }
  finally { transitioning = false; }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
});
id('enabled').addEventListener('change', () => update({ enabled: id('enabled').checked }));
id('snow').addEventListener('change', () => update({ paused: !id('snow').checked }));
id('taskbar').addEventListener('change', () => update({ taskbar: id('taskbar').checked }));
for (const key of ['intensity', 'wind', 'maxBallSize']) {
  id(key).addEventListener('input', () => { id(key + '-value').textContent = key === 'maxBallSize' ? '지름 ' + Number(id(key).value) * 2 + 'px' : id(key).value + ' %'; paint(key); });
  id(key).addEventListener('change', () => update({ [key]: Number(id(key).value) }));
}
for (const button of document.querySelectorAll('[data-action]')) {
  button.addEventListener('click', async () => {
    try {
      const action = button.dataset.action;
      if (['garland','tree','lantern','snack'].includes(action)) {
        await setOpen(false);
        await wintermas.action(action, id('lights').value);
      } else await wintermas.action(action);
    } catch (error) { report(error); }
  });
}
id('lights').addEventListener('change', syncSwatch);
id('light-color').addEventListener('change', () => {
  let option = id('lights').querySelector('[data-custom]');
  if (!option) {
    option = new Option('직접 선택');
    option.dataset.custom = '';
    id('lights').add(option);
  }
  option.value = id('light-color').value;
  option.selected = true;
  syncSwatch();
});
wintermas.onSettings(show);
wintermas.settings().then(show).catch(report);