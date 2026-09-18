/**
 * QX999 — Browser console script
 * Paste entire file into DevTools Console (F12) on the trading platform page.
 */
(function () {
  if (window.__QX999_ACTIVE__) {
    console.warn("QX999 already running.");
    return;
  }

  const QX999_PASSWORD = "sajol#@8";
  const PW_STORAGE_KEY = "qx999_saved_password";

  function getSavedPassword() {
    try {
      return (
        localStorage.getItem(PW_STORAGE_KEY) ||
        sessionStorage.getItem(PW_STORAGE_KEY) ||
        ""
      );
    } catch {
      return "";
    }
  }

  function rememberPassword(pw) {
    try {
      localStorage.setItem(PW_STORAGE_KEY, pw);
    } catch {
      try {
        sessionStorage.setItem(PW_STORAGE_KEY, pw);
      } catch {
        /* ignore */
      }
    }
  }

  function showPasswordGate(onSuccess) {
    const loginStyle = document.createElement("style");
    loginStyle.id = "qx999-login-style";
    loginStyle.textContent = `
      #qx999-login-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.72);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }
      #qx999-login-box {
        width: min(320px, calc(100vw - 32px));
        padding: 22px 20px 18px;
        border-radius: 14px;
        background: linear-gradient(160deg, #0d1f14 0%, #0a0f0c 100%);
        border: 1px solid rgba(0, 255, 102, 0.4);
        box-shadow: 0 0 50px rgba(0, 255, 102, 0.2);
      }
      #qx999-login-box h3 {
        margin: 0 0 6px;
        text-align: center;
        color: #00ff66;
        font-size: 18px;
        letter-spacing: 0.08em;
      }
      #qx999-login-box p {
        margin: 0 0 14px;
        text-align: center;
        font-size: 12px;
        color: #9fd4ad;
      }
      #qx999-login-input {
        box-sizing: border-box;
        width: 100%;
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 255, 102, 0.35);
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
        font-size: 15px;
        outline: none;
      }
      #qx999-login-input:focus {
        border-color: #00ff66;
        box-shadow: 0 0 0 2px rgba(0, 255, 102, 0.2);
      }
      #qx999-login-btn {
        width: 100%;
        margin-top: 12px;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: #00ff66;
        color: #052210;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
      }
      #qx999-login-err {
        min-height: 18px;
        margin-top: 8px;
        text-align: center;
        font-size: 12px;
        color: #ff6b6b;
        font-weight: 600;
      }
    `;
    document.head.appendChild(loginStyle);

    const overlay = document.createElement("div");
    overlay.id = "qx999-login-overlay";
    overlay.innerHTML = `
      <div id="qx999-login-box">
        <h3>SAJOL TRADER LOGIN</h3>
        <p>Enter password to continue</p>
        <input id="qx999-login-input" type="password" autocomplete="current-password" />
        <button type="button" id="qx999-login-btn">Enter</button>
        <p id="qx999-login-err"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#qx999-login-input");
    const errEl = overlay.querySelector("#qx999-login-err");
    const btn = overlay.querySelector("#qx999-login-btn");

    input.value = getSavedPassword();

    function tryLogin() {
      const pw = input.value;
      if (pw === QX999_PASSWORD) {
        rememberPassword(pw);
        overlay.remove();
        loginStyle.remove();
        onSuccess();
        return;
      }
      errEl.textContent = "Wrong password";
      input.focus();
      input.select();
    }

    btn.addEventListener("click", tryLogin);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryLogin();
      }
    });

    setTimeout(() => input.focus(), 50);
    if (input.value) {
      setTimeout(() => input.select(), 60);
    }
  }

  function initQX999() {
    window.__QX999_ACTIVE__ = true;

  const LOGO_URL =
    "https://i.postimg.cc/HkpP5WCd/IMG-20260918-071711-932.jpg";
  const LABEL = "SAJOL TRADER";
  const STORAGE_KEY = "qx999_settings_v1";
  const TAP_REQUIRED = 3;
  const TAP_SETTLE_MS = 380;
  const TAP_SEQUENCE_MS = 650;

  const defaults = { delaySec: 10, afterTradeScanSec: 0, direction: "random" };

  function parseStored(raw) {
    if (!raw) return null;
    const s = JSON.parse(raw);
    const delaySec = Math.max(1, Math.min(120, Number(s.delaySec) || defaults.delaySec));
    const afterTradeScanSec = Math.max(
      0,
      Math.min(300, Math.round(Number(s.afterTradeScanSec) || 0))
    );
    const direction = ["up", "down", "random"].includes(s.direction)
      ? s.direction
      : defaults.direction;
    return { delaySec, afterTradeScanSec, direction };
  }

  function loadSettings() {
    const sources = [
      () => localStorage.getItem(STORAGE_KEY),
      () => sessionStorage.getItem(STORAGE_KEY),
      () => {
        const b = window.__QX999_SETTINGS_BACKUP__;
        return b ? JSON.stringify(b) : null;
      },
    ];
    for (const get of sources) {
      try {
        const parsed = parseStored(get());
        if (parsed) return parsed;
      } catch {
        /* try next */
      }
    }
    return { ...defaults };
  }

  function saveSettings(s) {
    const json = JSON.stringify(s);
    window.__QX999_SETTINGS_BACKUP__ = { ...s };
    let ok = false;
    try {
      localStorage.setItem(STORAGE_KEY, json);
      ok = true;
    } catch {
      /* blocked */
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, json);
      ok = true;
    } catch {
      /* blocked */
    }
    return ok;
  }

  let settings = loadSettings();

  const style = document.createElement("style");
  style.textContent = `
    #qx999-widget {
      position: fixed;
      z-index: 2147483646;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: grab;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.45));
      transition: filter 0.25s ease;
    }
    #qx999-widget.qx999-glow {
      filter: drop-shadow(0 0 12px #00ff66) drop-shadow(0 0 28px #00ff66)
        drop-shadow(0 0 48px rgba(0,255,102,0.55));
    }
    #qx999-widget:active { cursor: grabbing; }
    #qx999-logo-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      background: rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    #qx999-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
    }
    #qx999-label {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.8);
      pointer-events: none;
    }
    #qx999-widget.qx999-glow #qx999-label {
      color: #b8ffd4;
      text-shadow: 0 0 8px #00ff66, 0 0 18px #00ff66, 0 0 32px rgba(0,255,102,0.8);
    }
    #qx999-scan-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483645;
      pointer-events: none;
      overflow: hidden;
      display: none;
    }
    #qx999-scan-overlay.qx999-scan-on { display: block; }
    #qx999-scan-line {
      position: absolute;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(
        180deg,
        #3ad67f 0%,
        #22c464 16%,
        #14ad56 40%,
        #009e4a 58%,
        #008a40 82%,
        rgba(0, 110, 48, 0.55) 100%
      );
      box-shadow:
        0 -88px 130px rgba(0, 220, 115, 1),
        0 -68px 100px rgba(0, 200, 100, 1),
        0 -50px 78px rgba(0, 185, 92, 0.98),
        0 -34px 58px rgba(0, 170, 85, 0.96),
        0 -22px 40px rgba(0, 155, 78, 0.94),
        0 -12px 26px rgba(0, 140, 72, 0.9),
        0 -6px 14px rgba(0, 125, 65, 0.88),
        0 0 28px rgba(0, 150, 75, 0.85),
        0 0 55px rgba(0, 130, 65, 0.55);
      top: -8%;
      animation: qx999-scan-move 1.45s linear infinite;
    }
    @keyframes qx999-scan-move {
      0% { top: -8%; }
      100% { top: 108%; }
    }
    #qx999-panel {
      position: fixed;
      z-index: 2147483647;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      pointer-events: none;
      width: min(300px, calc(100vw - 32px));
      padding: 18px 16px 14px;
      border-radius: 14px;
      background: linear-gradient(160deg, #0d1f14 0%, #0a0f0c 100%);
      border: 1px solid rgba(0,255,102,0.35);
      box-shadow: 0 0 40px rgba(0,255,102,0.25), 0 12px 40px rgba(0,0,0,0.55);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #e8ffe8;
    }
    #qx999-panel.qx999-panel-open {
      opacity: 1;
      pointer-events: auto;
    }
    #qx999-panel h3 {
      margin: 0 0 14px;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
      color: #00ff66;
      letter-spacing: 0.06em;
    }
    #qx999-panel .qx999-row {
      margin-bottom: 14px;
    }
    #qx999-panel label {
      display: block;
      font-size: 12px;
      color: #9fd4ad;
      margin-bottom: 6px;
    }
    #qx999-panel .qx999-subhint {
      margin: -2px 0 6px;
      font-size: 10px;
      color: #6a9a78;
      line-height: 1.3;
    }
    #qx999-panel .qx999-input-block {
      display: block;
      width: 100%;
    }
    #qx999-panel .qx999-time-input {
      box-sizing: border-box;
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid rgba(0,255,102,0.3);
      background: rgba(0,0,0,0.35);
      color: #fff;
      font-size: 15px;
      font-family: inherit;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
    }
    #qx999-panel .qx999-time-input:focus {
      border-color: #00ff66;
      box-shadow: 0 0 0 2px rgba(0,255,102,0.2);
    }
    #qx999-panel .qx999-time-input::-webkit-outer-spin-button,
    #qx999-panel .qx999-time-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    #qx999-panel .qx999-time-input[type="number"] {
      -moz-appearance: textfield;
    }
    #qx999-panel .qx999-save-btn {
      flex-shrink: 0;
      padding: 10px 14px;
      border: none;
      border-radius: 8px;
      background: #00ff66;
      color: #052210;
      font-weight: 700;
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
    }
    #qx999-panel .qx999-save-btn:active {
      background: #00e65c;
    }
    #qx999-panel .qx999-save-btn-block {
      display: block;
      width: 100%;
      margin-top: 4px;
      padding: 12px 14px;
      font-size: 14px;
    }
    #qx999-dir-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    #qx999-dir-group button {
      padding: 11px 12px;
      border-radius: 8px;
      border: 1px solid rgba(0,255,102,0.25);
      background: rgba(0,0,0,0.3);
      color: #dfffe8;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    }
    #qx999-dir-group button.qx999-dir-active {
      background: rgba(0,255,102,0.18);
      border-color: #00ff66;
      box-shadow: 0 0 16px rgba(0,255,102,0.35);
      color: #00ff66;
    }
    #qx999-panel-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      pointer-events: none;
    }
    #qx999-panel-backdrop.qx999-backdrop-open {
      opacity: 1;
      pointer-events: auto;
    }
    #qx999-panel-hint {
      margin: 10px 0 0;
      font-size: 11px;
      text-align: center;
      color: #6a9a78;
      line-height: 1.35;
    }
    #qx999-save-status {
      min-height: 18px;
      margin: 8px 0 0;
      font-size: 12px;
      text-align: center;
      color: #00ff66;
      font-weight: 600;
    }
    #qx999-panel button,
    #qx999-panel input {
      touch-action: manipulation;
    }
  `;
  document.head.appendChild(style);

  const scanOverlay = document.createElement("div");
  scanOverlay.id = "qx999-scan-overlay";
  scanOverlay.innerHTML = '<div id="qx999-scan-line"></div>';
  document.body.appendChild(scanOverlay);

  const backdrop = document.createElement("div");
  backdrop.id = "qx999-panel-backdrop";

  const panel = document.createElement("div");
  panel.id = "qx999-panel";
  panel.innerHTML = `
    <h3> SAJOL TRADER SETTINGS</h3>
    <div class="qx999-row">
      <label>Scan delay (seconds)</label>
      <input id="qx999-delay-input" class="qx999-time-input qx999-input-block" type="number" min="1" max="120" step="1" />
    </div>
    <div class="qx999-row">
      <label>After trade scan (seconds)</label>
      <p class="qx999-subhint">0 = stop only when you tap the icon</p>
      <input id="qx999-after-trade-input" class="qx999-time-input qx999-input-block" type="number" min="0" max="300" step="1" />
    </div>
    <div class="qx999-row">
      <label>Trade direction</label>
      <div id="qx999-dir-group">
        <button type="button" data-dir="up">Up</button>
        <button type="button" data-dir="down">Down</button>
        <button type="button" data-dir="random">Random</button>
      </div>
    </div>
    <button type="button" id="qx999-save-all" class="qx999-save-btn qx999-save-btn-block">Save</button>
    <p id="qx999-save-status"></p>
    <p id="qx999-panel-hint">3 taps on icon to open · tap outside to close</p>
  `;
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  panel.addEventListener("mousedown", (e) => e.stopPropagation());
  panel.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  panel.addEventListener("touchend", (e) => e.stopPropagation());

  const delayInput = panel.querySelector("#qx999-delay-input");
  const afterTradeInput = panel.querySelector("#qx999-after-trade-input");
  const saveStatus = panel.querySelector("#qx999-save-status");
  const dirButtons = panel.querySelectorAll("#qx999-dir-group button");
  let saveStatusTimer = null;
  let pendingDirection = settings.direction;

  function syncDirectionUI(dir) {
    dirButtons.forEach((btn) => {
      btn.classList.toggle("qx999-dir-active", btn.dataset.dir === dir);
    });
  }

  function syncPanelUI() {
    delayInput.value = String(settings.delaySec);
    afterTradeInput.value = String(settings.afterTradeScanSec);
    pendingDirection = settings.direction;
    syncDirectionUI(pendingDirection);
  }

  function openPanel() {
    syncPanelUI();
    backdrop.classList.add("qx999-backdrop-open");
    panel.classList.add("qx999-panel-open");
  }

  function closePanel() {
    backdrop.classList.remove("qx999-backdrop-open");
    panel.classList.remove("qx999-panel-open");
    saveStatus.textContent = "";
  }

  function showSaveStatus(msg, isError) {
    saveStatus.textContent = msg;
    saveStatus.style.color = isError ? "#ff6b6b" : "#00ff66";
    if (saveStatusTimer) clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => {
      saveStatus.textContent = "";
    }, 2500);
  }

  function parseDelayInput() {
    const n = Number(String(delayInput.value).trim());
    if (!Number.isFinite(n) || n < 1) return defaults.delaySec;
    return Math.max(1, Math.min(120, Math.round(n)));
  }

  function parseAfterTradeInput() {
    const n = Number(String(afterTradeInput.value).trim());
    if (!Number.isFinite(n) || n < 0) return defaults.afterTradeScanSec;
    return Math.max(0, Math.min(300, Math.round(n)));
  }

  function applyAllSettings() {
    settings.delaySec = parseDelayInput();
    settings.afterTradeScanSec = parseAfterTradeInput();
    settings.direction = pendingDirection;
    delayInput.value = String(settings.delaySec);
    afterTradeInput.value = String(settings.afterTradeScanSec);
    const stored = saveSettings(settings);
    syncPanelUI();
    closePanel();
    console.log(
      "QX999: settings saved | delay:",
      settings.delaySec + "s",
      "| after-trade:",
      settings.afterTradeScanSec === 0 ? "manual" : settings.afterTradeScanSec + "s",
      "| dir:",
      settings.direction,
      stored ? "" : "(storage blocked)"
    );
  }

  function bindPanelAction(el, handler) {
    let lock = false;
    const run = (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      if (lock) return;
      lock = true;
      setTimeout(() => {
        lock = false;
      }, 300);
      handler();
    };
    el.addEventListener("pointerup", run);
    el.addEventListener("click", run);
  }

  bindPanelAction(panel.querySelector("#qx999-save-all"), applyAllSettings);

  function onSettingsEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      applyAllSettings();
    }
  }
  delayInput.addEventListener("keydown", onSettingsEnter);
  afterTradeInput.addEventListener("keydown", onSettingsEnter);

  dirButtons.forEach((btn) => {
    bindPanelAction(btn, () => {
      pendingDirection = btn.dataset.dir;
      syncDirectionUI(pendingDirection);
    });
  });

  bindPanelAction(backdrop, closePanel);

  const widget = document.createElement("div");
  widget.id = "qx999-widget";
  widget.innerHTML = `
    <div id="qx999-logo-wrap"><img src="${LOGO_URL}" alt="Quotex City" draggable="false" /></div>
    <span id="qx999-label">${LABEL}</span>
  `;
  document.body.appendChild(widget);

  let scanActive = false;
  let tradeTimer = null;
  let afterTradeTimer = null;
  let tapCount = 0;
  let tapSettleTimer = null;
  let lastTapAt = 0;

  function getTradeButtons() {
    const root = document.getElementById("trade-button");
    if (!root) return { up: null, down: null };
    return {
      up: root.querySelector("button.JQZcs"),
      down: root.querySelector("button.twQq3"),
    };
  }

  function pickTradeButton() {
    const { up, down } = getTradeButtons();
    if (!up && !down) return null;
    if (settings.direction === "up") return up || null;
    if (settings.direction === "down") return down || null;
    const pool = [up, down].filter(Boolean);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function placeTrade() {
    const btn = pickTradeButton();
    if (!btn) {
      console.error("QX999: trade button not found for direction:", settings.direction);
      return false;
    }
    btn.click();
    const side = btn.classList.contains("JQZcs") ? "UP" : "DOWN";
    console.log("QX999 trade:", side, "| mode:", settings.direction);
    return true;
  }

  function clearAfterTradeTimer() {
    if (afterTradeTimer) {
      clearTimeout(afterTradeTimer);
      afterTradeTimer = null;
    }
  }

  function scheduleAfterTradeScanStop() {
    clearAfterTradeTimer();
    if (!settings.afterTradeScanSec || settings.afterTradeScanSec <= 0) return;
    const ms = settings.afterTradeScanSec * 1000;
    afterTradeTimer = setTimeout(() => {
      afterTradeTimer = null;
      if (scanActive) {
        stopScanSession();
        console.log("QX999: scan auto-stopped after trade (" + settings.afterTradeScanSec + "s)");
      }
    }, ms);
  }

  function stopScanSession() {
    widget.classList.remove("qx999-glow");
    scanOverlay.classList.remove("qx999-scan-on");
    scanActive = false;
    if (tradeTimer) {
      clearTimeout(tradeTimer);
      tradeTimer = null;
    }
    clearAfterTradeTimer();
  }

  function startAutoTrade() {
    if (scanActive) return;
    closePanel();
    clearAfterTradeTimer();
    scanActive = true;
    widget.classList.add("qx999-glow");
    scanOverlay.classList.add("qx999-scan-on");
    const delayMs = settings.delaySec * 1000;

    tradeTimer = setTimeout(() => {
      tradeTimer = null;
      placeTrade();
      scheduleAfterTradeScanStop();
    }, delayMs);
  }

  function resetTapCounter() {
    tapCount = 0;
    if (tapSettleTimer) {
      clearTimeout(tapSettleTimer);
      tapSettleTimer = null;
    }
  }

  function registerTap() {
    if (panel.classList.contains("qx999-panel-open")) return;

    const now = Date.now();
    if (now - lastTapAt > TAP_SEQUENCE_MS) tapCount = 0;
    lastTapAt = now;
    tapCount += 1;

    if (tapSettleTimer) {
      clearTimeout(tapSettleTimer);
      tapSettleTimer = null;
    }

    if (tapCount >= TAP_REQUIRED) {
      resetTapCounter();
      openPanel();
      return;
    }

    tapSettleTimer = setTimeout(() => {
      tapSettleTimer = null;
      if (tapCount === 1) {
        if (scanActive) {
          stopScanSession();
        } else {
          startAutoTrade();
        }
      }
      tapCount = 0;
    }, TAP_SETTLE_MS);
  }

  /* ——— Drag (mouse + touch) ——— */
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  const DRAG_THRESHOLD = 8;

  function clampPosition(left, top) {
    const rect = widget.getBoundingClientRect();
    const maxL = window.innerWidth - rect.width;
    const maxT = window.innerHeight - rect.height;
    return {
      left: Math.max(0, Math.min(left, maxL)),
      top: Math.max(0, Math.min(top, maxT)),
    };
  }

  function onPointerDown(clientX, clientY) {
    dragging = true;
    moved = false;
    const r = widget.getBoundingClientRect();
    startX = clientX;
    startY = clientY;
    startLeft = r.left;
    startTop = r.top;
    widget.style.transform = "none";
    widget.style.left = startLeft + "px";
    widget.style.top = startTop + "px";
  }

  function onPointerMove(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      moved = true;
    }
    const pos = clampPosition(startLeft + dx, startTop + dy);
    widget.style.left = pos.left + "px";
    widget.style.top = pos.top + "px";
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    if (!moved) {
      registerTap();
    }
  }

  widget.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onPointerDown(e.clientX, e.clientY);
  });

  widget.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      onPointerDown(t.clientX, t.clientY);
    },
    { passive: false }
  );

  document.addEventListener("mousemove", (e) => {
    onPointerMove(e.clientX, e.clientY);
  });

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging || e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      onPointerMove(t.clientX, t.clientY);
    },
    { passive: false }
  );

  document.addEventListener("mouseup", onPointerUp);
  document.addEventListener("touchend", onPointerUp);
  document.addEventListener("touchcancel", onPointerUp);

  window.__QX999_STOP__ = function () {
    stopScanSession();
    resetTapCounter();
    closePanel();
    widget.remove();
    scanOverlay.remove();
    backdrop.remove();
    panel.remove();
    style.remove();
    delete window.__QX999_ACTIVE__;
    delete window.__QX999_STOP__;
    console.log("QX999 removed.");
  };

  syncPanelUI();
  console.log(
    "QX999 loaded — 1 tap: scan+trade | 1 tap: stop scan | 3 taps: settings | delay:",
    settings.delaySec + "s",
    "| after-trade scan:",
    settings.afterTradeScanSec === 0 ? "manual" : settings.afterTradeScanSec + "s",
    "| dir:",
    settings.direction
  );
  }

  showPasswordGate(initQX999);
})();
