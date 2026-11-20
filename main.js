import { pinnedWidgetBounds, settingsLayout } from './ui/widget-bounds.js';
import { ballSizeLimit } from './ui/ball-settings.js';
import { normalizeBottomTaskbar } from './ui/taskbar-surface.js';
import { app, BrowserWindow, Menu, Tray, nativeImage, screen, ipcMain, powerMonitor, globalShortcut } from 'electron';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { join } from 'node:path';

const defaults = { enabled: false, intensity: 65, wind: 15, taskbar: true, paused: true, startup: false, maxBallSize: 80 };
const collapsed = { width: 280, height: 96 };
const expanded = { width: 1000, height: 590 };
const appPath = app.getAppPath();
const native = join(appPath.endsWith('.asar') ? process.resourcesPath : appPath, 'native', 'desktop.exe');

let settings = { ...defaults };
let panel, tray, worker, retry, settingsFile;
let trayHintShown = false;
let quitting = false, locked = false, tracking = false;
let save = Promise.resolve();
const overlays = new Map();
const packagedEntry = process.defaultApp ? [app.getAppPath(), '--quiet'] : ['--quiet'];

function send(win, channel, value) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, value);
}

function trayMenu() {
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '현빗 윈터 열기', click: showPanel },
    { label: settings.enabled ? '겨울 모드 끄기' : '겨울 모드 켜기', click: () => {
      update({ enabled: !settings.enabled }).catch(console.error);
    } },
    { label: settings.paused ? '눈 내리기 켜기' : '눈 내리기 끄기', enabled: settings.enabled, click: () => {
      update({ paused: !settings.paused }).catch(console.error);
    } },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() },
  ]));
}

function showPanel() {
  panel.show();
  panel.focus();
}

function hidePanel() {
  panel.hide();
  if (trayHintShown) return;
  trayHintShown = true;
  tray.displayBalloon({
    title: '현빗 윈터가 실행 중입니다',
    content: '시계 옆 트레이 아이콘을 두 번 클릭하면 설정창을 다시 엽니다.',
    iconType: 'custom',
    noSound: true,
  });
}

let panelLogoOffset=0;
function sizeWidget(open) {
 const bounds=panel.getBounds(),area=screen.getDisplayMatching(bounds).workArea;
 const anchor={x:bounds.x+panelLogoOffset,y:bounds.y};
 const layout=open?settingsLayout(anchor,expanded,area):{bounds:{...anchor,...collapsed},logoX:0};
 panelLogoOffset=layout.logoX;panel.setBounds(layout.bounds);
 return {logoX:panelLogoOffset};
}

function refreshOverlays() {
  const displays = screen.getAllDisplays();
  const ids = new Set(displays.map(display => display.id));
  for (const [id, win] of overlays) {
    if (!ids.has(id)) {
      overlays.delete(id);
      win.destroy();
    }
  }
  for (const display of displays) {
    if (overlays.has(display.id)) {
      overlays.get(display.id).setBounds(display.bounds);
      continue;
    }
    if (!settings.enabled || locked) continue;
    const win = new BrowserWindow({
      ...display.bounds, transparent: true, frame: false, focusable: false, skipTaskbar: true,
      hasShadow: false, resizable: false, movable: false, show: false, fullscreenable: false,
      webPreferences: {
        preload: join(app.getAppPath(), 'preload.cjs'), backgroundThrottling: false,
      },
    });
    overlays.set(display.id, win);
    win.setAlwaysOnTop(true, 'pop-up-menu');
    win.setIgnoreMouseEvents(true);
    win.webContents.on('did-finish-load', () => {
      send(win, 'settings:changed', settings);
      if (settings.enabled && !locked) win.showInactive();
    });
    win.loadFile('ui/overlay.html').catch(console.error);
  }
}

function syncRuntime() {
  clearTimeout(retry);
  if (settings.enabled && !locked) {
    refreshOverlays();
    if (!worker) startTracking();
  } else {
    if (worker && !worker.stdin.destroyed && !worker.stdin.writableEnded) worker.stdin.end();
  }
  syncVisibility();
}

function syncVisibility() {
  for (const win of overlays.values()) {
    if (locked || !settings.enabled) {
      win.setIgnoreMouseEvents(true);
      win.hide();
    }
    else if (!win.webContents.isLoading() && !win.isVisible()) win.showInactive();
  }
}

async function update(patch) {
  if (!patch || typeof patch !== 'object') return settings;
  for (const key of ['intensity', 'wind']) {
    if (Number.isFinite(patch[key])) settings[key] = Math.max(key === 'wind' ? -100 : 0, Math.min(100, patch[key]));
  }
  if ('maxBallSize' in patch) settings.maxBallSize = ballSizeLimit(patch.maxBallSize);
  for (const key of ['enabled', 'paused', 'taskbar', 'startup']) {
    if (typeof patch[key] === 'boolean') settings[key] = patch[key];
  }
  if ('startup' in patch) {
    app.setLoginItemSettings({
      openAtLogin: settings.startup,
      args: packagedEntry,
      path: process.env.PORTABLE_EXECUTABLE_FILE || process.execPath,
    });
  }
  const snapshot = { ...settings };
  send(panel, 'settings:changed', snapshot);
  for (const win of overlays.values()) send(win, 'settings:changed', snapshot);
  trayMenu();
  if ('enabled' in patch) syncRuntime();
  else syncVisibility();
  save = save.catch(() => {}).then(async () => {
    await writeFile(settingsFile + '.tmp', JSON.stringify(snapshot, null, 2));
    await rename(settingsFile + '.tmp', settingsFile);
  });
  await save;
  return snapshot;
}

function broadcastGeometry(windows, pressed, control, rightPressed) {
  if (locked || !settings.enabled) return;
  const mouse = screen.getCursorScreenPoint();
  const displays = new Map(screen.getAllDisplays().map(display => [display.id, display]));
  for (const [id, win] of overlays) {
    const display = displays.get(id);
    if (!display) continue;
    const { x, y, width, height } = display.bounds;
    const origin = screen.dipToScreenPoint({ x, y });
    const scale = display.scaleFactor;
    let rectangles = [];
    for (const rect of windows) {
      const left = (rect.left - origin.x) / scale;
      const top = (rect.top - origin.y) / scale;
      const right = (rect.right - origin.x) / scale;
      const bottom = (rect.bottom - origin.y) / scale;
      if (right > 0 && bottom > 0 && left < width && top < height) {
        rectangles.push({ id: rect.id, left, top, right, bottom, taskbar: rect.taskbar });
      }
    }
    const workBottom = display.workArea.y + display.workArea.height - y;
    rectangles = normalizeBottomTaskbar(rectangles, width, height, workBottom);
    send(win, 'desktop', { rectangles, mouse: { x: mouse.x - x, y: mouse.y - y, pressed, control, rightPressed } });
  }
}

function startTracking() {
  worker = spawn(native, [String(process.pid)], { windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] });
  worker.stdin.on('error', () => {});
  worker.on('error', console.error);
  const lines = createInterface({ input: worker.stdout });
  lines.on('line', line => {
    try {
      const { windows, pressed, control, rightPressed } = JSON.parse(line);
      if (!tracking) {
        tracking = true;
        send(panel, 'desktop', { tracking });
      }
      broadcastGeometry(windows, pressed, control, rightPressed);
    } catch (error) { console.error(error.message); }
  });
  worker.once('close', () => {
    worker = undefined;
    tracking = false;
    send(panel, 'desktop', { tracking });
    for (const win of overlays.values()) send(win, 'desktop', { rectangles: [], mouse: { x: -1000, y: -1000 } });
    if (!quitting && settings.enabled && !locked) retry = setTimeout(startTracking, 300);
  });
}

async function smokeTest() {
  try {
    const initial = panel.getBounds();
    const workArea = screen.getPrimaryDisplay().workArea;
    const centered = Math.abs(initial.x + initial.width / 2 - workArea.x - workArea.width / 2) <= 1;
    const panelCheck = await panel.webContents.executeJavaScript(`(async () => {
      const toggle = document.querySelector('#toggle');
      const initiallyClosed = toggle.getAttribute('aria-expanded') === 'false';
      const icon = toggle.querySelector('img').getBoundingClientRect();
      const iconCentered = Math.abs(icon.left + icon.width / 2 - innerWidth / 2) <= 1;
      toggle.click();
      await new Promise(resolve => setTimeout(resolve, 600));
      const menu = document.querySelector('#menu');
      const open = !menu.hidden;
      const actions = menu.querySelectorAll('[data-action]').length;
      const iconReady = toggle.querySelector('img').naturalWidth > 0;
      const options = document.querySelector('#options');
      const disabledByDefault = options.disabled;
      await wintermas.update({ enabled: true, paused: false });
      const enabledAfterToggle = !options.disabled;
      const bottom = menu.getBoundingClientRect().bottom;
      const height = innerHeight;
      return { initiallyClosed, open, actions, iconReady, iconCentered, bottom, height, disabledByDefault, enabledAfterToggle };
    })()`);
    if (process.env.WINTERMAS_SMOKE_PREVIEW) {
      await writeFile(process.env.WINTERMAS_SMOKE_PREVIEW, (await panel.capturePage()).toPNG());
    }
    const closed = await panel.webContents.executeJavaScript(`(async () => {
      document.querySelector('#toggle').click();
      await new Promise(resolve => setTimeout(resolve, 600));
      return document.querySelector('#menu').hidden;
    })()`);
    const deadline = Date.now() + 4000;
    while ((!tracking || [...overlays.values()].some(win => win.webContents.isLoading())) && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    const renderers = await Promise.all([...overlays.values()].map(win => win.webContents.executeJavaScript(
      `(async () => {
        const atlas = new Image();
        atlas.src = new URL('./santa-frames.svg', location.href).href;
        await atlas.decode();
        for (let i = 0; i < 20 && !document.documentElement.dataset.rendered; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        return atlas.naturalWidth === 1320 && atlas.naturalHeight === 220 &&
          document.documentElement.dataset.ready === 'true' &&
          document.documentElement.dataset.rendered === 'true' &&
          document.querySelector('canvas').width > 0;
      })()`
    )));
    const panelReady = centered && panelCheck.iconCentered && panelCheck.iconReady && panelCheck.initiallyClosed && panelCheck.open && closed &&
      panelCheck.disabledByDefault && panelCheck.enabledAfterToggle &&
      panelCheck.actions === 7 && panelCheck.bottom <= panelCheck.height;
    if (!tracking || !panelReady || !renderers.length || !renderers.every(Boolean)) {
      throw new Error(JSON.stringify({ tracking, panelCheck, renderers }));
    }
    const frameRates = await Promise.all([...overlays.values()].map(win => win.webContents.executeJavaScript(`
      (async () => {
        const context = document.querySelector('canvas').getContext('2d');
        const clear = context.clearRect;
        const backend = document.documentElement.dataset.snowBackend;
        const gpu = backend === 'webgl' && document.querySelector('#snow').getContext('webgl');
        const draw = gpu && gpu.drawArrays;
        let sceneFrames = 0;
        let snowFrames = 0;
        context.clearRect = function (...args) {
          sceneFrames++;
          return clear.apply(this, args);
        };
        if (gpu) gpu.drawArrays = function (...args) {
          snowFrames++;
          return draw.apply(this, args);
        };
        const started = performance.now();
        await new Promise(resolve => setTimeout(resolve, 1200));
        context.clearRect = clear;
        if (gpu) gpu.drawArrays = draw;
        const seconds = (performance.now() - started) / 1000;
        return { backend, snowFps: Math.round((gpu ? snowFrames : sceneFrames) / seconds),
          sceneFps: Math.round(sceneFrames / seconds) };
      })()
    `)));
    console.log('Overlay:', JSON.stringify(frameRates));
    console.log('GPU:', JSON.stringify(app.getGPUFeatureStatus()));
    console.log('Processes:', JSON.stringify(app.getAppMetrics().map(process => ({
      type: process.type, cpu: process.cpu.percentCPUUsage, privateKiB: process.memory.privateBytes,
    }))));
    app.quit();
  } catch (error) {
    console.error(error);
    app.exit(2);
  }
}

async function start() {
  app.setAppUserModelId('Wintermas');
  await app.whenReady();
  const icon = nativeImage.createFromBuffer(await readFile(join(appPath, 'ui', 'icon.png')));
  if (icon.isEmpty()) throw new Error('Wintermas icon could not be decoded.');
  const data = app.getPath('userData');
  await mkdir(data, { recursive: true });
  settingsFile = join(data, 'settings.json');
  try {
    const stored = JSON.parse(await readFile(settingsFile, 'utf8'));
    settings = Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
      [key, typeof stored[key] === typeof value ? stored[key] : value]));
  }
  catch (error) { if (error.code !== 'ENOENT') console.error(error.message); }
  settings.maxBallSize = ballSizeLimit(settings.maxBallSize);
  if (process.argv.includes('--smoke-test')) settings = { ...defaults };
  const area = screen.getPrimaryDisplay().workArea;
  panel = new BrowserWindow({
    ...collapsed, x: area.x + Math.floor((area.width - collapsed.width) / 2), y: area.y + 14,
    show: false, icon, frame: false, transparent: true, skipTaskbar: true,
    resizable: false, minimizable: false, maximizable: false, fullscreenable: false,
    title: '현빗 윈터 · Wintermas',
    webPreferences: { preload: join(app.getAppPath(), 'preload.cjs') },
  });
  panel.setAlwaysOnTop(true, 'screen-saver');
  panel.on('close', event => { if (!quitting) { event.preventDefault(); hidePanel(); } });
  tray = new Tray(icon.resize({ width: 32, height: 32, quality: 'best' }));
  tray.setToolTip('Wintermas');
  tray.on('double-click', showPanel);
  tray.on('balloon-click', showPanel);
  trayMenu();
  ipcMain.handle('decoration:menu', async event => {
    const win = [...overlays.values()].find(win => win.webContents === event.sender);
    if (!win || locked || !settings.enabled) return false;
    return new Promise(resolve => {
      let remove = false;
      Menu.buildFromTemplate([{label:'이 장식 치우기',click:()=>{remove=true;}}]).popup({window:win,callback:()=>resolve(remove)});
    });
  });
  ipcMain.handle('settings:get', () => ({ ...settings, tracking }));
  ipcMain.on('snowball:pointer', (event, capture) => {
    const overlay = [...overlays.values()].find(win => win.webContents === event.sender);
    if (overlay) overlay.setIgnoreMouseEvents(!(capture === true && !locked && settings.enabled));
  });
  globalShortcut.register('Alt+Shift+B', () => {
    if (locked || !settings.enabled) return;
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    send(overlays.get(display.id), 'effect:action', 'gather');
  });
  ipcMain.handle('settings:set', (event, patch) => event.sender === panel.webContents ? update(patch) : settings);
  ipcMain.handle('widget:open', (event, open, contentHeight) => {
    if (event.sender === panel.webContents) return sizeWidget(open === true, contentHeight);
  });
  let dragOrigin;
  ipcMain.on('widget:drag',(event,phase)=>{
    if(event.sender!==panel.webContents)return;
    if(phase==='start'){dragOrigin={point:screen.getCursorScreenPoint(),bounds:panel.getBounds()};return;}
    if(phase==='end'){dragOrigin=undefined;return;}
    if(phase!=='move'||!dragOrigin)return;
    const point=screen.getCursorScreenPoint();
    panel.setPosition(Math.round(dragOrigin.bounds.x+point.x-dragOrigin.point.x),Math.round(dragOrigin.bounds.y+point.y-dragOrigin.point.y));
  });
  ipcMain.handle('widget:hide', event => {
    if (event.sender === panel.webContents) hidePanel();
  });
  ipcMain.handle('effect:action', (event, action, color) => {
    if (event.sender !== panel.webContents || !settings.enabled || locked) return;
    if (['garland','tree','lantern','snack'].includes(action)) {
      const display = screen.getDisplayMatching(panel.getBounds());
      for (const [id, win] of overlays) {
        send(win, 'effect:action', id === display.id ? { placement: action, color } : 'decor-cancel');
      }
    } else if (['clear', 'snowball', 'reset', 'decor-reset'].includes(action)) {
      for (const win of overlays.values()) send(win, 'effect:action', action);
    }
  });
  for (const event of ['display-added', 'display-removed', 'display-metrics-changed']) screen.on(event, refreshOverlays);
  powerMonitor.on('lock-screen', () => { locked = true; syncRuntime(); });
  powerMonitor.on('unlock-screen', () => { locked = false; syncRuntime(); });
  syncRuntime();
  await panel.loadFile('ui/index.html');
  if (!process.argv.includes('--smoke-test')) panel.showInactive();
  if (process.argv.includes('--smoke-test')) setTimeout(smokeTest, 2500);
}

if (process.argv.includes('--smoke-test') && process.env.WINTERMAS_SMOKE_DATA) {
  app.setPath('userData', process.env.WINTERMAS_SMOKE_DATA);
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (panel) showPanel(); });
  app.on('before-quit', () => {
    globalShortcut.unregisterAll();
    quitting = true;
    clearTimeout(retry);
    worker?.stdin.end();
  });
  start().catch(error => { console.error(error); app.exit(1); });
}


